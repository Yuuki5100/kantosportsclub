package com.example.servercommon.validationtemplate.rule;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class RequireEmailUnlessGuestTest {

    @Test
    void testIsRequired_WhenRoleIsGuest() {
        // 準備
        RequireEmailUnlessGuest rule = new RequireEmailUnlessGuest();
        Map<String, String> row = new HashMap<>();
        row.put("role", "GUEST");

        // 実行
        boolean result = rule.isRequired(row);

        // 検証
        assertFalse(result, "RoleがGUESTの場合は必須ではないのでfalse");
    }

    @Test
    void testIsRequired_WhenRoleIsGuest_LowerCase() {
        RequireEmailUnlessGuest rule = new RequireEmailUnlessGuest();
        Map<String, String> row = new HashMap<>();
        row.put("role", "guest");

        boolean result = rule.isRequired(row);

        assertFalse(result, "Roleが小文字guestでもfalseになること");
    }

    @Test
    void testIsRequired_WhenRoleIsUser() {
        RequireEmailUnlessGuest rule = new RequireEmailUnlessGuest();
        Map<String, String> row = new HashMap<>();
        row.put("role", "USER");

        boolean result = rule.isRequired(row);

        assertTrue(result, "RoleがGUEST以外の場合はtrue");
    }

    @Test
    void testIsRequired_WhenRoleIsEmpty() {
        RequireEmailUnlessGuest rule = new RequireEmailUnlessGuest();
        Map<String, String> row = new HashMap<>();
        row.put("role", "");

        boolean result = rule.isRequired(row);

        assertTrue(result, "Roleが空文字でもGUESTでなければtrue");
    }

    @Test
    void testIsRequired_WhenRoleIsNull() {
        RequireEmailUnlessGuest rule = new RequireEmailUnlessGuest();
        Map<String, String> row = new HashMap<>();
        row.put("role", null);

        boolean result = rule.isRequired(row);

        assertTrue(result, "RoleがnullでもGUESTでなければtrue");
    }

    @Test
    void testIsRequired_WhenRoleNotPresent() {
        RequireEmailUnlessGuest rule = new RequireEmailUnlessGuest();
        Map<String, String> row = new HashMap<>();

        boolean result = rule.isRequired(row);

        assertTrue(result, "RoleがMapに存在しない場合もGUESTでなければtrue");
    }
}
