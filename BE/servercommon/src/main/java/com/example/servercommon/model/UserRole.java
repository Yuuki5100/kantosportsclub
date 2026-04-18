package com.example.servercommon.model;

public enum UserRole {
    SYSTEM_ADMIN(1),
    EDITOR(2),
    VIEWER(3),
    CUSTOM(4);

    private final int roleId;

    UserRole(int roleId) {
        this.roleId = roleId;
    }

    public int getRoleId() {
        return roleId;
    }
}
