package com.example.servercommon.service.writer;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.validation.ValidationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserWriterTest {

    private UserRepository userRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private UserWriter userWriter;

    @BeforeEach
    void setup() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(BCryptPasswordEncoder.class);
        userWriter = new UserWriter(userRepository, passwordEncoder);
    }


    @Test
    @DisplayName("✅ 正常なユーザーがDBに保存される")
    void shouldSaveValidUsers() {
        UserModel user = new UserModel();
        user.setUserId("alice");
        user.setPassword("rawpass");

        ValidationResult<UserModel> result = new ValidationResult<>(user, 1);
        when(passwordEncoder.encode("rawpass")).thenReturn("encoded");

        userWriter.write(List.of(user), List.of(result));

        ArgumentCaptor<List<UserModel>> captor = ArgumentCaptor.forClass(List.class);
        verify(userRepository).saveAll(captor.capture());

        List<UserModel> savedUsers = captor.getValue();
        assertThat(savedUsers).hasSize(1);
        assertThat(savedUsers.get(0).getPassword()).isEqualTo("encoded");
    }


    @Test
    @DisplayName("✅ パスワードがハッシュ化される")
    void shouldHashPassword() {
        UserModel user = new UserModel();
        user.setPassword("mypassword");

        ValidationResult<UserModel> result = new ValidationResult<>(user, 1);
        when(passwordEncoder.encode("mypassword")).thenReturn("hashed");

        userWriter.write(List.of(user), List.of(result));

        verify(passwordEncoder).encode("mypassword");
    }

    @Test
    @DisplayName("✅ ロールが null の場合は VIEWER が設定される")
    void shouldSetDefaultRoleIfNull() {
        UserModel user = new UserModel();
        user.setPassword("pass");
        user.setRoleId(null);

        ValidationResult<UserModel> result = new ValidationResult<>(user, 1);
        when(passwordEncoder.encode(any())).thenReturn("encoded");

        userWriter.write(List.of(user), List.of(result));

        ArgumentCaptor<List<UserModel>> captor = ArgumentCaptor.forClass(List.class);
        verify(userRepository).saveAll(captor.capture());
        assertThat(captor.getValue().get(0).getRoleId()).isEqualTo(UserRole.VIEWER.getRoleId());
    }

    @Test
    @DisplayName("❌ バリデーションエラーがある場合もログ出力されて保存対象から除外される")
    void shouldLogValidationErrors() {
        UserModel valid = new UserModel();
        valid.setPassword("ok");
        ValidationResult<UserModel> validResult = new ValidationResult<>(valid, 1);

        ValidationResult<UserModel> errorResult = new ValidationResult<>(null, 2);
        errorResult.addError("invalid data");

        when(passwordEncoder.encode("ok")).thenReturn("hashed");

        userWriter.write(List.of(valid), List.of(validResult, errorResult));

        ArgumentCaptor<List<UserModel>> captor = ArgumentCaptor.forClass(List.class);
        verify(userRepository).saveAll(captor.capture());

        assertThat(captor.getValue()).hasSize(1);
    }

    @Test
    @DisplayName("❌ 有効ユーザーが 0 件なら saveAll は呼ばれない")
    void shouldNotSaveWhenAllRowsAreInvalid() {
        ValidationResult<UserModel> invalid = new ValidationResult<>(null, 1);
        invalid.addError("error");

        userWriter.write(List.of(), List.of(invalid));

        verify(userRepository, never()).saveAll(any());
    }
}
