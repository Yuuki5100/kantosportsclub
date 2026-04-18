package com.example.batchserver.scheduler;

import com.example.servercommon.service.ImportJobExecutor;
import com.example.servercommon.service.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.mockito.Mockito;

import java.io.File;
import java.util.List;

import static org.mockito.Mockito.*;

class FileImportSchedulerTest {

    private StorageService storageService;
    private ImportJobExecutor importJobExecutor;
    private FileImportScheduler scheduler;

    @BeforeEach
    void setUp() {
        storageService = mock(StorageService.class);
        importJobExecutor = mock(ImportJobExecutor.class);
        scheduler = new FileImportScheduler(storageService, importJobExecutor);
    }

    @Test
    void testScanInputDirectory_AllNewFiles_Success() {
        File file1 = mock(File.class);
        File file2 = mock(File.class);

        when(storageService.listInputFiles()).thenReturn(List.of(file1, file2));
        when(storageService.isAlreadyProcessed(file1)).thenReturn(false);
        when(storageService.isAlreadyProcessed(file2)).thenReturn(false);

        scheduler.scanInputDirectory();

        // 処理順序の検証
        InOrder inOrder = inOrder(storageService);
        inOrder.verify(storageService).listInputFiles();
        inOrder.verify(storageService).isAlreadyProcessed(file1);
        inOrder.verify(storageService).markAsSuccess(file1);
        inOrder.verify(storageService).isAlreadyProcessed(file2);
        inOrder.verify(storageService).markAsSuccess(file2);

        verifyNoInteractions(importJobExecutor); // 今回 execute は呼ばれない仕様
    }

    @Test
    void testScanInputDirectory_SomeAlreadyProcessed() {
        File file1 = mock(File.class);
        File file2 = mock(File.class);

        when(storageService.listInputFiles()).thenReturn(List.of(file1, file2));
        when(storageService.isAlreadyProcessed(file1)).thenReturn(true);
        when(storageService.isAlreadyProcessed(file2)).thenReturn(false);

        scheduler.scanInputDirectory();

        verify(storageService).isAlreadyProcessed(file1);
        verify(storageService, never()).markAsSuccess(file1);

        verify(storageService).isAlreadyProcessed(file2);
        verify(storageService).markAsSuccess(file2);
    }

    @Test
    void testScanInputDirectory_FileProcessingThrowsException() {
        File file1 = mock(File.class);
        when(storageService.listInputFiles()).thenReturn(List.of(file1));
        when(storageService.isAlreadyProcessed(file1)).thenReturn(false);

        doThrow(new RuntimeException("処理失敗")).when(storageService).markAsSuccess(file1);

        scheduler.scanInputDirectory();

        // 例外が発生しても markAsFailed が呼ばれる
        verify(storageService).markAsFailed(file1);
    }
}
