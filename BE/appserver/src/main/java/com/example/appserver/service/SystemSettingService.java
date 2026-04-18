package com.example.appserver.service;

import com.example.appserver.request.system.SystemSettingUpdateRequest;
import com.example.appserver.response.system.SystemSettingData;
import com.example.appserver.response.system.SystemSettingItem;
import com.example.servercommon.model.SystemSetting;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.SystemSettingRepository;
import com.example.servercommon.setting.SystemSettingHistoryService;
import com.example.servercommon.setting.SystemSettingResolver;
import com.example.servercommon.utils.DateFormatUtil;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private static final String SYSTEM_SETTING_ID = "1";
    private final SystemSettingRepository systemSettingRepository;
    private final SystemSettingResolver systemSettingResolver;
    private final SystemSettingHistoryService systemSettingHistoryService;

    public Optional<SystemSetting> getCurrent() {
        return systemSettingRepository.findById(SYSTEM_SETTING_ID);
    }

    @Transactional
    public SystemSetting upsert(SystemSettingUpdateRequest request) {
        String userId = getCurrentUserId();
        String updater = userId != null ? userId : "system";
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();

        Optional<SystemSetting> existingOpt = systemSettingRepository.findById(SYSTEM_SETTING_ID);
        if (existingOpt.isPresent()) {
            SystemSetting before = copy(existingOpt.get());
            systemSettingRepository.updateValues(
                    SYSTEM_SETTING_ID,
                    request.getPasswordValidDays(),
                    request.getNumberOfRetries(),
                    request.getPasswordReissueUrlExpiration(),
                    request.getNumberOfRetries(),
                    request.getNumberOfNotices(),
                    updater,
                    now
            );
            SystemSetting after = systemSettingRepository.findById(SYSTEM_SETTING_ID).orElseThrow();
            systemSettingHistoryService.recordChanges(before, after, updater, now);
            systemSettingResolver.evictAll();
            return after;
        }

        SystemSetting created = new SystemSetting();
        created.setId(SYSTEM_SETTING_ID);
        created.setCompanyName("CRJ");
        created.setNumberOfDaysAvailableForReservation(30);
        created.setPasswordValidityDays(request.getPasswordValidDays());
        created.setPasswordAttemptValidityCount(request.getNumberOfRetries());
        created.setPasswordReissueUrlExpiration(request.getPasswordReissueUrlExpiration());
        created.setNumberOfRetries(request.getNumberOfRetries());
        created.setNumberOfNotices(request.getNumberOfNotices());
        created.setCreatorUserId(updater);
        created.setCreatedDateTime(now);
        created.setUpdaterUserId(updater);
        created.setUpdatedDateTime(now);

        SystemSetting saved = systemSettingRepository.save(created);
        systemSettingHistoryService.recordChanges(null, saved, updater, now);
        systemSettingResolver.evictAll();
        return saved;
    }

    public SystemSettingData toResponseData(SystemSetting setting) {
        List<SystemSettingItem> items = new ArrayList<>();
        items.add(new SystemSettingItem("パスワード期限日数", "PASSWORD_VALID_DAYS",
                setting.getPasswordValidityDays()));
        items.add(new SystemSettingItem("パスワード再発行URL有効期限時間", "PASSWORD_REISSUE_URL_EXPIRATION",
                setting.getPasswordReissueUrlExpiration()));
        items.add(new SystemSettingItem("ログイン試行回数上限", "NUMBER_OF_RETRIES",
                resolveNumberOfRetries(setting)));
        items.add(new SystemSettingItem("お知らせ表示件数", "NUMBER_OF_NOTICES",
                setting.getNumberOfNotices()));
        return new SystemSettingData(items);
    }

    private Integer resolveNumberOfRetries(SystemSetting setting) {
        if (setting.getNumberOfRetries() != null) return setting.getNumberOfRetries();
        return setting.getPasswordAttemptValidityCount();
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof com.example.appserver.security.CustomUserDetails details) {
            return details.getDomainUser().getUserId();
        }
        if (principal instanceof UserModel u) {
            return u.getUserId();
        }
        if (principal instanceof org.springframework.security.core.userdetails.User springUser) {
            return springUser.getUsername();
        }
        return null;
    }

    private SystemSetting copy(SystemSetting source) {
        SystemSetting copy = new SystemSetting();
        copy.setId(source.getId());
        copy.setCompanyName(source.getCompanyName());
        copy.setPasswordValidityDays(source.getPasswordValidityDays());
        copy.setPasswordAttemptValidityCount(source.getPasswordAttemptValidityCount());
        copy.setPasswordReissueUrlExpiration(source.getPasswordReissueUrlExpiration());
        copy.setNumberOfDaysAvailableForReservation(source.getNumberOfDaysAvailableForReservation());
        copy.setNumberOfRetries(source.getNumberOfRetries());
        copy.setNumberOfNotices(source.getNumberOfNotices());
        copy.setCreatorUserId(source.getCreatorUserId());
        copy.setCreatedDateTime(source.getCreatedDateTime());
        copy.setUpdaterUserId(source.getUpdaterUserId());
        copy.setUpdatedDateTime(source.getUpdatedDateTime());
        return copy;
    }
}
