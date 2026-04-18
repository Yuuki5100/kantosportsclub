package com.example.appserver.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import com.example.servercommon.config.AwsCredentialsProperties;

@Configuration
@EnableConfigurationProperties(AwsCredentialsProperties.class)
public class AwsPropertyRegistrar {
}
