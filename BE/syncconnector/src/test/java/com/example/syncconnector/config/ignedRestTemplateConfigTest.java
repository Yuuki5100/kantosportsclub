package com.example.syncconnector.config;

import com.example.syncconnector.http.SignedRestTemplate;
import com.example.syncconnector.signature.HmacSigner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SignedRestTemplateConfigTest {

    private SignedRestTemplateProperties props;
    private SignedRestTemplateConfig config;

    @BeforeEach
    void setUp() {
        props = new SignedRestTemplateProperties();
        props.setSecretKey("test-secret");
        props.setSignatureHeader("X-Test-Signature");

        config = new SignedRestTemplateConfig(props);
    }

    @Test
    void signedRestTemplate_shouldBeCreatedWithGivenProperties() {
        SignedRestTemplate restTemplate = config.signedRestTemplate();

        assertNotNull(restTemplate);
        assertEquals("X-Test-Signature", restTemplate.getSignatureHeader());

        // signerの検証まではこのクラスから直接アクセス不可（blackbox）
        // したがって、プロパティから構成された結果だけを確認する
    }
}
