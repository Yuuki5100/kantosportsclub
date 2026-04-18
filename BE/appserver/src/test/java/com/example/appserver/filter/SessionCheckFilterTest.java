package com.example.appserver.filter;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

class SessionCheckFilterTest {

    private SessionCheckFilter filter;
    private AuthenticationEntryPoint authenticationEntryPoint;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authenticationEntryPoint = mock(AuthenticationEntryPoint.class);
        filter = new SessionCheckFilter(authenticationEntryPoint);
    }

    @Test
    void shouldSkipOptionsRequests() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("OPTIONS");
        when(request.getRequestURI()).thenReturn("/any/path");

        boolean result = filter.shouldNotFilter(request);
        assertTrue(result, "OPTIONS requests should be skipped");
    }

    @Test
    void shouldReturnUnauthorizedWhenAuthenticatedButNoSession() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/protected");
        when(request.getSession(false)).thenReturn(null);

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        filter.doFilterInternal(request, response, chain);

        verify(authenticationEntryPoint).commence(eq(request), eq(response), any(InsufficientAuthenticationException.class));
        verify(chain, never()).doFilter(request, response);
    }

    @Test
    void shouldProceedWhenNotAuthenticated() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/public");
        when(request.getSession(false)).thenReturn(null);

        SecurityContextHolder.clearContext();

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        verify(authenticationEntryPoint, never()).commence(any(), any(), any());
    }

    @Test
    void shouldProceedWhenAuthenticatedAndSessionExists() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);
        HttpSession session = mock(HttpSession.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/protected");
        when(request.getSession(false)).thenReturn(session);

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        verify(authenticationEntryPoint, never()).commence(any(), any(), any());
    }

    @Test
    void shouldProceedWhenAuthenticationIsAnonymous() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/protected");
        when(request.getSession(false)).thenReturn(null);

        Authentication auth = mock(AnonymousAuthenticationToken.class);
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        verify(authenticationEntryPoint, never()).commence(any(), any(), any());
    }
}
