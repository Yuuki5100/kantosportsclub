package com.example.appserver.runner;

import com.example.servercommon.file.FileSaver;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.validationtemplate.GenericFileImporter;
import com.example.servercommon.validationtemplate.rule.ValidationResult;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FileImportRunnerTest {

    @Autowired
    private JobStatusRepository jobStatusRepository;
    @Autowired
    private FileSaver fileSaver;
    @Autowired
    private GenericFileImporter genericFileImporter;
    @Autowired
    private EnvironmentVariableResolver env;
    @Autowired
    private FileImportRunner runner;

    @BeforeEach
    void setup() {
        jobStatusRepository = mock(JobStatusRepository.class);
        fileSaver = mock(FileSaver.class);
        genericFileImporter = mock(GenericFileImporter.class);
        env = mock(EnvironmentVariableResolver.class);
        when(env.getOrDefault(anyString(), anyString())).thenReturn("classpath:config/templates");
        runner = new FileImportRunner(jobStatusRepository, fileSaver, genericFileImporter, env);
    }

    @Test
    @DisplayName("✅ 正常なファイルで保存・インポート・ジョブ保存される")
    void shouldProcessValidFileSuccessfully() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "users.csv", "text/csv", "data".getBytes());

        ValidationResult valid = new ValidationResult(1);
        when(genericFileImporter.importFiles(anyMap(), anyString(), anyString(), any(InputStream.class)))
                .thenReturn(List.of(valid));

        runner.run(file, "testJob", "users");

        verify(fileSaver).save(anyString(), any(InputStream.class));
        verify(genericFileImporter).importFiles(anyMap(), anyString(), anyString(), any(InputStream.class));
        verify(jobStatusRepository).save(any(JobStatus.class));
    }

    @Test
    @DisplayName("❌ ファイル名が null の場合は処理されない")
    void shouldSkipIfFilenameIsNull() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getOriginalFilename()).thenReturn(null);

        runner.run(file, "job", "users");

        verify(fileSaver, never()).save(any(), any());
        verify(genericFileImporter, never()).importFiles(any(),any(), any(), any());
        verify(jobStatusRepository, never()).save(any());
    }

    @Test
    @DisplayName("❌ getBytes() が IOException を投げた場合 catch される")
    void shouldCatchIOExceptionFromFileGetBytes() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getOriginalFilename()).thenReturn("users.csv");
        when(file.getBytes()).thenThrow(new IOException("読み込み失敗"));

        runner.run(file, "job", "users");

        verify(fileSaver, never()).save(any(), any());
        verify(genericFileImporter, never()).importFiles(any(), any(), any(), any());
        verify(jobStatusRepository, never()).save(any());
    }

    @Test
    @DisplayName("❌ バリデーションエラーがあると JobStatus.status が FAILED になる")
    void shouldSaveJobStatusWithFailedIfValidationErrorsExist() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "users.csv", "text/csv", "data".getBytes());

        ValidationResult invalid = new ValidationResult(2);
        invalid.addError("email", "メール形式が不正です");

        when(genericFileImporter.importFiles(anyMap(),anyString(), anyString(), any(InputStream.class)))
                .thenReturn(List.of(invalid));

        ArgumentCaptor<JobStatus> captor = ArgumentCaptor.forClass(JobStatus.class);
        runner.run(file, "failedJob", "users");

        verify(jobStatusRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo("FAILED");
        assertThat(captor.getValue().getMessage()).contains("Row 2: メール形式が不正です");
    }

    @Test
    @DisplayName("❌ 複数エラー行で Row N: メッセージが複数出力される")
    void shouldLogMultipleValidationErrors() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "users.csv", "text/csv", "data".getBytes());

        ValidationResult invalid1 = new ValidationResult(4);
        invalid1.addError("name", "名前が空です");

        ValidationResult invalid2 = new ValidationResult(6);
        invalid2.addError("email", "メールが不正です");
        invalid2.addError("id", "IDが未入力");

        when(genericFileImporter.importFiles(anyMap(), anyString(), anyString(), any(InputStream.class)))
                .thenReturn(List.of(invalid1, invalid2));

        ArgumentCaptor<JobStatus> captor = ArgumentCaptor.forClass(JobStatus.class);
        runner.run(file, "multiErrorJob", "users");

        verify(jobStatusRepository).save(captor.capture());
        String message = captor.getValue().getMessage();

        assertThat(message).contains("Row 4: 名前が空です");
        assertThat(message).contains("Row 6: メールが不正です");
        assertThat(message).contains("Row 6: IDが未入力");
    }
}
