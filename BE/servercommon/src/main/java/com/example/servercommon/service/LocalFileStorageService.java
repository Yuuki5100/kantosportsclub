package com.example.servercommon.service;

import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.exception.StorageAccessException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.JobStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements StorageService {

    private final JobStatusRepository jobStatusRepository;
    private final ResourceLoader resourceLoader;
    private final EnvironmentVariableResolver env;

    /** ベースディレクトリ（yml 未設定なら ./localFolder） */
    private Path baseDir() {
        String dir = env.getOptional("storage.local.base-dir").orElse("./localFolder");
        return Paths.get(dir).toAbsolutePath().normalize();
    }

    /** 入力/アーカイブ/エラー各ディレクトリ（ベース以下） */
    private Path inputDir()   { return baseDir().resolve(env.getOptional("storage.local.input-dir").orElse("input")); }
    private Path archiveDir() { return baseDir().resolve(env.getOptional("storage.local.archive-dir").orElse("archive")); }
    private Path errorDir()   { return baseDir().resolve(env.getOptional("storage.local.error-dir").orElse("error")); }

    /** テンプレートの基点（classpath or file を想定）。未設定なら classpath 配下に置く想定 */
    private String templateBase() {
        return env.getOptional("storage.local.template-dir")
                  .orElse("classpath:config/template/export/excel");
    }

    @Override
    public void upload(String path, InputStream inputStream) {
        try {
            Path targetPath = baseDir().resolve(path).normalize();
            Files.createDirectories(targetPath.getParent());
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_LOCAL_SAVE_FAILED, path, e);
            throw new StorageAccessException(BackendMessageCatalog.EX_LOCAL_FILE_SAVE_FAILED, e);
        }
    }

    @Override
    public List<File> listInputFiles() {
        try {
            if (!Files.isDirectory(inputDir())) return List.of();
            try (var stream = Files.list(inputDir())) {
                return stream.filter(Files::isRegularFile)
                             .map(Path::toFile)
                             .collect(Collectors.toList());
            }
        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_LOCAL_INPUT_LIST_FAILED, inputDir(), e);
            return List.of();
        }
    }

    @Override
    public File getFileByPath(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new StorageAccessException(BackendMessageCatalog.EX_FILE_PATH_EMPTY);
        }
        try {
            // 1) 明示スキーム（classpath:, file:）
            if (filePath.startsWith("classpath:") || filePath.startsWith("file:")) {
                return copyResourceToTemp(resourceLoader.getResource(filePath), filePath);
            }
            // 2) 絶対/相対ファイルとして存在
            Path p = Paths.get(filePath);
            if (p.isAbsolute() || Files.exists(p)) {
                File f = p.toFile();
                if (f.exists() && f.isFile()) return f;
            }
            // 3) “素のファイル名” → templateBase から解決
            String base = templateBase();
            String resolved = base.endsWith("/") ? (base + filePath) : (base + "/" + filePath);
            Resource res = resourceLoader.getResource(resolved);
            if (res.exists()) {
                return copyResourceToTemp(res, resolved);
            }
            // 4) フォールバック：baseDir 直下
            Path fallback = baseDir().resolve(filePath).normalize();
            if (Files.exists(fallback) && Files.isRegularFile(fallback)) {
                return fallback.toFile();
            }

            throw new StorageAccessException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_LOCAL_TEMPLATE_FETCH_FAILED, filePath));
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_LOCAL_GET_FILE_FAILED, filePath, e);
            if (e instanceof StorageAccessException) throw (StorageAccessException) e;
            throw new StorageAccessException(
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_FILE_FETCH_FAILED, filePath), e);
        }
    }

    private File copyResourceToTemp(Resource res, String debugPath) throws IOException {
        if (!res.exists()) {
            throw new StorageAccessException(BackendMessageCatalog.format(BackendMessageCatalog.EX_RESOURCE_NOT_FOUND, debugPath));
        }
        String name = Optional.ofNullable(res.getFilename()).orElse("template");
        File temp = File.createTempFile("tpl-", "-" + name);
        try (InputStream is = res.getInputStream();
             FileOutputStream fos = new FileOutputStream(temp)) {
            is.transferTo(fos);
        }
        temp.deleteOnExit();
        return temp;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isAlreadyProcessed(File file) {
        return jobStatusRepository.existsByOriginalFileName(file.getName());
    }

    @Override
    public void markAsSuccess(File file) {
        moveFile(file, archiveDir());
    }

    @Override
    public void markAsFailed(File file) {
        moveFile(file, errorDir());
    }

    private void moveFile(File file, Path targetDir) {
        try {
            Files.createDirectories(targetDir);
            Files.move(file.toPath(), targetDir.resolve(file.getName()),
                       StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_LOCAL_MOVE_FAILED, file.getName(), e);
        }
    }

    @Override
    public URL generatePresignedUrl(String objectKey) {
        try {
            // ローカルは署名不要：ローカルファイルの file:// URL を返す
            return baseDir().resolve(objectKey).normalize().toUri().toURL();
        } catch (MalformedURLException e) {
            log.error(BackendMessageCatalog.LOG_LOCAL_INVALID_URL_FORMAT, e.getMessage());
            throw new StorageAccessException(BackendMessageCatalog.EX_INVALID_URL_FORMAT, e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            Path filePath = baseDir().resolve(path).normalize();
            Files.deleteIfExists(filePath);
            log.info(BackendMessageCatalog.LOG_LOCAL_DELETE_SUCCESS, path);
        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_LOCAL_DELETE_FAILED, path, e);
            throw new StorageAccessException(BackendMessageCatalog.EX_LOCAL_DELETE_FAILED, e);
        }
    }

    @Override
    public List<String> listByPrefix(String prefix) {
        try {
            Path dir = baseDir();
            // prefix may contain directory separator (e.g. "notice/uuid")
            Path prefixPath = dir.resolve(prefix).normalize();
            Path parentDir = prefixPath.getParent();
            String filePrefix = prefixPath.getFileName().toString();

            if (parentDir == null || !Files.isDirectory(parentDir)) {
                return List.of();
            }
            try (var stream = Files.list(parentDir)) {
                return stream
                        .filter(Files::isRegularFile)
                        .filter(p -> p.getFileName().toString().startsWith(filePrefix))
                        .map(p -> dir.relativize(p).toString().replace("\\", "/"))
                        .collect(Collectors.toList());
            }
        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_LOCAL_PREFIX_SEARCH_FAILED, prefix, e);
            return List.of();
        }
    }
}
