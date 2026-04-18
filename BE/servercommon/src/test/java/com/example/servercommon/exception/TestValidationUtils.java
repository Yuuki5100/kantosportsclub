package com.example.servercommon.exception;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.core.MethodParameter;

import static org.mockito.Mockito.*;

public class TestValidationUtils {
    public static MethodArgumentNotValidException buildMockValidationException(String field, String message) {
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "mockObject");
        bindingResult.addError(new FieldError("mockObject", field, message));

        MethodParameter methodParameter = mock(MethodParameter.class);
        return new MethodArgumentNotValidException(methodParameter, bindingResult);
    }
}
