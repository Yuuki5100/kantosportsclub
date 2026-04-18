package com.example.appserver.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RequestInterceptorTest {

    private RequestInterceptor interceptor;
    private HttpServletRequest request;
    private HttpServletResponse response;

    @BeforeEach
    void setUp() {
        interceptor = new RequestInterceptor();
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
    }

    @Test
    void preHandle_ShouldReturnTrue() throws Exception {
        // モックリクエストのメソッドとURIを設定（任意）
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/test/uri");

        boolean result = interceptor.preHandle(request, response, new Object());

        assertTrue(result, "preHandle should always return true");
    }
}
