package com.example.syncconnector.model;

import java.time.Instant;
/**
 * サーバー間通信における汎用リクエストモデル。
 *
 * <p>リクエスト種別（requestType）と任意の payload を持ち、
 * 冪等性のための requestId や timestamp を含みます。</p>
 *
 * <p>署名対象として timestamp や payload が利用される前提です。</p>
 *
 * @param <T> リクエスト本体の型
 */
public class SyncRequest<T> {

    private String requestId;       // 冪等性用ID（ULIDなど）
    private String requestType;     // 処理タイプ（例："inventory-sync"）
    private T payload;              // 実データ（任意のDTO）
    private Instant timestamp;      // リクエスト作成時刻（署名対象）

    public SyncRequest() {}

    public SyncRequest(String requestId, String requestType, T payload, Instant timestamp) {
        this.requestId = requestId;
        this.requestType = requestType;
        this.payload = payload;
        this.timestamp = timestamp;
    }

    public static <T> SyncRequest<T> of(String requestType, T payload, Instant timestamp) {
        return new SyncRequest<>(generateRequestId(), requestType, payload, timestamp);
    }

    private static String generateRequestId() {
        return java.util.UUID.randomUUID().toString(); // もしくは ULID
    }

    // --- Getters/Setters ---

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public T getPayload() {
        return payload;
    }

    public void setPayload(T payload) {
        this.payload = payload;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
