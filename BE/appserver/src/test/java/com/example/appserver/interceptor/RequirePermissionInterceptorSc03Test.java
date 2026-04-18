package com.example.appserver.interceptor;

import com.example.appserver.config.AuthorizationInterceptorProperties;
import com.example.appserver.security.AuthChecker;
import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.security.RequirePermission;
import com.example.appserver.security.RolePermissionChecker;
import com.example.servercommon.model.UserModel;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.method.HandlerMethod;

import java.lang.reflect.Method;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RequirePermissionInterceptorSc03Test {

    private RequirePermissionInterceptor interceptor;
    private AuthChecker authChecker;
    private RolePermissionChecker rolePermissionChecker;
    private HttpServletRequest request;
    private HttpServletResponse response;

    @BeforeEach
    void setUp() {
        AuthorizationInterceptorProperties props = new AuthorizationInterceptorProperties();
        authChecker = mock(AuthChecker.class);
        rolePermissionChecker = mock(RolePermissionChecker.class);
        interceptor = new RequirePermissionInterceptor(props, authChecker, rolePermissionChecker);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);

        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken("u", "p"));
        UserModel u = new UserModel();
        u.setUserId("u1");
        u.setRoleId(10);
        when(authChecker.requireAuthenticatedUser(any())).thenReturn(new CustomUserDetails(u, Map.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void SC03_UT_038_shouldReturn403WhenViewEndpointAccessWithoutViewPermission() throws Exception {
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/roles/list");
        doThrow(new org.springframework.security.access.AccessDeniedException("denied"))
                .when(rolePermissionChecker).requireAllowed(any(), anyInt(), anyInt());

        HandlerMethod handler = handler("viewEndpoint");

        assertThatThrownBy(() -> interceptor.preHandle(request, response, handler))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }

    @Test
    void SC03_UT_039_shouldAllowRequestWhenViewEndpointAccessWithViewPermission() throws Exception {
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/roles/list");

        HandlerMethod handler = handler("viewEndpoint");
        boolean allowed = interceptor.preHandle(request, response, handler);

        assertThat(allowed).isTrue();
    }

    @Test
    void SC03_UT_040_shouldReturn403WhenUpdateEndpointAccessWithoutUpdatePermission() throws Exception {
        when(request.getMethod()).thenReturn("PUT");
        when(request.getRequestURI()).thenReturn("/api/roles/1");
        doThrow(new org.springframework.security.access.AccessDeniedException("denied"))
                .when(rolePermissionChecker).requireAllowed(any(), anyInt(), anyInt());

        HandlerMethod handler = handler("updateEndpoint");

        assertThatThrownBy(() -> interceptor.preHandle(request, response, handler))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }

    @Test
    void SC03_UT_041_shouldAllowRequestWhenUpdateEndpointAccessWithUpdatePermission() throws Exception {
        when(request.getMethod()).thenReturn("PUT");
        when(request.getRequestURI()).thenReturn("/api/roles/1");

        HandlerMethod handler = handler("updateEndpoint");
        boolean allowed = interceptor.preHandle(request, response, handler);

        assertThat(allowed).isTrue();
    }

    private HandlerMethod handler(String methodName) throws NoSuchMethodException {
        Method m = DummyController.class.getDeclaredMethod(methodName);
        return new HandlerMethod(new DummyController(), m);
    }

    private static final class DummyController {
        @RequirePermission(permissionId = 2, statusLevelId = 2)
        public void viewEndpoint() {
        }

        @RequirePermission(permissionId = 2, statusLevelId = 3)
        public void updateEndpoint() {
        }
    }
}
