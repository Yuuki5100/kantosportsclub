package com.example.appserver.interceptor;

import com.example.appserver.security.PermissionChecker;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthorizationInterceptorTest {

    private AuthorizationInterceptor interceptor;
    private PermissionChecker permissionChecker;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private Authentication authentication;
    private SecurityContext securityContext;

    @BeforeEach
    void setUp() {
        permissionChecker = mock(PermissionChecker.class);
        interceptor = new AuthorizationInterceptor(permissionChecker);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        authentication = mock(Authentication.class);
        securityContext = mock(SecurityContext.class);
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void preHandle_WhenPermissionGranted_ShouldReturnTrue() throws Exception {
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/some/uri");
        when(permissionChecker.checkPermission(authentication, "GET", "/some/uri")).thenReturn(true);

        boolean result = interceptor.preHandle(request, response, new Object());

        assertTrue(result);
        verify(response, never()).sendError(anyInt(), anyString());
    }

    @Test
    void preHandle_WhenPermissionDenied_ShouldReturnFalseAndSendError() throws Exception {
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURI()).thenReturn("/restricted/uri");
        when(permissionChecker.checkPermission(authentication, "POST", "/restricted/uri")).thenReturn(false);
        when(authentication.getName()).thenReturn("testUser");

        boolean result = interceptor.preHandle(request, response, new Object());

        assertFalse(result);
        verify(response, times(1)).sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
    }

    @Test
    void preHandle_WhenNoAuthentication_ShouldHandleAsAnonymous() throws Exception {
        when(request.getMethod()).thenReturn("DELETE");
        when(request.getRequestURI()).thenReturn("/admin/uri");
        when(securityContext.getAuthentication()).thenReturn(null);
        when(permissionChecker.checkPermission(null, "DELETE", "/admin/uri")).thenReturn(false);

        boolean result = interceptor.preHandle(request, response, new Object());

        assertFalse(result);
        verify(response, times(1)).sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
    }
}
