package com.example.servercommon.config;

import com.example.servercommon.message.BackendMessageCatalog;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;

@Configuration
@Profile("!test")
@Slf4j
public class SesMailConfig {

    private final EnvironmentVariableResolver env;

    public SesMailConfig(EnvironmentVariableResolver env) {
        this.env = env;
    }

    @Bean
    public SesClient sesClient() {
        var region = env.getOptional("aws.region").orElse("ap-northeast-1");

        var ak = env.getOptional("mail.access-key");
        var sk = env.getOptional("mail.secret-key");

        SesClient client;
        if (ak.isPresent() && sk.isPresent()) {
            log.info(BackendMessageCatalog.LOG_SES_STATIC_CREDENTIALS);
            var credentials = AwsBasicCredentials.create(ak.get(), sk.get());
            client = SesClient.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(credentials))
                    .build();
        } else {
            log.info(BackendMessageCatalog.LOG_SES_DEFAULT_CREDENTIALS);
            client = SesClient.builder()
                    .region(Region.of(region))
                    .credentialsProvider(software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create())
                    .build();
        }
        return client;
    }
}
