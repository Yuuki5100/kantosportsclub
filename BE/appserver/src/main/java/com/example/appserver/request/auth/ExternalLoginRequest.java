package com.example.appserver.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExternalLoginRequest {
    @NotBlank
    private String clientId;

    @NotBlank
    private String clientSecret;
}
