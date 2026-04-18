package com.example.appserver.service;

import com.example.appserver.request.system.SystemSettingUpdateRequest;
import com.example.appserver.security.CustomUserDetails;
import com.example.servercommon.model.SystemSetting;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.SystemSettingRepository;
import com.example.servercommon.setting.SystemSettingHistoryService;
import com.example.servercommon.setting.SystemSettingResolver;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SystemSettingServiceTest {

    @Mock
    private SystemSettingRepository systemSettingRepository;

    @InjectMocks
    private SystemSettingService systemSettingService;

    @Mock
    private SystemSettingResolver systemSettingResolver;

    @Mock
    private SystemSettingHistoryService systemSettingHistoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // SC06-UT-015
    @Test
    void shouldUpdateOnlyTargetRecords() {
        setAuthenticatedUser("u1");

        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        SystemSetting existing = new SystemSetting();
        existing.setId("1");

        when(systemSettingRepository.findById("1")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.updateValues(
                any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(1);
        when(systemSettingRepository.findById("1")).thenReturn(Optional.of(existing));

        SystemSetting result = systemSettingService.upsert(req);

        assertNotNull(result);

        ArgumentCaptor<String> idCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Integer> pwdDaysCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> pwdAttemptValidityCountCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> reissueCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> retriesCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> noticesCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<String> updaterCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<LocalDateTime> updatedAtCaptor = ArgumentCaptor.forClass(LocalDateTime.class);

        verify(systemSettingRepository, times(1)).updateValues(
                idCaptor.capture(),
                pwdDaysCaptor.capture(),
                pwdAttemptValidityCountCaptor.capture(),
                reissueCaptor.capture(),
                retriesCaptor.capture(),
                noticesCaptor.capture(),
                updaterCaptor.capture(),
                updatedAtCaptor.capture());

        assertEquals("1", idCaptor.getValue());
        assertEquals(90, pwdDaysCaptor.getValue());
        assertEquals(3, pwdAttemptValidityCountCaptor.getValue());
        assertEquals(3, retriesCaptor.getValue());
        assertEquals(2, reissueCaptor.getValue());
        assertEquals(10, noticesCaptor.getValue());
        assertEquals("u1", updaterCaptor.getValue());
        assertNotNull(updatedAtCaptor.getValue());

        verify(systemSettingRepository, never()).save(any(SystemSetting.class));
        verify(systemSettingHistoryService, times(1))
                .recordChanges(any(SystemSetting.class), any(SystemSetting.class), any(), any());
        verify(systemSettingResolver, times(1)).evictAll();
    }

    // SC06-UT-016
    @Test
    void shouldRollbackWhenAnyUpdateFails() {
        setAuthenticatedUser("u1");

        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        SystemSetting existing = new SystemSetting();
        existing.setId("1");

        when(systemSettingRepository.findById("1")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.updateValues(
                any(), any(), any(), any(), any(), any(), any(), any()))
                .thenThrow(new RuntimeException("update failed"));

        assertThrows(RuntimeException.class, () -> systemSettingService.upsert(req));

        verify(systemSettingRepository, times(1)).findById("1");
        verify(systemSettingRepository, never()).save(any(SystemSetting.class));
        verify(systemSettingHistoryService, never()).recordChanges(any(), any(), any(), any());
        verify(systemSettingResolver, never()).evictAll();
    }

    // SC06-UT-022
    @Test
    void shouldPersistAndReloadReturnsUpdatedValues() {
        setAuthenticatedUser("u1");

        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(120);
        req.setPasswordReissueUrlExpiration(3);
        req.setNumberOfRetries(5);
        req.setNumberOfNotices(15);

        SystemSetting existing = new SystemSetting();
        existing.setId("1");

        SystemSetting updated = new SystemSetting();
        updated.setId("1");
        updated.setPasswordValidityDays(120);
        updated.setPasswordReissueUrlExpiration(3);
        updated.setNumberOfRetries(5);
        updated.setNumberOfNotices(15);

        when(systemSettingRepository.findById("1"))
                .thenReturn(Optional.of(existing))
                .thenReturn(Optional.of(updated));
        when(systemSettingRepository.updateValues(
                any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(1);

        SystemSetting result = systemSettingService.upsert(req);

        assertNotNull(result);
        assertEquals(120, result.getPasswordValidityDays());
        assertEquals(3, result.getPasswordReissueUrlExpiration());
        assertEquals(5, result.getNumberOfRetries());
        assertEquals(15, result.getNumberOfNotices());

        verify(systemSettingRepository, times(1)).updateValues(
                any(), any(), any(), any(), any(), any(), any(), any());
        verify(systemSettingHistoryService, times(1))
                .recordChanges(any(SystemSetting.class), any(SystemSetting.class), any(), any());
        verify(systemSettingResolver, times(1)).evictAll();
    }

    @Test
    void shouldCreateInitialRecordAndWriteHistory() {
        setAuthenticatedUser("u1");

        SystemSettingUpdateRequest req = new SystemSettingUpdateRequest();
        req.setPasswordValidDays(90);
        req.setPasswordReissueUrlExpiration(2);
        req.setNumberOfRetries(3);
        req.setNumberOfNotices(10);

        SystemSetting saved = new SystemSetting();
        saved.setId("1");
        saved.setPasswordValidityDays(90);
        saved.setPasswordReissueUrlExpiration(2);
        saved.setNumberOfRetries(3);
        saved.setNumberOfNotices(10);

        when(systemSettingRepository.findById("1")).thenReturn(Optional.empty());
        when(systemSettingRepository.save(any(SystemSetting.class))).thenReturn(saved);

        SystemSetting result = systemSettingService.upsert(req);

        assertNotNull(result);
        assertEquals("1", result.getId());
        verify(systemSettingRepository, times(1)).save(any(SystemSetting.class));
        verify(systemSettingHistoryService, times(1))
                .recordChanges(any(), any(SystemSetting.class), any(), any());
        verify(systemSettingResolver, times(1)).evictAll();
    }

    private void setAuthenticatedUser(String userId) {
        UserModel user = new UserModel();
        user.setUserId(userId);
        CustomUserDetails details = new CustomUserDetails(user, Map.of());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities()));
    }
}
