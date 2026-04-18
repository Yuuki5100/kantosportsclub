package apigateway.security;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import apigateway.exception.ForbiddenException;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.util.List;

@Slf4j
@Component
@ConditionalOnMissingBean(IpWhitelistFilter.class)
public class IpWhitelistFilter implements GlobalFilter, Ordered {

    private final List<String> allowedIps;

    public IpWhitelistFilter(List<String> allowedIps) {
        this.allowedIps = allowedIps;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();
        String method = request.getMethod() != null ? request.getMethod().name() : "UNKNOWN";
        String origin = request.getHeaders().getFirst("Origin");
        String xffRaw = request.getHeaders().getFirst("X-Forwarded-For");

        String ip = extractClientIp(request);
        log.debug(BackendMessageCatalog.LOG_GATEWAY_IP_CHECK, method, path,
                origin, ip, xffRaw, allowedIps);

        if (isAllowedIp(ip)) {
            log.info(BackendMessageCatalog.LOG_GATEWAY_IP_ALLOWED, path, ip);
            log.debug(BackendMessageCatalog.LOG_GATEWAY_IP_PASSED, method, path, origin, ip);
            return chain.filter(exchange);
        } else {
            log.warn(BackendMessageCatalog.LOG_GATEWAY_IP_BLOCKED, path, ip);
            log.warn(BackendMessageCatalog.LOG_GATEWAY_IP_DENIED_DETAIL, method, path, origin, ip,
                    allowedIps);
            throw new ForbiddenException(BackendMessageCatalog.format(BackendMessageCatalog.EX_GATEWAY_IP_DENIED, ip));
        }
    }

    private String extractClientIp(ServerHttpRequest request) {
        // X-Forwarded-Forヘッダーがある場合はそこから
        List<String> xff = request.getHeaders().get("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            String firstHeaderValue = xff.get(0);
            if (firstHeaderValue != null) {
                String firstIp = firstHeaderValue.split(",")[0].trim();
                if (!firstIp.isEmpty()) {
                    return firstIp;
                }
            }
        }

        // なければRemoteAddressから
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress != null) {
            return remoteAddress.getAddress().getHostAddress();
        }

        return "unknown";
    }

    private boolean isAllowedIp(String ip) {
        return allowedIps.contains(ip);
    }

    @Override
    public int getOrder() {
        return -80; // JwtOrSessionAuthFilterより後にする場合は値を大きく（例：-80 > -100）
    }
}
