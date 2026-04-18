package com.example.servercommon.utils;

import java.util.HashMap;
import java.util.Map;

/**
 * パーミッション系ユーティリティ
 */
public class PermissionUtils {

    /**
     * キーを大文字化するユーティリティ
     *
     * @param key キー文字列
     * @return 大文字化されたキー
     */
    public static String normalizeKey(String key) {
        return key != null ? key.toUpperCase() : null;
    }

    /**
     * マップ内のすべてのキーを大文字化して新しいマップを返す
     *
     * @param original 元のマップ
     * @return キーが大文字化された新しいマップ
     */
    public static <T> Map<String, T> normalizeKeys(Map<String, T> original) {
        Map<String, T> normalized = new HashMap<>();
        if (original != null) {
            for (Map.Entry<String, T> entry : original.entrySet()) {
                String upperKey = normalizeKey(entry.getKey());
                normalized.put(upperKey, entry.getValue());
            }
        }
        return normalized;
    }

}
