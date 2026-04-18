package com.example.appserver.service;

import com.example.appserver.request.user.UserListQuery;
import com.example.appserver.response.user.UserDetailResponse;
import com.example.appserver.response.user.UserListData;
import com.example.appserver.response.user.UserListResponse;
import com.example.servercommon.exception.CustomException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.AuthOneTimeTokenModel;
import com.example.servercommon.model.MailMessage;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.AuthOneTimeTokenRepository;
import com.example.servercommon.repository.RoleRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.EmailSender;
import com.example.servercommon.utils.DateFormatUtil;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Duration PASSWORD_SET_TOKEN_TTL = Duration.ofDays(30);
    private static final String PURPOSE_PASSWORD_SET = "PASSWORD_SET";
    private static final String PURPOSE_PASSWORD_RESET = "PASSWORD_RESET";
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthOneTimeTokenRepository authOneTimeTokenRepository;
    private final EmailSender emailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.frontend-url}")
    private String frontendUrl;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserListData getUserList(UserListQuery query) {
        int pageNumber = (query != null && query.getPageNumber() != null) ? query.getPageNumber() : 1;
        int pageSize = (query != null && query.getPagesize() != null) ? query.getPagesize() : 50;

        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");
        PageRequest pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Specification<UserModel> spec = buildUserListSpec(query);
        Page<UserModel> page = (spec == null) ? userRepository.findAll(pageable)
                : userRepository.findAll(spec, pageable);
        List<UserListResponse> items = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new UserListData(items, page.getTotalElements());
    }

    public List<UserListResponse> getUserList() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<UserDetailResponse> getUserDetail(String userId) {
        return userRepository.findByUserId(userId)
                .map(this::toDetailResponse);
    }

    public Optional<UserModel> getUserByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    public UserModel createUser(UserModel user) {
        if (!StringUtils.hasText(user.getTimezone())) {
            user.setTimezone("UTC");
        }
        UserModel created = userRepository.save(user);

        String setPasswordToken = createPasswordSetToken(created.getUserId());
        String setPasswordUrl = frontendUrl + "/reset-password/" + setPasswordToken;
        String htmlBody = renderSetPasswordEmail(created, setPasswordUrl);
        MailMessage message = MailMessage.builder()
                .to(created.getEmail())
                .subject("Please Set your password")
                .htmlBody(htmlBody)
                .build();
        emailSender.send(message);

        return created;
    }

    public UserModel updateUser(UserModel user) {
        return userRepository.save(user);
    }

    public boolean existsByUserId(String userId) {
        return userRepository.existsByUserId(userId);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean roleExists(Integer roleId) {
        return roleRepository.existsById(roleId);
    }

    public void recordFailedLogin(String userId, int maxAttempts) {
        if (!StringUtils.hasText(userId)) return;

        userRepository.findByUserId(userId).ifPresent(user -> {
            int attempts = (user.getFailedLoginAttempts() != null)
                    ? user.getFailedLoginAttempts() + 1
                    : 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= maxAttempts) {
                user.setIsLockedOut(true);
            }
            userRepository.save(user);
        });
    }

    public void changePassword(String userId, String currentPassword, String newPassword) {
        UserModel user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_USER_ID_NOT_FOUND));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_CURRENT_PASSWORD_INCORRECT);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordSetTime(DateFormatUtil.nowUtcLocalDateTime());
        user.setEditorUserId(userId);
        userRepository.save(user);
    }

    public void resetPassword(String token, String newPassword) {
        AuthOneTimeTokenModel oneTimeToken = authOneTimeTokenRepository.findByJti(token)
                .orElseThrow(() -> new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_INVALID_TOKEN));

        if (oneTimeToken.getUsedAt() != null) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_TOKEN_ALREADY_USED);
        }

        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        if (oneTimeToken.getExpiresAt().isBefore(now)) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_TOKEN_EXPIRED);
        }

        if (!Set.of(PURPOSE_PASSWORD_SET, PURPOSE_PASSWORD_RESET).contains(oneTimeToken.getPurpose())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_INVALID_TOKEN_PURPOSE);
        }

        UserModel user = userRepository.findByUserId(oneTimeToken.getUserId())
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_USER_ID_NOT_FOUND));

        if (user.getPasswordSetTime() != null || !Boolean.TRUE.equals(user.getIsLockedOut())) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_PASSWORD_ALREADY_SET);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordSetTime(now);
        user.setIsLockedOut(false);
        user.setEditorUserId(user.getUserId());
        userRepository.save(user);

        oneTimeToken.setUsedAt(now);
        authOneTimeTokenRepository.save(oneTimeToken);
    }

    public void forgotPassword(String email) {
        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(
                        BackendMessageCatalog.CODE_E4041,
                        BackendMessageCatalog.ARG_USER_NOT_FOUND));

        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        /*Optional<AuthOneTimeTokenModel> activeToken =
                authOneTimeTokenRepository.findFirstByUserIdAndExpiresAtAfterAndUsedAtIsNullOrderByCreatedAtDesc(
                        user.getUserId(), now);
        if (activeToken.isPresent()) {
            throw new CustomException(BackendMessageCatalog.CODE_E4001, BackendMessageCatalog.ARG_PASSWORD_TOKEN_ALREADY_SENT);
        }*/
       authOneTimeTokenRepository.invalidateActiveTokensByUserId(user.getUserId(), now, now);

        String resetToken = createPasswordResetToken(user.getUserId());
        user.setPasswordSetTime(null);
        user.setIsLockedOut(true);
        userRepository.save(user);
        String resetUrl = frontendUrl + "/reset-password/" + resetToken;
        String htmlBody = renderResetPasswordEmail(user, resetUrl);

        MailMessage message = MailMessage.builder()
                .to(user.getEmail())
                .subject("Reset your password")
                .htmlBody(htmlBody)
                .build();
        emailSender.send(message);
    }

    private UserListResponse toResponse(UserModel user) {
        return new UserListResponse(
                user.getUserId(),
                user.getEmail(),
                user.getSurname(),
                user.getGivenName(),
                user.getRoleId(),
                resolveRoleName(user.getRoleId()),
                user.getIsLockedOut(),
                user.getFailedLoginAttempts(),
                DateFormatUtil.utcToJst(user.getLockOutTime()),
                DateFormatUtil.utcToJst(user.getUpdatedAt())
        );
    }

    private UserDetailResponse toDetailResponse(UserModel user) {
        return new UserDetailResponse(
                user.getUserId(),
                user.getEmail(),
                user.getSurname(),
                user.getGivenName(),
                resolveRoleName(user.getRoleId()),
                user.getRoleId(),
                user.getIsLockedOut(),
                user.getIsDeleted(),
                user.getMobileNo(),
                DateFormatUtil.utcToJst(user.getPasswordSetTime()),
                user.getFailedLoginAttempts(),
                DateFormatUtil.utcToJst(user.getLockOutTime()),
                user.getDeletionReason(),
                user.getCreatorUserId(),
                DateFormatUtil.utcToJst(user.getCreatedAt()),
                resolveUserName(user.getCreatorUserId()),
                user.getEditorUserId(),
                resolveUserName(user.getEditorUserId()),
                DateFormatUtil.utcToJst(user.getUpdatedAt())
        );
    }

    private String resolveRoleName(Integer roleId) {
        if (roleId == null) return "";
        return roleRepository.findById(roleId)
                .map(r -> r.getRoleName())
                .orElse("");
    }

    private String resolveUserName(String userId) {
        if (!StringUtils.hasText(userId)) return "";
        return userRepository.findById(userId)
                .map(u -> u.getSurname() + " " + u.getGivenName())
                .orElse("");
    }

    private Specification<UserModel> buildUserListSpec(UserListQuery query) {
        if (query == null) return null;

        Specification<UserModel> spec = null;

        if (StringUtils.hasText(query.getName())) {
            String term = "%" + query.getName().trim().toLowerCase() + "%";
            Specification<UserModel> nameSpec = (root, cq, cb) -> cb.or(
                    cb.like(cb.lower(root.get("givenName")), term),
                    cb.like(cb.lower(root.get("surname")), term)
            );
            spec = (spec == null) ? nameSpec : spec.and(nameSpec);
        }

        if (query.getRoleId() != null) {
            Specification<UserModel> roleSpec = (root, cq, cb) -> cb.equal(root.get("roleId"), query.getRoleId());
            spec = (spec == null) ? roleSpec : spec.and(roleSpec);
        }

        if (Boolean.TRUE.equals(query.getIsLocked())) {
            Specification<UserModel> lockedSpec = (root, cq, cb) -> cb.isTrue(root.get("isLockedOut"));
            spec = (spec == null) ? lockedSpec : spec.and(lockedSpec);
        }

        if (Boolean.TRUE.equals(query.getIsDeleted())) {
            Specification<UserModel> deletedSpec = (root, cq, cb) -> cb.isTrue(root.get("isDeleted"));
            spec = (spec == null) ? deletedSpec : spec.and(deletedSpec);
        }

        return spec;
    }

    private String renderSetPasswordEmail(UserModel user, String setPasswordUrl) {
        try {
            ClassPathResource resource = new ClassPathResource("mail/SetPassword.html");
            String template = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

            Context context = new Context();
            context.setVariables(Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "givenName", user.getGivenName(),
                    "surname", user.getSurname(),
                    "setPasswordUrl", setPasswordUrl
            ));

            return templateEngine.process(template, context);
        } catch (IOException e) {
            throw new RuntimeException(BackendMessageCatalog.EX_SET_PASSWORD_TEMPLATE_LOAD_FAILED, e);
        }
    }

    private String renderResetPasswordEmail(UserModel user, String resetPasswordUrl) {
        try {
            ClassPathResource resource = new ClassPathResource("mail/ResetPassword.html");
            String template = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

            Context context = new Context();
            context.setVariables(Map.of(
                    "userId", user.getUserId(),
                    "email", user.getEmail(),
                    "givenName", user.getGivenName(),
                    "surname", user.getSurname(),
                    "setPasswordUrl", resetPasswordUrl
            ));

            return templateEngine.process(template, context);
        } catch (IOException e) {
            throw new RuntimeException(BackendMessageCatalog.EX_RESET_PASSWORD_TEMPLATE_LOAD_FAILED, e);
        }
    }

    private String createPasswordSetToken(String userId) {
        String jti = UUID.randomUUID().toString();

        AuthOneTimeTokenModel token = new AuthOneTimeTokenModel();
        token.setUserId(userId);
        token.setJti(jti);
        token.setPurpose(PURPOSE_PASSWORD_SET);
        token.setExpiresAt(DateFormatUtil.nowUtcLocalDateTime().plus(PASSWORD_SET_TOKEN_TTL));
        token.setUsedAt(null);

        authOneTimeTokenRepository.save(token);
        return jti;
    }

    private String createPasswordResetToken(String userId) {
        String jti = UUID.randomUUID().toString();

        AuthOneTimeTokenModel token = new AuthOneTimeTokenModel();
        token.setUserId(userId);
        token.setJti(jti);
        token.setPurpose(PURPOSE_PASSWORD_RESET);
        token.setExpiresAt(DateFormatUtil.nowUtcLocalDateTime().plus(PASSWORD_SET_TOKEN_TTL));
        token.setUsedAt(null);

        authOneTimeTokenRepository.save(token);
        return jti;
    }
}
