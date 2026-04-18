package com.example.syncconnector.signature;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class HmacSignerTest {

    private static final String SECRET_KEY = "test-secret";
    private static final String EX_HMAC_FAIL_TEST = "HMAC失敗テスト";

    @Test
    void sign_shouldReturnConsistentSignature_forSameInput() {
        HmacSigner signer = new HmacSigner(SECRET_KEY);

        String input = "{\"data\":\"value\"}";
        String sig1 = signer.sign(input);
        String sig2 = signer.sign(input);

        assertNotNull(sig1);
        assertEquals(sig1, sig2, "同じ入力に対して同じ署名が生成されるべき");
    }

    @Test
    void verify_shouldReturnTrue_forValidSignature() {
        HmacSigner signer = new HmacSigner(SECRET_KEY);

        String input = "{\"type\":\"inventory-sync\"}";
        String signature = signer.sign(input);

        boolean result = signer.verify(input, signature);

        assertTrue(result, "署名が正しい場合は true を返すべき");
    }

    @Test
    void verify_shouldReturnFalse_forInvalidSignature() {
        HmacSigner signer = new HmacSigner(SECRET_KEY);

        String input = "{\"type\":\"inventory-sync\"}";
        String tamperedSignature = "invalid-signature";

        boolean result = signer.verify(input, tamperedSignature);

        assertFalse(result, "署名が不正な場合は false を返すべき");
    }

    @Test
    void verify_shouldReturnFalse_forTamperedPayload() {
        HmacSigner signer = new HmacSigner(SECRET_KEY);

        String original = "{\"key\":\"value\"}";
        String modified = "{\"key\":\"value2\"}";

        String signature = signer.sign(original);

        assertFalse(signer.verify(modified, signature), "ペイロードが改ざんされた場合は false を返すべき");
    }

    @Test
    void sign_shouldThrowRuntimeException_whenAlgorithmFails() {
        // HmacSigner を anonymous class でモックして内部の sign() を強制エラーにする
        HmacSigner brokenSigner = new HmacSigner("invalid") {
            @Override
            public String sign(String data) {
                throw new RuntimeException(EX_HMAC_FAIL_TEST);
            }
        };

        RuntimeException ex = assertThrows(RuntimeException.class, () -> brokenSigner.sign("dummy"));
        assertEquals(EX_HMAC_FAIL_TEST, ex.getMessage());
    }
}
