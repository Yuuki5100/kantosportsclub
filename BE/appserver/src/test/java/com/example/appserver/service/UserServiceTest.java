package com.example.appserver.service;

import com.example.servercommon.exception.CustomException;
import com.example.servercommon.model.AuthOneTimeTokenModel;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.AuthOneTimeTokenRepository;
import com.example.servercommon.repository.RoleRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.EmailSender;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.thymeleaf.TemplateEngine;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceTest {

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

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void changePassword_shouldThrowWhenCurrentPasswordIncorrect() {
        UserModel user = new UserModel();
        user.setUserId("u1");
        user.setPassword("hashed");

        when(userRepository.findByUserId("u1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        CustomException ex = assertThrows(
                CustomException.class,
                () -> userService.changePassword("u1", "wrong", "newpass")
        );

        assertEquals("E4001", ex.getCode());
        assertEquals("current_password is incorrect", ex.getMessage());
        verify(userRepository, never()).save(any(UserModel.class));
    }

    @Test
    void changePassword_shouldUpdatePasswordAndAuditFields() {
        UserModel user = new UserModel();
        user.setUserId("u1");
        user.setPassword("hashed");

        when(userRepository.findByUserId("u1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", "hashed")).thenReturn(true);
        when(passwordEncoder.encode("newpass")).thenReturn("encoded");

        userService.changePassword("u1", "old", "newpass");

        ArgumentCaptor<UserModel> captor = ArgumentCaptor.forClass(UserModel.class);
        verify(userRepository, times(1)).save(captor.capture());

        UserModel saved = captor.getValue();
        assertEquals("encoded", saved.getPassword());
        assertEquals("u1", saved.getEditorUserId());
        assertNotNull(saved.getPasswordSetTime());
    }

    @Test
    void resetPassword_shouldThrowWhenTokenInvalid() {
        when(authOneTimeTokenRepository.findByJti("bad-token")).thenReturn(Optional.empty());

        CustomException ex = assertThrows(
                CustomException.class,
                () -> userService.resetPassword("bad-token", "newpass")
        );

        assertEquals("E4001", ex.getCode());
        assertEquals("invalid token", ex.getMessage());
        verify(userRepository, never()).save(any(UserModel.class));
        verify(authOneTimeTokenRepository, never()).save(any(AuthOneTimeTokenModel.class));
    }

    @Test
    void resetPassword_shouldUnlockUserAndMarkTokenUsed() {
        AuthOneTimeTokenModel token = new AuthOneTimeTokenModel();
        token.setJti("good-token");
        token.setUserId("u1");
        token.setPurpose("PASSWORD_RESET");
        token.setExpiresAt(LocalDateTime.now().plusDays(1));
        token.setUsedAt(null);

        UserModel user = new UserModel();
        user.setUserId("u1");
        user.setIsLockedOut(true);
        user.setPasswordSetTime(null);

        when(authOneTimeTokenRepository.findByJti("good-token")).thenReturn(Optional.of(token));
        when(userRepository.findByUserId("u1")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newpass")).thenReturn("encoded");

        userService.resetPassword("good-token", "newpass");

        ArgumentCaptor<UserModel> userCaptor = ArgumentCaptor.forClass(UserModel.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        UserModel saved = userCaptor.getValue();
        assertEquals("encoded", saved.getPassword());
        assertTrue(Boolean.FALSE.equals(saved.getIsLockedOut()));
        assertEquals("u1", saved.getEditorUserId());
        assertNotNull(saved.getPasswordSetTime());

        ArgumentCaptor<AuthOneTimeTokenModel> tokenCaptor = ArgumentCaptor.forClass(AuthOneTimeTokenModel.class);
        verify(authOneTimeTokenRepository, times(1)).save(tokenCaptor.capture());
        assertNotNull(tokenCaptor.getValue().getUsedAt());
    }

    @Test
    void forgotPassword_shouldInvalidateActiveTokensAndSendNewResetEmail() {
        UserModel user = new UserModel();
        user.setUserId("u1");
        user.setEmail("u1@example.com");
        user.setGivenName("Taro");
        user.setSurname("Yamada");

        when(userRepository.findByEmail("u1@example.com")).thenReturn(Optional.of(user));
        when(templateEngine.process(any(String.class), any())).thenReturn("mail body");
        userService.forgotPassword("u1@example.com");
        verify(authOneTimeTokenRepository, times(1))
                .invalidateActiveTokensByUserId(any(), any(), any());
        verify(authOneTimeTokenRepository, times(1)).save(any(AuthOneTimeTokenModel.class));
        verify(userRepository, times(1)).save(any(UserModel.class));
        verify(emailSender, times(1)).send(any());
    }

    @Test
    void recordFailedLogin_shouldLockWhenMaxAttemptsReached() {
        UserModel user = new UserModel();
        user.setUserId("u1");
        user.setFailedLoginAttempts(1);
        user.setIsLockedOut(false);

        when(userRepository.findByUserId("u1")).thenReturn(Optional.of(user));

        userService.recordFailedLogin("u1", 2);

        ArgumentCaptor<UserModel> captor = ArgumentCaptor.forClass(UserModel.class);
        verify(userRepository, times(1)).save(captor.capture());

        UserModel saved = captor.getValue();
        assertEquals(2, saved.getFailedLoginAttempts());
        assertTrue(Boolean.TRUE.equals(saved.getIsLockedOut()));
    }

    // =========================================================
    // SC02-UT-031
    // createUser: timezone optional -> missing timezone saved as default
    // =========================================================
    @Test
    void shouldApplyDefaultTimezoneWhenMissingIfOptional() {
        UserModel input = new UserModel();
        input.setUserId("u1");
        input.setEmail("u1@example.com");
        input.setGivenName("Taro");
        input.setSurname("Yamada");
        input.setPassword("pw");
        input.setRoleId(1);

        assertTrue(hasTimezoneAccessors(input.getClass()),
                "UserModel must have timezone accessor for SC02-UT-031");

        setTimezone(input, null); // missing in request
        when(userRepository.save(any(UserModel.class))).thenAnswer(inv -> inv.getArgument(0));
        when(templateEngine.process(any(String.class), any())).thenReturn("mail body");

        userService.createUser(input);

        ArgumentCaptor<UserModel> captor = ArgumentCaptor.forClass(UserModel.class);
        verify(userRepository, times(1)).save(captor.capture());

        String savedTimezone = getTimezone(captor.getValue());
        assertEquals("UTC", savedTimezone);
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

    private void setTimezone(UserModel user, String value) {
        try {
            Method setter = user.getClass().getMethod("setTimezone", String.class);
            setter.invoke(user, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String getTimezone(UserModel user) {
        try {
            Method getter = user.getClass().getMethod("getTimezone");
            Object value = getter.invoke(user);
            return (String) value;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
