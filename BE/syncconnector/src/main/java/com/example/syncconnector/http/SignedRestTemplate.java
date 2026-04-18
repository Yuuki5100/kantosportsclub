package com.example.syncconnector.http;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.syncconnector.signature.HmacSigner;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

@RequiredArgsConstructor
/**
 * HMAC署名付きの HTTP POST 通信を行うためのラッパー。
 *
 * <p>JSONに変換したリクエストボディに対し {@link HmacSigner} を用いて署名を付加し、
 * 指定ヘッダに署名を設定した状態で {@link RestTemplate} を呼び出します。</p>
 *
 * @see com.example.syncconnector.signature.HmacSigner
 */
public class SignedRestTemplate {

    private final RestTemplate restTemplate;
    private final HmacSigner signer;
    private final String signatureHeader;
    private final ObjectMapper objectMapper = new ObjectMapper(); // Jacksonを使用

    /**
     * POST送信（署名付き）
     */
    public <T> ApiResponse<T> post(String url, Object requestBody, Class<T> responseType) {
        try {
            // JSON変換 + 署名
            String json = objectMapper.writeValueAsString(requestBody);
            String signature = signer.sign(json);

            // ヘッダー組み立て
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(signatureHeader, signature);

            HttpEntity<String> entity = new HttpEntity<>(json, headers);

            // 応答型の ParameterizedTypeReference を生成
            ParameterizedTypeReference<ApiResponse<T>> typeRef = new ParameterizedTypeReference<>() {};

            ResponseEntity<ApiResponse<T>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    typeRef
            );

            return response.getBody();

        } catch (JsonProcessingException e) {
            throw new RuntimeException(BackendMessageCatalog.EX_SYNC_JSON_CONVERSION_FAILED, e);
        }
    }

    // ✅ テスト用の Getter を追加
    public String getSignatureHeader() {
        return signatureHeader;
    }
}
