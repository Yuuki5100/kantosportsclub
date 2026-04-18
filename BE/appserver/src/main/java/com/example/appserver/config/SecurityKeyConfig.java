package com.example.appserver.config;

import com.example.servercommon.message.BackendMessageCatalog;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;

@Configuration
public class SecurityKeyConfig {

    private final RsaPublicKeyProperties props;

    public SecurityKeyConfig(RsaPublicKeyProperties props) {
        this.props = props;
    }

    @Bean
    public RSAPublicKey rsaPublicKey() throws Exception {
        String nBase64 = props.getModulusBase64();
        String eBase64 = props.getExponentBase64();

        if (nBase64 == null || nBase64.isBlank()) {
            throw new IllegalStateException(BackendMessageCatalog.EX_SECURITY_RSA_MODULUS_REQUIRED);
        }
        if (eBase64 == null || eBase64.isBlank()) {
            throw new IllegalStateException(BackendMessageCatalog.EX_SECURITY_RSA_EXPONENT_REQUIRED);
        }

        byte[] modulusBytes = Base64.getDecoder().decode(nBase64);
        byte[] exponentBytes = Base64.getDecoder().decode(eBase64);

        BigInteger modulus = new BigInteger(1, modulusBytes);
        BigInteger exponent = new BigInteger(1, exponentBytes);

        RSAPublicKeySpec keySpec = new RSAPublicKeySpec(modulus, exponent);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return (RSAPublicKey) keyFactory.generatePublic(keySpec);
    }
}
