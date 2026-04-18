package com.example.appserver.request.user;

import jakarta.validation.constraints.NotBlank;

public class DeleteUserRequest {

    @NotBlank(message = "Deletion reason must not be blank")
    private String deletionReason;

    public String getDeletionReason() {
        return deletionReason;
    }

    public void setDeletionReason(String deletionReason) {
        this.deletionReason = deletionReason;
    }
}
