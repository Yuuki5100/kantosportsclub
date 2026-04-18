package com.example.servercommon.service;

import com.example.servercommon.file.FileSaver;
import com.example.servercommon.message.BackendMessageCatalog;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncJobArtifactService {

    private final StorageService storageService;
    private final FileSaver fileSaver;

    public void save(String artifactPath, InputStream inputStream) throws IOException {
        fileSaver.save(artifactPath, inputStream);
    }

    public InputStream open(String artifactPath) throws IOException {
        if (!StringUtils.hasText(artifactPath)) {
            throw new IllegalStateException(BackendMessageCatalog.EX_FILE_PATH_EMPTY);
        }
        File file = storageService.getFileByPath(artifactPath);
        if (file == null || !file.exists()) {
            throw new IllegalStateException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_FILE_FETCH_FAILED, artifactPath));
        }
        return new FileInputStream(file);
    }

    public URL generateDownloadUrl(String artifactPath) {
        if (!StringUtils.hasText(artifactPath)) {
            return null;
        }
        return storageService.generatePresignedUrl(artifactPath);
    }

    public void deleteQuietly(String artifactPath) {
        if (!StringUtils.hasText(artifactPath)) {
            return;
        }
        try {
            storageService.delete(artifactPath);
        } catch (Exception ex) {
            log.warn(BackendMessageCatalog.LOG_FILE_DELETE_FAILED, ex.getMessage(), ex);
        }
    }
}

