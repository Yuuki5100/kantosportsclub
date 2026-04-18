package com.example.servercommon.validationtemplate;

import com.example.servercommon.config.TemplateProperties;
import com.example.servercommon.validationtemplate.loader.TemplateSchemaLoader;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;
import com.example.servercommon.validationtemplate.schema.ColumnSchema;
import com.example.servercommon.validationtemplate.schema.TemplateSheetSchema;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

import java.util.List;
import java.util.Map;

class TemplateSchemaLoaderTest {

    private TemplateSchemaLoader loader;

    @BeforeEach
    void setup() {
        TemplateProperties props = new TemplateProperties();
        props.setBasePath("classpath:config/templates/"); // テスト用のテンプレートパスを指定
        loader = new TemplateSchemaLoader(props);
    }

    @Test
    @DisplayName("✅ v1テンプレートが正常に読み込まれる（columns 定義）")
    void v1テンプレートが正常に読み込まれる() {
        TemplateSchema schema = loader.load("users");

        assertThat(schema).isNotNull();
        assertThat(schema.getTemplateId()).isEqualTo("users");
        assertThat(schema.getVersion()).isEqualTo("v1");
        assertThat(schema.isMultiSheet()).isFalse();

        List<ColumnSchema> columns = schema.getColumns();
        assertThat(columns).isNotEmpty();

        ColumnSchema col = columns.get(1);
        assertThat(col.getName()).isEqualTo("username");
        assertThat(col.getField()).isEqualTo("username");
        assertThat(col.getEntity()).isEqualTo("com.example.servercommon.model.User");
        assertThat(col.getRepository()).isEqualTo("userRepository");
    }

    @Test
    @DisplayName("✅ v2テンプレートが正常に読み込まれる（sheets 定義）")
    void v2テンプレートが正常に読み込まれる() {
        TemplateSchema schema = loader.load("users_v2");

        assertThat(schema).isNotNull();
        assertThat(schema.getTemplateId()).isEqualTo("users_v2");
        assertThat(schema.getVersion()).isEqualTo("v2");
        assertThat(schema.isMultiSheet()).isTrue();

        List<TemplateSheetSchema> sheets = schema.getSheets();
        assertThat(sheets).isNotEmpty();

        TemplateSheetSchema sheet = sheets.get(0);
        assertThat(sheet.getSheetName()).isEqualTo("基本情報");
        assertThat(sheet.getColumns()).isNotEmpty();

        ColumnSchema col = sheet.getColumns().get(1);
        assertThat(col.getField()).isEqualTo("username");
        assertThat(col.getEntity()).isEqualTo("com.example.servercommon.model.User");
        assertThat(col.getRepository()).isEqualTo("userRepository");
    }

    @Test
    @DisplayName("❌ 存在しないテンプレートファイルを指定すると例外が発生する")
    void 存在しないテンプレートファイルは例外() {
        assertThatThrownBy(() -> loader.load("not_exists"))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("テンプレートスキーマの読み込みに失敗しました");
    }
}
