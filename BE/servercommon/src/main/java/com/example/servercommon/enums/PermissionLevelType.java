package com.example.servercommon.enums;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum PermissionLevelType {
    Custom(0, "Custom"),
    USER(1, "USER"),
    ADMIN(2, "ADMIN"),
    VIEWER(3, "VIEWER");

    private int code;
    private String permissionLevelType;

    public int getCode() {
        return code;
    }

    public String getPrmissionLevelType() {
        return this.permissionLevelType;
    }

    // ステータスがEnumに定義されているものであれば、引数の文字列をそのまま返す。定義されていなければ例外をスローする。
    public static String fromType(String permissionLevelType) {
        for (PermissionLevelType type : PermissionLevelType.values()) {
            if (type.getPrmissionLevelType() == permissionLevelType)
                return type.permissionLevelType;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_PERMISSION_LEVEL_TYPE, permissionLevelType));
    }

    // ステータスがEnumに定義されているものであれば、引数のコードをそのまま返す。定義されていなければ例外をスローする。
    public static int fromCode(int code) {
        for (PermissionLevelType type : PermissionLevelType.values()) {
            if (type.getCode() == code)
                return type.code;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_PERMISSION_LEVEL_CODE, code));
    }
}
