package com.example.appserver.service.auth;

import com.example.appserver.security.CustomUserDetails;
import com.example.appserver.security.JwtTokenProvider;
import com.example.appserver.security.cookie.AuthCookieUtil;
import com.example.appserver.service.UserService;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.AuthRefreshTokenModel;
import com.example.servercommon.repository.AuthRefreshTokenRepository;
import com.example.servercommon.repository.PermissionRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.ErrorCodeService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class InternalAuthFlow implements AuthFlow {

    private final AuthenticationManager authenticationManager;
    private final ErrorCodeService errorCodeService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRefreshTokenRepository authRefreshTokenRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuthCookieUtil authCookieUtil;

    @Value("${security.auth.mode:jwt}")
    private String securityAuthMode;

    @Value("${spring.session.timeout:1800}")
    private int sessionTimeoutSeconds;

    @Value("${jwt.access.expiration-ms}")
    private long accessExpMs;

    @Value("${jwt.refresh.expiration-ms}")
    private long refreshExpMs;

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 4;

    @Override
    public String type() {
        return "internal";
    }

    private long toMaxAgeSec(long expMs) {
        long sec = expMs / 1000;
        return Math.max(sec, 1);
    }

    private LocalDateTime nowUtc() {
        return LocalDateTime.ofInstant(Instant.now(), ZoneOffset.UTC);
    }

    private boolean isSessionMode() {
        return "session".equalsIgnoreCase(securityAuthMode);
    }

    @Override
    public ResponseEntity<ApiResponse<?>> login(
            String userId,
            String password,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    ) {
        log.info(BackendMessageCatalog.LOG_INTERNAL_LOGIN_ATTEMPT, userId);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userId, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            if (isSessionMode()) {
                HttpSession session = request.getSession(true);
                session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
                session.setMaxInactiveInterval(sessionTimeoutSeconds);
            }

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            if (Boolean.TRUE.equals(userDetails.getDomainUser().getIsLockedOut())) {
                throw new CustomException(BackendMessageCatalog.CODE_E4012, BackendMessageCatalog.MSG_ACCOUNT_LOCKED);
            }

            // ★ users.user_id (String) を統一キーとして使う
            String uid = userDetails.getDomainUser().getUserId();
            String subjectUserId = uid;

            UUID accessJti = UUID.randomUUID();
            UUID refreshJti = UUID.randomUUID();
            UUID familyId = UUID.randomUUID();

            // ※ JwtTokenProvider 側も uid を String で受ける前提に合わせる
            String accessToken = jwtTokenProvider.generateAccessToken(
                    uid,
                    subjectUserId,
                    accessJti
            );

            String refreshToken = jwtTokenProvider.generateRefreshToken(
                    uid,
                    refreshJti,
                    familyId,
                    null,
                    subjectUserId
            );

            saveRefreshToken(uid, refreshJti, accessJti, false);

            authCookieUtil.setAccess(response, accessToken, toMaxAgeSec(accessExpMs));
            // authCookieUtil.setRefresh(response, refreshToken, toMaxAgeSec(refreshExpMs));

            var domainUser = userDetails.getDomainUser();
            var userPermissions = buildUserPermissions(userDetails);
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "authenticated", true,
                    "authType", "internal",
                    "user_id", domainUser.getUserId(),
                    "givenName", domainUser.getGivenName(),
                    "surname", domainUser.getSurname(),
                    "email", domainUser.getEmail(),
                    "userPermissions", userPermissions
                    // need permissions here
            )));

        } catch (BadCredentialsException ex) {
            userService.recordFailedLogin(userId, MAX_FAILED_LOGIN_ATTEMPTS);
            throw ex;
        } catch (LockedException ex) {
            throw new CustomException(BackendMessageCatalog.CODE_E4012, BackendMessageCatalog.MSG_ACCOUNT_LOCKED);
        } catch (DisabledException ex) {
            throw new CustomException(BackendMessageCatalog.CODE_E4013, BackendMessageCatalog.MSG_ACCOUNT_DISABLED);
        } catch (AccountExpiredException ex) {
            throw new CustomException(BackendMessageCatalog.CODE_E4014, BackendMessageCatalog.MSG_ACCOUNT_EXPIRED);
        } catch (CredentialsExpiredException ex) {
            throw new CustomException(BackendMessageCatalog.CODE_E4015, BackendMessageCatalog.MSG_CREDENTIALS_EXPIRED);
        } catch (AuthenticationException ex) {
            throw new CustomException(BackendMessageCatalog.CODE_E401, BackendMessageCatalog.MSG_AUTHENTICATION_FAILED);
        }
    }

    @Override
    public ResponseEntity<ApiResponse<?>> refreshTokens(
            String rawRefreshToken,
            HttpServletRequest request,
            HttpServletResponse response,
            Locale locale
    ) {
        try {
            var jws = jwtTokenProvider.parseAndValidate(rawRefreshToken);
            Claims claims = jws.getBody();

            if (!"refresh".equals(String.valueOf(claims.get("typ")))) {
                return buildErrorResponse(HttpStatus.BAD_REQUEST, BackendMessageCatalog.CODE_E400, locale);
            }

            UUID jti = UUID.fromString(claims.getId());
            UUID familyId = UUID.fromString((String) claims.get("fid"));

            // ★ sub は userId(String)
            String subjectUserId = claims.getSubject();

            // ★ uid も String（claim "uid"）
            Object uidObj = claims.get("uid");
            if (uidObj == null) {
                authCookieUtil.clearAccess(response);
                authCookieUtil.clearRefresh(response);
                return buildErrorResponse(HttpStatus.UNAUTHORIZED, BackendMessageCatalog.CODE_E401, locale);
            }
            String uid = uidObj.toString();

            AuthRefreshTokenModel rt = authRefreshTokenRepository.findByJti(jti.toString()).orElse(null);
            LocalDateTime now = nowUtc();
            if (rt == null || rt.getRevokedAt() != null || rt.getExpiresAt().isBefore(now)) {
                authCookieUtil.clearAccess(response);
                authCookieUtil.clearRefresh(response);
                return buildErrorResponse(HttpStatus.UNAUTHORIZED, BackendMessageCatalog.CODE_E401, locale);
            }

            // ★ tokenの所有者チェック（DBは refresh_tokens.user_id = String）
            if (rt.getUserId() == null || !rt.getUserId().equals(uid)) {
                authCookieUtil.clearAccess(response);
                authCookieUtil.clearRefresh(response);
                return buildErrorResponse(HttpStatus.UNAUTHORIZED, BackendMessageCatalog.CODE_E401, locale);
            }


            // ★ DB検索は userId(String) で
            var user = userRepository.findById(uid)
                    .orElseThrow(() -> new IllegalStateException(
                            BackendMessageCatalog.format(BackendMessageCatalog.EX_USER_NOT_FOUND_FOR_REFRESH_UID, uid)));

            if (user.getUserId() == null || !user.getUserId().equals(subjectUserId)) {
                authCookieUtil.clearAccess(response);
                authCookieUtil.clearRefresh(response);
                return buildErrorResponse(HttpStatus.UNAUTHORIZED, BackendMessageCatalog.CODE_E401, locale);
            }

            UUID newAccessJti = UUID.randomUUID();
            UUID newRefreshJti = UUID.randomUUID();

            String newAccessToken = jwtTokenProvider.generateAccessToken(uid, user.getUserId(), newAccessJti);

            String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                    uid,
                    newRefreshJti,
                    familyId,
                    jti,
                    user.getUserId()
            );

            saveRefreshToken(uid, newRefreshJti, newAccessJti, true);

            authCookieUtil.setAccess(response, newAccessToken, toMaxAgeSec(accessExpMs));
            // authCookieUtil.setRefresh(response, newRefreshToken, toMaxAgeSec(refreshExpMs));

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "authenticated", true
            )));

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_REFRESH_TOKEN_FAILED, e);
            authCookieUtil.clearAccess(response);
            authCookieUtil.clearRefresh(response);
            return buildErrorResponse(HttpStatus.UNAUTHORIZED, BackendMessageCatalog.CODE_E401, locale);
        }
    }

    @Override
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) session.invalidate();

            SecurityContextHolder.clearContext();

            revokeRefreshByAccessJti(request);

            authCookieUtil.clearAccess(response);
            //authCookieUtil.clearRefresh(response);

            return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_LOGGED_OUT_SUCCESS));

        } catch (Exception e) {
            log.warn(BackendMessageCatalog.LOG_LOGOUT_ERROR, e.getMessage());
            authCookieUtil.clearAccess(response);
            //authCookieUtil.clearRefresh(response);
            return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_LOGGED_OUT_BEST_EFFORT));
        }
    }

    private void revokeRefreshByAccessJti(HttpServletRequest request) {
        try {
            String token = null;
            if (request.getCookies() != null) {
                for (var c : request.getCookies()) {
                    if (AuthCookieUtil.ACCESS_COOKIE.equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
            if (!StringUtils.hasText(token)) {
                String authHeader = request.getHeader("Authorization");
                if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }
            if (!StringUtils.hasText(token)) return;

            Claims claims = jwtTokenProvider.parseClaims(token);
            String jti = claims.getId();
            if (!StringUtils.hasText(jti)) return;

            AuthRefreshTokenModel rt =
                    authRefreshTokenRepository.findByLastAccessJti(jti).orElse(null);
            if (rt == null) return;

            rt.setRevokedAt(nowUtc());
            authRefreshTokenRepository.save(rt);
        } catch (Exception e) {
            log.warn(BackendMessageCatalog.LOG_REVOKE_REFRESH_FAILED, e.getMessage());
        }
    }

    @Override
    public ResponseEntity<ApiResponse<?>> getStatus(HttpServletRequest request, Locale locale) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            String msg = errorCodeService.getErrorMessage(BackendMessageCatalog.CODE_E403, locale.getLanguage());
            throw new CustomException(BackendMessageCatalog.CODE_E403, msg);
        }

        if (auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            var domainUser = userDetails.getDomainUser();
            var userPermissions = buildUserPermissions(userDetails);
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "authenticated", true,
                    "user", Map.of(
                            "userId", domainUser.getUserId(),
                            "givenName", domainUser.getGivenName(),
                            "surname", domainUser.getSurname(),
                            "email", domainUser.getEmail()
                    ),
                    "userPermissions", userPermissions
            )));

        }

        String msg = errorCodeService.getErrorMessage(BackendMessageCatalog.CODE_E403, locale.getLanguage());
        throw new CustomException(BackendMessageCatalog.CODE_E403, msg);
    }

    @Override
    public ResponseEntity<ApiResponse<?>> loginWithExternalService(
            String clientId, String clientSecret,
            HttpServletRequest request, Locale locale
    ) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        BackendMessageCatalog.CODE_E400,
                        errorCodeService.getErrorMessage(BackendMessageCatalog.CODE_E400, locale.getLanguage())));
    }

    private List<Map<String, Object>> buildUserPermissions(CustomUserDetails userDetails) {
        Map<Integer, Integer> rolePermissions = userDetails.getRolePermissions();
        if (rolePermissions == null || rolePermissions.isEmpty()) {
            return List.of();
        }

        Map<Integer, String> permissionNameById = permissionRepository
                .findAllByPermissionIdIn(rolePermissions.keySet())
                .stream()
                .collect(Collectors.toMap(
                        p -> p.getPermissionId(),
                        p -> p.getPermissionName(),
                        (a, b) -> a
                ));

        return rolePermissions.entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "permissionId", e.getKey(),
                        "permissionName", permissionNameById.getOrDefault(e.getKey(), ""),
                        "statusLevelId", e.getValue()
                ))
                .toList();
    }

    private void saveRefreshToken(String userId, UUID jti, UUID accessJti, boolean markUsed) {
        LocalDateTime now = nowUtc();
        AuthRefreshTokenModel e = authRefreshTokenRepository.findByUserId(userId).orElse(null);
        if (e == null) {
            e = new AuthRefreshTokenModel();
            e.setUserId(userId);
        }
        e.setJti(jti.toString());
        e.setExpiresAt(now.plus(refreshExpMs, ChronoUnit.MILLIS));
        e.setRevokedAt(null);
        e.setLastUsedAt(markUsed ? now : null);
        e.setLastAccessJti(accessJti.toString());
        authRefreshTokenRepository.save(e);
    }

    private ResponseEntity<ApiResponse<?>> buildErrorResponse(HttpStatus status, String code, Locale locale) {
        return ResponseEntity.status(status)
                .body(ApiResponse.error(code, errorCodeService.getErrorMessage(code, locale.getLanguage())));
    }
}
