package com.example.servercommon.validationtemplate.reader;

import org.apache.commons.csv.CSVRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CsvRecordReaderTest {

    private CsvRecordReader reader;

    @BeforeEach
    void setUp() {
        reader = new CsvRecordReader();
    }

    @Test
    void read_returnsEmptyList_whenInputIsEmpty() {
        String csv = "";
        InputStream is = new ByteArrayInputStream(csv.getBytes());
        List<Map<String, String>> result = reader.read(is);
        assertThat(result).isEmpty();
    }

    @Test
    void read_parsesCsvWithHeaderAndRows() {
        String csv = """
                name,email,age
                Alice,alice@example.com,30
                Bob,bob@example.com,25
                """;
        InputStream is = new ByteArrayInputStream(csv.getBytes());
        List<Map<String, String>> result = reader.read(is);

        assertThat(result).hasSize(2);
        assertThat(result.get(0)).containsEntry("name", "Alice")
                                  .containsEntry("email", "alice@example.com")
                                  .containsEntry("age", "30");
        assertThat(result.get(1)).containsEntry("name", "Bob")
                                  .containsEntry("email", "bob@example.com")
                                  .containsEntry("age", "25");
    }

    @Test
    void read_trimsHeaderAndValues() {
        String csv = " name , email \n Alice , alice@example.com \n";
        InputStream is = new ByteArrayInputStream(csv.getBytes());
        List<Map<String, String>> result = reader.read(is);

        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("name", "Alice")
                                  .containsEntry("email", "alice@example.com");
    }

    @Test
    void read_ignoresEmptyLines() {
        String csv = """
                name,email
                Alice,alice@example.com

                Bob,bob@example.com
                """;
        InputStream is = new ByteArrayInputStream(csv.getBytes());
        List<Map<String, String>> result = reader.read(is);

        assertThat(result).hasSize(2);
        assertThat(result.get(0)).containsEntry("name", "Alice");
        assertThat(result.get(1)).containsEntry("name", "Bob");
    }
}
