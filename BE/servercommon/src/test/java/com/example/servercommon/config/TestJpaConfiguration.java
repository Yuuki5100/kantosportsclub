package com.example.servercommon.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EntityScan("com.example.servercommon.model")
@EnableJpaRepositories("com.example.servercommon.repository")
public class TestJpaConfiguration {
}
