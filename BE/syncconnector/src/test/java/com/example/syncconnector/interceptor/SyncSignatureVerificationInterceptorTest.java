package com.example.syncconnector.interceptor;

import com.example.servercommon.exception.SignatureVerificationException;
import com.example.syncconnector.signature.HmacSigner;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SyncSignatureVerificationInterceptorTest {

    private static final String SIGNATURE_HEADER = "X-Signature";

    private HmacSigner signer;
    private SyncSignatureVerificationInterceptor interceptor;

    @BeforeEach
    void setUp() {
        signer = mock(HmacSigner.class);
        interceptor = new SyncSignatureVerificationInterceptor(signer, List.of("/api/secure"), SIGNATURE_HEADER);
    }

    @Test
    void preHandle_shouldPassVerification_whenSignatureIsValid() throws Exception {
        var body = "{\"name\":\"test\"}";
        var signature = "valid-signature";

        var request = buildCachingRequest("/api/secure/resource", body, signature, SIGNATURE_HEADER);
        var response = new MockHttpServletResponse();

        when(signer.verify(body, signature)).thenReturn(true);

        boolean result = interceptor.preHandle(request, response, new Object());

        assertTrue(result);
    }

    @Test
    void preHandle_shouldSkip_whenPathNotMatched() throws Exception {
        var request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/public/resource");

        var response = new MockHttpServletResponse();

        assertTrue(interceptor.preHandle(request, response, new Object()));
        verify(request, never()).getHeader(SIGNATURE_HEADER);
    }

    @Test
    void preHandle_shouldThrow_whenSignatureMissing() {
        var body = "{\"id\":1}";
        var request = buildCachingRequest("/api/secure/resource", body, null, SIGNATURE_HEADER);
        var response = new MockHttpServletResponse();

        var ex = assertThrows(SignatureVerificationException.class, () ->
            interceptor.preHandle(request, response, new Object())
        );
        assertEquals("E4011", ex.getCode());
    }

    @Test
    void preHandle_shouldThrow_whenSignatureInvalid() {
        var body = "{\"id\":1}";
        var request = buildCachingRequest("/api/secure/resource", body, "invalid-signature", SIGNATURE_HEADER);
        var response = new MockHttpServletResponse();

        when(signer.verify(body, "invalid-signature")).thenReturn(false);

        var ex = assertThrows(SignatureVerificationException.class, () ->
            interceptor.preHandle(request, response, new Object())
        );
        assertEquals("E4012", ex.getCode());
    }

    @Test
    void preHandle_shouldThrow_whenRequestNotCached() {
        var request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/secure/test");
        when(request.getHeader(SIGNATURE_HEADER)).thenReturn("sig");

        var response = new MockHttpServletResponse();

        var ex = assertThrows(IllegalStateException.class, () ->
            interceptor.preHandle(request, response, new Object())
        );
        assertTrue(ex.getMessage().contains("ContentCachingRequestWrapper"));
    }

    // ヘルパー：ContentCachingRequestWrapper をセットアップ
    private ContentCachingRequestWrapper buildCachingRequest(
        String uri,
        String body,
        String signature,
        String signatureHeader
    ) {
        var request = new org.springframework.mock.web.MockHttpServletRequest();
        request.setRequestURI(uri);
        request.setContentType("application/json");
        request.setContent(body.getBytes(StandardCharsets.UTF_8));
        if (signature != null) {
            request.addHeader(signatureHeader, signature);
        }

        var wrapper = new ContentCachingRequestWrapper(request);
        // キャッシュを初期化するために1回読み取り
        try {
            wrapper.getInputStream().readAllBytes();
        } catch (Exception ignored) {
        }

        return wrapper;
    }
}
