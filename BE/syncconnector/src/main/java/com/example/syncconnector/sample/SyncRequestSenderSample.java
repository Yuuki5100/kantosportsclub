package com.example.syncconnector.sample;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.syncconnector.signature.HmacSigner;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * HMAC署名付きのサンプル送信処理クラス。
 *
 * <p>アプリケーション起動時に {@code @PostConstruct} によって自動実行され、
 * 固定の JSON データを署名付きで POST 送信します。</p>
 *
 * <p>テスト用・デモ用途であり、実運用の送信処理には {@link SignedRestTemplate} を推奨します。</p>
 */
@Component
@Profile("sample-sync-sender")
@RequiredArgsConstructor
@Slf4j
public class SyncRequestSenderSample {

    private final RestTemplate restTemplate;
    private final HmacSigner hmacSigner;

    @PostConstruct
    public void sendSampleRequest() {
        try {
            // 送信データ（JSONとして送信される）
            String jsonPayload = "{\"id\":123,\"name\":\"test\"}";

            // ヘッダーと署名の組み立て
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Signature", hmacSigner.sign(jsonPayload));

            HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);

            // 送信先（例）
            String url = "http://localhost:8080/api/sample/receive";

            // 送信
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            log.info(BackendMessageCatalog.LOG_SYNC_RESPONSE, response.getBody());
        } catch (Exception ex) {
            log.error(BackendMessageCatalog.LOG_SYNC_SEND_ERROR, ex.getMessage(), ex);
        }
    }
}
