package com.example.servercommon.service;

import com.example.servercommon.model.ErrorCode;
import com.example.servercommon.repository.ErrorCodeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // JUnit5用Mockito初期化
class ErrorCodeServiceTest {

    @Mock
    private ErrorCodeRepository errorCodeRepository;

    @InjectMocks
    private ErrorCodeService errorCodeService;

    @Test
    void getErrorMessage_正常系_コードとロケール一致で取得できる() {
        // Arrange
        String code = "E4001";
        String locale = "ja";
        String message = "入力に誤りがあります";

        when(errorCodeRepository.findByCodeAndLocale(code, locale))
                .thenReturn(Optional.of(new ErrorCode(code, locale, message)));

        // Act
        String result = errorCodeService.getErrorMessage(code, locale);

        // Assert
        assertEquals(message, result);
        verify(errorCodeRepository, times(1)).findByCodeAndLocale(code, locale);
    }

    @Test
    void getErrorMessage_異常系_該当コードが存在しない場合デフォルトメッセージ() {
        // Arrange
        String code = "E9999";
        String locale = "en";

        when(errorCodeRepository.findByCodeAndLocale(code, locale))
                .thenReturn(Optional.empty());

        // Act
        String result = errorCodeService.getErrorMessage(code, locale);

        // Assert
        assertEquals("Unknown error (code: E9999)", result);
        verify(errorCodeRepository, times(1)).findByCodeAndLocale(code, locale);
    }
}
