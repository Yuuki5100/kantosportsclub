package com.example.appserver.testutil;

import java.util.List;
import java.util.Map;

import com.example.appserver.permission.PermissionConfigProvider;

public class MockSecuritySupport {

    public static class DummyEndpointPermissions implements PermissionConfigProvider.EndpointPermissions {

        @Override
        public List<String> getPermissions() {
            return List.of("ANY");
        }

        @Override
        public void setPermissions(List<String> permissions) {}

        @Override
        public Map<String, Integer> getCustom() {
            return Map.of();
        }

        @Override
        public void setCustom(Map<String, Integer> custom) {}

        @Override
        public int getRequiredLevelForCustomRole(String role) {
            return 0;
        }

        @Override
        public int getRequiredLevel() {
            return 0;
        }

        @Override
        public int getDefaultLevel() {
            return 0;
        }
    }
}
