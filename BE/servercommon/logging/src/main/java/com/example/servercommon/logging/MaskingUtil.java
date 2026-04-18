package com.example.servercommon.logging;

public class MaskingUtil {
    public static String mask(String message) {
        if (message != null) {
            return message.replaceAll("(?i)(password=)[^\\s,]+", "$1****");
        }
        return message;
    }
}
