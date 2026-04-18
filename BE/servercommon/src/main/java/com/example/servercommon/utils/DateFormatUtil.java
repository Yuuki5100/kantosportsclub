package com.example.servercommon.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class DateFormatUtil {
    public static final ZoneId JST = ZoneId.of("Asia/Tokyo");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    /**
     * 日付を "yyyy/MM/dd" の文字列にフォーマットします。
     */
    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : "";
    }

    /**
     * 日時を "yyyy/MM/dd HH:mm:ss" の文字列にフォーマットします。
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : "";
    }

    /**
     * 指定日付の月初（1日）を取得します。
     */
    public static LocalDate getFirstDayOfMonth(LocalDate date) {
        return date != null ? date.withDayOfMonth(1) : null;
    }

    /**
     * 月末日を取得します。
     */
    public static LocalDate getEndOfMonth(LocalDate date) {
        return date != null ? date.withDayOfMonth(date.lengthOfMonth()) : null;
    }

    /**
     * 指定日付に日数を加算します。
     */
    public static LocalDate addDays(LocalDate baseDate, int days) {
        return baseDate != null ? baseDate.plusDays(days) : null;
    }

    /**
     * 指定日付から日数を減算します。
     */
    public static LocalDate subtractDays(LocalDate baseDate, int days) {
        return baseDate != null ? baseDate.minusDays(days) : null;
    }

    /**
     * 日付に週数を加算します。
     */
    public static LocalDate addWeeks(LocalDate date, int weeks) {
        return date != null ? date.plusWeeks(weeks) : null;
    }

    /**
     * 日付から週数を減算します。
     */
    public static LocalDate subtractWeeks(LocalDate date, int weeks) {
        return date != null ? date.minusWeeks(weeks) : null;
    }

    /**
     * 日付に月数を加算します。
     */
    public static LocalDate addMonths(LocalDate date, int months) {
        return date != null ? date.plusMonths(months) : null;
    }

    /**
     * 日付から月数を減算します。
     */
    public static LocalDate subtractMonths(LocalDate date, int months) {
        return date != null ? date.minusMonths(months) : null;
    }

    /**
     * 文字列をLocalDateに変換します。
     */
    public static LocalDate parseToLocalDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank())
            return null;
        String[] patterns = { "yyyy-MM-dd", "yyyy/MM/dd" };
        for (String pattern : patterns) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(pattern));
            } catch (DateTimeParseException ex) {
                ex.printStackTrace();
            }
        }
        return null;
    }

    /**
     * 文字列をLocalDateTimeに変換します。
     */
    public static LocalDateTime parseToLocalDateTime(String dateStr) {
        if (dateStr == null || dateStr.isBlank())
            return null;
        String[] patterns = { "yyyy-MM-dd HH:mm:ss", "yyyy/MM/dd HH:mm:ss" };
        for (String pattern : patterns) {
            try {
                return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern(pattern));
            } catch (DateTimeParseException ex) {
                ex.printStackTrace();
            }
        }
        return null;
    }

    // ----海外関連のプロジェクトがあるときのためZoneDateTime,UTC フォーマットを追加----

    /**
     * ZonedDateTimeをUTCに変換します。
     */
    public static ZonedDateTime toUTC(ZonedDateTime zonedDateTime) {
        return zonedDateTime != null ? zonedDateTime.withZoneSameInstant(ZoneOffset.UTC) : null;
    }

    /**
     * UTC時間を指定したタイムゾーンに変換します。
     */
    public static ZonedDateTime toLocalZone(ZonedDateTime utcDateTime, String zoneId) {
        return utcDateTime != null ? utcDateTime.withZoneSameInstant(ZoneId.of(zoneId)) : null;
    }

    /**
     * LocalDateTimeをZonedDateTimeに変換します。
     */
    public static ZonedDateTime toZonedDateTime(LocalDateTime localDateTime, String zoneId) {
        return localDateTime != null ? localDateTime.atZone(ZoneId.of(zoneId)) : null;
    }

    /**
     * 現在のUTC時間を取得します。
     */
    public static ZonedDateTime nowUTC() {
        return ZonedDateTime.now(ZoneOffset.UTC);
    }

    /**
     * 現在の指定したタイムゾーンの時間を取得します。
     */
    public static ZonedDateTime nowInZone(String zoneId) {
        return ZonedDateTime.now(ZoneId.of(zoneId));
    }

    /**
     * UTC の現在時刻を LocalDateTime で返します。
     */
    public static LocalDateTime nowUtcLocalDateTime() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    /**
     * UTC の LocalDateTime を JST の同一瞬間に変換します。
     */
    public static LocalDateTime utcToJst(LocalDateTime utcDateTime) {
        if (utcDateTime == null) {
            return null;
        }
        return utcDateTime.atOffset(ZoneOffset.UTC).atZoneSameInstant(JST).toLocalDateTime();
    }

    /**
     * JST の LocalDateTime を UTC の同一瞬間に変換します。
     */
    public static LocalDateTime jstToUtc(LocalDateTime jstDateTime) {
        if (jstDateTime == null) {
            return null;
        }
        return jstDateTime.atZone(JST).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
    }

    /**
     * Excelのシリアル日付（例: 45292）をLocalDateに変換します。
     */
    public static LocalDate fromExcelSerialDate(int serialDate) {
        return LocalDate.of(1899, 12, 30).plusDays(serialDate);
    }

}
