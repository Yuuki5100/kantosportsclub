package com.example.servercommon.enums;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.AllArgsConstructor;

/**
 * バッチジョブに関するメタ情報を保持するクラスです。
 * 本クラスは、システム内部で利用されるバッチジョブ名と、画面表示用の分かりやすい名称（例: "仕入伝票取込"）を対応付けます。
 */
@AllArgsConstructor
public enum BatchInfo {

    ITEM_CATEGORY_EXPORT_JOB("itemCategoryExportJob", "品目区分出力バッチ"),
    ITEM_CATEGORY_IMPORT_JOB("itemCategoryImportJob", "出庫カテゴリ取込バッチ"),
    ITEM_EXCEL_EXPORT_JOB("itemExcelExportJob", "品目出力バッチ"),
    ITEM_EXCEL_IMPORT_JOB("itemExcelImportJob", "品目取込バッチ"),
    INVENTORY_EXCEL_EXPORT_JOB("inventoryExcelExportJob", "入出庫実績出力バッチ"),
    LOCATION_EXCEL_EXPORT_JOB("locationExcelExportJob", "ロケーション出力バッチ"),
    LOCATION_EXCEL_IMPORT_JOB("locationExcelImportJob", "ロケーション取込バッチ"),
    PRODUCTION_RECEIPT_REPORT_CREATE_JOB("productionReceiptReportCreateJob", "生産受払報告書作成バッチ"),
    COST_UTILITY_CONSUMPTION_REPORT_CREATE_JOB("costUtilityConsumptionReportCreateJob", "生産受払報告書作成バッチ");

    private final String batchName;
    private final String displayName;

    public String getBatchName() {
        return batchName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static BatchInfo fromBatchName(String batchName) {
        for (BatchInfo type : values()) {
            if (type.getBatchName().equals(batchName)) {
                return type;
            }
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_BATCH_NAME, batchName));
    }

    public static BatchInfo fromDisplayName(String displayName) {
        for (BatchInfo type : values()) {
            if (type.getDisplayName().equals(displayName)) {
                return type;
            }
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_DISPLAY_NAME, displayName));
    }

    /** バッチ物理名から表示名(日本語名)の取得処理 **/
    public static String getDisplayNameByBatchName(String batchName) {
        for (BatchInfo type : values()) {
            if (type.getBatchName().equals(batchName)) {
                return type.getDisplayName();
            }
        }
        return batchName;
    }

}
