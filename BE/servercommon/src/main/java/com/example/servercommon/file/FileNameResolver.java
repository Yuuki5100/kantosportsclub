package com.example.servercommon.file;

import java.time.LocalDate;

/**
 * ファイル名に日付を付与するユーティリティクラス。
 */
public class FileNameResolver {

    public static String resolveWithDate(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            return "unknown_" + LocalDate.now().toString().replace("-", "") + ".txt";
        }

        String baseName = originalName.contains(".")
                ? originalName.substring(0, originalName.lastIndexOf('.'))
                : originalName;

        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.'))
                : "";

        String today = LocalDate.now().toString().replace("-", "");

        return baseName + "_" + today + extension;
    }
}
