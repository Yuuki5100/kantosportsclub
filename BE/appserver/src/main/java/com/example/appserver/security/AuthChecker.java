package com.example.appserver.security;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.UserModel;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class AuthChecker {

    private final CustomUserDetailsService customUserDetailsService;

    public AuthChecker(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    public CustomUserDetails requireAuthenticatedUser(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new BadCredentialsException(BackendMessageCatalog.MSG_UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails;
        }
        if (principal instanceof UserModel user) {
            return (CustomUserDetails) customUserDetailsService.loadUserByUsername(user.getUserId());
        }

        throw new BadCredentialsException(BackendMessageCatalog.MSG_UNAUTHORIZED);
    }
}
