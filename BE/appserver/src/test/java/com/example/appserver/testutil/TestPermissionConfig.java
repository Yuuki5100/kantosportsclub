package com.example.appserver.testutil;

import com.example.appserver.permission.PermissionConfigProvider;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@TestConfiguration
public class TestPermissionConfig {

    @Bean
    @Primary
    public PermissionConfigProvider permissionConfigProvider() {
        return new DummyPermissionConfigProvider();
    }

    static class DummyPermissionConfigProvider implements PermissionConfigProvider {

        @Override
        public Map<String, EndpointPermissions> getEndpointPermissions() {
            Map<String, EndpointPermissions> map = new HashMap<>();

            // ✅ 全メソッド + 全パスに対して許可
            allowAll(map);

            return map;
        }

        private void allow(Map<String, EndpointPermissions> map, String method, String path) {
            map.put(method + " " + path, new DummyEndpointPermissions());
        }

        private void allowAll(Map<String, EndpointPermissions> map) {
            List<String> methods = List.of("GET", "POST", "PUT", "DELETE", "PATCH");
            for (String method : methods) {
                map.put(method + " /**", new DummyEndpointPermissions());
            }
        }

        @Override
        public int getRequiredLevel(String endpoint) {
            return 0;
        }

        @Override
        public Optional<EndpointPermissions> findEndpointPermissions(String method, String path) {
            return Optional.of(new DummyEndpointPermissions());
        }

        @Override
        public void refresh() {
            // no-op for test
        }
    }

    static class DummyEndpointPermissions implements PermissionConfigProvider.EndpointPermissions {

        private List<String> permissions;
        private Map<String, Integer> custom;
        private int requiredLevel;

        // ✅ テスト用デフォルト：すべて許可、レベル 0
        public DummyEndpointPermissions() {
            this.permissions = List.of("TEST");
            this.custom = Map.of();
            this.requiredLevel = 0;
        }

        public DummyEndpointPermissions(List<String> permissions, Map<String, Integer> custom, int requiredLevel) {
            this.permissions = permissions;
            this.custom = custom;
            this.requiredLevel = requiredLevel;
        }

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
            return custom.getOrDefault(role, 0);
        }

        @Override
        public int getRequiredLevel() {
            return requiredLevel;
        }

        @Override
        public int getDefaultLevel() {
            return requiredLevel;
        }
    }
}
