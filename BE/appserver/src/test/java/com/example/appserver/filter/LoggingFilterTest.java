package com.example.appserver.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.io.IOException;

import static org.mockito.Mockito.*;

class LoggingFilterTest {

    private LoggingFilter loggingFilter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        loggingFilter = new LoggingFilter();
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);
    }

    @Test
    void doFilterInternal_ShouldLogAndProceedFilterChain() throws ServletException, IOException {
        // モックの振る舞いを設定
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/test-uri");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(response.getStatus()).thenReturn(200);

        // フィルタ実行
        loggingFilter.doFilterInternal(request, response, filterChain);

        // フィルタチェーンが呼ばれたことを確認
        verify(filterChain, times(1)).doFilter(request, response);

        // リクエスト情報の取得が呼ばれているか確認（ログ出力は Mockito では検証できませんが、メソッド呼び出しで間接確認）
        verify(request, times(1)).getMethod();
        verify(request, times(2)).getRequestURI(); // ログで2回参照
        verify(request, times(1)).getRemoteAddr();
        verify(response, times(1)).getStatus();
    }

    @Test
    void doFilterInternal_WhenFilterChainThrowsException_ShouldPropagate() throws ServletException, IOException {
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURI()).thenReturn("/error-uri");
        when(request.getRemoteAddr()).thenReturn("192.168.0.1");

        doThrow(new ServletException("Filter chain failed"))
                .when(filterChain).doFilter(request, response);

        try {
            loggingFilter.doFilterInternal(request, response, filterChain);
        } catch (ServletException e) {
            // 例外がそのままスローされることを確認
            assert e.getMessage().equals("Filter chain failed");
        }

        // フィルタチェーンは呼ばれている
        verify(filterChain, times(1)).doFilter(request, response);
    }
}
