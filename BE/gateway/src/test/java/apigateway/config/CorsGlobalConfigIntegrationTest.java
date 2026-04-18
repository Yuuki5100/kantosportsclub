package apigateway.config;

import apigateway.Gateway;
import apigateway.security.IpWhitelistFilter;
import apigateway.security.JwtOrSessionAuthFilter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = Gateway.class)
@ActiveProfiles("test")
class CorsGlobalConfigIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private JwtOrSessionAuthFilter jwtOrSessionAuthFilter;

    @MockBean
    private IpWhitelistFilter ipWhitelistFilter;

    @BeforeEach
    void setup() {
        when(jwtOrSessionAuthFilter.filter(any(), any())).thenReturn(Mono.empty());
        when(ipWhitelistFilter.filter(any(), any())).thenReturn(Mono.empty());
    }

    @Test
    void shouldAllowCorsFromLocalhost3000() {
        when(jwtOrSessionAuthFilter.filter(any(), any())).thenReturn(Mono.empty());
        when(ipWhitelistFilter.filter(any(), any())).thenReturn(Mono.empty());

        webTestClient
            .options()
            .uri("/test-cors")
            .header(HttpHeaders.ORIGIN, "http://localhost:3000")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
            .exchange()
            .expectStatus().isOk()
            .expectHeader().valueEquals("Access-Control-Allow-Origin", "http://localhost:3000")
            .expectHeader().valueEquals("Access-Control-Allow-Credentials", "true");
    }

    @Test
    void shouldRejectCorsFromUnauthorizedOrigin() {
        when(jwtOrSessionAuthFilter.filter(any(), any())).thenReturn(Mono.empty());
        when(ipWhitelistFilter.filter(any(), any())).thenReturn(Mono.empty());

        webTestClient
            .options()
            .uri("/test-cors")
            .header(HttpHeaders.ORIGIN, "http://evil.com")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
            .exchange()
            .expectStatus().isForbidden();
    }
}
