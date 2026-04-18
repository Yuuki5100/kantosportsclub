package com.example.syncconnector.sample;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.syncconnector.signature.HmacSigner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest; // ← 修正済
import java.io.BufferedReader;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Slf4j
public class SyncRequestReceiverSampleController {

    private final HmacSigner hmacSigner;

    @PostMapping("/api/sample/receive")
    public ResponseEntity<String> receive(
            HttpServletRequest request,
            @RequestHeader("X-Signature") String receivedSignature
    ) throws Exception {
        // リクエストボディ読み取り
        String body = new BufferedReader(request.getReader())
                .lines()
                .collect(Collectors.joining(System.lineSeparator()));

        // 署名検証
        boolean valid = hmacSigner.verify(body, receivedSignature);
        if (!valid) {
            return ResponseEntity.status(401).body(BackendMessageCatalog.MSG_SIGNATURE_VERIFICATION_FAILED);
        }

        // 正常処理
        log.info(BackendMessageCatalog.LOG_SYNC_RECEIVED_DATA, body);
        return ResponseEntity.ok(BackendMessageCatalog.MSG_SIGNATURE_OK);
    }
}
