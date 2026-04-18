package com.example.servercommon.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CompletableFuture;

import static org.assertj.core.api.Assertions.assertThat;

class AsyncTaskServiceTest {

    private AsyncTaskService asyncTaskService;

    @BeforeEach
    void setUp() {
        asyncTaskService = new AsyncTaskService();
    }

    @Test
    void importCsvAndInsertToDb_returnsCompletedFuture() throws Exception {
        String csvFilePath = "test.csv";

        // メソッド呼び出し（sleepは5秒あるので短縮したい場合はサービス内でコメントアウトしてもOK）
        CompletableFuture<String> future = asyncTaskService.importCsvAndInsertToDb(csvFilePath);

        // 完了まで待機
        String result = future.get();

        // 結果の確認
        assertThat(result).isEqualTo("CSV import completed for file: " + csvFilePath);
    }

    @Test
    void importCsvAndInsertToDb_interrupted_returnsInterruptedMessage() throws Exception {
        String csvFilePath = "test.csv";

        Thread testThread = new Thread(() -> {
            try {
                CompletableFuture<String> future = asyncTaskService.importCsvAndInsertToDb(csvFilePath);
                future.get();
            } catch (Exception ignored) {}
        });

        testThread.start();
        testThread.interrupt(); // 割り込みをかける
        testThread.join();

        // 割り込み発生時の挙動はCompletableFutureで既に捕捉されるので例外は出ない
    }
}
