package apigateway.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

public class TraceLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger accessLogger = LoggerFactory.getLogger("ACCESS");
    private static final String TRACE_ID_HEADER = "X-Trace-Id";
    private static final String MDC_TRACE_ID_KEY = "traceId";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        final String traceId = getOrCreateTraceId(request);

        MDC.put(MDC_TRACE_ID_KEY, traceId);

        ServerHttpRequest mutatedRequest = request.mutate()
            .header(TRACE_ID_HEADER, traceId)
            .build();

        ServerWebExchange mutatedExchange = exchange.mutate()
            .request(mutatedRequest)
            .build();

        final long start = System.currentTimeMillis();

        return chain.filter(mutatedExchange)
            .doFinally(signalType -> {
                long elapsed = System.currentTimeMillis() - start;
                String method = request.getMethod().name(); // ★これに変更
                String path = request.getURI().getPath();
                String ip = request.getHeaders().getFirst("X-Forwarded-For");
                if (ip == null && request.getRemoteAddress() != null) {
                    ip = request.getRemoteAddress().getAddress().getHostAddress();
                }

                accessLogger.info("[{}] {} {} from {} elapsed={}ms",
                        traceId, method, path, ip, elapsed);

                MDC.clear();
            });
    }

    private String getOrCreateTraceId(ServerHttpRequest request) {
        String traceId = request.getHeaders().getFirst(TRACE_ID_HEADER);
        return (traceId != null && !traceId.isBlank())
                ? traceId
                : UUID.randomUUID().toString();
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
