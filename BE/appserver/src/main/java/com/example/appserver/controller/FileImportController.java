package com.example.appserver.controller;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.appserver.config.AsyncJobProperties;
import com.example.appserver.runner.ReportPollingRunner;
import com.example.appserver.security.JwtTokenProvider;
import com.example.appserver.service.InternalApiClient;
import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.enums.AsyncJobExecutionStatus;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.AsyncJobArtifactService;
import com.example.servercommon.service.AsyncJobStatusService;
import com.example.servercommon.utils.DateFormatUtil;
import com.example.servercommon.validationtemplate.mapper.TemplateGetMapper;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

@RequiredArgsConstructor
@Slf4j
@RestController
@RequestMapping("/api/import")
public class FileImportController {

    private final JobStatusRepository jobStatusRepository;
    private final InternalApiClient internalApiClient;
    private final JwtTokenProvider jwtTokenProvider;
    private final EnvironmentVariableResolver env;
    private final FileSaver fileSaver;
    private final ReportPollingRunner reportPollingRunner;
    private final BackendMessageResolver messageResolver;
    private final AsyncJobStatusService asyncJobStatusService;
    private final AsyncJobArtifactService asyncJobArtifactService;
    private final AsyncJobProperties asyncJobProperties;
    @Value("${external.batchserver.url}")
    private String batchserverBaseUrl;

    @PostMapping("/templateGet")
    public ResponseEntity<ApiResponse<?>> templateGet(
            @RequestParam("templateId") String templateId) throws Exception {

        String basePath = env.getOrDefault("template.schema.base-path", "classpath:config/templates");
        Map<String, TemplateSchema> templateInfo = TemplateGetMapper.templateGet(templateId, basePath);
        return ResponseEntity.ok(ApiResponse.success((templateInfo)));
    }

    /**
     * ジョブ履歴取得エンドポイント
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<JobStatus>>> getImportHistory(
            @RequestParam(defaultValue = "0", required = false) int page,
            @RequestParam(defaultValue = "20", required = false) int size) {

        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime"));
        var jobs = jobStatusRepository.findByJobNameStartingWith("import-", pageable);
        return ResponseEntity.ok(ApiResponse.success(jobs.getContent()));
    }

    /**
     * ファイルアップロードエンドポイント
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("templateId") String templateId,
            Locale locale) {

        // input-dirは、application.ymlに存在する場合取得
        String fileName = file.getOriginalFilename();
        String jobName = "import-" + UUID.randomUUID();

        // 業務ロジック呼び出し（処理をappserverで行いたい場合は、コメントアウトを外してください）
        // 1. 一時ファイル保存（または S3 にアップロード）
        Path tempFile = null;
        try (InputStream is = file.getInputStream()) {
            tempFile = Files.createTempFile(jobName, fileName);
            file.transferTo(tempFile.toFile());
            fileSaver.save(fileName, is);
        } catch (IOException e) {
            throw new RuntimeException(BackendMessageCatalog.EX_FILE_SAVE_FAILED, e);
        }

        // 2. バッチサーバーに REST 経由でジョブ起動リクエスト
        Random random = new Random();
        int refid = 100 + random.nextInt(900);

        Map<String, Object> formData = new HashMap<>();
        formData.put("templateId", templateId);
        formData.put("fileName", fileName);
        formData.put("locale", locale.getLanguage());
        formData.put("jobName", jobName);
        formData.put("refid", refid);
        String accsessToken = jwtTokenProvider.generateInternalServiceToken("gateway");

        // batchserverに、処理を任せておく
        ResponseEntity<ApiResponse> apiResponse = internalApiClient.post(
                // ゲートウェイを通る場合は以下プログラム
                batchserverBaseUrl + "/api/batch/jobs/run/fileImportJob",
                formData,
                accsessToken,
                ApiResponse.class);

        // 3. バッチサーバーのレスポンスを確認
        if (!apiResponse.getStatusCode().is2xxSuccessful() || apiResponse.getBody() == null) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E5001,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E5001, locale)));

        }

        // 4. 拡張子 抽出
        Pattern pattern = Pattern.compile("\\.([^.]+)$");
        Matcher matcher = pattern.matcher(fileName);
        String extension = null;
        if (matcher.find()) {
            extension = matcher.group(1); // ← ここで「拡張子の文字列」を取得
        } else {
            log.warn(BackendMessageCatalog.LOG_NO_EXTENSION);
        }

        // 5. レスポンスデータの組み立て
        Map<String, String> responseData = new HashMap<>();
        responseData.put("refId", String.valueOf(refid));
        responseData.put("extension", extension);
        responseData.put("fileName", fileName);

        // 6. フロントエンドに jobId を返す（処理はバッチサーバーに任せて先に正常終了させちゃう）
        return ResponseEntity.ok(ApiResponse.success(responseData));
    }

    // appserverでファイル出力を非同期に行っておくAPI
    @PostMapping("/downloadReady")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDownloadReady(
            @RequestParam("reportId") String reportIdStr,
            @RequestParam("fileName") String fileName,
            @RequestParam("extention") String extention) {

        Long reportId = Long.valueOf(reportIdStr);
        String normalizedExtension = normalizeExtension(extention);

        // downloadAPIで必要な一意のジョブ名を発行し取得する（フェスのチケットをもらうイメージ）
        String jobName = normalizedExtension + "-" + UUID.randomUUID();
        LocalDateTime expiresAt = DateFormatUtil.nowUtcLocalDateTime()
                .plusMinutes(asyncJobProperties.getStatusTtlMinutes());
        asyncJobStatusService.registerPending(
                jobName,
                "REPORT_FILE_" + normalizedExtension.toUpperCase(Locale.ROOT),
                expiresAt);

        // jobrunnerに処理を登録して、非同期で実行しておく
        // 現在、extention（拡張子）を使用していないが、今後の拡張機能のため保持
        reportPollingRunner.runFileOutput(reportId, fileName, normalizedExtension, jobName);

        // jobName（ファイルをダウンロードするためのチケット）をレスポンスに設定し、FEに送信する
        Map<String, String> data = new HashMap<>();
        data.put("jobName", jobName);
        return ResponseEntity.ok(new ApiResponse<>(true, data, null));
    }

    // ファイルダウンロードAPI
    @PostMapping("/download")
    public ResponseEntity<InputStreamResource> downloadReport(@RequestParam("jobName") String jobName) {
        var executionOpt = asyncJobStatusService.findByJobName(jobName);
        if (executionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        var execution = executionOpt.get();
        if (execution.getStatus() != AsyncJobExecutionStatus.COMPLETED) {
            return ResponseEntity.badRequest().body(null);
        }

        if (execution.getArtifactPath() == null || execution.getArtifactPath().isBlank()) {
            return ResponseEntity.internalServerError().body(null);
        }

        InputStream inputStream;
        try {
            inputStream = asyncJobArtifactService.open(execution.getArtifactPath());
        } catch (IOException | RuntimeException e) {
            log.error(BackendMessageCatalog.LOG_FILE_DOWNLOAD_FAILED, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(null);
        }

        String extension = extractExtensionFromJobName(jobName);
        if (extension == null || extension.isBlank()) {
            extension = "pdf";
        }
        String fileName = jobName + "." + extension;
        MediaType contentType = resolveMediaType(execution.getArtifactMimeType(), extension);

        // 出来立てホヤホヤのバイナリーファイルをFEに送信する
        // ダウンロード出来ているかどうかは、開発コンソール > network > /downloadあたりで確認してください
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .contentType(contentType)
                .body(new InputStreamResource(inputStream));
    }

    private String extractExtensionFromJobName(String jobName) {
        if (jobName == null) {
            return null;
        }
        int idx = jobName.indexOf('-');
        if (idx <= 0) {
            return null;
        }
        return jobName.substring(0, idx);
    }

    private String normalizeExtension(String extension) {
        if (extension == null || extension.isBlank()) {
            return "pdf";
        }
        String trimmed = extension.trim();
        if (trimmed.startsWith(".")) {
            trimmed = trimmed.substring(1);
        }
        if (trimmed.isBlank()) {
            return "pdf";
        }
        return trimmed.toLowerCase(Locale.ROOT);
    }

    private MediaType resolveMediaType(String artifactMimeType, String extension) {
        if (artifactMimeType != null && !artifactMimeType.isBlank()) {
            try {
                return MediaType.parseMediaType(artifactMimeType);
            } catch (Exception ignored) {
                // ignore and fallback to extension based resolution
            }
        }

        if ("pdf".equalsIgnoreCase(extension)) {
            return MediaType.APPLICATION_PDF;
        }
        if ("csv".equalsIgnoreCase(extension)) {
            return MediaType.TEXT_PLAIN;
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
