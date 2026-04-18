package com.example.servercommon.utils;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class CustomNumberFormatUtilTest {

    @Test
    void formatDecimal_whenNumberIsNull_returnsEmpty() {
        String result = CustomNumberFormatUtil.formatDecimal(null, 2);
        assertThat(result).isEmpty();
    }

    @Test
    void formatDecimal_roundsCorrectly() {
        BigDecimal number = new BigDecimal("123.4567");
        String result = CustomNumberFormatUtil.formatDecimal(number, 2);
        assertThat(result).isEqualTo("123.46");

        number = new BigDecimal("123.451");
        result = CustomNumberFormatUtil.formatDecimal(number, 2);
        assertThat(result).isEqualTo("123.45");
    }

    @Test
    void parseFormattedNumber_whenNullOrEmpty_returnsZero() {
        assertThat(CustomNumberFormatUtil.parseFormattedNumber(null)).isEqualTo(BigDecimal.ZERO);
        assertThat(CustomNumberFormatUtil.parseFormattedNumber("")).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    void parseFormattedNumber_parsesCorrectly() {
        String formatted = "1,234,567.89";
        BigDecimal result = CustomNumberFormatUtil.parseFormattedNumber(formatted);
        assertThat(result).isEqualTo(new BigDecimal("1234567.89"));
    }

    @Test
    void parseFormattedInt_whenNullOrEmpty_returnsZero() {
        assertThat(CustomNumberFormatUtil.parseFormattedInt(null)).isZero();
        assertThat(CustomNumberFormatUtil.parseFormattedInt("")).isZero();
    }

    @Test
    void parseFormattedInt_parsesCorrectly() {
        String formatted = "1,234";
        int result = CustomNumberFormatUtil.parseFormattedInt(formatted);
        assertThat(result).isEqualTo(1234);
    }

    @Test
    void zeroPad_formatsCorrectly() {
        assertThat(CustomNumberFormatUtil.zeroPad(5, 4)).isEqualTo("0005");
        assertThat(CustomNumberFormatUtil.zeroPad(123, 6)).isEqualTo("000123");
        assertThat(CustomNumberFormatUtil.zeroPad(0, 3)).isEqualTo("000");
    }

    @Test
    void zeroPad_whenLengthSmallerThanNumberLength_returnsNumberAsString() {
        assertThat(CustomNumberFormatUtil.zeroPad(12345, 3)).isEqualTo("12345");
    }
}

