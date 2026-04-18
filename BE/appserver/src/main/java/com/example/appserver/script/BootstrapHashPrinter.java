package com.example.appserver.script;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@Slf4j
public class BootstrapHashPrinter {

    @Bean
    public CommandLineRunner hashPrinter(BCryptPasswordEncoder encoder) {
        return args -> {
            String raw = "password123";
            String hashed = encoder.encode(raw);
            log.info(BackendMessageCatalog.LOG_BOOTSTRAP_HASH, raw, hashed);
        };
    }
}
