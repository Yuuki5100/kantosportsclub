package com.example.appserver.response;

import com.example.servercommon.mapper.UserResponseMapper;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.responseModel.UserResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserDetailResponseTest {

    @Test
    void SC01_UT_022_shouldMapRoleIdWhenMappingResponse() {
        UserModel user = new UserModel();
        user.setUserId("u100");
        user.setGivenName("Taro");
        user.setSurname("Yamada");
        user.setEmail("taro@example.com");
        user.setRoleId(7);

        UserResponse res = UserResponseMapper.INSTANCE.fromUser(user);

        assertThat(res.getRoleId()).isEqualTo(7);
    }
}
