package com.example.appserver.service;

import com.example.appserver.service.sync.NoticeSyncEventService;
import com.example.appserver.response.notice.NoticeListResponse;
import com.example.servercommon.model.Notice;
import com.example.servercommon.repository.NoticeFileRepository;
import com.example.servercommon.repository.NoticeRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.StorageService;
import com.example.servercommon.setting.SystemSettingResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoticeServiceGetListTest {

    @Mock
    private NoticeRepository noticeRepository;
    @Mock
    private NoticeFileRepository noticeFileRepository;
    @Mock
    private SystemSettingResolver systemSettingResolver;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StorageService storageService;
    @Mock
    private NoticeSyncEventService noticeSyncEventService;

    private NoticeService noticeService;

    @BeforeEach
    void setUp() {
        noticeService = new NoticeService(
                noticeRepository,
                noticeFileRepository,
                systemSettingResolver,
                userRepository,
                storageService,
                noticeSyncEventService
        );
    }

    @Test
    void SC04_UT_004_shouldExcludeExpiredNoticesAfterEndDate() {
        LocalDate today = LocalDate.of(2026, 2, 1);
        Notice valid = notice(1L, "valid", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 2));

        when(systemSettingResolver.getInt("NUMBER_OF_NOTICES")).thenReturn(java.util.Optional.empty());
        when(systemSettingResolver.getInt("noticeDisplayLimit")).thenReturn(java.util.Optional.empty());
        when(noticeRepository.findByEndDateGreaterThanEqual(eq(today), any(Sort.class))).thenReturn(List.of(valid));

        NoticeListResponse res = noticeService.getList(today);

        assertThat(res.getNoticeList()).hasSize(1);
        assertThat(res.getNoticeList().get(0).getNoticeId()).isEqualTo(1L);
        verify(noticeRepository).findByEndDateGreaterThanEqual(eq(today), any(Sort.class));
    }

    @Test
    void SC04_UT_005_shouldIncludeNoticeWhenNowWithinStartAndEnd() {
        LocalDate today = LocalDate.of(2026, 1, 10);
        Notice active = notice(2L, "active", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 20));

        when(systemSettingResolver.getInt("NUMBER_OF_NOTICES")).thenReturn(java.util.Optional.empty());
        when(systemSettingResolver.getInt("noticeDisplayLimit")).thenReturn(java.util.Optional.empty());
        when(noticeRepository.findByEndDateGreaterThanEqual(eq(today), any(Sort.class))).thenReturn(List.of(active));

        NoticeListResponse res = noticeService.getList(today);

        assertThat(res.getNoticeList()).hasSize(1);
        assertThat(res.getNoticeList().get(0).getNoticeTitle()).isEqualTo("active");
    }

    @Test
    void SC04_UT_006_shouldApplyNoticeDisplayLimitFromSystemSetting() {
        LocalDate today = LocalDate.of(2026, 1, 10);

        Notice one = notice(10L, "one", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 20));

        when(systemSettingResolver.getInt("NUMBER_OF_NOTICES")).thenReturn(java.util.Optional.of(1));
        when(noticeRepository.findByEndDateGreaterThanEqual(eq(today), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(one), PageRequest.of(0, 1), 1));

        NoticeListResponse res = noticeService.getList(today);

        assertThat(res.getNoticeList()).hasSize(1);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(noticeRepository).findByEndDateGreaterThanEqual(eq(today), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(1);
    }

    private Notice notice(Long id, String title, LocalDate start, LocalDate end) {
        Notice n = new Notice();
        n.setNoticeId(id);
        n.setNoticeTitle(title);
        n.setStartDate(start);
        n.setEndDate(end);
        n.setCreatorUserId("admin");
        n.setEditorUserId("admin");
        return n;
    }
}
