package com.example.servercommon.exception;

public class FileImportException extends RuntimeException {
    public FileImportException(String message) {
        super(message);
    }

    public FileImportException(String message, Throwable cause) {
        super(message, cause);
    }
}
