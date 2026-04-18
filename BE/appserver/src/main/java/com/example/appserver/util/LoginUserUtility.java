package com.example.appserver.util;

import com.example.appserver.security.CustomUserDetails;
import com.example.servercommon.model.UserModel;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class LoginUserUtility {

    public static UserModel getLoginUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getDomainUser();
        }
        return null;
    }

    public static String getLoginUserId() {
        UserModel loginUser = getLoginUser();
        return loginUser != null ? loginUser.getUserId() : null;
    }
}
