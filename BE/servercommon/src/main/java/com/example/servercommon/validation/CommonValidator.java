package com.example.servercommon.validation;

import lombok.Data;

@Data
public class CommonValidator {
    // 入力バリデーション用
    private boolean required;
    private Integer maxLength;
    private Integer minLength;
    private String pattern;
    private boolean email;
    private boolean numericOnly;
    private boolean phoneNumberFormat; // 000-1234-555
    private boolean postalCodeFormat;  // 123-4567

    // DB バリデーション用
    private boolean mustExistInDb;
    private boolean mustBeUnique;
    private Class<?> targetEntityClass;
    private String targetFieldName;
}
