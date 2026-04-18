package com.example.appserver.service.sync;

import com.example.appserver.config.SyncOutboxProperties;
import com.example.appserver.config.SyncRemoteProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.SyncOutboxLog;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.SyncOutboxService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;

@Service
@RequiredArgsConstructor
@Slf4j
public class SyncOutboxDispatchService {

    private final SignedSyncSender signedSyncSender;
    private final SyncOutboxService syncOutboxService;
    private final SyncOutboxProperties syncOutboxProperties;
    private final SyncRemoteProperties syncRemoteProperties;
    private final ObjectMapper objectMapper;

    public void dispatch(SyncOutboxLog outbox) {
        if (!syncOutboxProperties.isUse()) {
            return;
        }

        String requestId = outbox.getRequestId();
        String requestUrl = buildRequestUrl(outbox);
        if (!StringUtils.hasText(requestUrl)) {
            syncOutboxService.markFailed(
                    outbox,
                    false,
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "sync.remote.base-url"),
                    null,
                    null,
                    syncOutboxProperties.getMaxRetry(),
                    syncOutboxProperties.getFixedDelayMs());
            return;
        }

        if (!signedSyncSender.isAvailable()) {
            syncOutboxService.markFailed(
                    outbox,
                    false,
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_CONFIG_REQUIRED, "sync.outbox.use=true with sync-connector"),
                    null,
                    null,
                    syncOutboxProperties.getMaxRetry(),
                    syncOutboxProperties.getFixedDelayMs());
            return;
        }

        JsonNode payloadNode;
        try {
            payloadNode = objectMapper.readTree(outbox.getPayload());
        } catch (Exception ex) {
            syncOutboxService.markFailed(
                    outbox,
                    false,
                    BackendMessageCatalog.EX_SYNC_JSON_CONVERSION_FAILED,
                    null,
                    null,
                    syncOutboxProperties.getMaxRetry(),
                    syncOutboxProperties.getFixedDelayMs());
            log.warn(BackendMessageCatalog.LOG_SYNC_OUTBOX_DISPATCH_ERROR, requestId, ex.getMessage(), ex);
            return;
        }

        try {
            ApiResponse<Object> response = signedSyncSender.post(requestUrl, payloadNode);
            String responseBody = toJson(response);
            if (isSuccessResponse(response)) {
                syncOutboxService.markSent(outbox, "200", responseBody);
                return;
            }

            syncOutboxService.markFailed(
                    outbox,
                    false,
                    extractFailureMessage(response),
                    response != null ? response.getErrorCode() : null,
                    responseBody,
                    syncOutboxProperties.getMaxRetry(),
                    syncOutboxProperties.getFixedDelayMs());
        } catch (HttpClientErrorException ex) {
            syncOutboxService.markFailed(
                    outbox,
                    false,
                    ex.getMessage(),
                    String.valueOf(ex.getStatusCode().value()),
                    ex.getResponseBodyAsString(),
                    syncOutboxProperties.getMaxRetry(),
                    syncOutboxProperties.getFixedDelayMs());
            log.warn(BackendMessageCatalog.LOG_SYNC_OUTBOX_DISPATCH_ERROR, requestId, ex.getMessage(), ex);
        } catch (HttpServerErrorException | ResourceAccessException ex) {
            syncOutboxService.markFailed(
                    outbox,
                    true,
                    ex.getMessage(),
                    extractStatusCode(ex),
                    extractResponseBody(ex),
                    syncOutboxProperties.getMaxRetry(),
                    syncOutboxProperties.getFixedDelayMs());
            log.warn(BackendMessageCatalog.LOG_SYNC_OUTBOX_DISPATCH_ERROR, requestId, ex.getMessage(), ex);
        } catch (RestClientException ex) {
            syncOutboxService.markFailed(
                    outbox,
                    true,
                    ex.getMessage(),
                    null,
                    null,
                    syncOutboxProperties.getMaxRetry(),
                    syncOutboxProperties.getFixedDelayMs());
            log.warn(BackendMessageCatalog.LOG_SYNC_OUTBOX_DISPATCH_ERROR, requestId, ex.getMessage(), ex);
        } catch (RuntimeException ex) {
            syncOutboxService.markFailed(
                    outbox,
                    false,
                    ex.getMessage(),
                    null,
                    null,
                    syncOutboxProperties.getMaxRetry(),
                    syncOutboxProperties.getFixedDelayMs());
            log.warn(BackendMessageCatalog.LOG_SYNC_OUTBOX_DISPATCH_ERROR, requestId, ex.getMessage(), ex);
        }
    }

    private boolean isSuccessResponse(ApiResponse<Object> response) {
        if (response == null || !response.isSuccess()) {
            return false;
        }
        Object data = response.getData();
        if (data instanceof Map<?, ?> map) {
            Object success = map.get("success");
            if (success instanceof Boolean result) {
                return result;
            }
        }
        return true;
    }

    private String extractFailureMessage(ApiResponse<Object> response) {
        if (response == null) {
            return BackendMessageCatalog.MSG_UNKNOWN_ERROR;
        }
        Object data = response.getData();
        if (data instanceof Map<?, ?> map) {
            Object message = map.get("message");
            if (message instanceof String messageString && StringUtils.hasText(messageString)) {
                return messageString;
            }
        }
        if (StringUtils.hasText(response.getMessage())) {
            return response.getMessage();
        }
        return BackendMessageCatalog.MSG_UNKNOWN_ERROR;
    }

    private String buildRequestUrl(SyncOutboxLog outbox) {
        String baseUrl = syncRemoteProperties.getBaseUrl();
        String path = outbox.getRequestPath();
        if (!StringUtils.hasText(baseUrl) || !StringUtils.hasText(path)) {
            return null;
        }

        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return normalizedBase + normalizedPath;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    private String extractStatusCode(Exception ex) {
        if (ex instanceof HttpServerErrorException serverError) {
            return String.valueOf(serverError.getStatusCode().value());
        }
        return null;
    }

    private String extractResponseBody(Exception ex) {
        if (ex instanceof HttpServerErrorException serverError) {
            return serverError.getResponseBodyAsString();
        }
        return null;
    }
}
