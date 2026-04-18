package com.example.syncconnector.interceptor;

import com.example.syncconnector.signature.HmacSigner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.mock.http.client.MockClientHttpRequest;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class SyncSignatureRequestInterceptorTest {

    private HmacSigner signer;
    private SyncSignatureRequestInterceptor interceptor;

    @BeforeEach
    void setUp() {
        signer = mock(HmacSigner.class);
        interceptor = new SyncSignatureRequestInterceptor(signer);
    }

    @Test
    void intercept_shouldAddSignatureHeader() throws IOException {
        // Arrange
        String expectedSignature = "signed-abc123";
        String payload = "{\"foo\":\"bar\"}";
        when(signer.sign(payload)).thenReturn(expectedSignature);

        // Spring提供のモックリクエスト（自前実装不要）
        MockClientHttpRequest mockRequest =
                new MockClientHttpRequest(HttpMethod.POST, URI.create("http://localhost/test"));
        HttpRequest request = mockRequest;

        byte[] body = payload.getBytes(StandardCharsets.UTF_8);

        ClientHttpRequestExecution execution = mock(ClientHttpRequestExecution.class);
        when(execution.execute(any(HttpRequest.class), any(byte[].class)))
                .thenReturn(mock(ClientHttpResponse.class));

        // Act
        interceptor.intercept(request, body, execution);

        // Assert
        assertEquals(expectedSignature, request.getHeaders().getFirst("X-Signature"));
    }
}
