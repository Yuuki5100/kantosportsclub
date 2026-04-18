package apigateway.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cloud.gateway.filter.ratelimit.RateLimiter;
import org.springframework.cloud.gateway.filter.ratelimit.RateLimiter.Response;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.Map;

@TestConfiguration
public class DummyRateLimiterConfig {

    @Bean
    @Primary
    public RateLimiter<Object> dummyRateLimiter() {
        return new RateLimiter<>() {
            @Override
            public Mono<Response> isAllowed(String routeId, String id) {
                return Mono.just(new Response(true, Map.of("X-RateLimit-Remaining", "9999")));
            }

            // v4系では getConfig の戻り値は Map<String, T> になっている
            @Override
            public Map<String, Object> getConfig() {
                return Collections.emptyMap(); // 空の設定でOK
            }

            @Override
            public Class<Object> getConfigClass() {
                return Object.class;
            }

            @Override
            public Object newConfig() {
                return new Object();
            }
        };
    }
}
