package com.example.servercommon.utils;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class FileExecUtilsTest {

    @Test
    void fileEmptyRowsSkip_returnsTrueForEmptyRow() {
        Map<String, String> emptyRow = Map.of("col1", "", "col2", "", "col3", "");
        assertThat(FileExecUtils.fileEmptyRowsSkip(emptyRow)).isTrue();
    }

    @Test
    void fileEmptyRowsSkip_returnsFalseForNonEmptyRow() {
        Map<String, String> row = Map.of("col1", "data", "col2", "", "col3", "");
        assertThat(FileExecUtils.fileEmptyRowsSkip(row)).isFalse();
    }

    @Test
    void valueConverter_encodesPassword() {
        String rawPassword = "mypassword";
        Object encoded = FileExecUtils.valueConverter("password", rawPassword);

        assertThat(encoded).isInstanceOf(String.class);
        assertThat(encoded).isNotEqualTo(rawPassword); // ハッシュ化されているはず
    }

    @Test
    void valueConverter_formatsLocalDateTime() {
        LocalDateTime now = LocalDateTime.of(2025, 10, 8, 15, 30, 45);
        Object result = FileExecUtils.valueConverter("starttime", now);

        String expected = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        assertThat(result).isEqualTo(expected);
    }

    @Test
    void valueConverter_returnsOriginalForUnknownColumn() {
        String value = "test";
        Object result = FileExecUtils.valueConverter("unknownColumn", value);
        assertThat(result).isEqualTo(value);
    }

    @Test
    void valueConverter_returnsOriginalIfNotLocalDateTimeForStarttime() {
        String value = "notADate";
        Object result = FileExecUtils.valueConverter("starttime", value);
        assertThat(result).isEqualTo(value);
    }

}
