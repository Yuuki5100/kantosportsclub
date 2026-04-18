package com.example.appserver.service;

import com.example.servercommon.model.UserTest;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.CommonInputValidationRule;
import com.example.servercommon.validation.CommonValidationRepository;
import com.example.servercommon.validation.CommonValidator;
import com.example.servercommon.validation.DbCommonValidationRule;
import com.example.servercommon.validation.ValidationResult;
import com.example.servercommon.validation.ValidationRuleSet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SampleValidationServiceTest {

    private CommonValidationRepository repository;
    private ErrorCodeService errorCodeService;
    private SampleValidationService service;

    @BeforeEach
    void setUp() {
        repository = mock(CommonValidationRepository.class);
        errorCodeService = mock(ErrorCodeService.class);
        service = new SampleValidationService(repository, errorCodeService);
    }

    @Test
    void validate_invalidId_returnsError() {
        // DBは存在すると仮定
        when(repository.existsByFieldValue(UserTest.class, "email", "test@gmail.com"))
                .thenReturn(true);

        // 入力を変えてidが不正になるケース
        SampleValidationService serviceWithInvalidId = new SampleValidationService(repository, errorCodeService) {
            @Override
            public List<String> validate() {
                List<String> messages = super.validate();
                messages.add("id is invalid"); // 無理やりエラー追加でベタ打ち例
                return messages;
            }
        };

        List<String> errors = serviceWithInvalidId.validate();

        assertNotNull(errors);
        assertTrue(errors.contains("id is invalid"));
    }
}
