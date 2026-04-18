package com.example.appserver.service;

import com.example.appserver.request.notice.NoticeCreateRequest;
import com.example.appserver.request.notice.NoticeUpdateRequest;
import com.example.appserver.response.notice.NoticeCreateResponse;
import com.example.appserver.response.notice.NoticeUpdateResponse;
import com.example.appserver.service.sync.NoticeSyncEventService;
import com.example.servercommon.model.Notice;
import com.example.servercommon.model.NoticeFile;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoticeServiceMutationTest {

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
    void SC04_UT_020_shouldReplaceNoticeDocsWhenDocIdsChanged() {
        Notice existing = notice(500L, "old title");
        when(noticeRepository.findById(500L)).thenReturn(Optional.of(existing));
        when(noticeRepository.save(any(Notice.class))).thenReturn(existing);

        NoticeFile old = noticeFile(500L, "notice/old.pdf", false);
        NoticeFile keep = noticeFile(500L, "notice/keep.pdf", false);
        when(noticeFileRepository.findAllByNoticeIdAndDeletedFlagFalse(500L)).thenReturn(List.of(old, keep));
        when(storageService.listByPrefix(anyString())).thenReturn(List.of());

        NoticeUpdateRequest req = new NoticeUpdateRequest();
        req.setNoticeTitle("new title");
        req.setStartDate(LocalDate.of(2026, 1, 1));
        req.setEndDate(LocalDate.of(2026, 1, 31));
        req.setContents("updated");
        req.setDocIds(List.of("notice/keep.pdf", "notice/new.pdf"));

        Optional<NoticeUpdateResponse> res = noticeService.update(500L, req, "admin");

        assertThat(res).isPresent();

        ArgumentCaptor<NoticeFile> fileCaptor = ArgumentCaptor.forClass(NoticeFile.class);
        verify(noticeFileRepository, atLeast(2)).save(fileCaptor.capture());

        List<NoticeFile> saved = fileCaptor.getAllValues();
        assertThat(saved).anyMatch(f -> "notice/old.pdf".equals(f.getDestinationUrl()) && Boolean.TRUE.equals(f.getDeletedFlag()));
        assertThat(saved).anyMatch(f -> "notice/new.pdf".equals(f.getDestinationUrl()) && Boolean.FALSE.equals(f.getDeletedFlag()));
    }

    @Test
    void SC04_UT_021_shouldInsertNoticesAndNoticeDocsAtomically() {
        NoticeCreateRequest req = new NoticeCreateRequest();
        req.setNoticeTitle("create");
        req.setStartDate(LocalDate.of(2026, 1, 1));
        req.setEndDate(LocalDate.of(2026, 1, 31));
        req.setContents("body");
        req.setDocIds(List.of("notice/a.pdf", "notice/b.pdf"));

        Notice savedNotice = notice(700L, "create");
        when(noticeRepository.save(any(Notice.class))).thenReturn(savedNotice);
        when(storageService.listByPrefix(anyString())).thenReturn(List.of());

        NoticeCreateResponse res = noticeService.create(req, "admin");

        assertThat(res.getNoticeId()).isEqualTo(700L);
        verify(noticeRepository).save(any(Notice.class));
        verify(noticeFileRepository, atLeast(2)).save(any(NoticeFile.class));
    }

    private Notice notice(Long id, String title) {
        Notice n = new Notice();
        n.setNoticeId(id);
        n.setNoticeTitle(title);
        n.setStartDate(LocalDate.of(2026, 1, 1));
        n.setEndDate(LocalDate.of(2026, 1, 31));
        n.setCreatorUserId("admin");
        n.setEditorUserId("admin");
        return n;
    }

    private NoticeFile noticeFile(Long noticeId, String dest, boolean deleted) {
        NoticeFile nf = new NoticeFile();
        nf.setNoticeId(noticeId);
        nf.setDestinationUrl(dest);
        nf.setDeletedFlag(deleted);
        nf.setFileName(dest);
        nf.setFileFormat("pdf");
        nf.setFileSize(BigDecimal.ONE);
        nf.setCreatorUserId("admin");
        nf.setUpdaterUserId("admin");
        return nf;
    }
}
