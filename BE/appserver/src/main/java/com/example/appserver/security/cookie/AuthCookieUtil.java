package com.example.appserver.security.cookie;

import com.example.appserver.config.AuthProperties;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthCookieUtil {

    public static final String ACCESS_COOKIE = "ACCESS_TOKEN";
    public static final String REFRESH_COOKIE = "REFRESH_TOKEN";

    private final AuthProperties authProperties;

    public void setAccess(HttpServletResponse res, String token, long maxAgeSec) {
        var c = authProperties.getCookie();
        res.addHeader(HttpHeaders.SET_COOKIE,
                build(ACCESS_COOKIE, token, maxAgeSec, c.getAccessPath(), c).toString());
    }

    public void setRefresh(HttpServletResponse res, String token, long maxAgeSec) {
        var c = authProperties.getCookie();
        res.addHeader(HttpHeaders.SET_COOKIE,
                build(REFRESH_COOKIE, token, maxAgeSec, c.getRefreshPath(), c).toString());
    }

    public void clearAccess(HttpServletResponse res) {
        var c = authProperties.getCookie();
        res.addHeader(HttpHeaders.SET_COOKIE,
                build(ACCESS_COOKIE, "", 0, c.getAccessPath(), c).toString());
    }

    public void clearRefresh(HttpServletResponse res) {
        var c = authProperties.getCookie();
        res.addHeader(HttpHeaders.SET_COOKIE,
                build(REFRESH_COOKIE, "", 0, c.getRefreshPath(), c).toString());
    }

    private ResponseCookie build(String name, String value, long maxAgeSec, String path, AuthProperties.Cookie c) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(c.isSecure())
                .sameSite(c.getSameSite())
                .path(path)
                .maxAge(maxAgeSec)
                .build();
    }
}
