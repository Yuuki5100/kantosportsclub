package com.example.appserver.security.cookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenCookieResolver {

    public String resolve(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        for (Cookie c : cookies) {
            if (AuthCookieUtil.REFRESH_COOKIE.equals(c.getName())) {
                String v = c.getValue();
                return (v != null && !v.isBlank()) ? v : null;
            }
        }
        return null;
    }
}
