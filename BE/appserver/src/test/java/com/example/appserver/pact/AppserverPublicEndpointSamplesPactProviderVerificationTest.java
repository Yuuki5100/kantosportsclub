package com.example.appserver.pact;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    classes = AppserverPublicEndpointSamplesPactProviderVerificationTest.TestApp.class,
    properties = {
      "spring.profiles.active=test",
      "springdoc.api-docs.enabled=false",
      "springdoc.swagger-ui.enabled=false",
      "management.endpoints.enabled-by-default=false",
      "spring.session.store-type=none"
    }
)
@Provider("appserver-provider")
@PactFolder("../../CI/qa/pact/contracts-samples")
@Disabled("Temporarily disabled because local Pact sample contract files are not present in this environment")
class AppserverPublicEndpointSamplesPactProviderVerificationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setup(PactVerificationContext context) {
        if (context != null) {
            context.setTarget(new HttpTestTarget("localhost", port));
        }
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verifyPactInteractions(PactVerificationContext context) {
        context.verifyInteraction();
    }

    @State("public sample endpoints are available")
    void publicSampleEndpointsAreAvailable() {
        // No runtime data preparation required for this sample provider.
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(
        exclude = {
          ErrorMvcAutoConfiguration.class,
          DataSourceAutoConfiguration.class,
          DataSourceTransactionManagerAutoConfiguration.class,
          HibernateJpaAutoConfiguration.class,
          BatchAutoConfiguration.class,
          FlywayAutoConfiguration.class,
          MybatisAutoConfiguration.class
        }
    )
    @Import({NoSecurityConfig.class, PublicEndpointSampleController.class})
    static class TestApp {
    }

    static class NoSecurityConfig {
        @Bean
        @Primary
        SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable());
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            http.httpBasic(Customizer.withDefaults());
            return http.build();
        }
    }

    @RestController
    static class PublicEndpointSampleController {

        @PostMapping(path = "/api/auth/login", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> authLogin(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("message", "sample-login-success"));
        }

        @GetMapping("/api/auth/external-login")
        ResponseEntity<Void> externalLogin() {
            return ResponseEntity.status(302)
                .location(URI.create("https://example.local/oauth/authorize"))
                .build();
        }

        @GetMapping("/api/auth/callback")
        ResponseEntity<Void> callback(@RequestParam("code") String code, @RequestParam("state") String state) {
            return ResponseEntity.status(302)
                .location(URI.create("http://localhost:3000/login"))
                .build();
        }

        @PostMapping(path = "/api/user/forgot-password", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("message", "sample-forgot-password-accepted"));
        }

        @PutMapping(path = "/api/user/reset-password/{token}", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> resetPassword(@PathVariable("token") String token, @RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("message", "sample-reset-password-success"));
        }

        @PostMapping(path = "/batch-runner/start", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> batchRunnerStart(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("accepted", true));
        }

        @PostMapping(path = "/batch-runner/dummy", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> batchRunnerDummy(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("ok", true));
        }

        @PostMapping(path = "/import/templateGet", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> importTemplateGet(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("template", "sample-template"));
        }

        @GetMapping("/import/history")
        ResponseEntity<Object> importHistory() {
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(java.util.List.of());
        }

        @PostMapping(path = "/import/upload", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> importUpload(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("uploaded", true));
        }

        @PostMapping(path = "/import/downloadReady", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> importDownloadReady(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("ready", true));
        }

        @PostMapping(path = "/import/download", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<byte[]> importDownload(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body("sample-binary".getBytes());
        }

        @GetMapping("/report/list")
        ResponseEntity<Object> reportList() {
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(java.util.List.of());
        }

        @PostMapping(path = "/report/export/csv/file", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<byte[]> reportExportFile(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body("sample-export-file".getBytes());
        }

        @PostMapping(path = "/report/job", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> reportJob(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("jobName", "sample-job-name"));
        }

        @GetMapping("/report/polling/{jobName}")
        ResponseEntity<Map<String, Object>> reportPolling(@PathVariable("jobName") String jobName) {
            return ResponseEntity.ok(Map.of("status", "COMPLETED"));
        }

        @PostMapping(path = "/report/download/csv", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<byte[]> reportDownload(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body("sample-report-data".getBytes());
        }

        @PostMapping(path = "/api/files/upload", consumes = MediaType.APPLICATION_JSON_VALUE)
        ResponseEntity<Map<String, Object>> filesUpload(@RequestBody Map<String, Object> body) {
            return ResponseEntity.ok(Map.of("fileId", "sample-file-id"));
        }

        @GetMapping("/api/files/download")
        ResponseEntity<byte[]> filesDownload(@RequestParam("fileId") String fileId) {
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body("sample-file-data".getBytes());
        }

        @DeleteMapping("/api/files/{fileId}")
        ResponseEntity<Map<String, Object>> filesDelete(@PathVariable("fileId") String fileId) {
            return ResponseEntity.ok(Map.of("deleted", true));
        }

        @GetMapping("/actuator/health")
        ResponseEntity<Map<String, Object>> actuatorHealth() {
            return ResponseEntity.ok(Map.of("status", "UP"));
        }

        @GetMapping("/v3/api-docs")
        ResponseEntity<Map<String, Object>> apiDocs() {
            return ResponseEntity.ok(Map.of("openapi", "3.0.0"));
        }

        @GetMapping("/swagger-ui/index.html")
        ResponseEntity<String> swaggerUi() {
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_HTML_VALUE)
                .body("<html><body>sample-swagger-ui</body></html>");
        }

        @GetMapping("/error")
        ResponseEntity<Map<String, Object>> error() {
            return ResponseEntity.ok(Map.of("error", "sample-error-payload"));
        }
    }
}
