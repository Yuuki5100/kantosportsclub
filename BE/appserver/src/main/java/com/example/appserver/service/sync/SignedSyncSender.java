package com.example.appserver.service.sync;

import com.example.servercommon.responseModel.ApiResponse;
import com.fasterxml.jackson.databind.JsonNode;

public interface SignedSyncSender {

    boolean isAvailable();

    ApiResponse<Object> post(String url, JsonNode payload);
}
