package com.example.servercommon.service;

import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.exception.StorageAccessException;
import com.example.servercommon.repository.JobStatusRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LocalFileStorageServiceTest {

    private JobStatusRepository repository;
    private ResourceLoader resourceLoader;
    private EnvironmentVariableResolver env;
    private LocalFileStorageService service;

    @BeforeEach
    void setUp() {
        repository = Mockito.mock(JobStatusRepository.class);
        resourceLoader = Mockito.mock(ResourceLoader.class);
        env = Mockito.mock(EnvironmentVariableResolver.class);

        Mockito.when(env.getOptional(Mockito.anyString())).thenReturn(Optional.empty());

        service = new LocalFileStorageService(repository, resourceLoader, env);
    }

    @Test
    void upload_createsFileSuccessfully() throws Exception {
        String path = "testfile.txt";
        byte[] data = "hello".getBytes();
        InputStream is = new ByteArrayInputStream(data);

        service.upload(path, is);

        Path filePath = Path.of("./localFolder").resolve(path).toAbsolutePath();
        assertThat(Files.exists(filePath)).isTrue();
        assertThat(Files.readAllBytes(filePath)).isEqualTo(data);

        Files.deleteIfExists(filePath);
    }

    @Test
    void getFileByPath_withClasspathResource_returnsFile() throws Exception {
        String fileName = "template.xlsx";
        Resource res = new ByteArrayResource("data".getBytes()) {
            @Override
            public String getFilename() { return fileName; }
        };
        Mockito.when(resourceLoader.getResource("classpath:" + fileName)).thenReturn(res);

        File f = service.getFileByPath("classpath:" + fileName);
        assertThat(f).exists();
        assertThat(f.getName()).contains(fileName);
    }

    @Test
    void getFileByPath_whenInvalid_throwsException() {
        assertThrows(StorageAccessException.class, () -> service.getFileByPath("nonexistent.txt"));
    }

    @Test
    void generatePresignedUrl_returnsUrl() throws Exception {
        Path testFile = Path.of("./localFolder/test.txt");
        Files.createDirectories(testFile.getParent());
        Files.writeString(testFile, "hello");

        URL url = service.generatePresignedUrl("test.txt");
        assertThat(url.toString()).endsWith("test.txt");

        Files.deleteIfExists(testFile);
    }

    @Test
    void delete_removesFile() throws Exception {
        Path testFile = Path.of("./localFolder/delete.txt");
        Files.createDirectories(testFile.getParent());
        Files.writeString(testFile, "hello");

        service.delete("delete.txt");
        assertThat(Files.exists(testFile)).isFalse();
    }

    @Test
    void isAlreadyProcessed_returnsTrueOrFalse() {
        File file = new File("processed.txt");
        Mockito.when(repository.existsByOriginalFileName(file.getName())).thenReturn(true);
        boolean result = service.isAlreadyProcessed(file);
        assertThat(result).isTrue();
    }
}
