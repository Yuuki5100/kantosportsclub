package com.example.appserver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);            // コアスレッド数
        executor.setMaxPoolSize(10);            // 最大スレッド数
        executor.setQueueCapacity(25);          // キュー容量
        executor.setThreadNamePrefix("Async-Executor-"); // スレッド名の接頭辞
        executor.initialize();
        return executor;
    }
}
