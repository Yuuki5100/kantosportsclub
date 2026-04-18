package com.example.appserver.interceptor;

import com.example.appserver.security.RequirePermission;
import com.example.appserver.security.AuthChecker;
import com.example.appserver.security.RolePermissionChecker;
import com.example.appserver.config.AuthorizationInterceptorProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

@Slf4j
@Component
public class RequirePermissionInterceptor implements HandlerInterceptor {

    private final AuthorizationInterceptorProperties authzProps;
    private final AuthChecker authChecker;
    private final RolePermissionChecker rolePermissionChecker;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public RequirePermissionInterceptor(AuthorizationInterceptorProperties authzProps,
                                        AuthChecker authChecker,
                                        RolePermissionChecker rolePermissionChecker) {
        this.authzProps = authzProps;
        this.authChecker = authChecker;
        this.rolePermissionChecker = rolePermissionChecker;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        if (isPreflight(request) || isExcluded(request)) {
            if (log.isDebugEnabled()) {
                log.debug(BackendMessageCatalog.LOG_REQUIRE_PERMISSION_SKIP, request.getMethod(), request.getRequestURI());
            }
            return true;
        }

        RequirePermission requirePermission = handlerMethod.getMethodAnnotation(RequirePermission.class);
        if (requirePermission == null) {
            throw new org.springframework.security.access.AccessDeniedException(
                    BackendMessageCatalog.EX_REQUIRE_PERMISSION_MISSING);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        var userDetails = authChecker.requireAuthenticatedUser(authentication);
        Integer roleId = userDetails.getDomainUser() != null ? userDetails.getDomainUser().getRoleId() : null;

        try {
            rolePermissionChecker.requireAllowed(
                    roleId,
                    requirePermission.permissionId(),
                    requirePermission.statusLevelId()
            );
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            log.warn(BackendMessageCatalog.LOG_REQUIRE_PERMISSION_ACCESS_DENIED,
                    request.getMethod(),
                    request.getRequestURI(),
                    roleId,
                    requirePermission.permissionId(),
                    requirePermission.statusLevelId());
            throw ex;
        }

        return true;
    }

    private boolean isPreflight(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    private boolean isExcluded(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (pathMatcher.match("/api/auth/**", path)) {
            return true;
        }

        List<String> excludes = authzProps.getExcludePaths();
        if (excludes == null || excludes.isEmpty()) return false;
        return excludes.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

}
