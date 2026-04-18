package com.example.servercommon.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class UserModelTest {

    @Test
    void shouldApplyDefaultValuesWhenEntityCreated() {
        UserModel user = new UserModel();

        assertFalse(Boolean.TRUE.equals(user.getIsDeleted()));
        assertFalse(Boolean.TRUE.equals(user.getIsLockedOut()));
        assertEquals(0, user.getFailedLoginAttempts());
    }
}
