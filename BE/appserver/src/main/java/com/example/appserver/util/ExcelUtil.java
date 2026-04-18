package com.example.appserver.util;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;

// import com.example.servercommon.entity.MasterItem;
// import com.example.servercommon.entity.MasterItemCategory;

public class ExcelUtil {

    public static Map<Integer, String> getHeaderMap(Row headerRow) {
        Map<Integer, String> headerMap = new HashMap<>();
        for (Cell cell : headerRow) {
            headerMap.put(cell.getColumnIndex(), cell.getStringCellValue().trim());
        }
        return headerMap;
    }

    public static String getValueByHeader(Row row, Map<Integer, String> headerMap, String targetHeader) {
        for (Map.Entry<Integer, String> entry : headerMap.entrySet()) {
            if (entry.getValue().equals(targetHeader)) {
                Cell cell = row.getCell(entry.getKey());
                if (cell != null) {
                    return cell.getStringCellValue().trim();
                }
            }
        }
        return null;
    }

    public static LocalDate getLocalDateByHeader(Row row, Map<Integer, String> headerMap, String targetHeader) {
        String dateStr = getValueByHeader(row, headerMap, targetHeader);
        if (dateStr != null && !dateStr.isBlank()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
            return LocalDate.parse(dateStr, formatter);
        }
        return null;
    }

    public static BigDecimal getBigDecimalByHeader(Row row, Map<Integer, String> headerMap, String targetHeader) {
        String value = getValueByHeader(row, headerMap, targetHeader);
        if (value != null && !value.isBlank()) {
            return new BigDecimal(value);
        }
        return null;
    }


    // public static MasterItem toMasterItem(Row row, Map<Integer, String> headerMap) {
    //     MasterItem item = new MasterItem();
    //     item.setItemCd(getValueByHeader(row, headerMap, "品目CD"));
    //     item.setStartOfApplicationDate(getLocalDateByHeader(row, headerMap, "適用開始日"));
    //     item.setItemName(getValueByHeader(row, headerMap, "品目名"));
    //     item.setBusinessItemName(getValueByHeader(row, headerMap, "取引用品目名"));
    //     item.setAbbreviationName(getValueByHeader(row, headerMap, "略称名"));
    //     item.setItemCategoryCd(getValueByHeader(row, headerMap, "品目区分CD"));
    //     item.setClientCd(getValueByHeader(row, headerMap, "取引先CD"));
    //     item.setDescription(getValueByHeader(row, headerMap, "品目説明"));
    //     item.setInventoryManagementTargetFlag(Boolean.parseBoolean(getValueByHeader(row, headerMap, "在庫管理対象フラグ")));
    //     item.setInOutClockQuantityRequiredFlag(Boolean.parseBoolean(getValueByHeader(row, headerMap, "入出庫時計量必須フラグ")));
    //     item.setManifestNumberInputFlag(Boolean.parseBoolean(getValueByHeader(row, headerMap, "マニフェスト番号入力フラグ")));
    //     item.setInventoryAllocationRateSettingFlag(Boolean.parseBoolean(getValueByHeader(row, headerMap, "貯蔵品配賦率設定フラグ")));
    //     item.setInventoryUnit(getValueByHeader(row, headerMap, "在庫単位"));
    //     item.setInventoryDestinationUnit(getValueByHeader(row, headerMap, "在庫換算先単位"));
    //     item.setInventoryUnitConversionRate(getBigDecimalByHeader(row, headerMap, "在庫単位換算率"));
    //     item.setInOutUnit(getValueByHeader(row, headerMap, "入出庫単位"));
    //     item.setInventoryValuationUnitPrice(getBigDecimalByHeader(row, headerMap, "在庫評価単価"));
    //     item.setReasonForDeletion(getValueByHeader(row, headerMap, "削除理由"));

    //     return item;
    // }

}
