package com.example.servercommon.file;

import org.springframework.stereotype.Component;

import com.example.servercommon.service.StorageService;

import lombok.AllArgsConstructor;

import java.io.IOException;
import java.io.InputStream;

@Component
@AllArgsConstructor
public class FileSaver {

    private final StorageService storageService;

    /**
     * アップロードファイルを保存する共通メソッド
     *
     * @param filename    保存するファイル名（例: users_20250328.csv）
     * @param inputStream ファイル内容の入力ストリーム
     */
    public void save(String filename, InputStream inputStream) throws IOException {
        storageService.upload(filename, inputStream);
    }
}
