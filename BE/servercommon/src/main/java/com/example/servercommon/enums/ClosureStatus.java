package com.example.servercommon.enums;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum ClosureStatus {
    OPEN(1 , "未締"),
    CLOSED(2 , "締済"),
    REOPENED(3 , "解除");

    private final int code;
    private final String status;

    public int getCode() {
        return code;
    }

    public String getStatus() {
        return status;
    }

    public static ClosureStatus fromCode(int code) {
        for (ClosureStatus status : values()) {
            if (status.getCode() == code) return status;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_CLOSURE_STATUS_CODE, code));
    }

    public static ClosureStatus fromStatus(String status) {
        for (ClosureStatus closureStatus : values()) {
            if (closureStatus.getStatus() == status) return closureStatus;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_CLOSURE_STATUS, status));
    }
}
