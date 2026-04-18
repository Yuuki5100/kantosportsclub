package com.example.servercommon.utils;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class PermissionUtilsTest {

    @Test
    void normalizeKey_returnsUpperCase() {
        String input = "read";
        String result = PermissionUtils.normalizeKey(input);
        assertThat(result).isEqualTo("READ");
    }

    @Test
    void normalizeKey_returnsNullForNullInput() {
        String result = PermissionUtils.normalizeKey(null);
        assertThat(result).isNull();
    }

    @Test
    void normalizeKeys_returnsMapWithUpperCaseKeys() {
        Map<String, String> input = new HashMap<>();
        input.put("read", "value1");
        input.put("write", "value2");

        Map<String, String> result = PermissionUtils.normalizeKeys(input);

        assertThat(result).hasSize(2);
        assertThat(result).containsKeys("READ", "WRITE");
        assertThat(result.get("READ")).isEqualTo("value1");
        assertThat(result.get("WRITE")).isEqualTo("value2");
    }

    @Test
    void normalizeKeys_returnsEmptyMapForNullInput() {
        Map<String, String> result = PermissionUtils.normalizeKeys(null);
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void normalizeKeys_preservesValues() {
        Map<String, Integer> input = new HashMap<>();
        input.put("key1", 10);
        input.put("key2", 20);

        Map<String, Integer> result = PermissionUtils.normalizeKeys(input);

        assertThat(result.get("KEY1")).isEqualTo(10);
        assertThat(result.get("KEY2")).isEqualTo(20);
    }
}
