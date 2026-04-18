package com.example.appserver.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    private JwtAuthenticationFilter filter;
    private JwtTokenProvider tokenProvider;
    private CustomUserDetailsService userDetailsService;

    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() throws Exception {
        filter = new JwtAuthenticationFilter();
        tokenProvider = mock(JwtTokenProvider.class);
        userDetailsService = mock(CustomUserDetailsService.class);

        Field tokenProviderField = JwtAuthenticationFilter.class.getDeclaredField("tokenProvider");
        tokenProviderField.setAccessible(true);
        tokenProviderField.set(filter, tokenProvider);

        Field userDetailsField = JwtAuthenticationFilter.class.getDeclaredField("customUserDetailsService");
        userDetailsField.setAccessible(true);
        userDetailsField.set(filter, userDetailsService);

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);

        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_ShouldSetAuthentication_WhenTokenValid() throws Exception {
        String token = "valid.jwt.token";
        String userId = "testuser";

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(tokenProvider.validateToken(token)).thenReturn(true);
        when(tokenProvider.getSubjectFromJWT(token)).thenReturn(userId);

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(userId)
                .password("password")
                .authorities(Collections.emptyList())
                .build();

        when(userDetailsService.loadUserByUsername(userId)).thenReturn(userDetails);

        filter.doFilterInternal(request, response, filterChain);

        SecurityContext context = SecurityContextHolder.getContext();
        assertNotNull(context.getAuthentication());
        assertEquals(userId, context.getAuthentication().getName());

        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    void doFilterInternal_ShouldNotSetAuthentication_WhenTokenInvalid() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid.token");
        when(tokenProvider.validateToken("invalid.token")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    void doFilterInternal_ShouldNotSetAuthentication_WhenNoAuthorizationHeader() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    void getJwtFromRequest_ShouldReturnToken_WhenBearerPresent() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer my.jwt.token");

        Method method = JwtAuthenticationFilter.class.getDeclaredMethod("getJwtFromRequest", HttpServletRequest.class);
        method.setAccessible(true);

        String jwt = (String) method.invoke(filter, request);
        assertEquals("my.jwt.token", jwt);
    }

    @Test
    void getJwtFromRequest_ShouldReturnNull_WhenBearerMissing() throws Exception {
        Method method = JwtAuthenticationFilter.class.getDeclaredMethod("getJwtFromRequest", HttpServletRequest.class);
        method.setAccessible(true);

        when(request.getHeader("Authorization")).thenReturn("Token my.jwt.token");
        assertNull(method.invoke(filter, request));

        when(request.getHeader("Authorization")).thenReturn(null);
        assertNull(method.invoke(filter, request));
    }
}
