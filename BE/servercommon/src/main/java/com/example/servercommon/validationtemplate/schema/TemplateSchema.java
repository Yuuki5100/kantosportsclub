package com.example.servercommon.validationtemplate.schema;

import com.example.servercommon.message.BackendMessageCatalog;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TemplateSchema {

    /** テンプレートID（例: "users"） */
    private String templateId;

    /** バージョン（例: "v1", "v2"） */
    private String version;

    /** 対応するエンティティのクラス名 */
    private String entity;

    /** 対応するリポジトリのBean名 or クラス名 */
    private String repository;

    /** v1: 単一カラム定義用（レガシー構造） */
    private List<ColumnSchema> columns;

    /** v2: シート単位の定義（推奨構造） */
    private List<TemplateSheetSchema> sheets;

    /** v2構造かどうかの判定用フラグ */
    private SkipRuleSchema skipRule;

    /** v2構造判定用: YAML に記述される */
    private boolean multiSheet;

    /**
     * v1構造用：name → ColumnSchema の検索用Map
     */
    public Map<String, ColumnSchema> toColumnMap() {
        if (columns == null) {
            throw new IllegalStateException(BackendMessageCatalog.EX_TEMPLATE_SCHEMA_COLUMNS_REQUIRED);
        }
        return columns.stream().collect(Collectors.toMap(ColumnSchema::getName, c -> c));
    }

    /**
     * v1構造用：field → ColumnSchema の検索用Map（動的ルール用）
     */
    public Map<String, ColumnSchema> toFieldMap() {
        if (columns == null) {
            throw new IllegalStateException(BackendMessageCatalog.EX_TEMPLATE_SCHEMA_COLUMNS_REQUIRED);
        }
        return columns.stream().collect(Collectors.toMap(ColumnSchema::getField, c -> c));
    }

    /**
     * 明示的な getter（Lombok では読み込まれないケースの補完用）
     */
    public boolean isMultiSheet() {
        return this.multiSheet;
    }

    public void setMultiSheet(boolean multiSheet) {
        this.multiSheet = multiSheet;
    }

    public List<TemplateSheetSchema> getSheets() {
        return this.sheets;
    }

    public void setSheets(List<TemplateSheetSchema> sheets) {
        this.sheets = sheets;
    }
}
