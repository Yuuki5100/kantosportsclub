package com.example.appserver.permission;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PermissionConfigProvider {

    Map<String, EndpointPermissions> getEndpointPermissions();

    int getRequiredLevel(String endpoint);

    Optional<EndpointPermissions> findEndpointPermissions(String method, String path);

    void refresh();

    interface EndpointPermissions {
        List<String> getPermissions();
        Map<String, Integer> getCustom();

        void setPermissions(List<String> permissions);
        void setCustom(Map<String, Integer> custom);

        int getRequiredLevelForCustomRole(String role);
        int getRequiredLevel();

        // ✅ テストやロジックで参照する場合に必要
        int getDefaultLevel();
    }
}
