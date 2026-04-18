package com.example.appserver.request.user;

import jakarta.validation.constraints.NotBlank;

public class UnlockUserRequest {

    @NotBlank(message = "locked_user_id must not be blank")
    private String lockedUserId;

    public String getLockedUserId() {
        return lockedUserId;
    }

    public void setLockedUserId(String lockedUserId) {
        this.lockedUserId = lockedUserId;
    }
}
