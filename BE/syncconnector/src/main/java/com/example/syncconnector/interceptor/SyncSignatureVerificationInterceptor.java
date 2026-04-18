package com.example.syncconnector.interceptor;

import com.example.servercommon.exception.SignatureVerificationException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.syncconnector.signature.HmacSigner;
import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.ContentCachingRequestWrapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RequiredArgsConstructor
/**
 * サーバー受信時に HMAC署名を検証する Spring MVC インターセプタ。
 *
 * <p>{@code X-Signature} ヘッダに付与された署名と、ボディから生成した署名を比較して検証します。
 * {@link jakarta.servlet.Filter} にて {@link ContentCachingRequestWrapper} が適用されている必要があります。</p>
 *
 * <p>対象パスは設定クラス {@link com.example.syncconnector.config.SyncSignatureVerificationConfig}
 * から注入されたリストとマッチングされます。</p>
 */
public class SyncSignatureVerificationInterceptor implements HandlerInterceptor {

    private final HmacSigner signer;
    private final List<String> targetPaths;
    private final String signatureHeader;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();

        // 対象パスでなければスキップ
        if (targetPaths.stream().noneMatch(path::startsWith)) {
            return true;
        }

        // 署名ヘッダー取得
        String providedSignature = request.getHeader(signatureHeader);
        if (providedSignature == null || providedSignature.isBlank()) {
            throw new SignatureVerificationException(
                    BackendMessageCatalog.CODE_E4011,
                    BackendMessageCatalog.format(BackendMessageCatalog.EX_SYNC_MISSING_SIGNATURE_HEADER, signatureHeader));
        }

        // ContentCachingRequestWrapper を Filter で適用している前提
        if (!(request instanceof ContentCachingRequestWrapper)) {
            throw new IllegalStateException(BackendMessageCatalog.EX_SYNC_CONTENT_CACHING_WRAPPER_REQUIRED);
        }

        // リクエストボディ取得（キャッシュから）
        ContentCachingRequestWrapper wrapper = (ContentCachingRequestWrapper) request;
        String body = new String(wrapper.getContentAsByteArray(), StandardCharsets.UTF_8);

        // 署名検証
        if (!signer.verify(body, providedSignature)) {
            throw new SignatureVerificationException(BackendMessageCatalog.CODE_E4012, BackendMessageCatalog.EX_SYNC_INVALID_SIGNATURE);
        }

        return true;
    }
}
