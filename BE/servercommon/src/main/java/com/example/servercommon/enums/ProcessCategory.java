package com.example.servercommon.enums;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProcessCategory {
    NEW(1, "新規"),
    UPDATE(2, "更新"),
    REFERENCE_NEW(3, "参照新規登録"),
    DELETE(4, "削除");

    private final int code;
    private final String categoryName;

    public int getCode() {
        return code;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public static ProcessCategory fromCode(int code) {
        for (ProcessCategory category : ProcessCategory.values()) {
            if (category.getCode() == code) return category;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(BackendMessageCatalog.EX_INVALID_CODE_JA, code));
    }

    public static ProcessCategory fromStatus(String categoryName) {
        for (ProcessCategory category : values()) {
            if (category.getCategoryName() == categoryName) return category;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_PROCESS_CATEGORY, categoryName));
    }
}
