package com.example.servercommon.utils;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.validationtemplate.rule.SkipIfEmptyField;
import com.example.servercommon.validationtemplate.rule.SkipRule;

/**
 * skipRule の定義に基づき、該当クラスを生成するファクトリクラスです。
 * .ymlに設定された skipRule の class や param を元に、行スキップ判定用のロジックを生成します。
 *
 */
public class SkipRuleFactory {
    public static SkipRule create(String className, String param) {
        if ("com.example.servercommon.validationtemplate.rule.SkipIfEmptyField".equals(className)) {
            return new SkipIfEmptyField(param); // param is field name like "itemName"
        }

        try {
            Class<?> clazz = Class.forName(className);
            return (SkipRule) clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_SKIP_RULE_INSTANTIATE_FAILED, className), e);
        }
    }
}
