package com.example.servercommon.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.exception.StorageAccessException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.JobStatusRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.io.*;
import java.lang.reflect.Field;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class S3StorageServiceTest {

    private AmazonS3 s3Client;
    private JobStatusRepository jobStatusRepository;
    private S3StorageService s3StorageService;
    private EnvironmentVariableResolver env;

    @BeforeEach
    void setUp() throws Exception {
        s3Client = mock(AmazonS3.class);
        jobStatusRepository = mock(JobStatusRepository.class);
        env = mock(EnvironmentVariableResolver.class);

        when(env.getOptional("storage.s3.bucket")).thenReturn(Optional.of("test-bucket"));
        when(env.getOptional("storage.s3.input-dir")).thenReturn(Optional.of("input"));
        when(env.getOptional("storage.s3.archive-dir")).thenReturn(Optional.of("archive"));
        when(env.getOptional("storage.s3.error-dir")).thenReturn(Optional.of("error"));
        when(env.getOptional("storage.s3.endpoint")).thenReturn(Optional.of("http://localhost:4566"));
        when(env.getOptional("storage.s3.access-key")).thenReturn(Optional.of("dummy-access-key"));
        when(env.getOptional("storage.s3.secret-key")).thenReturn(Optional.of("dummy-secret-key"));

        s3StorageService = new S3StorageService(env, jobStatusRepository);
        var field = S3StorageService.class.getDeclaredField("s3Client");
        field.setAccessible(true);
        field.set(s3StorageService, s3Client);

        // s3StorageService = new S3StorageService("http://localhost", "key", "secret",
        // jobStatusRepository);

        // var clientField = S3StorageService.class.getDeclaredField("s3Client");
        // clientField.setAccessible(true);
        // clientField.set(s3StorageService, s3Client);

        // var bucketField = S3StorageService.class.getDeclaredField("bucket");
        // bucketField.setAccessible(true);
        // bucketField.set(s3StorageService, "test-bucket");

        // var inputDirField = S3StorageService.class.getDeclaredField("inputDir");
        // inputDirField.setAccessible(true);
        // inputDirField.set(s3StorageService, "input");

        // var archiveDirField = S3StorageService.class.getDeclaredField("archiveDir");
        // archiveDirField.setAccessible(true);
        // archiveDirField.set(s3StorageService, "archive");

        // var errorDirField = S3StorageService.class.getDeclaredField("errorDir");
        // errorDirField.setAccessible(true);
        // errorDirField.set(s3StorageService, "error");
    }

    @Test
    void upload_shouldCallPutObject() {
        InputStream mockStream = new ByteArrayInputStream("test".getBytes());

        s3StorageService.upload("test/path.txt", mockStream);

        ArgumentCaptor<ObjectMetadata> metadataCaptor = ArgumentCaptor.forClass(ObjectMetadata.class);
        verify(s3Client).putObject(eq("test-bucket"), eq("test/path.txt"), any(ByteArrayInputStream.class),
                metadataCaptor.capture());
        assertThat(metadataCaptor.getValue().getContentLength()).isEqualTo("test".getBytes().length);
    }

    @Test
    void upload_shouldThrowStorageAccessException_onFailure() {
        InputStream stream = new ByteArrayInputStream("data".getBytes());
        doThrow(new RuntimeException("upload failed")).when(s3Client).putObject(any(), any(), any(), any());

        assertThatThrownBy(() -> s3StorageService.upload("error/path.txt", stream))
                .isInstanceOf(StorageAccessException.class)
                .hasMessageContaining(BackendMessageCatalog.EX_S3_UPLOAD_FAILED);
    }

    @Test
    void generatePresignedUrl_shouldReturnUrl() {
        URL dummyUrl = mock(URL.class);
        when(s3Client.generatePresignedUrl(any(GeneratePresignedUrlRequest.class)))
                .thenReturn(dummyUrl);

        URL result = s3StorageService.generatePresignedUrl("sample.pdf");

        assertThat(result).isEqualTo(dummyUrl);
    }

    @Test
    void generatePresignedUrl_shouldThrowStorageAccessException_onFailure() {
        when(s3Client.generatePresignedUrl(any())).thenThrow(new RuntimeException("S3 failure"));

        assertThatThrownBy(() -> s3StorageService.generatePresignedUrl("fail.pdf"))
                .isInstanceOf(StorageAccessException.class)
                .hasMessageContaining(BackendMessageCatalog.EX_S3_PRESIGNED_URL_FAILED);
    }

    @Test
    void isAlreadyProcessed_shouldReturnTrue() {
        File file = new File("processed_file.xlsx");
        when(jobStatusRepository.existsByOriginalFileName(file.getName())).thenReturn(true);

        boolean result = s3StorageService.isAlreadyProcessed(file);
        assertThat(result).isTrue();
    }

    @Test
    void markAsSuccess_shouldMoveFileToArchiveDir() throws Exception {
        File file = new File("success_file.xlsx");

        // private フィールド localFileKeyMap に値をセット
        Field keyMapField = S3StorageService.class.getDeclaredField("localFileKeyMap");
        keyMapField.setAccessible(true);
        Map<String, String> localFileKeyMap = (Map<String, String>) keyMapField.get(s3StorageService);
        localFileKeyMap.put(file.getAbsolutePath(), "input/success_file.xlsx");

        // private フィールド localFilDeOriginalNameMap に値をセット
        Field originalNameMapField = S3StorageService.class.getDeclaredField("localFileOriginalNameMap");
        originalNameMapField.setAccessible(true);
        Map<String, String> localFileOriginalNameMap = (Map<String, String>) originalNameMapField.get(s3StorageService);
        localFileOriginalNameMap.put(file.getAbsolutePath(), "success_file.xlsx");

        s3StorageService.markAsSuccess(file);

        verify(s3Client).copyObject("test-bucket", "input/success_file.xlsx", "test-bucket",
                "archive/success_file.xlsx");
        verify(s3Client).deleteObject("test-bucket", "input/success_file.xlsx");
    }

    @Test
    void markAsFailed_shouldMoveFileToErrorDir() throws Exception {
        File file = new File("failed_file.xlsx");

        // private フィールド localFileKeyMap に値をセット
        Field keyMapField = S3StorageService.class.getDeclaredField("localFileKeyMap");
        keyMapField.setAccessible(true);
        Map<String, String> localFileKeyMap = (Map<String, String>) keyMapField.get(s3StorageService);
        localFileKeyMap.put(file.getAbsolutePath(), "input/failed_file.xlsx");

        // private フィールド localFileOriginalNameMap に値をセット
        Field originalNameMapField = S3StorageService.class.getDeclaredField("localFileOriginalNameMap");
        originalNameMapField.setAccessible(true);
        Map<String, String> localFileOriginalNameMap = (Map<String, String>) originalNameMapField.get(s3StorageService);
        localFileOriginalNameMap.put(file.getAbsolutePath(), "failed_file.xlsx");

        // 実行
        s3StorageService.markAsFailed(file);

        // 検証（実装に合わせて copyObject + deleteObject）
        verify(s3Client).copyObject("test-bucket", "input/failed_file.xlsx", "test-bucket", "error/failed_file.xlsx");
        verify(s3Client).deleteObject("test-bucket", "input/failed_file.xlsx");
    }

    @Test
    void getFileByPath_shouldReturnFile() throws Exception {
        S3Object s3Object = mock(S3Object.class);
        InputStream inputStream = new ByteArrayInputStream("dummy content".getBytes());
        S3ObjectInputStream s3InputStream = new S3ObjectInputStream(inputStream, null);

        when(s3Object.getObjectContent()).thenReturn(s3InputStream);
        when(s3Client.getObject("test-bucket", "path/to/file.txt")).thenReturn(s3Object);

        File file = s3StorageService.getFileByPath("path/to/file.txt");

        assertThat(file).exists();
        assertThat(file.getName()).contains("file.txt");
    }

    @Test
    void getFileByPath_shouldThrowStorageAccessException_onFailure() {
        when(s3Client.getObject(any(String.class), any(String.class)))
                .thenThrow(new RuntimeException("S3 failure"));

        assertThatThrownBy(() -> s3StorageService.getFileByPath("bad/path.txt"))
                .isInstanceOf(StorageAccessException.class)
                .hasMessageContaining(
                        BackendMessageCatalog.format(BackendMessageCatalog.EX_FILE_FETCH_FAILED, "bad/path.txt"));
    }
}
