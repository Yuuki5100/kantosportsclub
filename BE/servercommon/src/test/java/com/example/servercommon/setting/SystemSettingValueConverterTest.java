package com.example.servercommon.setting;

import java.time.Duration;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SystemSettingValueConverterTest {

    private final SystemSettingValueConverter converter = new SystemSettingValueConverter();

    @Test
    void convert_shouldConvertInteger() {
        Integer result = converter.convert("NUMBER_OF_RETRIES", "10", Integer.class);
        assertThat(result).isEqualTo(10);
    }

    @Test
    void convert_shouldConvertDuration() {
        Duration result = converter.convert("SAMPLE_DURATION", "10m", Duration.class);
        assertThat(result).isEqualTo(Duration.ofMinutes(10));
    }

    @Test
    void convert_shouldThrowWhenBooleanIsInvalid() {
        assertThatThrownBy(() -> converter.convert("FLAG", "not-bool", Boolean.class))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("System setting conversion failed");
    }
}
