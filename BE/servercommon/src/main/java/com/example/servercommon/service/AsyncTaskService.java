package com.example.servercommon.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.concurrent.CompletableFuture;

@Service
public class AsyncTaskService {

    /**
     * CSVファイルからデータを読み込み、DBにインサートする処理をシミュレーションします。
     * 実際の CSV 読み込みや DB インサートは行わず、sleep で処理時間をシミュレーションします。
     *
     * @param csvFilePath CSVファイルのパス（シミュレーション用のパラメータ）
     * @return 処理結果のメッセージを含む CompletableFuture
     */
    @Async("taskExecutor")
    public CompletableFuture<String> importCsvAndInsertToDb(String csvFilePath) {
        try {
            // 重い処理をシミュレーション（例：5秒間スリープ）
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return CompletableFuture.completedFuture("CSV import interrupted");
        }
        String result = "CSV import completed for file: " + csvFilePath;
        return CompletableFuture.completedFuture(result);
    }
}
