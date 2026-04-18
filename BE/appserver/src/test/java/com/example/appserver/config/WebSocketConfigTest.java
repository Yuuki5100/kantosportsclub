package com.example.appserver.config;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest(classes = WebSocketConfig.class)
class WebSocketConfigTest {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private WebSocketConfig webSocketConfig;

    @Test
    void contextLoads() {
        assertNotNull(context, "ApplicationContext should be injected");
        assertNotNull(context.getBean(WebSocketConfig.class), "WebSocketConfig bean should be loaded");
        assertNotNull(webSocketConfig, "WebSocketConfig should be injected");
    }
}
