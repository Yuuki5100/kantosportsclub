package com.example.servercommon.validation;

public class ValidationError {
    private final int lineNumber;
    private final String message;
    private final String fieldName;

    public ValidationError(int lineNumber, String message) {
        this(lineNumber, message, null);
    }

    public ValidationError(int lineNumber, String fieldName, String message) {
        this.lineNumber = lineNumber;
        this.fieldName = fieldName;
        this.message = message;
    }

    public int getLineNumber() {
        return lineNumber;
    }

    public String getMessage() {
        return message;
    }

    public String getFieldName() {
        return fieldName;
    }
}
