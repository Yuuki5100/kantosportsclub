package com.example.servercommon.enums;

import com.example.servercommon.message.BackendMessageCatalog;

public enum JobType {
    DUMMY_JOB(1, "ダミージョブ"),
    DUMMY_JOB_B(2, "ダミージョブB"),
    FILE_IMPORT(3, "ファイル取込ジョブ");

    private final int code;
    private final String label;

    JobType(int code, String label) {
        this.code = code;
        this.label = label;
    }

    public int getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static JobType fromCode(int code) {
        for (JobType type : JobType.values()) {
            if (type.getCode() == code) return type;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_JOB_TYPE_CODE, code));
    }

    public static JobType fromLabel(String label) {
        for (JobType type : JobType.values()) {
            if (type.getLabel() == label)
                return type;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_JOB_TYPE_LABEL, label));
    }
}
