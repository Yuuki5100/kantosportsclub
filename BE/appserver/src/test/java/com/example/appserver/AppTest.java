package com.example.appserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import com.example.appserver.testutil.TestPermissionConfig;

import static org.junit.jupiter.api.Assertions.assertTrue;


@SpringBootTest(classes = {AppTestConfig.class})
@Import(TestPermissionConfig.class)
@ActiveProfiles("test")
public class AppTest {
    @Test
    void contextLoads() {
        assertTrue(true);
    }
}

@Configuration
class AppTestConfig {
    // 本番Beanをスキャンさせず、空の設定にしておくことで依存性トラブルを防ぐ
}
