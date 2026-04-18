package com.example.servercommon.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PrimaryKeyGeneratorTest {

    @Test
    void generateIfNeeded_returnsUlidForString() {
        String key = PrimaryKeyGenerator.generateIfNeeded(String.class);
        assertThat(key).isNotNull();
        assertThat(key).hasSize(26); // ULIDは26文字
    }

    @Test
    void generateIfNeeded_returnsNullForIntegerClass() {
        Integer key = PrimaryKeyGenerator.generateIfNeeded(Integer.class);
        assertThat(key).isNull();
    }

    @Test
    void generateIfNeeded_returnsNullForLongClass() {
        Long key = PrimaryKeyGenerator.generateIfNeeded(Long.class);
        assertThat(key).isNull();
    }

    @Test
    void generateIfNeeded_throwsExceptionForUnsupportedType() {
        assertThrows(IllegalArgumentException.class, () ->
                PrimaryKeyGenerator.generateIfNeeded(Double.class));
    }
}

