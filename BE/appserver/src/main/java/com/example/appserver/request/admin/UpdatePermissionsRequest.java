package com.example.appserver.request.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@Data
public class UpdatePermissionsRequest {

    @NotNull(message = "User ID must not be null")
    private String userId;

    @NotNull(message = "Permissions must not be null")
    private Map<String, Integer> permissions;
}
