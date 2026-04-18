package com.example.servercommon.file;

import java.util.Arrays;
import java.util.List;

import lombok.AllArgsConstructor;

/**
 * ファイル種別を表す列挙型。
 * プレフィックスや拡張子、バリデータBean名、シート名などの情報を保持。
 */
@AllArgsConstructor
public enum FileType {
    USERS("users", "csv", "usersFileValidator", List.of("users")),
    ORDERS("orders", "xlsx", "ordersFileValidator", List.of("orders")),
    MASTER_ITEM("masteritems", "xlsx", "masterFileValidator", List.of("品目", "品目プラ形態タイプ"));

    private final String prefix;
    private final String extension;
    private final String validatorBeanName;
    private final List<String> sheetNames;

    public String getValidatorBeanName() {
        return validatorBeanName;
    }

    public List<String> getSheetNames() {
        return sheetNames;
    }

    /**
     * ファイル名からFileTypeを判定（プレフィックス + 拡張子にマッチ）。
     * 例: "users_20250328.csv" → USERS
     *
     * @param filename 判定対象のファイル名
     * @return 該当するFileType
     * @throws IllegalArgumentException 対応するFileTypeが存在しない場合
     */
    public static FileType fromFilename(String filename) {
        String lower = filename.toLowerCase();
        return Arrays.stream(values())
                .filter(type -> lower.contains(type.prefix) && lower.endsWith("." + type.extension))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("未対応のファイル種別です: " + filename));
    }

    /**
     * 指定されたファイル名がサポートされるFileTypeかを判定。
     *
     * @param filename 判定対象のファイル名
     * @return サポート対象であれば true、そうでなければ false
     */
    public static boolean supports(String filename) {
        try {
            fromFilename(filename);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * デフォルトのシート名を返却（プレフィックスを大文字化した文字列）。
     *
     * @return シート名（例: "masteritems" → "MASTERITEMS"）
     */
    public String getSheetName() {
        return prefix.toUpperCase();
    }
}
