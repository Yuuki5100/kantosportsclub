package com.example.syncconnector.config;

import com.example.syncconnector.signature.HmacSigner;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@RequiredArgsConstructor
public class SyncConnectorBeansConfig {

    private final SyncSignatureProperties signatureProperties;

    @Bean
    public HmacSigner hmacSigner() {
        return new HmacSigner(signatureProperties.resolveSecret());
    }

    @Bean
    @ConditionalOnMissingBean(RestTemplate.class)
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
