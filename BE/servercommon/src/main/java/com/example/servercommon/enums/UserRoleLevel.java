package com.example.servercommon.enums;

import java.util.Arrays;

public enum UserRoleLevel {
    USER(1),
    ADMIN(2),
    SYSTEM_ADMIN(3);

    private final int level;

    UserRoleLevel(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }

    public static int fromRoleName(String roleName) {
        return Arrays.stream(UserRoleLevel.values())
                     .filter(r -> r.name().equalsIgnoreCase(roleName))
                     .findFirst()
                     .map(UserRoleLevel::getLevel)
                     .orElse(0);
    }
}
