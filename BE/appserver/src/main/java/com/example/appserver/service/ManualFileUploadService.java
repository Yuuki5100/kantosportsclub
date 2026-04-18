package com.example.appserver.service;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.service.StorageService;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ManualFileUploadService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final int MAX_FILE_COUNT = 10;
    private static final int MAX_FILE_NAME_LENGTH = 255;
    private static final Set<String> ALLOWED_EXT = Set.of("pdf", "jpg", "png", "xlsx", "docx");

    private final StorageService storageService;

    public List<String> uploadFiles(List<MultipartFile> files) throws IllegalArgumentException {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE);
        }
        if (files.size() > MAX_FILE_COUNT) {
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE_COUNT);
        }

        List<String> docIds = new ArrayList<>();
        for (MultipartFile file : files) {
            validateFile(file);
            String fileId = buildFileId(file.getOriginalFilename());

            try (InputStream is = file.getInputStream()) {
                storageService.upload(fileId, is);
            } catch (Exception ex) {
                log.error(BackendMessageCatalog.LOG_MANUAL_FILE_UPLOAD_FAILED, fileId, ex);
                throw new RuntimeException(ex);
            }

            docIds.add(fileId);
        }

        return docIds;
    }

    private void validateFile(MultipartFile file) {
        if (file == null) {
            log.error(BackendMessageCatalog.LOG_MANUAL_UPLOAD_VALIDATION_FILE_NULL);
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE);
        }
        if (file.isEmpty()) {
            log.error(BackendMessageCatalog.LOG_MANUAL_UPLOAD_VALIDATION_FILE_EMPTY, file.getOriginalFilename(), file.getSize());
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE);
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            log.error(BackendMessageCatalog.LOG_MANUAL_UPLOAD_VALIDATION_NAME_BLANK);
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE);
        }

        if (originalName.length() > MAX_FILE_NAME_LENGTH) {
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE_NAME);
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE_SIZE);
        }

        String ext = extractExtension(originalName);
        if (ext == null || !ALLOWED_EXT.contains(ext.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE_TYPE);
        }
    }

    private String buildFileId(String originalName) {
        return String.format("manual/%s-%s", UUID.randomUUID(), originalName);
    }

    private String extractExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length() - 1) return null;
        return filename.substring(idx + 1);
    }
}
