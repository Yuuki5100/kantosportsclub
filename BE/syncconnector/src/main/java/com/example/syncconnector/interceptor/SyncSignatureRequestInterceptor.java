package com.example.syncconnector.interceptor;

import com.example.syncconnector.signature.HmacSigner;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * {@link ClientHttpRequestInterceptor} 実装クラス。
 * <p>
 * HTTP リクエストボディに対して HMAC 署名を生成し、指定のヘッダー（デフォルトで "X-Signature"）に付与します。
 * 主に {@link org.springframework.web.client.RestTemplate} に登録して、送信リクエストに署名を追加する用途で利用されます。
 * </p>
 *
 * <p>使用例：</p>
 * <pre>{@code
 * RestTemplate restTemplate = new RestTemplate();
 * restTemplate.getInterceptors().add(new SyncSignatureRequestInterceptor(new HmacSigner("secret")));
 * }</pre>
 *
 * @see HmacSigner
 */
@RequiredArgsConstructor
public class SyncSignatureRequestInterceptor implements ClientHttpRequestInterceptor {

    /** 署名を生成するための HMAC サイナー */
    private final HmacSigner signer;

    /**
     * リクエスト送信直前に署名を追加する処理。
     *
     * @param request 送信対象のリクエスト
     * @param body リクエストボディ（バイト列）
     * @param execution 実際の送信処理を行うエンジン
     * @return HTTPレスポンス
     * @throws IOException 通信エラーなど
     */
    @Override
    public ClientHttpResponse intercept(
            HttpRequest request, byte[] body, ClientHttpRequestExecution execution
    ) throws IOException {
        String payload = new String(body, StandardCharsets.UTF_8);
        String signature = signer.sign(payload);

        request.getHeaders().add("X-Signature", signature);
        return execution.execute(request, body);
    }
}
