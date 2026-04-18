package apigateway.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import reactor.core.publisher.Mono;

@TestConfiguration
public class RateLimiterBypassConfig {

    @Primary
    @Bean(name = "RequestRateLimiter") // ★重要：この名前で上書きする
    public GlobalFilter dummyRateLimiter() {
        return (exchange, chain) -> {
            // スルーするだけのダミーフィルター
            return chain.filter(exchange);
        };
    }
}
