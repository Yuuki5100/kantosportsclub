package com.example.servercommon.exception;

import java.text.MessageFormat;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import lombok.Getter;

@Getter
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CustomException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final String code;
    private final Object[] args;

    private static final String DEFAULT_CODE = "E400";

    public String getCode() {
        return code;
    }

    public Object[] getArgs() {
        return args;
    }

    // メッセージのみ（コードはデフォルト）
    public CustomException(String message) {
        this(DEFAULT_CODE, message);
    }

    // コードとメッセージのみ（引数なし）
    public CustomException(String code, String message) {
        super(message);
        this.code = resolveCode(code);
        this.args = new Object[0];
    }

    // コード・メッセージ・引数あり
    public CustomException(String code, String message, Object... args) {
        super(message);  // raw template stored
        this.code = resolveCode(code);
        this.args = args != null ? args : new Object[0];
    }

    // コード・メッセージ・例外・引数あり
    public CustomException(String code, String message, Throwable cause, Object... args) {
        super(message, cause);
        this.code = resolveCode(code);
        this.args = args != null ? args : new Object[0];
    }

    private static String resolveCode(String code) {
        return Objects.requireNonNullElse(code, DEFAULT_CODE);
    }
}
