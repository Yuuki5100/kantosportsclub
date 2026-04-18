package com.example.servercommon.enums;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum StatusType {
    RUNNING(1, "RUNNING"),
    SUCCESS(2, "SUCCESS"),
    FAILED(3, "FAILED");

    private final int code;
    private final String statusType;

    public int getCode() {
        return code;
    }

    public String getStatusType() {
        return statusType;
    }

    // ステータスがEnumに定義されているものであれば、引数のコードをそのまま返す。定義されていなければ例外をスローする。
    public static int fromCode(int code) {
        for (StatusType type : StatusType.values()) {
            if (type.getCode() == code){
                return code;
            }
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_STATUS_TYPE_CODE, code));
    }

    // ステータスがEnumに定義されているものであれば、引数の文字列をそのまま返す。定義されていなければ例外をスローする。
    public static String fromType(String statusType) {
        for (StatusType type : StatusType.values()) {
            if (type.getStatusType() == statusType)
                return type.statusType;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_STATUS_TYPE, statusType));
    }
}
