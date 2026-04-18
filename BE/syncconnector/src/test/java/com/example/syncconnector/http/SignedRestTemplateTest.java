package com.example.syncconnector.http;

import com.example.servercommon.responseModel.ApiResponse;
import com.example.syncconnector.signature.HmacSigner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class SignedRestTemplateTest {

    private RestTemplate restTemplate;
    private HmacSigner signer;
    private SignedRestTemplate signedRestTemplate;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        signer = mock(HmacSigner.class);
        signedRestTemplate = new SignedRestTemplate(restTemplate, signer, "X-Signature");
    }

    @Test
    void post_shouldReturnApiResponse_whenSignatureValid() {
        String url = "http://localhost/api/test";
        TestRequest request = new TestRequest("hello");
        String jsonBody = "{\"message\":\"hello\"}";
        String signature = "abc123";

        // モック定義
        when(signer.sign(jsonBody)).thenReturn(signature);

        ApiResponse<TestResponse> apiResponse = new ApiResponse<>();
        apiResponse.setData(new TestResponse("ok"));
        ResponseEntity<ApiResponse<TestResponse>> responseEntity = ResponseEntity.ok(apiResponse);

        when(restTemplate.exchange(
                eq(url),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                ArgumentMatchers.<ParameterizedTypeReference<ApiResponse<TestResponse>>>any()))
                .thenReturn(responseEntity);

        // 実行
        ApiResponse<TestResponse> result = signedRestTemplate.post(url, request, TestResponse.class);

        // 検証
        assertNotNull(result);
        assertEquals("ok", result.getData().message());
    }

    @Test
    void post_shouldUseCustomHeaderName() {
        String url = "http://localhost/api/test";
        TestRequest request = new TestRequest("check header");
        String jsonBody = "{\"message\":\"check header\"}";
        String signature = "custom-sig";

        when(signer.sign(jsonBody)).thenReturn(signature);

        ApiResponse<TestResponse> apiResponse = new ApiResponse<>();
        apiResponse.setData(new TestResponse("received"));

        ArgumentCaptor<HttpEntity<?>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        when(restTemplate.exchange(
                eq(url),
                eq(HttpMethod.POST),
                captor.capture(),
                any(ParameterizedTypeReference.class))).thenReturn(ResponseEntity.ok(apiResponse));

        signedRestTemplate = new SignedRestTemplate(restTemplate, signer, "X-Custom-Signature");

        ApiResponse<TestResponse> result = signedRestTemplate.post(url, request, TestResponse.class);

        assertEquals("received", result.getData().message());
        HttpHeaders headers = captor.getValue().getHeaders();
        assertEquals(signature, headers.getFirst("X-Custom-Signature"));
    }

    @Test
    void post_shouldSignEmptyBodyRequest() {
        String url = "http://localhost/api/test";
        String signature = "empty-body-signature";

        // body: null → toJson: "null"
        when(signer.sign("null")).thenReturn(signature);

        ApiResponse<TestResponse> apiResponse = new ApiResponse<>();
        apiResponse.setData(new TestResponse("empty"));

        ArgumentCaptor<HttpEntity<?>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        when(restTemplate.exchange(
                eq(url),
                eq(HttpMethod.POST),
                captor.capture(),
                any(ParameterizedTypeReference.class))).thenReturn(ResponseEntity.ok(apiResponse));

        ApiResponse<TestResponse> result = signedRestTemplate.post(url, null, TestResponse.class);

        assertEquals("empty", result.getData().message());
        HttpHeaders headers = captor.getValue().getHeaders();
        assertEquals(signature, headers.getFirst("X-Signature"));
    }

    @Test
    void post_shouldThrowException_onServerError() {
        String url = "http://localhost/api/error";
        TestRequest request = new TestRequest("error");
        String jsonBody = "{\"message\":\"error\"}";
        String signature = "sig-error";

        when(signer.sign(jsonBody)).thenReturn(signature);
        when(restTemplate.exchange(
                eq(url),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                any(ParameterizedTypeReference.class))).thenThrow(new RuntimeException("Internal Server Error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            signedRestTemplate.post(url, request, TestResponse.class);
        });

        assertEquals("Internal Server Error", ex.getMessage());
    }

    @Test
    void post_shouldFail_ifSignerThrowsException() {
        String url = "http://localhost/api/fail";
        TestRequest request = new TestRequest("fail");

        when(signer.sign(anyString())).thenThrow(new IllegalStateException("Signature failed"));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            signedRestTemplate.post(url, request, TestResponse.class);
        });

        assertEquals("Signature failed", ex.getMessage());
    }

    // テスト用リクエスト/レスポンス
    record TestRequest(String message) {
    }

    record TestResponse(String message) {
    }

    private <T> ResponseEntity<ApiResponse<T>> mockApiResponse(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setData(data);
        return ResponseEntity.ok(response);
    }

}
