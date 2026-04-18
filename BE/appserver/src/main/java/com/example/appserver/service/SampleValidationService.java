package com.example.appserver.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.servercommon.model.UserTest;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.CommonInputValidationRule;
import com.example.servercommon.validation.CommonValidationRepository;
import com.example.servercommon.validation.CommonValidator;
import com.example.servercommon.validation.DbCommonValidationRule;
import com.example.servercommon.validation.ValidationResult;
import com.example.servercommon.validation.ValidationRuleSet;

@Service
public class SampleValidationService {

    private final CommonValidationRepository repository;
    private final ErrorCodeService errorCodeService;

    public SampleValidationService(CommonValidationRepository repository, ErrorCodeService errorCodeService) {
        this.repository = repository;
        this.errorCodeService = errorCodeService;
    }

    public List<String> validate() {
        Map<String, Object> input = new HashMap<>();
        input.put("email", "test@gmail.com");
        input.put("id", "12");
        input.put("postalCode", "1234-567");
        input.put("telephone", "0312345678");

        ValidationRuleSet ruleSet = new ValidationRuleSet();

        // email: 入力バリデーション
        CommonValidator emailValidator = new CommonValidator();
        emailValidator.setRequired(true);
        emailValidator.setEmail(true);
        emailValidator.setMaxLength(30);
        ruleSet.addInputRule("email", new CommonInputValidationRule(emailValidator, errorCodeService));

        // email: DB存在チェック
        CommonValidator emailDbValidator = new CommonValidator();
        emailDbValidator.setMustExistInDb(true);
        emailDbValidator.setTargetEntityClass(UserTest.class);
        emailDbValidator.setTargetFieldName("email");
        ruleSet.addDbRule("email", new DbCommonValidationRule(emailDbValidator, repository, errorCodeService));

        // id: 数字のみ、3桁以上
        CommonValidator idValidator = new CommonValidator();
        idValidator.setNumericOnly(true);
        idValidator.setMinLength(3);
        ruleSet.addInputRule("id", new CommonInputValidationRule(idValidator, errorCodeService));

        // 郵便番号
        CommonValidator postalValidator = new CommonValidator();
        postalValidator.setPostalCodeFormat(true);
        ruleSet.addInputRule("postalCode", new CommonInputValidationRule(postalValidator, errorCodeService));

        // 電話番号
        CommonValidator phoneValidator = new CommonValidator();
        phoneValidator.setPhoneNumberFormat(true);
        ruleSet.addInputRule("telephone", new CommonInputValidationRule(phoneValidator, errorCodeService));

        // バリデーション実行
        List<ValidationResult<?>> results = ruleSet.validate(input);

        // エラーメッセージを抽出
        List<String> messages = new ArrayList<>();
        for (ValidationResult<?> result : results) {
            messages.addAll(result.getErrors());
        }
        return messages;
    }
}
