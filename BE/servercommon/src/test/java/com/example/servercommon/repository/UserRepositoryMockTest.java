package com.example.servercommon.repository;

import com.example.servercommon.model.UserModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class UserRepositoryMockTest {

    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
    }

    @Test
    void testFindById_returnsExpectedUser() {
        UserModel user = new UserModel();
        user.setUserId("test");
        user.setPassword("pass");
        user.setEmail("t@example.com");
        user.setRoleId(1);

        when(userRepository.findById("test")).thenReturn(Optional.of(user));

        Optional<UserModel> result = userRepository.findById("test");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("t@example.com");

        verify(userRepository).findById("test");
    }

    @Test
    void testFindById_whenUserNotFound() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        Optional<UserModel> result = userRepository.findById("unknown");

        assertThat(result).isNotPresent();

        verify(userRepository).findById("unknown");
    }
}
