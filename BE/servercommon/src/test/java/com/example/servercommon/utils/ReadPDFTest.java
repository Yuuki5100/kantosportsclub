package com.example.servercommon.utils;

import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileWriter;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ReadPDFTest {

    @Test
    void readJson_readsValidJsonFileSuccessfully() throws Exception {
        // 一時的にJSONファイルを作成
        File tempFile = File.createTempFile("test", ".json");
        tempFile.deleteOnExit();

        String jsonContent = "{ \"name\": \"Alice\", \"age\": 30 }";
        try (FileWriter writer = new FileWriter(tempFile)) {
            writer.write(jsonContent);
        }

        // Map<String, Object> にキャストして読み込む
        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) ReadPDF.readJson(tempFile.getAbsolutePath());

        // 結果確認
        assertThat(result).isNotNull();
        assertThat(result).containsEntry("name", "Alice");
        assertThat(result).containsEntry("age", 30); // ageはInteger型で入ってくる
    }

    @Test
    void readJson_throwsExceptionForInvalidFile() {
        String invalidPath = "non_existent_file.json";

        org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () -> {
            ReadPDF.readJson(invalidPath);
        });
    }

    @Test
    void readJson_readsEmptyJsonObject() throws Exception {
        File tempFile = File.createTempFile("empty", ".json");
        tempFile.deleteOnExit();

        String jsonContent = "{}";
        try (FileWriter writer = new FileWriter(tempFile)) {
            writer.write(jsonContent);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) ReadPDF.readJson(tempFile.getAbsolutePath());

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }
}
