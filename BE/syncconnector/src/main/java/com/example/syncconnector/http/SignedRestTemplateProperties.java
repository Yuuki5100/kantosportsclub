package com.example.syncconnector.http;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * {@link com.example.syncconnector.http.SignedRestTemplate} 向けの設定プロパティ。
 *
 * <p>HMAC 署名付きリクエストの送信に使用する秘密鍵と、リクエストヘッダー名を定義します。</p>
 *
 * <p>主に以下のように `application.yml` 等に設定します：</p>
 *
 * <pre>{@code
 * sync:
 *   signature:
 *     secret-key: your-secret-key
 *     signature-header: X-Signature
 * }</pre>
 *
 * <p>署名ヘッダーは省略時にデフォルトで "X-Signature" が使用されます。</p>
 */
@Data
@ConfigurationProperties(prefix = "sync.signature")
public class SignedRestTemplateProperties {
    /** HMAC署名に使用する秘密鍵。必須。 */
    private String secretKey;

    /** リクエスト送信時に使用する署名ヘッダー名（例: X-Signature）。省略時はデフォルト値を使用。 */
    private String signatureHeader = "X-Signature";
}
