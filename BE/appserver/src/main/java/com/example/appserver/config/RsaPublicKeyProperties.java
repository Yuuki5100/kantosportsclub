package com.example.appserver.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "security.rsa-public-key")
public class RsaPublicKeyProperties {
    /**
     * Base64エンコードされたモジュラス(n)
     */
    private String modulusBase64;

    /**
     * Base64エンコードされた指数(e)
     */
    private String exponentBase64 = "AQAB"; // 省略時は65537
}
