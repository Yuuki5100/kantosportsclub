package com.example.servercommon.utils;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class IncomeLotNumberGeneratorTest {

    private final IncomeLotNumberGenerator generator = new IncomeLotNumberGenerator();

    @Test
    void generate_returnsCorrectFormatForSingleDigitSequence() {
        String prefix = "ABC";
        int lastNumber = 1;
        LocalDate date = LocalDate.of(2025, 10, 8);

        String result = generator.generate(prefix, lastNumber, date);

        assertThat(result).isEqualTo("ABC2025100801");
    }

    @Test
    void generate_returnsCorrectFormatForDoubleDigitSequence() {
        String prefix = "XYZ";
        int lastNumber = 12;
        LocalDate date = LocalDate.of(2025, 1, 5);

        String result = generator.generate(prefix, lastNumber, date);

        assertThat(result).isEqualTo("XYZ2025010512");
    }

    @Test
    void generate_returnsCorrectFormatForZeroSequence() {
        String prefix = "LOT";
        int lastNumber = 0;
        LocalDate date = LocalDate.of(2025, 12, 31);

        String result = generator.generate(prefix, lastNumber, date);

        assertThat(result).isEqualTo("LOT2025123100");
    }

    @Test
    void generate_returnsCorrectFormatForPrefixWithSpecialCharacters() {
        String prefix = "@@@";
        int lastNumber = 5;
        LocalDate date = LocalDate.of(2025, 3, 15);

        String result = generator.generate(prefix, lastNumber, date);

        assertThat(result).isEqualTo("@@@2025031505");
    }
}

