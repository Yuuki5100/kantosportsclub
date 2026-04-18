package apigateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.reactive.CorsWebFilter;

import static org.junit.jupiter.api.Assertions.*;

class CorsGlobalConfigTest {

    @Test
    void corsWebFilterBeanShouldBeCreatedSuccessfully() {
        CorsGlobalConfig config = new CorsGlobalConfig();
        CorsWebFilter filter = config.corsWebFilter();
        assertNotNull(filter);
    }
}
