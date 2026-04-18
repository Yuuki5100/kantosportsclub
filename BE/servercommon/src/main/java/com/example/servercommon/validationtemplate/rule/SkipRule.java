package com.example.servercommon.validationtemplate.rule;

import java.util.Map;

public interface SkipRule {
    boolean shouldSkip(Map<String, String> row);
}
