package com.example.batchserver.tasklet;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.scope.context.StepContext;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.batch.repeat.RepeatStatus;

import com.example.servercommon.file.FileToMultipartConverter;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.model.NotifyQueue;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.repository.NotifyQueueRepository;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.service.StorageService;
import com.example.servercommon.validationtemplate.GenericFileImporter;
import com.example.servercommon.validationtemplate.mapper.TemplateGetMapper;
import com.example.servercommon.validationtemplate.rule.ValidationResult;

public class FileValidationTaskletTest {

    @Mock
    private GenericFileImporter genericFileImporter;
    @Mock
    private ErrorCodeService errorCodeService;
    @Mock
    private JobStatusRepository jobStatusRepository;
    @Mock
    private NotifyQueueRepository notifyQueueRepository;
    @Mock
    private com.example.servercommon.config.EnvironmentVariableResolver env;
    @Mock
    private StorageService storageService;
    @Mock
    private org.springframework.web.client.RestTemplate restTemplate;

    @Mock
    private org.springframework.batch.core.StepContribution contribution;
    @Mock
    private ChunkContext chunkContext;

    @InjectMocks
    private FileValidationTasklet tasklet;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(env.getOrDefault(anyString(), anyString())).thenReturn("classpath:config/templates");
    }

    // helper to stub chunkContext -> stepContext -> stepExecution -> jobParameters
    private void stubJobParameters(JobParameters params) {
        StepContext stepContext = mock(StepContext.class);
        StepExecution stepExecution = mock(StepExecution.class);
        when(chunkContext.getStepContext()).thenReturn(stepContext);
        when(stepContext.getStepExecution()).thenReturn(stepExecution);
        when(stepExecution.getJobParameters()).thenReturn(params);
    }

    @Test
    void testExecute_FileNameNull_ShouldFailFast() throws Exception {
        JobParameters params = mock(JobParameters.class);
        stubJobParameters(params);

        when(params.getString("fileName")).thenReturn(null);
        when(params.getString("templateId")).thenReturn("temp1");
        when(params.getString("jobName")).thenReturn("job1");
        when(params.getLong("refid")).thenReturn(1L);
        when(params.getString("locale")).thenReturn("ja");
        when(errorCodeService.getErrorMessage("E4001", "ja")).thenReturn("無効なファイル名");

        RepeatStatus result = tasklet.execute(contribution, chunkContext);

        verify(jobStatusRepository, times(1)).save(any(JobStatus.class));
        verify(storageService, never()).getFileByPath(any());
        verify(notifyQueueRepository, never()).save(any(NotifyQueue.class));
        assert result == RepeatStatus.FINISHED;
    }

    @Test
    void testExecute_Success() throws Exception {
        JobParameters params = mock(JobParameters.class);
        stubJobParameters(params);

        when(params.getString("templateId")).thenReturn("temp1");
        when(params.getString("fileName")).thenReturn("test.csv");
        when(params.getString("jobName")).thenReturn("job1");
        when(params.getLong("refid")).thenReturn(100L);
        when(params.getString("locale")).thenReturn("ja");

        // 実ファイルを作る（FileInputStream が開けるように）
        Path tmp = Files.createTempFile("file-validation-test", ".csv");
        Files.writeString(tmp, "header1,header2\nval1,val2");
        File file = tmp.toFile();

        when(storageService.getFileByPath("test.csv")).thenReturn(file);

        // static モックは try-with-resources で閉じる
        try (MockedStatic<FileToMultipartConverter> converterMock = mockStatic(FileToMultipartConverter.class);
                MockedStatic<TemplateGetMapper> templateMock = mockStatic(TemplateGetMapper.class)) {

            MultipartFile multipartMock = mock(MultipartFile.class);
            converterMock.when(() -> FileToMultipartConverter.convert(file)).thenReturn(multipartMock);
            templateMock.when(() -> TemplateGetMapper.templateGet(eq("temp1"), anyString())).thenReturn(Map.of());

            // 成功の ValidationResult を返す
            ValidationResult ok = new ValidationResult(1); // errors は空
            when(genericFileImporter.importFiles(anyMap(), eq("temp1"), eq("test.csv"), any())).thenReturn(List.of(ok));

            RepeatStatus result = tasklet.execute(contribution, chunkContext);

            verify(jobStatusRepository, times(1)).save(any(JobStatus.class));
            verify(notifyQueueRepository, times(1)).save(any(NotifyQueue.class));
            assert result == RepeatStatus.FINISHED;
        } finally {
            // temp file を削除（任意）
            tmp.toFile().delete();
        }
    }

    @Test
    void testExecute_ValidationError() throws Exception {
        JobParameters params = mock(JobParameters.class);
        stubJobParameters(params);

        when(params.getString("templateId")).thenReturn("temp1");
        when(params.getString("fileName")).thenReturn("test.csv");
        when(params.getString("jobName")).thenReturn("job1");
        when(params.getLong("refid")).thenReturn(100L);
        when(params.getString("locale")).thenReturn("ja");

        Path tmp = Files.createTempFile("file-validation-test", ".csv");
        Files.writeString(tmp, "header1,header2\nval1,val2");
        File file = tmp.toFile();

        when(storageService.getFileByPath("test.csv")).thenReturn(file);

        try (MockedStatic<FileToMultipartConverter> converterMock = mockStatic(FileToMultipartConverter.class);
                MockedStatic<TemplateGetMapper> templateMock = mockStatic(TemplateGetMapper.class)) {

            MultipartFile multipartMock = mock(MultipartFile.class);
            converterMock.when(() -> FileToMultipartConverter.convert(file)).thenReturn(multipartMock);
            templateMock.when(() -> TemplateGetMapper.templateGet(eq("temp1"), anyString())).thenReturn(Map.of());

            // バリデーションエラーを持つ実インスタンスを返す
            ValidationResult invalid = new ValidationResult(1);
            invalid.addError("field1", "エラー内容");

            when(genericFileImporter.importFiles(anyMap(), eq("temp1"), eq("test.csv"), any()))
                    .thenReturn(List.of(invalid));

            RepeatStatus result = tasklet.execute(contribution, chunkContext);

            verify(jobStatusRepository, times(1)).save(any(JobStatus.class));
            verify(notifyQueueRepository, times(1)).save(any(NotifyQueue.class));
            assert result == RepeatStatus.FINISHED;
        } finally {
            tmp.toFile().delete();
        }
    }

    @Test
    void testExecute_ExceptionDuringProcessing() throws Exception {
        JobParameters params = mock(JobParameters.class);
        stubJobParameters(params);

        when(params.getString("templateId")).thenReturn("temp1");
        when(params.getString("fileName")).thenReturn("test.csv");
        when(params.getString("jobName")).thenReturn("job1");
        when(params.getLong("refid")).thenReturn(100L);
        when(params.getString("locale")).thenReturn("ja");

        // 例外は try の外で発生
        when(storageService.getFileByPath("test.csv")).thenThrow(new RuntimeException("S3エラー"));

        try {
            tasklet.execute(contribution, chunkContext);
        } catch (Exception e) {
            // 外で例外が発生するので JobStatus 保存はされない
            verify(jobStatusRepository, never()).save(any());
            return;
        }
        throw new AssertionError("例外が発生することを期待していたが発生しませんでした。");
    }
}
