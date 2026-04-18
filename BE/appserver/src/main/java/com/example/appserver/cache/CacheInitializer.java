package com.example.appserver.cache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;

@AllArgsConstructor
@Component
public class CacheInitializer {

    @Autowired
    private final SettingVariableCache settingVariableCache;
    @Autowired
    private final MailTemplateCache mailTemplateCache;
    @Autowired
    private final ErrorCodeCache errorCodeCache;

    @PostConstruct
    public void init() {
        settingVariableCache.updateCache();
        mailTemplateCache.updateCache();
        errorCodeCache.updateCache();
    }
}

