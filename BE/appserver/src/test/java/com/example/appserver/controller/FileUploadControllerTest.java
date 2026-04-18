package com.example.appserver.controller;

import com.example.appserver.config.FileUploadProperties;
import com.example.appserver.testutil.TestPermissionConfig;
import com.example.servercommon.enums.ResourceType;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.responseModel.UploadedFileResponse;
import com.example.servercommon.service.StorageService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import org.junit.jupiter.api.Disabled;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
@Import(TestPermissionConfig.class)
@Disabled("Controller統合テストは一時スキップ")
class FileUploadControllerTest {

    private StorageService storageService;
    private FileUploadProperties fileUploadProperties;
    private BackendMessageResolver messageResolver;
    private FileUploadController fileUploadController;

    @BeforeEach
    void setUp() {
        storageService = mock(StorageService.class);
        fileUploadProperties = new FileUploadProperties();
        fileUploadProperties.setAllowedExtensions(List.of("pdf", "xlsx"));
        messageResolver = mock(BackendMessageResolver.class);

        fileUploadController = new FileUploadController(storageService, fileUploadProperties, messageResolver);
    }

    @Test
    void testUploadFile_success() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile("file", "test.pdf", "application/pdf", "dummy".getBytes());

        ResponseEntity<ApiResponse<UploadedFileResponse>> response =
                fileUploadController.uploadFile(mockFile, com.example.servercommon.enums.ResourceType.USER, Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody().isSuccess());

        UploadedFileResponse uploaded = response.getBody().getData();
        assertNotNull(uploaded);
        assertTrue(uploaded.getFileId().endsWith("-test.pdf"));
        assertEquals("test.pdf", uploaded.getOriginalName());

        verify(storageService, times(1)).upload(anyString(), any(InputStream.class));
    }

    @Test
    void testUploadFile_invalidExtension() {
        MockMultipartFile mockFile = new MockMultipartFile("file", "test.txt", "text/plain", "dummy".getBytes());

        ResponseEntity<ApiResponse<UploadedFileResponse>> response =
                fileUploadController.uploadFile(mockFile, ResourceType.USER, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertFalse(response.getBody().isSuccess());

        verify(storageService, never()).upload(anyString(), any(InputStream.class));
    }

    @Test
    void testUploadFile_emptyName() {
        MockMultipartFile mockFile = new MockMultipartFile("file", "", "application/pdf", "dummy".getBytes());

        ResponseEntity<ApiResponse<UploadedFileResponse>> response =
                fileUploadController.uploadFile(mockFile, ResourceType.USER, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertFalse(response.getBody().isSuccess());

        verify(storageService, never()).upload(anyString(), any(InputStream.class));
    }

    @Test
    void testDeleteFile_success() {
        ResponseEntity<ApiResponse<Void>> response =
                fileUploadController.deleteFile("test-file.pdf", Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody().isSuccess());

        verify(storageService).delete("test-file.pdf");
    }

    @Test
    void testDeleteFile_failure() {
        doThrow(new RuntimeException("delete failed")).when(storageService).delete("test-file.pdf");

        ResponseEntity<ApiResponse<Void>> response =
                fileUploadController.deleteFile("test-file.pdf", Locale.JAPAN);

        assertEquals(500, response.getStatusCodeValue());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void testUploadFile_noAllowedExtensions() {
        fileUploadProperties.setAllowedExtensions(Collections.emptyList());

        MockMultipartFile mockFile = new MockMultipartFile("file", "test.pdf", "application/pdf", "dummy".getBytes());

        ResponseEntity<ApiResponse<UploadedFileResponse>> response =
                fileUploadController.uploadFile(mockFile, ResourceType.USER, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertFalse(response.getBody().isSuccess());

        verify(storageService, never()).upload(anyString(), any(InputStream.class));
    }
}
