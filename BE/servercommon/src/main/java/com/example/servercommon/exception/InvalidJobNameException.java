package com.example.servercommon.exception;

public class InvalidJobNameException extends IllegalArgumentException {
    public InvalidJobNameException(String message) {
        super(message);
    }
}
