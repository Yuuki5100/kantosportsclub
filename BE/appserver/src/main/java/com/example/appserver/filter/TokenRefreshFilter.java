package com.example.appserver.filter;

import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.security.CustomUserDetailsService;
import com.example.appserver.security.JwtTokenProvider;
import com.example.appserver.security.cookie.AuthCookieUtil;
import com.example.appserver.config.AuthorizationInterceptorProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.repository.AuthRefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenRefreshFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationEntryPoint authenticationEntryPoint;
    private final AuthorizationInterceptorProperties allowlistProps;
    private final AuthRefreshTokenRepository authRefreshTokenRepository;
    private final AuthCookieUtil authCookieUtil;
    private final AntPathMatcher antPathMatcher = new AntPathMatcher();

    @Value("${jwt.access.expiration-ms}")
    private long accessExpMs;

    @SuppressWarnings("null")
    @Override
    protected boolean shouldNotFilter(@SuppressWarnings("null") HttpServletRequest request) {
        return request.getMethod().equalsIgnoreCase("OPTIONS") || isAllowlisted(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (log.isDebugEnabled()) {
            log.debug(BackendMessageCatalog.LOG_TOKEN_REFRESH_REQUEST, request.getMethod(), request.getRequestURI());
        }

        // Safety: skip if response is already committed (e.g. error dispatch)
        if (response.isCommitted()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Existing authenticated user: skip token parsing.
        var existing = SecurityContextHolder.getContext().getAuthentication();
        if (existing != null
                && existing.isAuthenticated()
                && existing.getPrincipal() instanceof CustomUserDetails) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = resolveCookie(request, AuthCookieUtil.ACCESS_COOKIE);

        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        // No token: do NOT write the response here.
        // Let Spring Security decide if the endpoint requires authentication.
        if (token == null || token.isBlank()) {
            if (log.isDebugEnabled()) {
                log.debug(BackendMessageCatalog.LOG_TOKEN_REFRESH_NO_TOKEN);
            }
            writeAuthErrorResponse(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    BackendMessageCatalog.MSG_AUTH_TOKEN_MISSING,
                    BackendMessageCatalog.EVENT_AUTH_TOKEN_MISSING);
            return;
        }

        if (log.isDebugEnabled()) {
            log.debug(BackendMessageCatalog.LOG_TOKEN_REFRESH_FOUND, token.length());
        }

        try {
            Claims claims = jwtTokenProvider.parseClaims(token);

            // access token typ must be "access"
            Object typ = claims.get("typ");
            if (typ == null || !"access".equals(String.valueOf(typ))) {
                SecurityContextHolder.clearContext();
                writeAuthErrorResponse(
                        response,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        BackendMessageCatalog.MSG_AUTH_TOKEN_INVALID,
                        BackendMessageCatalog.EVENT_AUTH_TOKEN_INVALID);
                return;
            }

            /**
             * Expected JWT claims:
             * - sub  : userId (String)
             * - uid  : users.user_id (String)
             * - uname: fallback userId (String)
             * - typ  : "access"
             */
            String userId = claims.getSubject();

            // Fallback: if subject is empty, try uname
            if (userId == null || userId.isBlank()) {
                Object unameObj = claims.get("uname");
                if (unameObj != null) {
                    userId = String.valueOf(unameObj);
                }
            }

            if (userId == null || userId.isBlank()) {
                SecurityContextHolder.clearContext();
                writeAuthErrorResponse(
                        response,
                        HttpServletResponse.SC_UNAUTHORIZED,
                        BackendMessageCatalog.MSG_AUTH_TOKEN_INVALID,
                        BackendMessageCatalog.EVENT_AUTH_TOKEN_INVALID);
                return;
            }

            maybeSilentRefresh(claims, userId, response);

            CustomUserDetails userDetails =
                    (CustomUserDetails) userDetailsService.loadUserByUsername(userId);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);

            if (log.isDebugEnabled()) {
                log.debug(BackendMessageCatalog.LOG_TOKEN_REFRESH_AUTHENTICATED, userId);
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException ex) {
            SecurityContextHolder.clearContext();
            revokeRelatedRefreshToken(ex.getClaims());
            log.warn(BackendMessageCatalog.LOG_TOKEN_REFRESH_EXPIRED, ex);
            writeAuthErrorResponse(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    BackendMessageCatalog.MSG_AUTH_TOKEN_EXPIRED,
                    BackendMessageCatalog.EVENT_AUTH_TOKEN_EXPIRED);
        } catch (JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();
            log.warn(BackendMessageCatalog.LOG_TOKEN_REFRESH_INVALID, ex);
            writeAuthErrorResponse(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    BackendMessageCatalog.MSG_AUTH_TOKEN_INVALID,
                    BackendMessageCatalog.EVENT_AUTH_TOKEN_INVALID);
        }
    }

    private void revokeRelatedRefreshToken(Claims claims) {
        if (claims == null) {
            return;
        }
        String accessJti = claims.getId();
        if (!StringUtils.hasText(accessJti)) {
            return;
        }
        try {
            var refreshRowOpt = authRefreshTokenRepository.findByLastAccessJti(accessJti);
            if (refreshRowOpt.isEmpty()) {
                return;
            }
            var refreshRow = refreshRowOpt.get();
            if (refreshRow.getRevokedAt() == null) {
                refreshRow.setRevokedAt(LocalDateTime.ofInstant(Instant.now(), ZoneOffset.UTC));
                authRefreshTokenRepository.save(refreshRow);
            }
        } catch (Exception e) {
            log.warn(BackendMessageCatalog.LOG_TOKEN_REFRESH_REVOKE_FAILED, accessJti, e);
        }
    }

    private void writeAuthErrorResponse(HttpServletResponse response, int status, String message, String eventType)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        String body = BackendMessageCatalog.JSON_AUTH_ERROR_TEMPLATE
                .replace("{0}", escapeJsonString(message))
                .replace("{1}", escapeJsonString(eventType));
        response.getWriter().write(body);
        response.getWriter().flush();
    }

    private String escapeJsonString(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private void maybeSilentRefresh(Claims claims, String userId, HttpServletResponse response) {
        if (!jwtTokenProvider.isWithinAccessRefreshBuffer(claims)) {
            return;
        }

        String oldAccessJti = claims.getId();
        Object uidObj = claims.get("uid");
        if (!StringUtils.hasText(oldAccessJti) || uidObj == null || !StringUtils.hasText(userId)) {
            return;
        }

        var refreshRowOpt = authRefreshTokenRepository.findByLastAccessJti(oldAccessJti);
        if (refreshRowOpt.isEmpty()) {
            return;
        }

        var refreshRow = refreshRowOpt.get();
        LocalDateTime now = LocalDateTime.ofInstant(Instant.now(), ZoneOffset.UTC);
        if (refreshRow.getRevokedAt() != null || refreshRow.getExpiresAt() == null || refreshRow.getExpiresAt().isBefore(now)) {
            // Refresh token is not usable anymore; keep current access token until it naturally expires.
            return;
        }

        UUID newAccessJti = UUID.randomUUID();
        String uid = String.valueOf(uidObj);
        String newAccessToken = jwtTokenProvider.generateAccessToken(uid, userId, newAccessJti);

        refreshRow.setLastAccessJti(newAccessJti.toString());
        authRefreshTokenRepository.save(refreshRow);

        authCookieUtil.setAccess(response, newAccessToken, toMaxAgeSec(accessExpMs));
    }

    private long toMaxAgeSec(long expMs) {
        long sec = expMs / 1000;
        return Math.max(sec, 1);
    }

    private String resolveCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        for (Cookie c : cookies) {
            if (cookieName.equals(c.getName())) {
                String v = c.getValue();
                return (v != null && !v.isBlank()) ? v : null;
            }
        }
        return null;
    }

    private boolean isAllowlisted(HttpServletRequest request) {
        List<String> paths = allowlistProps.getExcludePaths();
        if (paths == null || paths.isEmpty()) return false;

        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (StringUtils.hasText(contextPath) && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }

        for (String pattern : paths) {
            if (StringUtils.hasText(pattern) && antPathMatcher.match(pattern, uri)) {
                return true;
            }
        }
        return false;
    }
}
