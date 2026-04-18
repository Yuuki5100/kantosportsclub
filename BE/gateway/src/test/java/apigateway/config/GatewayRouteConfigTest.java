package apigateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
class GatewayRouteConfigTest {

    @Autowired
    private GatewayRouteConfig config;

    @Autowired
    private RouteLocatorBuilder builder;

    @Test
    void testCustomRouteLocatorReturnsNonNullRouteLocator() {
        RouteLocator routeLocator = config.customRouteLocator(builder);
        assertNotNull(routeLocator);
    }
}
