package com.example.appserver.controller;

import com.example.servercommon.service.AsyncTaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/import")
public class ImportController {
//実装サンプル
    private final AsyncTaskService asyncTaskService;

    public ImportController(AsyncTaskService asyncTaskService) {
        this.asyncTaskService = asyncTaskService;
    }

    /**
     * CSVインポートタスクを非同期で開始するエンドポイント
     * @param csvFilePath CSVファイルのパス（シミュレーション用パラメータ）
     * @return タスク開始のレスポンス
     */
    @PostMapping("/csv")
    public ResponseEntity<?> importCsv(@RequestParam("file") String csvFilePath) {
        CompletableFuture<String> futureResult = asyncTaskService.importCsvAndInsertToDb(csvFilePath);
        // 非同期タスクの結果は後で取得可能ですが、ここではタスク開始を通知するだけとします。
        return ResponseEntity.ok("CSV import task started for file: " + csvFilePath);
    }
}
