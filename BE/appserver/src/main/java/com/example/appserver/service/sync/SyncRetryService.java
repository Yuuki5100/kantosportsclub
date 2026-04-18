package com.example.appserver.service.sync;

import com.example.appserver.config.SyncOutboxProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.SyncOutboxLog;
import com.example.servercommon.service.SyncOutboxService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SyncRetryService {

    private final SyncOutboxService syncOutboxService;
    private final SyncOutboxDispatchService syncOutboxDispatchService;
    private final SyncOutboxProperties syncOutboxProperties;

    @Scheduled(fixedDelayString = "${sync.outbox.fixed-delay-ms:60000}")
    public void retryPending() {
        if (!syncOutboxProperties.isUse()) {
            return;
        }

        List<SyncOutboxLog> targets = syncOutboxService.findDispatchTargets(syncOutboxProperties.getDispatchLimit());
        if (targets.isEmpty()) {
            return;
        }

        log.debug(BackendMessageCatalog.LOG_SYNC_OUTBOX_RETRY_SCAN, targets.size());
        for (SyncOutboxLog target : targets) {
            try {
                syncOutboxDispatchService.dispatch(target);
            } catch (Exception ex) {
                log.warn(BackendMessageCatalog.LOG_SYNC_OUTBOX_DISPATCH_ERROR,
                        target.getRequestId(), ex.getMessage(), ex);
            }
        }
    }
}
