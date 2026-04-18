package apigateway.security;

import apigateway.config.PublicPathProperties;
import apigateway.exception.UnauthorizedException;
import com.example.servercommon.message.BackendMessageCatalog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class JwtOrSessionAuthFilter implements GlobalFilter, Ordered {

    private final List<String> publicPaths;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public JwtOrSessionAuthFilter(PublicPathProperties publicPathProperties, JwtTokenProvider jwtTokenProvider) {
        this.publicPaths = publicPathProperties.getPublicPaths() != null
                ? publicPathProperties.getPublicPaths()
                : Collections.emptyList();
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // For tests or manual construction
    JwtOrSessionAuthFilter(List<String> publicPaths, JwtTokenProvider jwtTokenProvider) {
        this.publicPaths = publicPaths != null ? publicPaths : Collections.emptyList();
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();
        String method = request.getMethod() != null ? request.getMethod().name() : "UNKNOWN";
        String origin = request.getHeaders().getFirst("Origin");

        String ip = request.getHeaders().getFirst("X-Forwarded-For");
        if (ip == null && request.getRemoteAddress() != null) {
            ip = request.getRemoteAddress().getAddress().getHostAddress();
        }

        if ("OPTIONS".equalsIgnoreCase(method)) {
            log.debug(BackendMessageCatalog.LOG_GATEWAY_JWT_BYPASS_OPTIONS, method, path, origin, ip);
            return chain.filter(exchange);
        }

        if (path.equals("/api") || path.startsWith("/api/")) {
            log.debug(BackendMessageCatalog.LOG_GATEWAY_JWT_BYPASS_API, method, path, origin, ip);
            return chain.filter(exchange);
        }

        if (isPublicPath(path)) {
            log.debug(BackendMessageCatalog.LOG_GATEWAY_JWT_BYPASS_PUBLIC, method, path, origin, ip);
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                log.warn(BackendMessageCatalog.LOG_GATEWAY_JWT_INVALID_BEARER, method, path, origin,
                        ip);
                throw new UnauthorizedException(BackendMessageCatalog.EX_GATEWAY_INVALID_JWT_TOKEN);
            }
            log.debug(BackendMessageCatalog.LOG_GATEWAY_JWT_ACCEPTED_BEARER, method, path, origin, ip);
            return chain.filter(exchange);
        }

        MultiValueMap<String, HttpCookie> cookies = request.getCookies();
        HttpCookie jsessionId = cookies != null ? cookies.getFirst("JSESSIONID") : null;
        if (jsessionId != null && !jsessionId.getValue().isEmpty()) {
            log.debug(BackendMessageCatalog.LOG_GATEWAY_JWT_ACCEPTED_SESSION, method, path, origin, ip);
            return chain.filter(exchange);
        }

        log.warn(BackendMessageCatalog.LOG_GATEWAY_JWT_REJECTED_MISSING, method, path,
                origin, ip);
        throw new UnauthorizedException(BackendMessageCatalog.EX_GATEWAY_MISSING_TOKEN_OR_SESSION);
    }

    private boolean isPublicPath(String path) {
        return publicPaths.stream().anyMatch(path::startsWith);
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
