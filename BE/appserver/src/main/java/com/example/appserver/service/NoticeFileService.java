package com.example.appserver.service;

import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.service.StorageService;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeFileService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final int MAX_FILE_COUNT = 3;
    private static final int MAX_FILE_NAME_LENGTH = 255;
    private static final Set<String> ALLOWED_EXT = Set.of("pdf", "jpg", "png");

    private final StorageService storageService;
    private final EnvironmentVariableResolver env;

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
                log.error(BackendMessageCatalog.LOG_NOTICE_FILE_UPLOAD_FAILED, fileId, ex);
                throw new RuntimeException(ex);
            }

            docIds.add(fileId);
        }

        return docIds;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(BackendMessageCatalog.ARG_FILE);
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
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
        return String.format("notice/%s-%s", UUID.randomUUID(), originalName);
    }

    private String extractExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length() - 1) return null;
        return filename.substring(idx + 1);
    }

    /**
     * notice/ ディレクトリ内でUUIDプレフィックスに一致するファイルを検索する。
     * @param uuidPrefix UUID文字列（36文字）
     * @return 一致するファイル、見つからない場合はnull
     */
    public File findFileByPrefix(String uuidPrefix) {
        String baseDir = env.getOptional("storage.local.base-dir").orElse("./localFolder");
        Path noticeDir = Paths.get(baseDir).toAbsolutePath().normalize().resolve("notice");

        if (!Files.isDirectory(noticeDir)) {
            log.warn(BackendMessageCatalog.LOG_NOTICE_DIR_NOT_FOUND, noticeDir);
            return null;
        }

        try (Stream<Path> files = Files.list(noticeDir)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().startsWith(uuidPrefix))
                    .map(Path::toFile)
                    .findFirst()
                    .orElse(null);
        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_NOTICE_DIR_SEARCH_FAILED, noticeDir, e);
            return null;
        }
    }
}
