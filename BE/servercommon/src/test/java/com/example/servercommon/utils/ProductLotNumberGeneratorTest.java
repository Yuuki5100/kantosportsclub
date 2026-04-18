package com.example.servercommon.utils;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ProductLotNumberGeneratorTest {

    @Test
    void generate_returnsExpectedLotNumber() {
        ProductLotNumberGenerator generator = new ProductLotNumberGenerator();
        LocalDate date = LocalDate.of(2025, 10, 8);
        String locationName = "LOC";
        int lastNumber = 5;

        String lotNumber = generator.generate(locationName, lastNumber, date);

        assertThat(lotNumber).isEqualTo("LOC2025100805");
    }

    @Test
    void generate_formatsSingleDigitNumberWithLeadingZero() {
        ProductLotNumberGenerator generator = new ProductLotNumberGenerator();
        LocalDate date = LocalDate.of(2025, 10, 8);
        String locationName = "PROD";
        int lastNumber = 3;

        String lotNumber = generator.generate(locationName, lastNumber, date);

        assertThat(lotNumber).isEqualTo("PROD2025100803");
    }

    @Test
    void generate_formatsDoubleDigitNumberCorrectly() {
        ProductLotNumberGenerator generator = new ProductLotNumberGenerator();
        LocalDate date = LocalDate.of(2025, 10, 8);
        String locationName = "ITEM";
        int lastNumber = 12;

        String lotNumber = generator.generate(locationName, lastNumber, date);

        assertThat(lotNumber).isEqualTo("ITEM2025100812");
    }
}

