package com.example.syncconnector.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * 署名付き RestTemplate の設定プロパティクラス。
 *
 * <p>application.yml や application.properties で以下の形式で定義：</p>
 * <pre>
 * sync:
 *   signed-rest:
 *     secret-key: your-secret-key
 *     signature-header: X-Signature
 * </pre>
 */
@Data
@Validated
@ConfigurationProperties(prefix = "sync.signed-rest")
public class SignedRestTemplateProperties {

    @NotBlank(message = "sync.signed-rest.secretKey must not be blank")
    private String secretKey;

    private String signatureHeader = "X-Signature";
}
