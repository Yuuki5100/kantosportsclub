// ValidationRule.java
package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.validationtemplate.schema.ColumnSchema;

public interface ValidationRule {
    void validate(String fieldName, String value, ColumnSchema schema, ValidationResult result);
}
