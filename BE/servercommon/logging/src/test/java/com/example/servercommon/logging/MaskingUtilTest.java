package com.example.servercommon.logging;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MaskingUtilTest {

    @Test
    void testMask_passwordMasked() {
        String input = "username=admin, password=secret123";
        String expected = "username=admin, password=****";
        assertEquals(expected, MaskingUtil.mask(input));
    }

    @Test
    void testMask_passwordCaseInsensitive() {
        String input = "PASSWORD=abc";
        String expected = "PASSWORD=****";
        assertEquals(expected, MaskingUtil.mask(input));
    }

    @Test
    void testMask_multiplePasswords() {
        String input = "password=one password=two";
        String expected = "password=**** password=****";
        assertEquals(expected, MaskingUtil.mask(input));
    }

    @Test
    void testMask_noPassword_returnsSame() {
        String input = "no secret here";
        assertEquals(input, MaskingUtil.mask(input));
    }

    @Test
    void testMask_nullInput_returnsNull() {
        assertNull(MaskingUtil.mask(null));
    }
}
