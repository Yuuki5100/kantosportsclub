package apigateway.config;

import apigateway.security.IpWhitelistFilter;
import apigateway.security.JwtOrSessionAuthFilter;
import apigateway.security.JwtTokenProvider;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@TestConfiguration
public class DummySecurityBypassFilterConfig {

    @Bean
    @Primary
    public JwtOrSessionAuthFilter jwtOrSessionAuthFilter() {
        List<String> dummyPublicPaths = List.of("/login", "/logout", "/actuator", "/health");
        PublicPathProperties publicPathProperties = new PublicPathProperties();
        publicPathProperties.setPublicPaths(dummyPublicPaths);
        return new JwtOrSessionAuthFilter(publicPathProperties, new JwtTokenProvider()) {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                return chain.filter(exchange); // 認証バイパス
            }
        };
    }

    @Bean
    @Primary
    public IpWhitelistFilter ipWhitelistFilter() {
        return new IpWhitelistFilter(List.of("127.0.0.1")) {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                return chain.filter(exchange); // IPバイパス
            }
        };
    }
}
