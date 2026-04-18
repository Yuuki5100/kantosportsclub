package com.example.appserver.interceptor;

import com.example.appserver.security.PermissionChecker;
import com.example.servercommon.message.BackendMessageCatalog;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthorizationInterceptor implements HandlerInterceptor {

    private final PermissionChecker permissionChecker;

    public AuthorizationInterceptor(PermissionChecker permissionChecker) {
        this.permissionChecker = permissionChecker;
    }

    @SuppressWarnings("null")
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        if (!permissionChecker.checkPermission(authentication, method, uri)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, BackendMessageCatalog.MSG_ACCESS_DENIED);
            return false;
        }
        return true;
    }
}
