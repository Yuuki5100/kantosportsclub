package apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
// import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import apigateway.config.PublicPathProperties;

@SpringBootApplication
@ComponentScan(basePackages = {
    "apigateway",
    // "com.example.servercommon"
})
@EnableConfigurationProperties(PublicPathProperties.class)
// @EnableJpaRepositories(basePackages = "com.example.servercommon.repository")
@EntityScan(basePackages = {
    // "com.example.servercommon.model" // ← ErrorCode 用に追加！
})

public class Gateway {
    public static void main(String[] args) {
        SpringApplication.run(Gateway.class, args);
    }
}
