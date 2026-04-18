package apigateway.config;

import java.time.Duration;

import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

@Configuration
public class GatewayRouteConfig {

    @Value("${gateway.appserver-uri:http://localhost:8081}")
    private String appserverUri;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("appserver-auth", r -> r.path("/api/auth/**")
                        .uri(appserverUri))

                .route("appserver", r -> r.path("/api/**")
                        .and()
                        .not(p -> p.path("/api/auth/**"))
                        // Temporarily disabled rate limiter to avoid blocking API traffic during troubleshooting.
                        // .filters(f -> f
                        //         .requestRateLimiter(config -> {
                        //             config.setRateLimiter(redisRateLimiter());
                        //             config.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                        //         }))
                        .uri(appserverUri))

                .route("batchserver", r -> r.path("/batch/**")
                        .filters(f -> f
                        .addRequestHeader("X-Gateway-Token", "trusted")
                        .stripPrefix(2)) // "/api/batch" を除去
                        .uri("http://localhost:8083"))

                .route("internal-user-service", r -> r
                        .header("X-Internal-Call", "true")
                        .and().path("/internal-api/users/**")
                        .filters(f -> f.retry(config -> config
                                .setRetries(3)
                                .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)
                                .setMethods(HttpMethod.GET, HttpMethod.POST)
                                .setBackoff(Duration.ofMillis(100), Duration.ofMillis(1000), 2, false)))
                        .uri("http://localhost:8082"))

                //.route("frontend-user-api", r -> r.path("/api/users/**")
                //        .uri("http://localhost:8082"))

                .build();
    }

    @Bean
    public RedisRateLimiter redisRateLimiter() {
        // replenishRate: 10 req/sec, burstCapacity: 20
        return new RedisRateLimiter(10, 20);
    }
}
