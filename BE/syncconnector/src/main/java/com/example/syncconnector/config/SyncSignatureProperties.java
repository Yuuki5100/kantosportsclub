package com.example.syncconnector.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * 受信リクエストの HMAC署名検証用プロパティ定義。
 *
 * <p>application.yml などで以下のように定義：</p>
 * <pre>
 * sync:
 *   signature:
 *     enabled: true
 *     secret: your-secret
 *     target-paths:
 *       - /api/secure-endpoint
 *     signature-header: X-Signature
 * </pre>
 *
 * <p>この設定は {@link com.example.syncconnector.config.SyncSignatureVerificationConfig} により利用されます。</p>
 */
@Data
@Validated
@ConfigurationProperties(prefix = "sync.signature")
public class SyncSignatureProperties {

    private boolean enabled = true;

    private String secret;

    /**
     * 後方互換用（旧キー: sync.signature.secretKey）。
     */
    private String secretKey;

    /**
     * 署名検証対象となる API パス（完全一致）
     */
    private List<String> targetPaths;

    /**
     * ヘッダー名（デフォルトは X-Signature）
     */
    private String signatureHeader = "X-Signature";

    public String resolveSecret() {
        if (secret != null && !secret.isBlank()) {
            return secret;
        }
        return secretKey;
    }
}
