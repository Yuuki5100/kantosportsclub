package com.example.servercommon.enums;

import com.example.servercommon.message.BackendMessageCatalog;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Row.MissingCellPolicy;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum FileJobImportCellType {
    /*
     * ファイル連携の際に、どのカラムを"Name"とし、どの制約を設けるのかを設定します。
     *
     * 第一引数：どのセルを読み込むのか
     * 第二引数：どの制約を適応するのか（初期設定は、nullは空文字として扱うようにしている）
     *
     * 以下、制約一覧。
     * --------------------------
     * RETURN_NULL_AND_BLANK,
     * RETURN_BLANK_AS_NULL,
     * CREATE_NULL_AS_BLANK
     * --------------------------
     */
    CellName(0, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK),
    CellEmail(1, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);

    private final int columNumber;
    private final MissingCellPolicy policy;

    public int getColumNumber() {
        return columNumber;
    }

    public MissingCellPolicy getPolicy() {
        return policy;
    }

    public static FileJobImportCellType fromColumNumber(int columNumber) {
        for (FileJobImportCellType type : FileJobImportCellType.values()) {
            if (type.getColumNumber() == columNumber)
                return type;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_FILE_JOB_IMPORT_COLUMN, columNumber));
    }

    public static FileJobImportCellType fromPolicy(MissingCellPolicy policy) {
        for (FileJobImportCellType type : FileJobImportCellType.values()) {
            if (type.getPolicy() == policy)
                return type;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_FILE_JOB_IMPORT_POLICY, policy));
    }
}
