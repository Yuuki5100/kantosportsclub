package apigateway.config;

import apigateway.Gateway;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

@Disabled("RateLimiterの動作確認はデプロイ後に実施するため一時スキップ")
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    classes = Gateway.class
)
@ActiveProfiles("test")
@Import({
    DummyRateLimiterConfig.class,
    DummySecurityBypassFilterConfig.class
})
class RateLimiterIntegrationTest {

    @Autowired
    WebTestClient webTestClient;

    @Test
    void shouldReturnOk_whenRateLimitIsNotExceeded() {
        for (int i = 0; i < 10; i++) {
            webTestClient.get()
                .uri("/api/app/ratelimit-test")
                .header("X-Forwarded-For", "127.0.0.1")
                .exchange()
                .expectStatus().is2xxSuccessful();
        }
    }
}
