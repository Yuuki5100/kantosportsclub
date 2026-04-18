package com.example.servercommon.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "aws.credentials")
public class AwsCredentialsProperties {
    private String accessKey;
    private String secretKey;
}
