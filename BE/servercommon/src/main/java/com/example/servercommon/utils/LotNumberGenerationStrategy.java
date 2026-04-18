package com.example.servercommon.utils;

import java.time.LocalDate;

public interface LotNumberGenerationStrategy {
    String generate(String param, int lastNumber, LocalDate date);
}
