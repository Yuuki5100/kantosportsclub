package com.example.servercommon.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;
public class CustomNumberFormatUtil {
    private static final NumberFormat NUMBER_FORMAT = NumberFormat.getNumberInstance(Locale.JAPAN);
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(Locale.JAPAN);

    /**
     * 小数点以下を指定桁数でフォーマット（例：123.4567, 2 → "123.46"）
     */
    public static String formatDecimal(BigDecimal number, int scale) {
        if (number == null) return "";
        return number.setScale(scale, RoundingMode.HALF_UP).toPlainString();
    }

    /**
     * カンマ付きの文字列をBigDecimalに変換（例："1,234,567.89" → 1234567.89）
     */
    public static BigDecimal parseFormattedNumber(String formatted) {
        if (formatted == null || formatted.isEmpty()) return BigDecimal.ZERO;
        String clean = formatted.replace(",", "");
        return new BigDecimal(clean);
    }

    /**
     * カンマ付きの文字列をintに変換（例："1,234" → 1234）
     */
    public static int parseFormattedInt(String formatted) {
        if (formatted == null || formatted.isEmpty()) return 0;
        return Integer.parseInt(formatted.replace(",", ""));
    }

    /**
     * ゼロ埋めで数値をフォーマット（例：5, 4 → "0005"）
     * 例:バーコード生成など(12->000012)
     */
    public static String zeroPad(int number, int length) {
        return String.format("%0" + length + "d", number);
    }

}
