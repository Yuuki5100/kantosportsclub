package com.example.servercommon.exception;

import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.service.ErrorCodeService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.security.access.AccessDeniedException;
import java.text.MessageFormat;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

    private final ErrorCodeService errorCodeService;
    private final TeamsNotificationService teamsNotificationService;

    public GlobalExceptionHandler(ErrorCodeService errorCodeService,
            TeamsNotificationService teamsNotificationService) {
        this.errorCodeService = errorCodeService;
        this.teamsNotificationService = teamsNotificationService;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(MethodArgumentNotValidException ex,
            Locale locale) {
        String errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        log.warn(BackendMessageCatalog.LOG_VALIDATION_ERROR, errors);

        String code = BackendMessageCatalog.CODE_E4001;
        String baseMessage = getMessage(code, locale);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(code, baseMessage + " (" + errors + ")"));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleBadCredentialsException(BadCredentialsException ex, Locale locale) {
        log.warn(BackendMessageCatalog.LOG_BAD_CREDENTIALS_EXCEPTION, ex.getMessage());
        String code = BackendMessageCatalog.CODE_E401;
        String message = getMessage(code, locale);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(code, message));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(AccessDeniedException ex, Locale locale) {
        log.warn(BackendMessageCatalog.LOG_ACCESS_DENIED, ex.getMessage());
        String code = BackendMessageCatalog.CODE_E4031;
        String message = getMessage(code, locale);
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(code, message));
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<?>> handleCustomException(CustomException ex, Locale locale) {
        log.warn(BackendMessageCatalog.LOG_CUSTOM_EXCEPTION, ex.getMessage());
        String formattedMessage = getMessage(ex, locale); // ✅ uses fallback logic

        return ResponseEntity.status(resolveHttpStatus(ex.getCode()))
                .body(ApiResponse.error(ex.getCode(), formattedMessage));
    }

    private HttpStatus resolveHttpStatus(String code) {
        if (BackendMessageCatalog.CODE_E403.equals(code) || BackendMessageCatalog.CODE_E4031.equals(code)) {
            return HttpStatus.FORBIDDEN;
        }
        if (BackendMessageCatalog.CODE_E401.equals(code)
                || BackendMessageCatalog.CODE_E4011.equals(code)
                || BackendMessageCatalog.CODE_E4012.equals(code)
                || BackendMessageCatalog.CODE_E4013.equals(code)
                || BackendMessageCatalog.CODE_E4014.equals(code)
                || BackendMessageCatalog.CODE_E4015.equals(code)) {
            return HttpStatus.UNAUTHORIZED;
        }
        if (BackendMessageCatalog.CODE_E4041.equals(code)) {
            return HttpStatus.NOT_FOUND;
        }
        if (BackendMessageCatalog.CODE_E409.equals(code)) {
            return HttpStatus.CONFLICT;
        }
        return HttpStatus.BAD_REQUEST;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgument(IllegalArgumentException ex, Locale locale) {
        log.warn(BackendMessageCatalog.LOG_ILLEGAL_ARGUMENT, ex.getMessage());
        String code = BackendMessageCatalog.CODE_E4002;
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(code, ex.getMessage()));
    }

    @ExceptionHandler(InvalidJobNameException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidJobName(InvalidJobNameException ex, Locale locale) {
        log.warn(BackendMessageCatalog.LOG_INVALID_JOB_NAME, ex.getMessage());
        String code = BackendMessageCatalog.CODE_E1013;
        String message = getMessage(code, locale);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(code, message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
            Locale locale) {
        log.warn(BackendMessageCatalog.LOG_MALFORMED_JSON, ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, BackendMessageCatalog.CODE_E4003, locale);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleAllExceptions(Exception ex, Locale locale) {
        log.error(BackendMessageCatalog.LOG_UNHANDLED_EXCEPTION, ex);
        String code = BackendMessageCatalog.CODE_E5001;
        String message = getMessage(code, locale);

        // Teams通知（重大なエラーのみ）
        try {
            String teamsMessage = String.format(
                    BackendMessageCatalog.TEAMS_CRITICAL_ERROR_TEMPLATE,
                    message, ex.getClass().getName(), ex.getMessage());
            teamsNotificationService.sendNotification(teamsMessage);
        } catch (Exception notifyEx) {
            log.warn(BackendMessageCatalog.LOG_TEAMS_NOTIFY_FAILED, notifyEx.getMessage());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(code, message));
    }

    @ExceptionHandler(ReportGenerationException.class)
    public ResponseEntity<ApiResponse<?>> handleReportGenerationException(ReportGenerationException ex, Locale locale) {
        log.error(BackendMessageCatalog.LOG_REPORT_GENERATION_ERROR, ex.getMessage(), ex);
        String code = BackendMessageCatalog.CODE_E5101; // ← 新しいエラーコード（後述）
        String message = getMessage(code, locale);

        // Teams 通知（運用者向け）
        try {
            String teamsMessage = String.format(
                    BackendMessageCatalog.TEAMS_REPORT_ERROR_TEMPLATE,
                    code, ex.getClass().getSimpleName(), ex.getMessage());
            teamsNotificationService.sendNotification(teamsMessage);
        } catch (Exception notifyEx) {
            log.warn(BackendMessageCatalog.LOG_TEAMS_NOTIFY_FAILED, notifyEx.getMessage());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(code, message));
    }

    @ExceptionHandler(StorageAccessException.class)
    public ResponseEntity<ApiResponse<?>> handleStorageAccessException(StorageAccessException ex, Locale locale) {
        log.error(BackendMessageCatalog.LOG_STORAGE_ERROR, ex.getMessage(), ex);
        String code = BackendMessageCatalog.CODE_E5201;
        String message = getMessage(code, locale);

        // 通知（必要に応じて）
        try {
            teamsNotificationService.sendNotification(BackendMessageCatalog.TEAMS_STORAGE_ERROR_PREFIX + ex.getMessage());
        } catch (Exception notifyEx) {
            log.warn(BackendMessageCatalog.LOG_TEAMS_NOTIFY_FAILED, notifyEx.getMessage());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(code, message));
    }

    @ExceptionHandler(FileImportException.class)
    public ResponseEntity<ApiResponse<?>> handleFileImportException(FileImportException ex, Locale locale) {
        log.error(BackendMessageCatalog.LOG_FILE_IMPORT_ERROR, ex.getMessage(), ex);
        String code = BackendMessageCatalog.CODE_E6001;
        String message = errorCodeService.getErrorMessage(code, locale.getLanguage());
        ApiResponse<?> response = ApiResponse.error(code, message + " (" + ex.getMessage() + ")");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // 共通レスポンスビルダー
    private ResponseEntity<ApiResponse<?>> buildErrorResponse(HttpStatus status, String code, Locale locale) {
        String message = getMessage(code, locale);
        return ResponseEntity.status(status).body(ApiResponse.error(code, message));
    }

    // 共通レスポンスビルダー
    // private ResponseEntity<ApiResponse<?>> buildErrorResponse(HttpStatus status,
    // String code, String message,
    // Locale locale) {
    // String localizedMessage = getMessage(code, locale);
    // return ResponseEntity.status(status).body(ApiResponse.error(code,
    // localizedMessage));
    // }

    // エラーメッセージ取得のnull-safeヘルパー
    private String getMessage(String code, Locale locale) {
        return Optional.ofNullable(errorCodeService.getErrorMessage(code, locale.getLanguage()))
                .orElse(BackendMessageCatalog.MSG_UNKNOWN_ERROR);
    }

    private String getMessage(CustomException ex, Locale locale) {
        String dbMessage = errorCodeService.getErrorMessage(ex.getCode(), locale.getLanguage());

        // Treat "Unknown error (code: ...)" as missing
        boolean isFallbackFromDB = dbMessage == null
                || dbMessage.trim().equals(BackendMessageCatalog.MSG_UNKNOWN_ERROR_PREFIX + ex.getCode() + ")");

        if (isFallbackFromDB) {
            return MessageFormat.format(ex.getMessage(), ex.getArgs());
        }

        return MessageFormat.format(dbMessage, ex.getArgs());
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<?>> handleDataAccessException(DataAccessException ex, Locale locale) {
        log.warn(BackendMessageCatalog.LOG_DATA_ACCESS_EXCEPTION, ex.getMessage());
        String code = BackendMessageCatalog.CODE_E1011;
        String message = getMessage(code, locale);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(code, message));
    }

    @ExceptionHandler(SignatureVerificationException.class)
    public ResponseEntity<ApiResponse<?>> handleSignatureVerificationException(SignatureVerificationException ex,
            Locale locale) {
        log.warn(BackendMessageCatalog.LOG_SIGNATURE_VERIFICATION_FAILED, ex.getMessage());
        String message = getMessage(ex.getCode(), locale);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getCode(), message));
    }
}
