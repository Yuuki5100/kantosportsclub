package com.example.appserver.permission;

import com.example.appserver.permission.PermissionConfigProvider.EndpointPermissions;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.EndpointAuthorityMapping;
import com.example.servercommon.repository.EndpointAuthorityMappingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class PermissionConfigProviderImpl implements PermissionConfigProvider {

    private final EndpointAuthorityMappingRepository mappingRepository;
    private final AntPathMatcher antPathMatcher = new AntPathMatcher();

    private volatile Map<String, PermissionConfigProvider.EndpointPermissions> endpoints = Map.of();

    public PermissionConfigProviderImpl(EndpointAuthorityMappingRepository mappingRepository) {
        this.mappingRepository = mappingRepository;
    }

    @PostConstruct
    public void init() {
        refresh();
    }

    @Scheduled(fixedDelayString = "${security.permission.cache-refresh-fixed-delay-ms:600000}")
    public void refreshOnSchedule() {
        refresh();
    }

    @Override
    public synchronized void refresh() {
        Map<String, PermissionConfigProvider.EndpointPermissions> reloaded = buildPermissionsFromDb();
        endpoints = Collections.unmodifiableMap(reloaded);
        logEndpointConfigurations(endpoints);
    }

    private Map<String, PermissionConfigProvider.EndpointPermissions> buildPermissionsFromDb() {
        List<EndpointAuthorityMapping> allMappings = mappingRepository.findAll();
        if (allMappings == null || allMappings.isEmpty()) {
            return Map.of();
        }

        Map<String, List<EndpointAuthorityMapping>> grouped = allMappings.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getMethod().toUpperCase() + " " + m.getUrl()));

        Map<String, PermissionConfigProvider.EndpointPermissions> loaded = new HashMap<>();
        for (Map.Entry<String, List<EndpointAuthorityMapping>> entry : grouped.entrySet()) {
            String methodUrl = entry.getKey();
            List<EndpointAuthorityMapping> mappings = entry.getValue();

            EndpointPermissionsImpl ep = new EndpointPermissionsImpl();

            Map<String, Integer> customPermissions = mappings.stream()
                    .filter(m -> m.getMenuFunctionId() != null && m.getRequiredLevel() != null)
                    .collect(Collectors.toMap(
                            m -> String.valueOf(m.getMenuFunctionId()),
                            EndpointAuthorityMapping::getRequiredLevel,
                            Integer::max));

            ep.setPermissions(List.of());
            ep.setCustom(customPermissions);
            ep.setDefaultLevel(customPermissions.values().stream().max(Integer::compareTo).orElse(0));

            loaded.put(methodUrl, ep);
        }
        return loaded;
    }

    private void logEndpointConfigurations(Map<String, PermissionConfigProvider.EndpointPermissions> target) {
        log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_DB_HEADER);
        target.forEach((key, value) -> {
            log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_LOADED, key);
            log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_ALLOWED_ROLES, value.getPermissions());
            log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_CUSTOM_PERMISSIONS, value.getCustom());
            log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_DEFAULT_LEVEL, value.getRequiredLevel());
        });
        log.debug(BackendMessageCatalog.LOG_ENDPOINT_CONFIG_DB_FOOTER);
    }

    @Override
    public Map<String, PermissionConfigProvider.EndpointPermissions> getEndpointPermissions() {
        return endpoints;
    }

    @Override
    public int getRequiredLevel(String endpoint) {
        PermissionConfigProvider.EndpointPermissions ep = endpoints.get(endpoint);
        return (ep != null) ? ep.getRequiredLevel() : 0;
    }

    @Override
    public Optional<EndpointPermissions> findEndpointPermissions(String method, String path) {
        if (method == null || path == null) {
            return Optional.empty();
        }
        String requestKey = method.toUpperCase() + " " + path;
        return endpoints.entrySet().stream()
                .filter(entry -> antPathMatcher.match(entry.getKey(), requestKey))
                .map(Map.Entry::getValue)
                .findFirst();
    }

    /**
     * 内部クラスだが、インターフェースを正しく実装
     */
    public static class EndpointPermissionsImpl implements PermissionConfigProvider.EndpointPermissions {
        private List<String> permissions;
        private Map<String, Integer> custom;
        private int defaultLevel;

        @Override
        public List<String> getPermissions() {
            return permissions;
        }

        @Override
        public void setPermissions(List<String> permissions) {
            this.permissions = permissions;
        }

        @Override
        public Map<String, Integer> getCustom() {
            return custom;
        }

        @Override
        public void setCustom(Map<String, Integer> custom) {
            this.custom = custom;
        }

        @Override
        public int getRequiredLevelForCustomRole(String role) {
            if (custom != null && role != null) {
                return custom.getOrDefault(role, 0);
            }
            return 0;
        }

        @Override
        public int getRequiredLevel() {
            return defaultLevel;
        }

        @Override
        public int getDefaultLevel() {
            return defaultLevel;
        }

        public void setDefaultLevel(int defaultLevel) {
            this.defaultLevel = defaultLevel;
        }
    }

}
