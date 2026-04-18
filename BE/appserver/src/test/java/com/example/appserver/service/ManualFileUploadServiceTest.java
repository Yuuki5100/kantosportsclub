package com.example.appserver.service;

import com.example.servercommon.service.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.*;

class ManualFileUploadServiceTest {

    @Mock
    private StorageService storageService;

    @InjectMocks
    private ManualFileUploadService manualFileUploadService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // =========================================================
    // MANUAL-UT-082 files null -> IllegalArgumentException("file")
    // =========================================================
    @Test
    void shouldThrowWhenFilesNull() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(null)
        );
        assertEquals("file", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-083 files empty -> IllegalArgumentException("file")
    // =========================================================
    @Test
    void shouldThrowWhenFilesEmpty() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of())
        );
        assertEquals("file", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-084 files.size=11 -> IllegalArgumentException("file.count")
    // =========================================================
    @Test
    void shouldThrowWhenFileCountExceedsMax() {
        List<MultipartFile> files = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            files.add(mockValidFile("f" + i + ".pdf", 10));
        }

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(files)
        );
        assertEquals("file.count", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-085 list contains null -> IllegalArgumentException("file")
    // =========================================================
    @Test
    void shouldThrowWhenFileIsNullInList() {
        List<MultipartFile> files = new ArrayList<>();
        files.add(null);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(files)
        );

        assertEquals("file", ex.getMessage());
        verifyNoInteractions(storageService);
    }


    // =========================================================
    // MANUAL-UT-086 file.isEmpty=true -> IllegalArgumentException("file")
    // =========================================================
    @Test
    void shouldThrowWhenFileIsEmpty() {
        MultipartFile f = mock(MultipartFile.class);
        when(f.isEmpty()).thenReturn(true);
        when(f.getOriginalFilename()).thenReturn("a.pdf");
        when(f.getSize()).thenReturn(10L);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );
        assertEquals("file", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-087 originalName null -> IllegalArgumentException("file")
    // =========================================================
    @Test
    void shouldThrowWhenOriginalNameNull() {
        MultipartFile f = mockValidFile(null, 10);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );
        assertEquals("file", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-088 originalName blank -> IllegalArgumentException("file")
    // =========================================================
    @Test
    void shouldThrowWhenOriginalNameBlank() {
        MultipartFile f = mockValidFile("   ", 10);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );
        assertEquals("file", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-089 originalName length 256 -> IllegalArgumentException("file.name")
    // =========================================================
    @Test
    void shouldThrowWhenOriginalNameTooLong() {
        String longName = "a".repeat(252) + ".pdf"; // total 256
        assertEquals(256, longName.length());

        MultipartFile f = mockValidFile(longName, 10);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );
        assertEquals("file.name", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-090 size > 5MB -> IllegalArgumentException("file.size")
    // =========================================================
    @Test
    void shouldThrowWhenFileSizeExceedsMax() {
        long over = 5L * 1024L * 1024L + 1L;
        MultipartFile f = mockValidFile("a.pdf", over);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );
        assertEquals("file.size", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-091 no extension -> IllegalArgumentException("file.type")
    // =========================================================
    @Test
    void shouldThrowWhenExtensionMissing() {
        MultipartFile f = mockValidFile("manualfile", 10);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );
        assertEquals("file.type", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-092 ends with dot -> IllegalArgumentException("file.type")
    // =========================================================
    @Test
    void shouldThrowWhenExtensionEndsWithDot() {
        MultipartFile f = mockValidFile("file.", 10);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );
        assertEquals("file.type", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-093 extension not allowed -> IllegalArgumentException("file.type")
    // =========================================================
    @Test
    void shouldThrowWhenExtensionNotAllowed() {
        MultipartFile f = mockValidFile("file.exe", 10);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );
        assertEquals("file.type", ex.getMessage());
        verifyNoInteractions(storageService);
    }

    // =========================================================
    // MANUAL-UT-094 allowed extension case-insensitive -> upload called once
    // =========================================================
    @Test
    void shouldAcceptAllowedExtensionCaseInsensitive() throws Exception {
        MultipartFile f = mockValidFile("doc.PDF", 10);
        InputStream is = new ByteArrayInputStream("x".getBytes());
        when(f.getInputStream()).thenReturn(is);

        List<String> docIds = manualFileUploadService.uploadFiles(List.of(f));

        assertEquals(1, docIds.size());
        verify(storageService, times(1)).upload(anyString(), same(is));
    }

    // =========================================================
    // MANUAL-UT-095 multiple files -> returns docIds for all
    // =========================================================
    @Test
    void shouldReturnDocIdsForAllFiles() throws Exception {
        MultipartFile f1 = mockValidFile("a.pdf", 10);
        MultipartFile f2 = mockValidFile("b.pdf", 20);

        InputStream is1 = new ByteArrayInputStream("1".getBytes());
        InputStream is2 = new ByteArrayInputStream("2".getBytes());
        when(f1.getInputStream()).thenReturn(is1);
        when(f2.getInputStream()).thenReturn(is2);

        List<String> docIds = manualFileUploadService.uploadFiles(List.of(f1, f2));

        assertEquals(2, docIds.size());
        assertTrue(docIds.get(0).startsWith("manual/"));
        assertTrue(docIds.get(1).startsWith("manual/"));
        verify(storageService, times(2)).upload(anyString(), any(InputStream.class));
    }

    // =========================================================
    // MANUAL-UT-096 docId format manual/{uuid}-{originalName}
    // =========================================================
    @Test
    void shouldUseDocIdFormatManualUuidHyphenOriginalName() throws Exception {
        MultipartFile f = mockValidFile("a.pdf", 10);
        InputStream is = new ByteArrayInputStream("x".getBytes());
        when(f.getInputStream()).thenReturn(is);

        manualFileUploadService.uploadFiles(List.of(f));

        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        verify(storageService).upload(keyCaptor.capture(), any(InputStream.class));

        String key = keyCaptor.getValue();
        assertTrue(key.startsWith("manual/"));
        assertTrue(key.endsWith("-a.pdf"));
    }

    // =========================================================
    // MANUAL-UT-097 should pass InputStream to storageService.upload
    // =========================================================
    @Test
    void shouldPassFileInputStreamToStorageUpload() throws Exception {
        MultipartFile f = mockValidFile("a.pdf", 10);
        InputStream is = new ByteArrayInputStream("stream".getBytes());
        when(f.getInputStream()).thenReturn(is);

        List<String> docIds = manualFileUploadService.uploadFiles(List.of(f));

        assertEquals(1, docIds.size());
        verify(storageService, times(1)).upload(anyString(), same(is));
    }

    // =========================================================
    // MANUAL-UT-098 storageService.upload throws -> RuntimeException with cause
    // =========================================================
    @Test
    void shouldThrowRuntimeExceptionWhenStorageUploadFails() throws Exception {
        MultipartFile f = mockValidFile("a.pdf", 10);
        InputStream is = new ByteArrayInputStream("x".getBytes());
        when(f.getInputStream()).thenReturn(is);

        RuntimeException root = new RuntimeException("s3 down");
        doThrow(root).when(storageService).upload(anyString(), any(InputStream.class));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> manualFileUploadService.uploadFiles(List.of(f))
        );

        // NOTE: service wraps with new RuntimeException(ex)
        assertSame(root, ex.getCause());
        verify(storageService, times(1)).upload(anyString(), any(InputStream.class));
    }

    // =========================================================
    // MANUAL-UT-099 first fails -> second not processed
    // =========================================================
    @Test
    void shouldStopProcessingWhenAnyUploadFails() throws Exception {
        MultipartFile f1 = mockValidFile("a.pdf", 10);
        MultipartFile f2 = mockValidFile("b.pdf", 10);

        InputStream is1 = new ByteArrayInputStream("1".getBytes());
        InputStream is2 = new ByteArrayInputStream("2".getBytes());
        when(f1.getInputStream()).thenReturn(is1);
        when(f2.getInputStream()).thenReturn(is2);

        RuntimeException root = new RuntimeException("fail first");
        doThrow(root).when(storageService).upload(anyString(), same(is1));

        assertThrows(RuntimeException.class, () -> manualFileUploadService.uploadFiles(List.of(f1, f2)));

        // upload called only for first file
        verify(storageService, times(1)).upload(anyString(), any(InputStream.class));
        verify(storageService, never()).upload(anyString(), same(is2));
    }

    // ---------------------------------------------------------
    // helper: build a "valid enough" MultipartFile mock
    // ---------------------------------------------------------
    private MultipartFile mockValidFile(String originalName, long size) {
        MultipartFile f = mock(MultipartFile.class);
        when(f.isEmpty()).thenReturn(false);
        when(f.getOriginalFilename()).thenReturn(originalName);
        when(f.getSize()).thenReturn(size);
        return f;
    }
}
