package com.example.appserver.service.sync;

import com.example.appserver.config.SyncOutboxProperties;
import com.example.appserver.config.SyncRemoteProperties;
import com.example.servercommon.model.SyncOutboxLog;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.SyncOutboxService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

class SyncOutboxDispatchServiceTest {

    private SignedSyncSender signedSyncSender;
    private SyncOutboxService syncOutboxService;
    private SyncOutboxDispatchService syncOutboxDispatchService;

    @BeforeEach
    void setUp() {
        signedSyncSender = mock(SignedSyncSender.class);
        syncOutboxService = mock(SyncOutboxService.class);

        SyncOutboxProperties syncOutboxProperties = new SyncOutboxProperties();
        syncOutboxProperties.setUse(true);
        syncOutboxProperties.setMaxRetry(3);
        syncOutboxProperties.setFixedDelayMs(1000L);

        SyncRemoteProperties syncRemoteProperties = new SyncRemoteProperties();
        syncRemoteProperties.setBaseUrl("https://remote.example.local");

        syncOutboxDispatchService = new SyncOutboxDispatchService(
                signedSyncSender,
                syncOutboxService,
                syncOutboxProperties,
                syncRemoteProperties,
                new ObjectMapper()
        );
        when(signedSyncSender.isAvailable()).thenReturn(true);
    }

    @Test
    void dispatch_marksSent_whenRemoteReturnsSuccess() {
        SyncOutboxLog outbox = new SyncOutboxLog();
        outbox.setRequestId("req-1");
        outbox.setRequestPath("/api/notice/sync");
        outbox.setPayload("{\"noticeId\":10}");

        ApiResponse<Object> response = ApiResponse.success(Map.of("success", true, "message", "OK"));
        when(signedSyncSender.post(eq("https://remote.example.local/api/notice/sync"), any()))
                .thenReturn(response);

        syncOutboxDispatchService.dispatch(outbox);

        verify(syncOutboxService).markSent(eq(outbox), eq("200"), any());
        verify(syncOutboxService, never()).markFailed(
                any(),
                anyBoolean(),
                anyString(),
                any(),
                any(),
                anyInt(),
                anyLong());
    }

    @Test
    void dispatch_marksRetryWait_whenServerErrorOccurs() {
        SyncOutboxLog outbox = new SyncOutboxLog();
        outbox.setRequestId("req-2");
        outbox.setRequestPath("/api/notice/sync");
        outbox.setPayload("{\"noticeId\":11}");

        HttpServerErrorException ex = HttpServerErrorException.create(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                HttpHeaders.EMPTY,
                "{\"message\":\"boom\"}".getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8
        );
        when(signedSyncSender.post(any(), any())).thenThrow(ex);

        syncOutboxDispatchService.dispatch(outbox);

        ArgumentCaptor<Boolean> retryableCaptor = ArgumentCaptor.forClass(Boolean.class);
        verify(syncOutboxService).markFailed(
                eq(outbox),
                retryableCaptor.capture(),
                any(),
                eq("500"),
                eq("{\"message\":\"boom\"}"),
                eq(3),
                eq(1000L));
        assertTrue(retryableCaptor.getValue());
    }

    @Test
    void dispatch_marksFailedImmediately_whenClientErrorOccurs() {
        SyncOutboxLog outbox = new SyncOutboxLog();
        outbox.setRequestId("req-3");
        outbox.setRequestPath("/api/notice/sync");
        outbox.setPayload("{\"noticeId\":12}");

        HttpClientErrorException ex = HttpClientErrorException.create(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                HttpHeaders.EMPTY,
                "{\"message\":\"invalid\"}".getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8
        );
        when(signedSyncSender.post(any(), any())).thenThrow(ex);

        syncOutboxDispatchService.dispatch(outbox);

        ArgumentCaptor<Boolean> retryableCaptor = ArgumentCaptor.forClass(Boolean.class);
        verify(syncOutboxService).markFailed(
                eq(outbox),
                retryableCaptor.capture(),
                any(),
                eq("400"),
                eq("{\"message\":\"invalid\"}"),
                eq(3),
                eq(1000L));
        assertEquals(Boolean.FALSE, retryableCaptor.getValue());
    }

    @Test
    void dispatch_marksFailed_whenUseTrueButSyncConnectorIsUnavailable() {
        SyncOutboxLog outbox = new SyncOutboxLog();
        outbox.setRequestId("req-4");
        outbox.setRequestPath("/api/notice/sync");
        outbox.setPayload("{\"noticeId\":13}");
        when(signedSyncSender.isAvailable()).thenReturn(false);

        syncOutboxDispatchService.dispatch(outbox);

        verify(syncOutboxService).markFailed(
                eq(outbox),
                eq(false),
                any(),
                eq(null),
                eq(null),
                eq(3),
                eq(1000L));
        verify(syncOutboxService, never()).markSent(any(), any(), any());
    }
}
