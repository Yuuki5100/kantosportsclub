package com.example.servercommon.validationtemplate.rule;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SkipIfEmptyFieldTest {

    @Test
    void testShouldSkip_WhenFieldIsNull() {
        // 準備
        SkipIfEmptyField rule = new SkipIfEmptyField("email");
        Map<String, String> row = new HashMap<>();
        row.put("email", null);

        // 実行
        boolean result = rule.shouldSkip(row);

        // 検証
        assertTrue(result, "フィールドがnullの場合はスキップ対象になる");
    }

    @Test
    void testShouldSkip_WhenFieldIsEmptyString() {
        SkipIfEmptyField rule = new SkipIfEmptyField("email");
        Map<String, String> row = new HashMap<>();
        row.put("email", "");

        boolean result = rule.shouldSkip(row);

        assertTrue(result, "フィールドが空文字の場合はスキップ対象になる");
    }

    @Test
    void testShouldSkip_WhenFieldIsWhitespace() {
        SkipIfEmptyField rule = new SkipIfEmptyField("email");
        Map<String, String> row = new HashMap<>();
        row.put("email", "   ");

        boolean result = rule.shouldSkip(row);

        assertTrue(result, "フィールドが空白のみの場合はスキップ対象になる");
    }

    @Test
    void testShouldSkip_WhenFieldHasValue() {
        SkipIfEmptyField rule = new SkipIfEmptyField("email");
        Map<String, String> row = new HashMap<>();
        row.put("email", "test@example.com");

        boolean result = rule.shouldSkip(row);

        assertFalse(result, "フィールドに値がある場合はスキップ対象にならない");
    }

    @Test
    void testShouldSkip_WhenFieldNotPresent() {
        SkipIfEmptyField rule = new SkipIfEmptyField("email");
        Map<String, String> row = new HashMap<>();

        boolean result = rule.shouldSkip(row);

        assertTrue(result, "フィールドがMapに存在しない場合はスキップ対象になる");
    }
}
