package com.example.appserver.service;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.AuthOneTimeTokenRepository;
import com.example.servercommon.repository.RoleRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.EmailSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.thymeleaf.TemplateEngine;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceLockPolicyTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private AuthOneTimeTokenRepository authOneTimeTokenRepository;
    @Mock
    private EmailSender emailSender;
    @Mock
    private TemplateEngine templateEngine;
    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
                userRepository,
                roleRepository,
                authOneTimeTokenRepository,
                emailSender,
                templateEngine,
                passwordEncoder
        );
    }

    @Test
    void SC01_UT_028_shouldLockAccountAfterThresholdFailedLogins() {
        UserModel user = new UserModel();
        user.setUserId("u-lock");
        user.setFailedLoginAttempts(3);
        user.setIsLockedOut(false);

        when(userRepository.findByUserId("u-lock")).thenReturn(Optional.of(user));

        userService.recordFailedLogin("u-lock", 4);

        ArgumentCaptor<UserModel> captor = ArgumentCaptor.forClass(UserModel.class);
        verify(userRepository).save(captor.capture());

        UserModel saved = captor.getValue();
        assertThat(saved.getFailedLoginAttempts()).isEqualTo(4);
        assertThat(saved.getIsLockedOut()).isTrue();
    }
}
