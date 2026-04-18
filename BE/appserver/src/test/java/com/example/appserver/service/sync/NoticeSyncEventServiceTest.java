package com.example.appserver.service.sync;

import com.example.appserver.config.SyncRemoteProperties;
import com.example.appserver.config.SyncOutboxProperties;
import com.example.servercommon.enums.SyncOutboxStatus;
import com.example.servercommon.model.SyncOutboxLog;
import com.example.servercommon.service.SyncOutboxService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NoticeSyncEventServiceTest {

    private SyncOutboxService syncOutboxService;
    private SyncOutboxDispatchService syncOutboxDispatchService;
    private NoticeSyncEventService noticeSyncEventService;

    @BeforeEach
    void setUp() {
        syncOutboxService = mock(SyncOutboxService.class);
        syncOutboxDispatchService = mock(SyncOutboxDispatchService.class);

        SyncRemoteProperties syncRemoteProperties = new SyncRemoteProperties();
        syncRemoteProperties.setBaseUrl("https://remote.example.local");
        syncRemoteProperties.getNotice().setNoticeChangedPath("/api/notice/sync");

        SyncOutboxProperties syncOutboxProperties = new SyncOutboxProperties();
        syncOutboxProperties.setUse(true);

        noticeSyncEventService = new NoticeSyncEventService(
                syncOutboxService,
                syncOutboxDispatchService,
                syncRemoteProperties,
                syncOutboxProperties,
                new ObjectMapper()
        );
    }

    @Test
    void publishNoticeChanged_registersOutboxAndDispatchesImmediately() {
        SyncOutboxLog outbox = new SyncOutboxLog();
        outbox.setStatus(SyncOutboxStatus.PENDING);
        when(syncOutboxService.register(any(), eq("NOTICE_CHANGED"), eq("/api/notice/sync"), any()))
                .thenReturn(outbox);

        noticeSyncEventService.publishNoticeChanged(101L, "CREATED", "user-1");

        verify(syncOutboxService).register(any(), eq("NOTICE_CHANGED"), eq("/api/notice/sync"), any());
        verify(syncOutboxDispatchService).dispatch(eq(outbox));
    }

    @Test
    void publishNoticeChanged_skips_whenSyncOutboxUseIsFalse() {
        SyncRemoteProperties syncRemoteProperties = new SyncRemoteProperties();
        syncRemoteProperties.setBaseUrl("https://remote.example.local");
        syncRemoteProperties.getNotice().setNoticeChangedPath("/api/notice/sync");
        SyncOutboxProperties disabledProperties = new SyncOutboxProperties();
        disabledProperties.setUse(false);

        NoticeSyncEventService disabledService = new NoticeSyncEventService(
                syncOutboxService,
                syncOutboxDispatchService,
                syncRemoteProperties,
                disabledProperties,
                new ObjectMapper()
        );

        disabledService.publishNoticeChanged(101L, "CREATED", "user-1");

        verify(syncOutboxService, never()).register(any(), any(), any(), any());
        verify(syncOutboxDispatchService, never()).dispatch(any());
    }
}
