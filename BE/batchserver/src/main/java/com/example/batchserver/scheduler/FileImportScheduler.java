package com.example.batchserver.scheduler;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.service.ImportJobExecutor;
import com.example.servercommon.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileImportScheduler {

    private final StorageService storageService;
    private final ImportJobExecutor importJobExecutor;

    @Scheduled(cron = "0 * * * * *") // 毎分
    public void scanInputDirectory() {
        log.info(BackendMessageCatalog.LOG_BATCH_FILE_SCAN_START);

        List<File> files = storageService.listInputFiles();

        for (File file : files) {
            if (storageService.isAlreadyProcessed(file)) {
                log.info(BackendMessageCatalog.LOG_BATCH_FILE_ALREADY_PROCESSED, file.getName());
                continue;
            }

            try {
                log.info(BackendMessageCatalog.LOG_BATCH_FILE_DETECTED, file.getName());
                // 以下で呼び出しているvalidate処理が古いため不要
                // importJobExecutor.execute(file);
                storageService.markAsSuccess(file);
            } catch (Exception e) {
                log.error(BackendMessageCatalog.LOG_BATCH_FILE_PROCESS_FAILED, file.getName(), e);
                storageService.markAsFailed(file);
            }
        }

        log.info(BackendMessageCatalog.LOG_BATCH_FILE_SCAN_END);
    }
}
