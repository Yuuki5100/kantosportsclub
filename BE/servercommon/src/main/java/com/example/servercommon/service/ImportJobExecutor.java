package com.example.servercommon.service;

import com.example.servercommon.enums.JobType;
import com.example.servercommon.file.FileNameResolver;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.service.writer.UserWriter;
import com.example.servercommon.validation.FileValidatorDispatcher;
import com.example.servercommon.validation.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImportJobExecutor {

    private final FileSaver fileSaver;
    private final FileValidatorDispatcher fileValidatorDispatcher;
    private final UserWriter userWriter;
    private final JobStatusRepository jobStatusRepository;

    // 複数ファイルインポートを考慮したメソッド
    public void execute(MultipartFile multipartFile) throws Exception {
        String fileName = multipartFile.getOriginalFilename();
        try (InputStream is = multipartFile.getInputStream()) {
            processImport(fileName, is);
        }
    }

    // 単一ファイルインポートを考慮したメソッド
    public void execute(File file) throws Exception {
        try (InputStream is = new FileInputStream(file)) {
            processImport(file.getName(), is);
        }
    }
    @Transactional
    private void processImport(String fileName, InputStream inputStream) throws Exception {
        byte[] fileBytes = inputStream.readAllBytes();
        String resolvedFileName = FileNameResolver.resolveWithDate(fileName);

        // 1. ファイル保存
        fileSaver.save(resolvedFileName, new ByteArrayInputStream(fileBytes));

        // 2. バリデーション
        List<ValidationResult<?>> validationResults = fileValidatorDispatcher.validate(resolvedFileName,
                new ByteArrayInputStream(fileBytes));

        // 3. 成功行のみ抽出
        List<?> validObjects = validationResults.stream()
                .filter(ValidationResult::isValid)
                .map(ValidationResult::getTarget)
                .toList();

        // 4. 書き込み（User専用）
        @SuppressWarnings("unchecked")
        List<UserModel> users = (List<UserModel>) validObjects;

        userWriter.write(users, (List<ValidationResult<UserModel>>) (List<?>) validationResults);

        // 5. ジョブステータス保存
        JobStatus status = JobStatus.builder()
                .jobName("import-" + UUID.randomUUID())
                .jobType(JobType.FILE_IMPORT.getCode())
                .originalFileName(resolvedFileName)
                .status("SUCCESS")
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now())
                .message(buildMessage(users.size(), validationResults))
                .build();

        jobStatusRepository.save(status);
    }

    // エラーメッセージ文を生成する
    private String buildMessage(int successCount, List<ValidationResult<?>> results) {
        long errorCount = results.stream().filter(r -> !r.isValid()).count();
        StringBuilder sb = new StringBuilder();
        // sbにエラーの概要を詰める
        sb.append("登録件数: ").append(successCount)
                .append(" / エラー件数: ").append(errorCount);

        // sbにエラー箇所を詰める
        results.stream()
                .filter(r -> !r.isValid())
                .forEach(r -> {
                    for (String err : r.getErrors()) {
                        sb.append("\nRow ").append(r.getRowNumber()).append(": ").append(err);
                    }
                });

        // 前処理で詰めたメッセージを返す
        return sb.toString();
    }
}
