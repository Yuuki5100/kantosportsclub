package com.example.appserver.service;

import com.example.servercommon.impl.UserServiceImpl;
import com.example.servercommon.model.MailMessage;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.EmailSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceContractTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailSender emailSender;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userService.setLoginUrl("https://example.local/login");
    }

    @Test
    void SC01_UT_201_shouldReturnAllUsersFromRepository() {
        List<UserModel> users = List.of(user("u001", "u001@example.com"), user("u002", "u002@example.com"));
        when(userRepository.findAll()).thenReturn(users);

        List<UserModel> result = userService.getAllUsers();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserModel::getUserId).containsExactly("u001", "u002");
    }

    @Test
    void SC01_UT_202_shouldReturnUserByUserIdWhenExists() {
        UserModel user = user("u010", "u010@example.com");
        when(userRepository.findById("u010")).thenReturn(Optional.of(user));

        Optional<UserModel> result = userService.getUserByUserId("u010");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("u010@example.com");
    }

    @Test
    void SC01_UT_203_shouldReturnEmptyWhenUserByUserIdNotFound() {
        when(userRepository.findById("missing")).thenReturn(Optional.empty());

        Optional<UserModel> result = userService.getUserByUserId("missing");

        assertThat(result).isEmpty();
    }

    @Test
    void SC01_UT_204_shouldCreateUserViaRepository() {
        UserModel request = user("u020", "u020@example.com");
        request.setRoleId(9);
        when(userRepository.save(any(UserModel.class))).thenReturn(request);

        UserModel created = userService.createUser(request);

        assertThat(created.getUserId()).isEqualTo("u020");
        assertThat(created.getRoleId()).isEqualTo(9);
        verify(userRepository).save(request);
    }

    @Test
    void SC01_UT_205_shouldUpdateUserViaRepository() {
        UserModel request = user("u021", "u021@example.com");
        request.setRoleId(11);
        when(userRepository.save(any(UserModel.class))).thenReturn(request);

        UserModel updated = userService.updateUser(request);

        assertThat(updated.getRoleId()).isEqualTo(11);
        verify(userRepository).save(request);
    }

    @Test
    void SC01_UT_206_shouldDeleteUserById() {
        userService.deleteUser("u030");

        verify(userRepository).deleteById("u030");
    }

    @Test
    void SC01_UT_207_shouldCreateUserWithLoginInfoAndSendEmail() {
        UserModel request = user("u040", "u040@example.com");
        when(userRepository.save(any(UserModel.class))).thenReturn(request);

        UserModel created = userService.createUserWithLoginInfo(request, "temp-pass");

        assertThat(created.getUserId()).isEqualTo("u040");

        ArgumentCaptor<MailMessage> captor = ArgumentCaptor.forClass(MailMessage.class);
        verify(emailSender).send(captor.capture());
        MailMessage message = captor.getValue();
        assertThat(message.getTo()).isEqualTo("u040@example.com");
        assertThat(message.getTemplateName()).isEqualTo("login");
        assertThat(message.getTemplateVariables()).containsEntry("userId", "u040");
        assertThat(message.getTemplateVariables()).containsEntry("temporaryPassword", "temp-pass");
        assertThat(message.getTemplateVariables()).containsEntry("loginUrl", "https://example.local/login");
    }

    @Test
    void SC01_UT_208_shouldCreateUserEvenWhenMailSendFails() {
        UserModel request = user("u041", "u041@example.com");
        when(userRepository.save(any(UserModel.class))).thenReturn(request);
        doThrow(new RuntimeException("mail send failed")).when(emailSender).send(any(MailMessage.class));

        UserModel created = userService.createUserWithLoginInfo(request, "temp-pass");

        assertThat(created.getUserId()).isEqualTo("u041");
        verify(userRepository).save(request);
        verify(emailSender).send(any(MailMessage.class));
    }

    private UserModel user(String id, String email) {
        UserModel u = new UserModel();
        u.setUserId(id);
        u.setEmail(email);
        u.setPassword("hashed");
        u.setGivenName("Given");
        u.setSurname("Surname");
        u.setRoleId(3);
        u.setCreatorUserId("admin");
        u.setEditorUserId("admin");
        return u;
    }
}
