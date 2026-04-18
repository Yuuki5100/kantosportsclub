package com.example.servercommon.validationtemplate.schema;

import lombok.Data;
import java.util.List;

@Data
public class TemplateSheetSchema {
    private String sheetName; // シート名
    private List<ColumnSchema> columns; // カラム
}
