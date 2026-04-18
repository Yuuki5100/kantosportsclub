package com.example.servercommon.utils;

import com.example.servercommon.enums.JobType;
import com.example.servercommon.message.BackendMessageCatalog;

public class FileTypeResolver {

    private static String safeLower(String fileName) {
        return fileName == null ? "" : fileName.toLowerCase();
    }

    public static boolean isExcel(String fileName) {
        String name = safeLower(fileName);
        return name.endsWith(".xlsx") || name.endsWith(".xls");
    }

    public static boolean isCsv(String fileName) {
        return safeLower(fileName).endsWith(".csv");
    }

    public static boolean isRRPT(String fileName) {
        return safeLower(fileName).endsWith(".rrpt");
    }

    /**
     * ファイル種別に応じた JobType を返す（現状 FILE_IMPORT に統一）
     */
    public static JobType resolveJobType(String fileName) {
        if (isCsv(fileName) || isExcel(fileName)) {
            return JobType.FILE_IMPORT;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_UNSUPPORTED_FILE_FORMAT, fileName));
    }
}
