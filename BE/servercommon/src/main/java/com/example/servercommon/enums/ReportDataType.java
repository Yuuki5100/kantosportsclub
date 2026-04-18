package com.example.servercommon.enums;

public enum ReportDataType {
    STRING(1, "@"),                      // 一般文字列
    NUMBER(2, "#,##0.###"), // 最大3桁小数、0埋めなし
    DATE(3, "yyyy/mm/dd"),              // 日付
    BOOLEAN(4, "BOOLEAN"),              // 書式不要
    CURRENCY(5, "\"¥\"#,##0"),          // 円通貨
    CUSTOM(9, null);                    // ユーザー定義、外部から与える

    private final int code;
    private final String defaultFormat;

    ReportDataType(int code, String defaultFormat) {
        this.code = code;
        this.defaultFormat = defaultFormat;
    }

    public int getCode() {
        return code;
    }

    public String getDefaultFormat() {
        return defaultFormat;
    }

    public static ReportDataType fromCode(Integer code) {
        if (code == null) return STRING;
        for (ReportDataType type : values()) {
            if (type.code == code) return type;
        }
        return STRING;
    }

    /**
     * 与えられたカスタム書式が null または空なら、enum のデフォルト書式を返す
     */
    public String resolveFormat(String customPattern) {
        return (customPattern != null && !customPattern.isBlank())
                ? customPattern
                : this.defaultFormat;
    }
}
