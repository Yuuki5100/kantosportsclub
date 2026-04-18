package com.example.servercommon.exception;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class StorageAccessExceptionTest {

    @Test
    void コンストラクタ_メッセージのみ() {
        StorageAccessException ex = new StorageAccessException("S3へのアクセスに失敗しました");

        assertThat(ex)
            .isInstanceOf(StorageAccessException.class)
            .hasMessage("S3へのアクセスに失敗しました");
    }

    @Test
    void コンストラクタ_メッセージと原因例外あり() {
        Exception cause = new IllegalStateException("root cause");
        StorageAccessException ex = new StorageAccessException("ファイル取得失敗", cause);

        assertThat(ex)
            .isInstanceOf(StorageAccessException.class)
            .hasMessage("ファイル取得失敗")
            .hasCauseInstanceOf(IllegalStateException.class)
            .hasRootCauseMessage("root cause");
    }
}
