package com.example.batchserver.config;

import com.example.servercommon.config.AwsCredentialsProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AwsCredentialsProperties.class)
public class AwsPropertyRegistrar {
}
