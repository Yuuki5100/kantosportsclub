package com.example.appserver.permission;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EndpointPermission {

    // エンドポイント（例: "/user/profile"）
    private String endpoint;
    // デフォルトの権限レベル（例: 2）
    private int defaultLevel;
    // 許可されるロールのリスト（例: "USER", "ADMIN", "VIEWER"）
    private List<String> allowedRoles;
    // カスタム設定（例: {"user": 2}）
    private Map<String, Integer> customPermissions;

    /**
     * 権限リストの件数を requiredLevel として返す（シンプルな実装例）。
     */
    public int getRequiredLevel() {
        return (allowedRoles != null) ? allowedRoles.size() : 0;
    }
}
