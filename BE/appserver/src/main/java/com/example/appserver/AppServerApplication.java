package com.example.appserver;

import com.example.servercommon.config.TemplateProperties;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;




@MapperScan("com.example.servercommon.mapper")
@SpringBootApplication(scanBasePackages = {
    "com.example",
    "com.example.appserver", // ✅ Explicitly add this!
    "com.example.servercommon"
})
@EntityScan(basePackages = {
        "com.example.servercommon.model"
})
@EnableJpaRepositories(basePackages = {
        "com.example.servercommon.repository",
        "com.example.appserver.repository"
})
@EnableScheduling
@EnableAsync
@EnableConfigurationProperties(TemplateProperties.class) // ★追加
public class AppServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppServerApplication.class, args);
    }
}
