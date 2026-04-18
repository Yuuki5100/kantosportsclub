package com.example.appserver.response.user;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserDetailResponseTest {

    // =========================================================
    // SC02-UT-032
    // mapping: response should include timezone
    // =========================================================
    @Test
    void shouldIncludeTimezoneWhenMappingResponse() {
        UserDetailResponse response = new UserDetailResponse();

        assertTrue(hasTimezoneAccessors(response.getClass()),
                "UserDetailResponse must have timezone accessor for SC02-UT-032");

        setTimezone(response, "Asia/Tokyo");
        assertEquals("Asia/Tokyo", getTimezone(response));
    }

    private boolean hasTimezoneAccessors(Class<?> clazz) {
        try {
            clazz.getMethod("getTimezone");
            clazz.getMethod("setTimezone", String.class);
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        }
    }

    private void setTimezone(UserDetailResponse response, String value) {
        try {
            Method setter = response.getClass().getMethod("setTimezone", String.class);
            setter.invoke(response, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String getTimezone(UserDetailResponse response) {
        try {
            Method getter = response.getClass().getMethod("getTimezone");
            Object value = getter.invoke(response);
            return (String) value;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
