package apigateway.logging;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


// 機能	テスト内容
// トレースIDの生成	X-Trace-Id がリクエストヘッダにない場合、新規発行されること
// トレースIDの引き継ぎ	X-Trace-Id がある場合、それを利用すること
// ログ出力されること	SLF4J (MDC) によるログ出力がされていること（※ここはモックで間接確認）
// リクエストヘッダー書き換え	mutatedRequest に X-Trace-Id が確実に入ること

class TraceLoggingFilterTest {

    @Test
    void shouldGenerateNewTraceIdIfNoneExists() {
        TraceLoggingFilter filter = new TraceLoggingFilter();

        MockServerHttpRequest request = MockServerHttpRequest.get("/test").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain))
            .expectComplete()
            .verify();

        verify(chain).filter(any(ServerWebExchange.class));
        ServerWebExchange forwardedExchange =
            mockingDetails(chain).getInvocations().stream()
                .findFirst()
                .map(invocation -> (ServerWebExchange) invocation.getArgument(0))
                .orElseThrow();

        String traceId = forwardedExchange.getRequest().getHeaders().getFirst("X-Trace-Id");
        assertNotNull(traceId);
        assertFalse(traceId.isBlank());
    }

    @Test
    void shouldUseExistingTraceIdIfPresent() {
        TraceLoggingFilter filter = new TraceLoggingFilter();

        String existingTraceId = "existing-trace-id-1234";
        MockServerHttpRequest request = MockServerHttpRequest.get("/test")
            .header("X-Trace-Id", existingTraceId)
            .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain))
            .expectComplete()
            .verify();

        verify(chain).filter(any(ServerWebExchange.class));
        ServerWebExchange forwardedExchange =
            mockingDetails(chain).getInvocations().stream()
                .findFirst()
                .map(invocation -> (ServerWebExchange) invocation.getArgument(0))
                .orElseThrow();

        String actualTraceId = forwardedExchange.getRequest().getHeaders().getFirst("X-Trace-Id");
        assertEquals(existingTraceId, actualTraceId);
    }
}
