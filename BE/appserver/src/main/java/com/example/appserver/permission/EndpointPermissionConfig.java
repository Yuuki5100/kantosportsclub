package com.example.appserver.permission;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.*;

@Slf4j
@Configuration
@ConditionalOnProperty(name = "security.permission.legacy-endpoint-config-enabled", havingValue = "true")
public class EndpointPermissionConfig {

    /**
     * エンドポイントの設定をMapとして定義する。
     * キーはエンドポイントURL（例: "/user/profile"）、
     * 値はEndpointPermissionオブジェクトとなる。
     */
    @Bean
    public Map<String, EndpointPermission> endpointPermissions() {
        Map<String, EndpointPermission> map = new HashMap<>();

        map.put("/user/profile",
                new EndpointPermission("/user/profile", 2,
                        Arrays.asList("USER", "ADMIN", "VIEWER"),
                        Collections.singletonMap("USER", 2)));

        map.put("/admin/dashboard",
                new EndpointPermission("/admin/dashboard", 1,
                        Arrays.asList("ADMIN", "USER"),
                        Collections.singletonMap("ADMIN", 1)));

        map.put("/product/details",
                new EndpointPermission("/product/details", 1,
                        Arrays.asList("USER", "ADMIN", "VIEWER"),
                        Collections.singletonMap("USER", 1)));

        map.put("/user/list",
                new EndpointPermission("/user/list", 1,
                        Arrays.asList("USER"),
                        Collections.singletonMap("USER", 3)));

        map.put("/api/system",
                new EndpointPermission("/api/system", 1,
                        Arrays.asList("USER", "ADMIN"),
                        Collections.singletonMap("USER", 3)));

        if (log.isDebugEnabled()) {
            log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_MEMORY_HEADER);
            map.forEach((key, value) -> {
                log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_LOADED, key);
                log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_ALLOWED_ROLES, value.getAllowedRoles());
                log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_CUSTOM_PERMISSIONS, value.getCustomPermissions());
                log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_DEFAULT_LEVEL, value.getDefaultLevel());
            });
            log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_MEMORY_FOOTER);
        }

        return map;
    }
}
