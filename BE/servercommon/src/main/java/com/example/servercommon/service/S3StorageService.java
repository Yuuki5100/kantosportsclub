package com.example.servercommon.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.exception.StorageAccessException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.JobStatusRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
public class S3StorageService implements StorageService {

    private final AmazonS3 s3Client;

    private final String bucket;
    private final String inputDir;
    private final String archiveDir;
    private final String errorDir;
    private final String templatePrefix; // ★ 追加：テンプレ用プレフィックス

    private final JobStatusRepository jobStatusRepository;

    // ローカル一時ファイルとS3キーのマッピング
    private final Map<String, String> localFileKeyMap = new HashMap<>();
    private final Map<String, String> localFileOriginalNameMap = new HashMap<>();

    public S3StorageService(
            EnvironmentVariableResolver env,
            JobStatusRepository jobStatusRepository) {

        this.bucket = env.getOptional("storage.s3.bucket")
                .orElseThrow(() -> new IllegalStateException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "storage.s3.bucket")));

        this.inputDir = env.getOptional("storage.s3.input-dir")
                .orElseThrow(() -> new IllegalStateException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "storage.s3.input-dir")));

        this.archiveDir = env.getOptional("storage.s3.archive-dir")
                .orElseThrow(() -> new IllegalStateException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "storage.s3.archive-dir")));

        this.errorDir = env.getOptional("storage.s3.error-dir")
                .orElseThrow(() -> new IllegalStateException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "storage.s3.error-dir")));

        // ★ 追加：テンプレ用プレフィックス（未設定ならデフォルト）
        this.templatePrefix = env.getOptional("storage.s3.template-prefix")
                .orElse("templates/export/excel");

        String endpoint = env.getOptional("storage.s3.endpoint")
                .orElseThrow(() -> new IllegalStateException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "storage.s3.endpoint")));

        String accessKey = env.getOptional("storage.s3.access-key")
                .orElseThrow(() -> new IllegalStateException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "storage.s3.access-key")));

        String secretKey = env.getOptional("storage.s3.secret-key")
                .orElseThrow(() -> new IllegalStateException(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "storage.s3.secret-key")));

        this.jobStatusRepository = jobStatusRepository;

        BasicAWSCredentials creds = new BasicAWSCredentials(accessKey, secretKey);
        this.s3Client = AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(
                        new AmazonS3ClientBuilder.EndpointConfiguration(endpoint, "ap-northeast-1"))
                .withPathStyleAccessEnabled(true)
                .withCredentials(new AWSStaticCredentialsProvider(creds))
                .build();
    }

    @Override
    public List<File> listInputFiles() {
        return s3Client.listObjects(bucket, inputDir).getObjectSummaries().stream()
                .map(summary -> {
                    String key = summary.getKey(); // 例: input/Orders.csv
                    String originalName = new File(key).getName();
                    File tempFile = null;
                    try (InputStream is = s3Client.getObject(bucket, key).getObjectContent()) {
                        tempFile = File.createTempFile("s3-", "-" + originalName);
                        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                            is.transferTo(fos);
                        }
                        tempFile.deleteOnExit();

                        // マッピング登録
                        localFileKeyMap.put(tempFile.getAbsolutePath(), key);
                        localFileOriginalNameMap.put(tempFile.getAbsolutePath(), originalName);

                    } catch (Exception e) {
                        log.error(BackendMessageCatalog.LOG_S3_TEMP_FETCH_FAILED, key, e);
                    }
                    return tempFile;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public File getFileByPath(String filePath) {
        // ★ 変更：素のファイル名が来たら templatePrefix を付与
        String key = resolveTemplateKey(filePath);

        String fileName = new File(key).getName();
        try (InputStream is = s3Client.getObject(bucket, key).getObjectContent()) {
            File tempFile = File.createTempFile("s3-", "-" + fileName);
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                is.transferTo(fos);
            }
            tempFile.deleteOnExit();

            // マッピング登録
            localFileKeyMap.put(tempFile.getAbsolutePath(), key);
            localFileOriginalNameMap.put(tempFile.getAbsolutePath(), fileName);

            return tempFile;
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_S3_GET_FILE_FAILED, key, e);
            throw new StorageAccessException(BackendMessageCatalog.format(BackendMessageCatalog.EX_FILE_FETCH_FAILED, key), e);
        }
    }

    // ★ 追加：テンプレートキー解決
    private String resolveTemplateKey(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new StorageAccessException(BackendMessageCatalog.EX_FILE_PATH_EMPTY);
        }
        // 既にディレクトリ区切りを含んでいれば、そのままキーとして扱う
        if (filePath.contains("/")) {
            return filePath;
        }
        // 素のファイル名なら templatePrefix を付与
        return (templatePrefix.endsWith("/"))
                ? templatePrefix + filePath
                : templatePrefix + "/" + filePath;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isAlreadyProcessed(File file) {
        String originalName = localFileOriginalNameMap.getOrDefault(file.getAbsolutePath(), file.getName());
        return jobStatusRepository.existsByOriginalFileName(originalName);
    }

    @Override
    public void markAsSuccess(File file) {
        moveToDir(file, archiveDir);
    }

    @Override
    public void markAsFailed(File file) {
        moveToDir(file, errorDir);
    }

    @Override
    public void upload(String path, InputStream inputStream) {
        try {
            byte[] bytes = inputStream.readAllBytes();
            com.amazonaws.services.s3.model.ObjectMetadata metadata = new com.amazonaws.services.s3.model.ObjectMetadata();
            metadata.setContentLength(bytes.length);
            s3Client.putObject(bucket, path, new java.io.ByteArrayInputStream(bytes), metadata);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_S3_UPLOAD_FAILED, path, e);
            throw new StorageAccessException(BackendMessageCatalog.EX_S3_UPLOAD_FAILED, e);
        }
    }

    private void moveToDir(File file, String dir) {
        String key = localFileKeyMap.get(file.getAbsolutePath());
        if (key == null) {
            log.warn(BackendMessageCatalog.LOG_S3_KEY_MISSING_FOR_MOVE, file.getName());
            return;
        }
        String originalName = localFileOriginalNameMap.getOrDefault(file.getAbsolutePath(), file.getName());
        String destKey = (dir.endsWith("/")) ? (dir + originalName) : (dir + "/" + originalName);
        try {
            s3Client.copyObject(bucket, key, bucket, destKey);
            s3Client.deleteObject(bucket, key);
            log.info(BackendMessageCatalog.LOG_S3_MOVE_SUCCESS, key, destKey);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_S3_MOVE_FAILED, key, e);
        }
    }

    @Override
    public URL generatePresignedUrl(String objectKey) {
        try {
            GeneratePresignedUrlRequest req =
                    new GeneratePresignedUrlRequest(bucket, objectKey)
                            .withMethod(HttpMethod.GET)
                            .withExpiration(new Date(System.currentTimeMillis() + 3600 * 1000)); // 1時間

            return s3Client.generatePresignedUrl(req);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_S3_PRESIGNED_URL_FAILED, objectKey, e);
            throw new StorageAccessException(BackendMessageCatalog.EX_S3_PRESIGNED_URL_FAILED, e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            s3Client.deleteObject(bucket, path);
            log.info(BackendMessageCatalog.LOG_S3_DELETE_SUCCESS, path);
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_S3_DELETE_FAILED, path, e);
            throw new StorageAccessException(BackendMessageCatalog.EX_S3_DELETE_FAILED, e);
        }
    }

    @Override
    public List<String> listByPrefix(String prefix) {
        try {
            return s3Client.listObjects(bucket, prefix).getObjectSummaries().stream()
                    .map(s -> s.getKey())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_S3_PREFIX_SEARCH_FAILED, prefix, e);
            return List.of();
        }
    }
}
