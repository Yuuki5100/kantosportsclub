package com.example.appserver.service.sync;

import com.example.appserver.config.SyncRemoteProperties;
import com.example.appserver.config.SyncOutboxProperties;
import com.example.servercommon.enums.SyncOutboxStatus;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.SyncOutboxLog;
import com.example.servercommon.service.SyncOutboxService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NoticeSyncEventService {

    private static final String REQUEST_TYPE_NOTICE_CHANGED = "NOTICE_CHANGED";

    private final SyncOutboxService syncOutboxService;
    private final SyncOutboxDispatchService syncOutboxDispatchService;
    private final SyncRemoteProperties syncRemoteProperties;
    private final SyncOutboxProperties syncOutboxProperties;
    private final ObjectMapper objectMapper;

    public void publishNoticeChanged(Long noticeId, String action, String userId) {
        if (!syncOutboxProperties.isUse()) {
            return;
        }

        String requestId = UUID.randomUUID().toString();
        String payload = toJson(Map.of(
                "requestId", requestId,
                "requestType", REQUEST_TYPE_NOTICE_CHANGED,
                "noticeId", noticeId,
                "action", action,
                "userId", userId,
                "timestamp", Instant.now().toString()
        ));

        SyncOutboxLog outbox = syncOutboxService.register(
                requestId,
                REQUEST_TYPE_NOTICE_CHANGED,
                syncRemoteProperties.getNotice().getNoticeChangedPath(),
                payload
        );

        if (outbox.getStatus() == SyncOutboxStatus.PENDING || outbox.getStatus() == SyncOutboxStatus.RETRY_WAIT) {
            syncOutboxDispatchService.dispatch(outbox);
        }
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException(BackendMessageCatalog.EX_SYNC_JSON_CONVERSION_FAILED, ex);
        }
    }
}
