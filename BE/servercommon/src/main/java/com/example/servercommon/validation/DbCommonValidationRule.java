package com.example.servercommon.validation;

import com.example.servercommon.service.ErrorCodeService;

import java.util.List;

public class DbCommonValidationRule implements DbValidationRule {

    private final CommonValidator validator;
    private final CommonValidationRepository commonRepo;
    private final ErrorCodeService errorCodeService;

    private static final String DEFAULT_LOCALE = "ja";

    public DbCommonValidationRule(CommonValidator validator, CommonValidationRepository commonRepo, ErrorCodeService errorCodeService) {
        this.validator = validator;
        this.commonRepo = commonRepo;
        this.errorCodeService = errorCodeService;
    }

    @Override
    public ValidationResult<?> validate(String fieldName, Object value) {
        ValidationResult<?> result = new ValidationResult<>(null, -1);

        if (value == null || validator.getTargetEntityClass() == null || validator.getTargetFieldName() == null) {
            return result;
        }

        boolean exists = commonRepo.existsByFieldValue(
                validator.getTargetEntityClass(),
                validator.getTargetFieldName(),
                value.toString()
        );

        if (validator.isMustExistInDb() && !exists) {
            result.addError(errorCodeService.getErrorMessage("E5001", List.of(fieldName), DEFAULT_LOCALE));
        } else if (validator.isMustBeUnique() && exists) {
            result.addError(errorCodeService.getErrorMessage("E5002", List.of(fieldName), DEFAULT_LOCALE));
        }

        return result;
    }
}
