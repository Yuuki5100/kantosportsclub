package com.example.syncconnector.model;

public class SyncResult {

    private boolean success;
    private String message;
    private String requestId;

    public SyncResult() {}

    public SyncResult(boolean success, String message, String requestId) {
        this.success = success;
        this.message = message;
        this.requestId = requestId;
    }

    public static SyncResult success(String requestId) {
        return new SyncResult(true, "OK", requestId);
    }

    public static SyncResult failure(String message, String requestId) {
        return new SyncResult(false, message, requestId);
    }

    // --- Getters/Setters ---

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
}
