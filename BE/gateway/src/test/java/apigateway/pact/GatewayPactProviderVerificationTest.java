package apigateway.pact;

import apigateway.Gateway;
import apigateway.security.IpWhitelistFilter;
import apigateway.security.JwtOrSessionAuthFilter;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import au.com.dius.pact.provider.junit5.HttpTestTarget;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = Gateway.class)
@ActiveProfiles("test")
@Disabled("Temporarily disabled because local Pact contract files are not present in this environment")
@Provider("gateway-provider")
@PactFolder("../../CI/qa/pact/contracts")
class GatewayPactProviderVerificationTest {

    @LocalServerPort
    private int port;

    @MockBean
    private JwtOrSessionAuthFilter jwtOrSessionAuthFilter;

    @MockBean
    private IpWhitelistFilter ipWhitelistFilter;

    @BeforeEach
    void setup(PactVerificationContext context) {
        when(jwtOrSessionAuthFilter.filter(any(), any())).thenReturn(Mono.empty());
        when(ipWhitelistFilter.filter(any(), any())).thenReturn(Mono.empty());
        if (context != null) {
            context.setTarget(new HttpTestTarget("localhost", port));
        }
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verifyPactInteractions(PactVerificationContext context) {
        context.verifyInteraction();
    }

    @State("cors endpoint is available")
    void corsEndpointIsAvailable() {
        // No setup is required for this pilot state.
    }
}
