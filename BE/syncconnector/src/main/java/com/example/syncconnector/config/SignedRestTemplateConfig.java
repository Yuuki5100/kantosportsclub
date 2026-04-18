package com.example.syncconnector.config;

import com.example.syncconnector.config.SignedRestTemplateProperties;
import com.example.syncconnector.http.SignedRestTemplate;
import com.example.syncconnector.signature.HmacSigner;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * HMAC署名付きの {@link com.example.syncconnector.http.SignedRestTemplate} を提供する設定クラス。
 *
 * <p>プロパティ {@code sync.signed-rest.*} をもとに、署名キーとヘッダー名を使用して RestTemplate をラップします。</p>
 */
@Configuration
@EnableConfigurationProperties(SignedRestTemplateProperties.class)
@RequiredArgsConstructor
public class SignedRestTemplateConfig {

    private final SignedRestTemplateProperties props;

    /**
     * HMAC署名付き RestTemplate Bean を生成。
     *
     * @return 署名付きの SignedRestTemplate
     */
    @Bean
    public SignedRestTemplate signedRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        HmacSigner signer = new HmacSigner(props.getSecretKey());
        return new SignedRestTemplate(restTemplate, signer, props.getSignatureHeader());
    }
}
