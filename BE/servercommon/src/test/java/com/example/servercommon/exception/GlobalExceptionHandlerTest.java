package com.example.servercommon.exception;

import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.ErrorCodeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import org.springframework.security.access.AccessDeniedException;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private ErrorCodeService errorCodeService;
    private TeamsNotificationService teamsNotificationService;
    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        errorCodeService = mock(ErrorCodeService.class);
        teamsNotificationService = mock(TeamsNotificationService.class);
        handler = new GlobalExceptionHandler(errorCodeService, teamsNotificationService);
    }

    @Test
    void handleCustomException_レスポンス形式確認() {
        when(errorCodeService.getErrorMessage("E400", "ja")).thenReturn("ビジネスエラーです");

        var response = handler.handleCustomException(new CustomException("業務例外"), new Locale("ja"));

        assertEquals(400, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("E400", response.getBody().getError().getCode());
        assertEquals("ビジネスエラーです", response.getBody().getError().getMessage());
        verifyNoInteractions(teamsNotificationService);
    }

    @Test
    void handleAccessDeniedException_レスポンス確認() throws Exception {
        when(errorCodeService.getErrorMessage("E4031", "en")).thenReturn("Access denied");

        var response = handler.handleAccessDeniedException(new AccessDeniedException("no permission"), new Locale("en"));

        assertEquals(403, response.getStatusCodeValue());
        assertEquals("E4031", response.getBody().getError().getCode());
        verifyNoInteractions(teamsNotificationService);
    }

    @Test
    void handleAllExceptions_重大例外_Teams通知が送信される() {
        when(errorCodeService.getErrorMessage("E5001", "ja")).thenReturn("システムエラーが発生しました");

        Exception ex = new IllegalStateException("想定外の状態");
        var response = handler.handleAllExceptions(ex, new Locale("ja"));

        assertEquals(500, response.getStatusCodeValue());
        assertEquals("E5001", response.getBody().getError().getCode());

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(teamsNotificationService, times(1)).sendNotification(captor.capture());

        String messageSent = captor.getValue();
        assertTrue(messageSent.contains("システムエラーが発生しました"));
        assertTrue(messageSent.contains("IllegalStateException"));
    }

    @Test
    void handleValidationExceptions_バリデーション例外整形() {
        // モックされたバリデーション例外を構築
        var ex = TestValidationUtils.buildMockValidationException("email", "must not be blank");

        when(errorCodeService.getErrorMessage("E4001", "ja")).thenReturn("入力に誤りがあります");

        var response = handler.handleValidationExceptions(ex, new Locale("ja"));

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("E4001", response.getBody().getError().getCode());
        assertTrue(response.getBody().getError().getMessage().contains("email"));
        verifyNoInteractions(teamsNotificationService);
    }
}
