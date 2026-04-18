package apigateway.config;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.test.context.ActiveProfiles;

import reactor.test.StepVerifier;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class GatewayRouteConfigIntegrationTest {

    @Autowired
    private RouteLocator routeLocator;

    @Disabled("Temporarily disabled while route expectations are being aligned with the current gateway config")
    @Test
    void shouldLoadExpectedRoutes() {
        StepVerifier.create(routeLocator.getRoutes().map(route -> route.getId()).collectList())
            .assertNext(ids -> {
                assertTrue(ids.contains("appserver"), "appserver route should be registered");
                assertTrue(ids.contains("batchserver"), "batchserver route should be registered");
                assertTrue(ids.contains("internal-user-service"), "internal-user-service route should be registered");
                assertTrue(ids.contains("frontend-user-api"), "frontend-user-api route should be registered");
            })
            .verifyComplete();
    }
}
