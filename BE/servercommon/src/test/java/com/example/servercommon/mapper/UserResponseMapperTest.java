package com.example.servercommon.mapper;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.responseModel.UserResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class UserResponseMapperTest {

    @Test
    void shouldNotIncludePasswordWhenMappingResponse() {
        UserModel user = new UserModel();
        user.setUserId("U1");
        user.setEmail("ab.com");
        user.setPassword("SECRET");
        user.setGivenName("Taro");
        user.setSurname("Yamada");
        user.setMobileNo("09000000000");
        user.setRoleId(1);

        UserResponse res = UserResponseMapper.INSTANCE.fromUser(user);

        assertNotNull(res);
        assertEquals("U1", res.getUserId());
        assertEquals("ab.com", res.getEmail());
        assertEquals("Taro", res.getGivenName());
        assertEquals("Yamada", res.getSurname());
        assertEquals("09000000000", res.getMobileNo());
        assertEquals(1, res.getRoleId());

        // Ensure response does not expose password field
        assertFalse(hasField(UserResponse.class, "password"));
    }

    private static boolean hasField(Class<?> type, String fieldName) {
        try {
            type.getDeclaredField(fieldName);
            return true;
        } catch (NoSuchFieldException e) {
            return false;
        }
    }
}
