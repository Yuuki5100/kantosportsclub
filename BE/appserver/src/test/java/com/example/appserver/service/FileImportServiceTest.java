package com.example.appserver.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validationtemplate.GenericFileImporter;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.rule.ValidationResult.ValidationError;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;

class FileImportServiceTest {

    private FileImportService service;
    private GenericFileImporter genericFileImporter;
    private JobStatusRepository jobStatusRepository;
    private ErrorCodeService errorCodeService;
    private com.example.servercommon.config.EnvironmentVariableResolver env;

    @BeforeEach
    void setUp() {
        genericFileImporter = mock(GenericFileImporter.class);
        jobStatusRepository = mock(JobStatusRepository.class);
        errorCodeService = mock(ErrorCodeService.class);
        env = mock(com.example.servercommon.config.EnvironmentVariableResolver.class);
        when(env.getOrDefault(anyString(), anyString())).thenReturn("classpath:config/templates");

        service = new FileImportService(errorCodeService, genericFileImporter, jobStatusRepository, env);
    }

@Test
void fileUpload_ShouldReturnOk_WhenFileValid() throws Exception {
    MockMultipartFile file = new MockMultipartFile("file", "test.csv",
            "text/csv", "data".getBytes());

    ValidationResult result = mock(ValidationResult.class);
    when(result.isValid()).thenReturn(true);
    when(result.getErrors()).thenReturn(Collections.emptyList());

    when(genericFileImporter.importFiles(any(Map.class), anyString(), anyString(), any(InputStream.class)))
            .thenReturn(Collections.singletonList(result));

    try (MockedStatic<com.example.servercommon.validationtemplate.mapper.TemplateGetMapper> mockedStatic =
         mockStatic(com.example.servercommon.validationtemplate.mapper.TemplateGetMapper.class)) {

        mockedStatic.when(() ->
            com.example.servercommon.validationtemplate.mapper.TemplateGetMapper.templateGet(anyString(), anyString()))
            .thenReturn(Collections.singletonMap("template1", mock(TemplateSchema.class)));

        ResponseEntity<?> response = service.fileUpload("template1", file, "test.csv",
                Locale.JAPAN, "job1");

        assertEquals(200, response.getStatusCodeValue());

        ApiResponse<?> body = (ApiResponse<?>) response.getBody();
        assertNotNull(body);
        assertTrue(body.isSuccess());  // 成功フラグ確認
        assertNotNull(body.getData());
        assertEquals(
                BackendMessageCatalog.format(BackendMessageCatalog.MSG_IMPORT_SUCCESS, "job1"),
                body.getData().toString());

        verify(jobStatusRepository, times(1)).save(any());
    }
}


    @Test
    void fileUpload_ShouldReturnBadRequest_WhenFilenameInvalid() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.csv",
                "text/csv", "data".getBytes());

        when(errorCodeService.getErrorMessage("E4001", "ja")).thenReturn("ファイル名エラー");

        ResponseEntity<?> response = service.fileUpload("template1", file, "  ",
                Locale.JAPAN, "job1");

        assertEquals(400, response.getStatusCodeValue());
        ApiResponse<?> body = (ApiResponse<?>) response.getBody();
        assertNotNull(body);
        assertNotNull(body.getMessage());
        assertTrue(body.getMessage().contains("ファイル名エラー"));
    }

    @Test
    void fileUpload_ShouldReturnBadRequest_WhenValidationErrors() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.csv",
                "text/csv", "data".getBytes());

        ValidationResult result = mock(ValidationResult.class);
        when(result.isValid()).thenReturn(false);
        when(result.getErrors()).thenReturn(List.of(new ValidationError("field1", "必須")));

        when(genericFileImporter.importFiles(any(Map.class), anyString(), anyString(), any(InputStream.class)))
                .thenReturn(Collections.singletonList(result));

        when(errorCodeService.getErrorMessage("E4001", "ja")).thenReturn("バリデーションエラー");

        try (MockedStatic<com.example.servercommon.validationtemplate.mapper.TemplateGetMapper> mockedStatic =
             mockStatic(com.example.servercommon.validationtemplate.mapper.TemplateGetMapper.class)) {

            mockedStatic.when(() ->
                com.example.servercommon.validationtemplate.mapper.TemplateGetMapper.templateGet(anyString(), anyString()))
                .thenReturn(Collections.singletonMap("template1", mock(TemplateSchema.class)));

            ResponseEntity<?> response = service.fileUpload("template1", file, "test.csv",
                    Locale.JAPAN, "job1");

            assertEquals(400, response.getStatusCodeValue());
            ApiResponse<?> body = (ApiResponse<?>) response.getBody();
            assertNotNull(body);
            assertNotNull(body.getMessage());
            assertTrue(body.getMessage().contains("バリデーションエラー"));
        }
    }

    @Test
    void fileUpload_ShouldReturnInternalServerError_WhenExceptionOccurs() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getOriginalFilename()).thenReturn("test.csv");
        when(file.getInputStream()).thenThrow(new RuntimeException("IO失敗"));

        when(errorCodeService.getErrorMessage("E5001", "ja")).thenReturn("サーバーエラー");

        ResponseEntity<?> response = service.fileUpload("template1", file, "test.csv",
                Locale.JAPAN, "job1");

        assertEquals(500, response.getStatusCodeValue());
        ApiResponse<?> body = (ApiResponse<?>) response.getBody();
        assertNotNull(body);
        assertNotNull(body.getMessage());
        assertTrue(body.getMessage().contains("サーバーエラー"));
    }
}
