package com.example.servercommon.validation;

import com.example.servercommon.file.FileType;
import com.example.servercommon.validation.validator.UsersFileValidator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.context.ApplicationContext;

import java.io.InputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class FileValidatorDispatcherTest {

    private FileValidatorDispatcher dispatcher;
    private ApplicationContext applicationContext;
    private FileValidator<Object> usersFileValidator;

    @BeforeEach
    void setUp() {
        applicationContext = mock(ApplicationContext.class);
        usersFileValidator = mock(FileValidator.class);
        dispatcher = new FileValidatorDispatcher(applicationContext);
    }

    @Test
    @DisplayName("✅ users_20250401.csv で usersFileValidator が呼び出される")
    void shouldDelegateToUsersFileValidator() {
        String filename = "users_20250401.csv";
        InputStream inputStream = InputStream.nullInputStream();

        ValidationResult<Object> dummyResult = new ValidationResult<>(new Object(), 1);
        when(applicationContext.getBean("usersFileValidator", FileValidator.class))
                .thenReturn(usersFileValidator);
        when(usersFileValidator.validate(inputStream)).thenReturn(List.of(dummyResult));

        List<ValidationResult<?>> results = dispatcher.validate(filename, inputStream);

        verify(usersFileValidator).validate(inputStream);
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo(dummyResult);
    }

    @Test
    @DisplayName("✅ orders_20250401.xlsx で ordersFileValidator が呼び出される")
    void shouldDelegateToOrdersFileValidator() {
        String filename = "orders_20250401.xlsx";
        InputStream inputStream = InputStream.nullInputStream();

        ValidationResult<Object> dummyResult = new ValidationResult<>(new Object(), 1);
        when(applicationContext.getBean("ordersFileValidator", FileValidator.class))
                .thenReturn(usersFileValidator);
        when(usersFileValidator.validate(inputStream)).thenReturn(List.of(dummyResult));

        List<ValidationResult<?>> results = dispatcher.validate(filename, inputStream);

        verify(usersFileValidator).validate(inputStream);
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).isEqualTo(dummyResult);
    }

    @Test
    @DisplayName("❌ 未知のファイル名に対しては IllegalArgumentException")
    void shouldThrowForUnknownFileType() {
        String filename = "unknownfile.csv";
        InputStream inputStream = InputStream.nullInputStream();

        assertThrows(IllegalArgumentException.class, () ->
                dispatcher.validate(filename, inputStream));
    }
}
