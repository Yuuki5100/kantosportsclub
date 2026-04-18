package com.example.appserver.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class LoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);

    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // リクエスト開始時のログ
        logger.info("Incoming Request: {} {} from {}",
            request.getMethod(), request.getRequestURI(), request.getRemoteAddr());

        // フィルタチェーンを実行
        filterChain.doFilter(request, response);

        // レスポンス完了後のログ
        logger.info("Outgoing Response: {} for {}",
            response.getStatus(), request.getRequestURI());
    }
}
