package com.example.servercommon.validationtemplate.rule;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.validationtemplate.rule.dynamic.RowBasedRequiredRule;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@NoArgsConstructor
@Data
@Slf4j
public class RequireEmailUnlessGuest implements RowBasedRequiredRule {

    @Override
    public boolean isRequired(Map<String, String> row) {
        String role = row.get("role");
        if("GUEST".equalsIgnoreCase(role)) {
            log.debug(BackendMessageCatalog.LOG_GUEST_ROLE_DETECTED, role);
        }
        boolean ok = !"GUEST".equalsIgnoreCase(role);
        return ok;
    }
}
