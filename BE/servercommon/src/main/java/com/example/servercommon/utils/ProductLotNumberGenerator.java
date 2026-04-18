package com.example.servercommon.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

@Component
public class ProductLotNumberGenerator implements LotNumberGenerationStrategy{
    /**
     * 製造,製品　ロット番号採番用
     * 例: ロケーション名+YYYYMMDD+0N
     * @param locationName ロケーション名
     * @param lastNumber DBから取得した最後の番号
     * @return String
     */
    @Override
    public String generate(String locationName, int lastNumber, LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%02d", lastNumber);
        return locationName + dateStr + sequence;
    }
}
