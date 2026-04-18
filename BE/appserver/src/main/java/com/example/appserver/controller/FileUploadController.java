package com.example.appserver.controller;

import com.example.appserver.config.FileUploadProperties;
import com.example.servercommon.enums.ResourceType;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.responseModel.UploadedFileResponse;
import com.example.servercommon.service.StorageService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final StorageService storageService;
    private final FileUploadProperties fileUploadProperties;
    private final BackendMessageResolver messageResolver;

    /**
     * ファイルアップロードAPI
     *
     * @param file アップロードするファイル
     * @return ファイルIDとファイル名を含むレスポンス
     */
    @PostMapping("/upload")
    @io.swagger.v3.oas.annotations.Operation(summary = "ファイルアップロード", description = "ファイルをS3にアップロードします")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "アップロード成功")

    public ResponseEntity<ApiResponse<UploadedFileResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("resourceType") ResourceType resourceType,
            Locale locale) {

        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(
                                BackendMessageCatalog.CODE_E4001,
                                messageResolver.resolveError(
                                        BackendMessageCatalog.CODE_E4001,
                                        locale,
                                        BackendMessageCatalog.ARG_FILE_NAME)));
            }

            // ✅ 拡張子チェック（設定に基づく）
            if (!isAllowedExtension(originalFilename)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(
                                BackendMessageCatalog.CODE_E4003,
                                messageResolver.resolveError(BackendMessageCatalog.CODE_E4003, locale)));
            }

            // ✅ resourceType + UUID でパスを切る
            String fileId = String.format("%s/%s-%s",
                    resourceType.name().toLowerCase(),
                    UUID.randomUUID(),
                    originalFilename);

            // ✅ ファイルアップロード実行
            try (InputStream is = file.getInputStream()) {
                storageService.upload(fileId, is);
            }

            log.info(BackendMessageCatalog.LOG_FILE_UPLOAD_SUCCESS, fileId);
            UploadedFileResponse response = new UploadedFileResponse(fileId, originalFilename);
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_FILE_UPLOAD_FAILED, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E5001,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E5001, locale)));
        }
    }

    /**
     * 許可された拡張子かどうかを判定する
     */
    private boolean isAllowedExtension(String filename) {
        if (fileUploadProperties == null || fileUploadProperties.getAllowedExtensions() == null) {
            log.warn(BackendMessageCatalog.LOG_FILE_EXTENSION_NOT_CONFIGURED);
            return false;
        }
        String lowered = filename.toLowerCase();
        return fileUploadProperties.getAllowedExtensions().stream()
                .anyMatch(ext -> lowered.endsWith("." + ext));
    }

    /**
     * ファイルダウンロードAPI
     *
     * @param fileId   ダウンロード対象ファイルのID（S3キー）
     * @param response HTTPレスポンスにバイナリを流します
     */
    @GetMapping("/download")
    @io.swagger.v3.oas.annotations.Operation(summary = "ファイルダウンロード", description = "S3からファイルをダウンロードします")
    public void downloadFile(@RequestParam("fileId") String fileId, HttpServletResponse response) {
        try {
            String decodedFileId = URLDecoder.decode(fileId, StandardCharsets.UTF_8.name());
            File file = storageService.getFileByPath(decodedFileId);

            if (file == null || !file.exists()) {
                log.warn(BackendMessageCatalog.LOG_FILE_NOT_FOUND, decodedFileId);
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"");
            response.setContentLengthLong(file.length());

            try (InputStream is = new FileInputStream(file)) {
                is.transferTo(response.getOutputStream());
                response.flushBuffer();
            }
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_FILE_DOWNLOAD_FAILED, fileId, e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * ファイル削除API
     *
     * @param fileId 削除するファイルのID（S3キー）
     * @return 削除完了レスポンス
     */
    @DeleteMapping("/{fileId}")
    @io.swagger.v3.oas.annotations.Operation(summary = "ファイル削除", description = "指定されたファイルをS3から削除します")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "削除成功")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable String fileId, Locale locale) {
        try {
            storageService.delete(fileId);
            log.info(BackendMessageCatalog.LOG_FILE_DELETE_SUCCESS, fileId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_FILE_DELETE_FAILED, fileId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E5002,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E5002, locale)));
        }
    }
}
