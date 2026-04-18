package com.example.batchserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import com.example.servercommon.config.TemplateProperties;

@SpringBootApplication(
    scanBasePackages = {"com.example.batchserver", "com.example.servercommon"},
    exclude = {SecurityAutoConfiguration.class}
)
@EnableJpaRepositories(basePackages = "com.example.servercommon.repository")
@EntityScan(basePackages = "com.example.servercommon")
@EnableConfigurationProperties(TemplateProperties.class)
@EnableScheduling
public class BatchServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(BatchServerApplication.class, args);
    }
}
