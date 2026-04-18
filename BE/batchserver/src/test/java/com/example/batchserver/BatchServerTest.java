package com.example.batchserver;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Spring Boot Batch Server テスト共通ベースクラス
 * - @SpringBootTest: 実際のコンテキストでの統合テスト
 * - @ActiveProfiles("test"): test 用 application-test.yml を使用
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
public abstract class BatchServerTest {
    // 共通のユーティリティやフィクスチャなどをここに定義可能
}
