package apigateway.security;

import apigateway.exception.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


//1 X-Forwarded-For ヘッダーがホワイトリスト内 → 通過

//2 リモートIPアドレスがホワイトリスト内 → 通過

//3 IPがホワイトリスト外 → ForbiddenException

//4 IPが取得できない場合（null）→ ForbiddenException

class IpWhitelistFilterTest {
    private IpWhitelistFilter filter;

    @BeforeEach
    void setUp() {
        filter = new IpWhitelistFilter(List.of("127.0.0.1", "192.168.0.1"));
    }

    @Test
    void shouldAllowRequestWhenIpInHeaderIsWhitelisted() {
        ServerHttpRequest request = mock(ServerHttpRequest.class);
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Forwarded-For", "127.0.0.1");

        when(request.getHeaders()).thenReturn(headers);
        when(request.getPath()).thenReturn(mock(org.springframework.http.server.RequestPath.class));
        when(request.getPath().toString()).thenReturn("/test");

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);

        assertDoesNotThrow(() -> filter.filter(exchange, exchange1 -> Mono.empty()).block());
    }

    @Test
    void shouldRejectRequestWhenIpNotWhitelisted() {
        ServerHttpRequest request = mock(ServerHttpRequest.class);
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Forwarded-For", "8.8.8.8");

        when(request.getHeaders()).thenReturn(headers);
        when(request.getPath()).thenReturn(mock(org.springframework.http.server.RequestPath.class));
        when(request.getPath().toString()).thenReturn("/test");

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);

        assertThrows(ForbiddenException.class, () -> filter.filter(exchange, exchange1 -> Mono.empty()).block());
    }

    @Test
    void shouldAllowRequestWhenIpInRemoteAddressIsWhitelisted() throws Exception {
        ServerHttpRequest request = mock(ServerHttpRequest.class);
        InetAddress address = InetAddress.getByName("192.168.0.1");

        when(request.getHeaders()).thenReturn(new HttpHeaders());
        when(request.getRemoteAddress()).thenReturn(new InetSocketAddress(address, 8080));
        when(request.getPath()).thenReturn(mock(org.springframework.http.server.RequestPath.class));
        when(request.getPath().toString()).thenReturn("/test");

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);

        assertDoesNotThrow(() -> filter.filter(exchange, exchange1 -> Mono.empty()).block());
    }

    @Test
    void shouldRejectRequestWhenIpIsNull() {
        ServerHttpRequest request = mock(ServerHttpRequest.class);

        when(request.getHeaders()).thenReturn(new HttpHeaders());
        when(request.getRemoteAddress()).thenReturn(null);
        when(request.getPath()).thenReturn(mock(org.springframework.http.server.RequestPath.class));
        when(request.getPath().toString()).thenReturn("/test");

        ServerWebExchange exchange = mock(ServerWebExchange.class);
        when(exchange.getRequest()).thenReturn(request);

        assertThrows(ForbiddenException.class, () -> filter.filter(exchange, exchange1 -> Mono.empty()).block());
    }
}
