package apigateway.security;

import apigateway.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.RequestPath;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JwtOrSessionAuthFilterTest {

    private JwtOrSessionAuthFilter filter;
    private GatewayFilterChain chain;
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = mock(JwtTokenProvider.class);

        List<String> publicPaths = List.of("/login", "/logout", "/public", "/actuator", "/health");
        filter = new JwtOrSessionAuthFilter(publicPaths, jwtTokenProvider);

        chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());
    }


    @Test
    @DisplayName("Public path に対して認証なしでアクセス可能であること")
    void shouldAllowAccessToPublicPathsWithoutAuth() {
        List<String> publicPaths = List.of("/login", "/logout", "/public", "/actuator", "/health");

        for (String path : publicPaths) {
            ServerHttpRequest request = mock(ServerHttpRequest.class);
            when(request.getPath()).thenReturn(RequestPath.parse(path, path));
            when(request.getMethod()).thenReturn(null);
            when(request.getHeaders()).thenReturn(new HttpHeaders());
            when(request.getCookies()).thenReturn(new LinkedMultiValueMap<>()); // ← null回避

            ServerWebExchange exchange = mock(ServerWebExchange.class);
            when(exchange.getRequest()).thenReturn(request);

            assertDoesNotThrow(
                () -> filter.filter(exchange, chain).block(),
                "Expected no exception for public path: " + path
            );
        }
    }

    @Test
    void shouldAllowWithValidJwt() {
        String token = "valid.jwt.token";
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);

        ServerHttpRequest request = mock(ServerHttpRequest.class);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        when(request.getHeaders()).thenReturn(headers);
        when(request.getPath()).thenReturn(RequestPath.parse("/secure", "/secure"));
        when(request.getMethod()).thenReturn(null);
        when(request.getCookies()).thenReturn(new LinkedMultiValueMap<>());

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);

        assertDoesNotThrow(() -> filter.filter(exchange, chain).block());
    }

    @Test
    void shouldRejectWithInvalidJwt() {
        String token = "invalid.jwt.token";
        when(jwtTokenProvider.validateToken(token)).thenReturn(false);

        ServerHttpRequest request = mock(ServerHttpRequest.class);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        when(request.getHeaders()).thenReturn(headers);
        when(request.getPath()).thenReturn(RequestPath.parse("/secure", "/secure"));
        when(request.getMethod()).thenReturn(null);
        when(request.getCookies()).thenReturn(new LinkedMultiValueMap<>());

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
            () -> filter.filter(exchange, chain).block());
        assertTrue(ex.getMessage().contains("Invalid JWT token"));
    }

    @Test
    void shouldAllowWithValidSession() {
        HttpCookie sessionCookie = mock(HttpCookie.class);
        when(sessionCookie.getValue()).thenReturn("sessionid123");

        ServerHttpRequest request = mock(ServerHttpRequest.class);
        when(request.getCookies()).thenReturn(
            new LinkedMultiValueMap<>(Map.of("JSESSIONID", List.of(sessionCookie)))
        );
        when(request.getHeaders()).thenReturn(new HttpHeaders());
        when(request.getPath()).thenReturn(RequestPath.parse("/secure", "/secure"));
        when(request.getMethod()).thenReturn(null);

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);

        assertDoesNotThrow(() -> filter.filter(exchange, chain).block());
    }

    @Test
    void shouldRejectWhenNoJwtOrSession() {
        ServerHttpRequest request = mock(ServerHttpRequest.class);
        when(request.getCookies()).thenReturn(new LinkedMultiValueMap<>());
        when(request.getHeaders()).thenReturn(new HttpHeaders());

        RequestPath mockPath = mock(RequestPath.class);
        when(mockPath.toString()).thenReturn("/secure");
        when(request.getPath()).thenReturn(mockPath);
        when(request.getMethod()).thenReturn(null);
        when(request.getRemoteAddress()).thenReturn(new InetSocketAddress("10.0.0.1", 12345));

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
            () -> filter.filter(exchange, chain).block());
        assertTrue(ex.getMessage().contains("Missing token or session"));
    }
}
