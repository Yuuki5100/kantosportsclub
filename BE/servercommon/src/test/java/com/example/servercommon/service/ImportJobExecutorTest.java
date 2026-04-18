package com.example.servercommon.service;

import com.example.servercommon.enums.JobType;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.service.writer.UserWriter;
import com.example.servercommon.validation.FileValidatorDispatcher;
import com.example.servercommon.validation.ValidationResult;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ImportJobExecutorTest {

    private FileSaver fileSaver;
    private FileValidatorDispatcher dispatcher;
    private UserWriter userWriter;
    private JobStatusRepository jobStatusRepository;
    private ImportJobExecutor executor;

    @BeforeEach
    void setUp() {
        fileSaver = mock(FileSaver.class);
        dispatcher = mock(FileValidatorDispatcher.class);
        userWriter = mock(UserWriter.class);
        jobStatusRepository = mock(JobStatusRepository.class);

        executor = new ImportJobExecutor(fileSaver, dispatcher, userWriter, jobStatusRepository);
    }

    @Test
    @DisplayName("✅ 正常にアップロード処理される")
    void upload_success() throws Exception {
        byte[] fileBytes = "id,name,email\n1,Alice,a@example.com".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "users.csv", "text/csv", fileBytes);

        ValidationResult<Object> result = new ValidationResult<>(new UserModel(), 2);
        when(dispatcher.validate(any(), any())).thenReturn(List.of(result));

        executor.execute(file);

        verify(fileSaver).save(any(), any());
        verify(userWriter).write(anyList(), anyList());
        verify(jobStatusRepository).save(any(JobStatus.class));
    }

    @Test
    @DisplayName("❌ バリデーション全件エラー時：Rowメッセージが含まれる")
    void shouldRecordAllValidationErrorsInJobStatusMessage() throws Exception {
        byte[] fileBytes = "id,name,email\ninvalid".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "users.csv", "text/csv", fileBytes);

        ValidationResult<Object> invalid = new ValidationResult<>(null, 3);
        invalid.addError("メールが不正です");
        invalid.addError("名前が空です");

        when(dispatcher.validate(any(), any())).thenReturn(List.of(invalid));

        executor.execute(file);

        ArgumentCaptor<JobStatus> statusCaptor = ArgumentCaptor.forClass(JobStatus.class);
        verify(jobStatusRepository).save(statusCaptor.capture());

        String message = statusCaptor.getValue().getMessage();
        assertThat(message).contains("エラー件数: 1");
        assertThat(message).contains("Row 3: メールが不正です");
        assertThat(message).contains("Row 3: 名前が空です");
    }

    @Test
    @DisplayName("❌ FileValidatorDispatcherが例外を投げた場合に伝播される")
    void shouldThrowExceptionIfDispatcherFails() throws Exception {
        byte[] fileBytes = "bad input".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "unknown.csv", "text/csv", fileBytes);

        when(dispatcher.validate(any(), any()))
            .thenThrow(new IllegalArgumentException("不明なファイルタイプ"));

        assertThatThrownBy(() -> executor.execute(file))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("不明なファイルタイプ");

        verify(jobStatusRepository, never()).save(any());
    }

    @Test
    @DisplayName("❌ FileSaverが例外を投げた場合に伝播される")
    void shouldThrowExceptionIfFileSaverFails() throws Exception {
        byte[] fileBytes = "id,name,email\n1,Alice,a@example.com".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "users.csv", "text/csv", fileBytes);

        doThrow(new RuntimeException("保存失敗"))
            .when(fileSaver).save(anyString(), any(InputStream.class));

        assertThatThrownBy(() -> executor.execute(file))
            .isInstanceOf(RuntimeException.class) // ← 修正ポイント
            .hasMessageContaining("保存失敗");

        verify(dispatcher, never()).validate(any(), any());
        verify(jobStatusRepository, never()).save(any());
    }


    @Test
    @DisplayName("✅ Fileからの処理も成功する")
    void shouldExecuteWithFileObject() throws Exception {
        File tempFile = File.createTempFile("test-users", ".csv");
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write("id,name,email\n1,Alice,a@example.com".getBytes());
        }

        ValidationResult<Object> result = new ValidationResult<>(new UserModel(), 2);
        when(dispatcher.validate(any(), any())).thenReturn(List.of(result));

        executor.execute(tempFile);

        verify(fileSaver).save(any(), any());
        verify(userWriter).write(anyList(), anyList());
        verify(jobStatusRepository).save(any(JobStatus.class));
    }
}
