package com.example.appserver.controller;

import com.example.servercommon.enums.NotifyQueueStatus;
import com.example.servercommon.model.NotifyQueue;
import com.example.servercommon.responseModel.NotifyQueueEvent;
import com.example.servercommon.repository.NotifyQueueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/notify")
@RequiredArgsConstructor
public class NotifyQueueController {

    private final NotifyQueueRepository notifyQueueRepository;

    @GetMapping("/latest")
    public ResponseEntity<NotifyQueueEvent> getLatestNotify(@RequestParam("type") String type) {
        Optional<NotifyQueue> latest = notifyQueueRepository
                .findTop1ByEventTypeAndStatusOrderByCreatedAtDesc(type, NotifyQueueStatus.SENT);

        return latest.map(queue -> ResponseEntity.ok(
                NotifyQueueEvent.builder()
                        .eventType(queue.getEventType())
                        .refId(queue.getRefId())
                        .metadata(null) // 必要に応じてセット
                        .createdAt(queue.getCreatedAt())
                        .build()))
                .orElse(ResponseEntity.noContent().build()); // 204 No Content
    }
}
