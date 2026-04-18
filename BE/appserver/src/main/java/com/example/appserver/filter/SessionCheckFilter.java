package com.example.appserver.filter;

import com.example.servercommon.message.BackendMessageCatalog;
import java.io.IOException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@ConditionalOnProperty(name = "security.auth.mode", havingValue = "session")
public class SessionCheckFilter extends OncePerRequestFilter {

    private boolean canPublish = true;
    private final AuthenticationEntryPoint authenticationEntryPoint;

    public SessionCheckFilter(AuthenticationEntryPoint authenticationEntryPoint) {
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Override
    protected boolean shouldNotFilter(@SuppressWarnings("null") HttpServletRequest request) {
        final String method = request.getMethod();
        final String path = request.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            if (log.isDebugEnabled())
                log.debug(BackendMessageCatalog.LOG_SESSION_CHECK_SKIP_OPTIONS, path);
            return true;
        }

        return false;
    }

    @Override
    protected void doFilterInternal(@SuppressWarnings("null") HttpServletRequest request,
            @SuppressWarnings("null") HttpServletResponse response,
            @SuppressWarnings("null") FilterChain filterChain)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isAuthenticated = auth != null && auth.isAuthenticated()
                && !(auth instanceof AnonymousAuthenticationToken);

        if (!canPublish)
            return;

        if (isAuthenticated && session == null) {
            authenticationEntryPoint.commence(
                    request, response, new InsufficientAuthenticationException(BackendMessageCatalog.EX_SESSION_REQUIRED));
            return;
        }

        filterChain.doFilter(request, response);
    }
}
