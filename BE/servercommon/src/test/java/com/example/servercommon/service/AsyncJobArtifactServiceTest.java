package com.example.servercommon.service;

import com.example.servercommon.file.FileSaver;
import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AsyncJobArtifactServiceTest {

    @TempDir
    File tempDir;

    @Mock
    private StorageService storageService;
    @Mock
    private FileSaver fileSaver;

    private AsyncJobArtifactService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new AsyncJobArtifactService(storageService, fileSaver);
    }

    @Test
    void save_shouldDelegateToFileSaver() throws Exception {
        try (InputStream inputStream = InputStream.nullInputStream()) {
            service.save("async-jobs/job-1.pdf", inputStream);
        }
        verify(fileSaver).save(eq("async-jobs/job-1.pdf"), any(InputStream.class));
    }

    @Test
    void open_shouldReturnStreamWhenFileExists() throws Exception {
        File file = new File(tempDir, "sample.txt");
        Files.writeString(file.toPath(), "hello", StandardCharsets.UTF_8);
        when(storageService.getFileByPath("async-jobs/sample.txt")).thenReturn(file);

        try (InputStream stream = service.open("async-jobs/sample.txt")) {
            assertNotNull(stream);
            assertEquals("hello", new String(stream.readAllBytes(), StandardCharsets.UTF_8));
        }
    }

    @Test
    void open_shouldThrowWhenPathIsEmpty() {
        assertThrows(IllegalStateException.class, () -> service.open(" "));
    }

    @Test
    void generateDownloadUrl_shouldDelegateStorageService() throws Exception {
        URL expected = new URL("http://example.com/file");
        when(storageService.generatePresignedUrl("async-jobs/job-2.pdf")).thenReturn(expected);

        URL actual = service.generateDownloadUrl("async-jobs/job-2.pdf");

        assertEquals(expected, actual);
    }

    @Test
    void deleteQuietly_shouldSkipBlankPath() {
        service.deleteQuietly(" ");
        verify(storageService, never()).delete(any());
    }
}
