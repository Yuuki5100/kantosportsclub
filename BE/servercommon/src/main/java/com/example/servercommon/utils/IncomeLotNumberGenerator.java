package com.example.servercommon.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

@Component
public class IncomeLotNumberGenerator implements LotNumberGenerationStrategy{

    /**
     * 入庫　ロット番号採番用
     * 例: @@@+YYYYMMDD+0N
     * @param prefix  マスタコード
     * @param lastNumber DBから取得した最後の番号
     * @return String
     */
    @Override
    public String generate(String prefix, int lastNumber, LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%02d", lastNumber);
        return prefix + dateStr + sequence;
    }
}
