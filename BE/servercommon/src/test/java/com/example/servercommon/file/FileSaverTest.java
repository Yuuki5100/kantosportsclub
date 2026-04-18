package com.example.servercommon.file;

import com.example.servercommon.service.StorageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class FileSaverTest {

    @Test
    @DisplayName("✅ StorageService.upload() が正しく呼び出される")
    void save_shouldDelegateToStorageService() throws IOException {
        // Arrange
        StorageService mockStorageService = mock(StorageService.class);
        FileSaver fileSaver = new FileSaver(mockStorageService);
        String filename = "users_20250430.csv";
        InputStream stream = new ByteArrayInputStream("dummy data".getBytes());

        // Act
        fileSaver.save(filename, stream);

        // Assert
        verify(mockStorageService, times(1)).upload(eq(filename), eq(stream));
    }

}
