package com.example.syncconnector;

import com.example.syncconnector.config.SyncSignatureProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(SyncSignatureProperties.class)
public class SyncConnectorApplication {

    public static void main(String[] args) {
        SpringApplication.run(SyncConnectorApplication.class, args);
    }
}
