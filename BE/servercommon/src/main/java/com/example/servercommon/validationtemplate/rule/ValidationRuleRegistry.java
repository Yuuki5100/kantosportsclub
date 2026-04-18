// ValidationRuleRegistry.java
package com.example.servercommon.validationtemplate.rule;

import java.util.List;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.service.ErrorCodeService;

public class ValidationRuleRegistry {

    /**
     * 本番環境やバリデーションで使用されるルール一覧。
     *
     * @param errorCodeService エラーコード取得用サービス
     * @return ValidationRule のリスト
     */
    public static List<ValidationRule> getDefaultRules(ErrorCodeService errorCodeService) {
        return List.of(
            new EnumRule(errorCodeService),
            new MaxLengthRule(errorCodeService),
            new PatternRule(errorCodeService)
            // RequiredRule は GenericValidator 側で個別処理
        );
    }

    /**
     * ※使用禁止：ErrorCodeServiceが必要なため、明示的な呼び出しのみ許可。
     * テスト用途では FakeErrorCodeService を明示的に渡すこと。
     */
    @Deprecated
    public static List<ValidationRule> getDefaultRules() {
        throw new UnsupportedOperationException(BackendMessageCatalog.EX_ERROR_CODE_SERVICE_REQUIRED);
    }
}
