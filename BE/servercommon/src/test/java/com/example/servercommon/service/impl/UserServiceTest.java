package com.example.servercommon.service.impl;

import com.example.servercommon.impl.UserServiceImpl;
import com.example.servercommon.model.MailMessage;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.EmailSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private EmailSender emailSender;
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        emailSender = mock(EmailSender.class);
        userService = new UserServiceImpl(userRepository, emailSender);
        userService.setLoginUrl("https://example.com/login"); // 手動注入
    }

    @Test
    @DisplayName("getAllUsersでユーザー一覧を返すこと")
    void testGetAllUsers() {
        UserModel u = new UserModel();
        u.setUserId("alice");
        u.setPassword("pass");
        u.setEmail("alice@example.com");
        u.setRoleId(UserRole.EDITOR.ordinal());

        when(userRepository.findAll()).thenReturn(List.of(u));

        List<UserModel> result = userService.getAllUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo("alice");
    }

    @Test
    @DisplayName("getUserByUserIdでユーザーを取得できること")
    void testGetUserByUserId() {
        UserModel mockUser = new UserModel();
        mockUser.setUserId("bob");
        mockUser.setPassword("pass");
        mockUser.setEmail("bob@example.com");
        mockUser.setRoleId(UserRole.VIEWER.ordinal());

        when(userRepository.findById("bob")).thenReturn(Optional.of(mockUser));

        Optional<UserModel> result = userService.getUserByUserId("bob");

        assertThat(result).isPresent();
        assertThat(result.get().getUserId()).isEqualTo("bob");
    }

    @Test
    @DisplayName("createUserでユーザーを保存できること")
    void testCreateUser() {
        UserModel input = new UserModel();
        input.setUserId("newuser");
        input.setPassword("pass");
        input.setEmail("new@example.com");
        input.setRoleId(UserRole.EDITOR.ordinal());

        when(userRepository.save(input)).thenReturn(input);

        UserModel result = userService.createUser(input);

        assertThat(result.getUserId()).isEqualTo("newuser");
        verify(userRepository).save(input);
    }

    @Test
    @DisplayName("createUserWithLoginInfoでメール送信が行われること")
    void testCreateUserWithLoginInfo() {
        UserModel input = new UserModel();
        input.setUserId("loginuser");
        input.setPassword("hashed");
        input.setEmail("login@example.com");
        input.setRoleId(UserRole.EDITOR.ordinal());

        when(userRepository.save(input)).thenReturn(input);

        UserModel result = userService.createUserWithLoginInfo(input, "rawPass123");

        assertThat(result.getUserId()).isEqualTo("loginuser");

        ArgumentCaptor<MailMessage> mailCaptor = ArgumentCaptor.forClass(MailMessage.class);
        verify(emailSender).send(mailCaptor.capture());

        MailMessage sent = mailCaptor.getValue();
        assertThat(sent.getTo()).isEqualTo("login@example.com");
        assertThat(sent.getSubject()).contains("ログイン情報");
        assertThat(sent.getTemplateName()).isEqualTo("login");
        assertThat(sent.getTemplateVariables())
                .containsEntry("userId", "loginuser")
                .containsEntry("temporaryPassword", "rawPass123")
                .containsEntry("loginUrl", "https://example.com/login");
    }

    @Test
    @DisplayName("deleteUserでユーザーが削除されること")
    void testDeleteUser() {
        userService.deleteUser("user-99");
        verify(userRepository).deleteById("user-99");
    }
}
