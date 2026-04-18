package com.example.appserver.security;

import com.example.appserver.config.PermissionProperties;
import com.example.appserver.permission.PermissionConfigProvider;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component("customPermissionEvaluator")
public class CustomPermissionEvaluator implements PermissionEvaluator {

    private static final Pattern METHOD_PATH_PATTERN =
            Pattern.compile("^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\\s+(.+)$", Pattern.CASE_INSENSITIVE);

    private final PermissionChecker permissionChecker;
    private final PermissionConfigProvider permissionConfigProvider;
    private final PermissionProperties permissionProperties;

    public CustomPermissionEvaluator(PermissionChecker permissionChecker,
                                     PermissionConfigProvider permissionConfigProvider,
                                     PermissionProperties permissionProperties) {
        this.permissionChecker = permissionChecker;
        this.permissionConfigProvider = permissionConfigProvider;
        this.permissionProperties = permissionProperties;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        if (targetDomainObject == null || permission == null) return false;

        String endpoint = targetDomainObject.toString();

        int requiredLevel;
        try {
            requiredLevel = Integer.parseInt(permission.toString());
        } catch (NumberFormatException e) {
            return false;
        }

        EndpointTarget endpointTarget = resolveTarget(endpoint);
        if (endpointTarget == null) {
            return false;
        }
        if (permissionProperties.isMethodSecurityAllowIfUnmapped()
                && permissionConfigProvider.findEndpointPermissions(endpointTarget.method(), endpointTarget.path()).isEmpty()) {
            return true;
        }
        return permissionChecker.checkPermission(authentication, endpointTarget.method(), endpointTarget.path(), requiredLevel);
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return hasPermission(authentication, targetType, permission);
    }

    public boolean checkPermission(Authentication authentication, String endpoint) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        return checkPermission(authentication, endpoint, 0);
    }

    public boolean checkPermission(Authentication authentication, String endpoint, int requiredLevel) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        if (endpoint == null) return false;

        EndpointTarget endpointTarget = resolveTarget(endpoint);
        if (endpointTarget == null) {
            return false;
        }
        if (permissionProperties.isMethodSecurityAllowIfUnmapped()
                && permissionConfigProvider.findEndpointPermissions(endpointTarget.method(), endpointTarget.path()).isEmpty()) {
            return true;
        }
        return permissionChecker.checkPermission(authentication, endpointTarget.method(), endpointTarget.path(), requiredLevel);
    }

    private EndpointTarget resolveTarget(String endpointExpression) {
        if (endpointExpression == null || endpointExpression.isBlank()) {
            return null;
        }

        Matcher matcher = METHOD_PATH_PATTERN.matcher(endpointExpression.trim());
        if (matcher.matches()) {
            String method = matcher.group(1).toUpperCase(Locale.ROOT);
            String path = matcher.group(2).trim();
            return path.isEmpty() ? null : new EndpointTarget(method, path);
        }

        String method = permissionProperties.getMethodSecurityDefaultMethod();
        if (method == null || method.isBlank()) {
            method = "GET";
        }
        return new EndpointTarget(method.toUpperCase(Locale.ROOT), endpointExpression.trim());
    }

    private record EndpointTarget(String method, String path) {
    }
}
