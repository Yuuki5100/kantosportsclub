package com.example.syncconnector.signature;

import com.example.servercommon.message.BackendMessageCatalog;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
/**
 * HMAC-SHA256 を用いた署名の生成・検証を行うユーティリティ。
 *
 * <p>JSON文字列などを対象に Base64 エンコードされた署名を生成し、
 * 署名検証（verify）をサポートします。</p>
 *
 * <p>主にクライアント送信・サーバー検証の両側で使用されます。</p>
 */
public class HmacSigner {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final String secretKey;

    public HmacSigner(String secretKey) {
        this.secretKey = secretKey;
    }

    /**
     * 署名を生成する
     *
     * @param data 対象データ（例：JSON文字列）
     * @return Base64エンコードされたHMAC署名
     */
    public String sign(String data) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.EX_HMAC_SIGNATURE_GENERATION_FAILED, e);
        }
    }

    /**
     * 署名が一致するかどうかを検証する
     *
     * @param data         検証対象データ（署名対象文字列と同一）
     * @param providedSign リクエストに付与された署名（Base64）
     * @return 一致すれば true
     */
    public boolean verify(String data, String providedSign) {
        String expectedSign = sign(data);
        return constantTimeEquals(expectedSign, providedSign);
    }

    /**
     * タイミング攻撃対策用の比較
     */
    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
