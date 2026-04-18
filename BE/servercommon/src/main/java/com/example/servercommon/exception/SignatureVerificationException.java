package com.example.servercommon.exception;

public class SignatureVerificationException extends RuntimeException {
    private final String code;

    public SignatureVerificationException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
