package com.example.servercommon.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ReportCacheProperties.class)
public class ReportCommonConfig {
}
