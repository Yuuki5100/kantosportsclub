package com.example.appserver.service;

import com.example.appserver.request.notice.NoticeCreateRequest;
import com.example.appserver.request.notice.NoticeUpdateRequest;
import com.example.appserver.response.notice.NoticeCreateResponse;
import com.example.appserver.response.notice.NoticeDetailResponse;
import com.example.appserver.response.notice.NoticeListItem;
import com.example.appserver.response.notice.NoticeListResponse;
import com.example.appserver.response.notice.NoticeUpdateResponse;
import com.example.appserver.service.sync.NoticeSyncEventService;
import com.example.servercommon.model.Notice;
import com.example.servercommon.model.NoticeFile;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.NoticeFileRepository;
import com.example.servercommon.repository.NoticeRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.StorageService;
import com.example.servercommon.setting.SystemSettingKeys;
import com.example.servercommon.setting.SystemSettingResolver;
import com.example.servercommon.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    private final NoticeRepository noticeRepository;
    private final NoticeFileRepository noticeFileRepository;
    private final SystemSettingResolver systemSettingResolver;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final NoticeSyncEventService noticeSyncEventService;

    public List<Notice> getListEntities(LocalDate today) {
        Integer limit = resolveNoticeDisplayLimit();
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (limit != null && limit > 0) {
            return noticeRepository.findByEndDateGreaterThanEqual(today, PageRequest.of(0, limit, sort))
                    .getContent();
        }
        return noticeRepository.findByEndDateGreaterThanEqual(today, sort);
    }

    public NoticeListResponse getList(LocalDate today) {
        List<Notice> notices = getListEntities(today);
        List<NoticeListItem> items = notices.stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
        return new NoticeListResponse(items);
    }

    public Optional<NoticeDetailResponse> getDetail(Long noticeId) {
        return noticeRepository.findById(noticeId).map(this::toDetailResponse);
    }

    public NoticeCreateResponse create(NoticeCreateRequest request, String userId) {
        Notice notice = new Notice();
        notice.setNoticeTitle(request.getNoticeTitle());
        notice.setStartDate(request.getStartDate());
        notice.setEndDate(request.getEndDate());
        notice.setContents(request.getContents());
        notice.setCreatorUserId(userId);
        notice.setEditorUserId(userId);

        Notice saved = noticeRepository.save(notice);

        saveNoticeFiles(saved.getNoticeId(), request.getDocIds(), userId);
        noticeSyncEventService.publishNoticeChanged(saved.getNoticeId(), "CREATED", userId);

        return new NoticeCreateResponse(saved.getNoticeId());
    }

    public Optional<NoticeUpdateResponse> update(Long noticeId, NoticeUpdateRequest request, String userId) {
        return noticeRepository.findById(noticeId).map(existing -> {
            existing.setNoticeTitle(request.getNoticeTitle());
            existing.setStartDate(request.getStartDate());
            existing.setEndDate(request.getEndDate());
            existing.setContents(request.getContents());
            existing.setEditorUserId(userId);

            Notice saved = noticeRepository.save(existing);

            syncNoticeFiles(saved.getNoticeId(), request.getDocIds(), userId);
            noticeSyncEventService.publishNoticeChanged(saved.getNoticeId(), "UPDATED", userId);

            return new NoticeUpdateResponse(saved.getNoticeId());
        });
    }

    public boolean isInvalidDateRange(LocalDate start, LocalDate end) {
        if (start == null || end == null) return false;
        return start.isAfter(end);
    }

    public String getCurrentUserId() {
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

    private Integer resolveNoticeDisplayLimit() {
        Integer numberOfNotices = systemSettingResolver
                .getInt(SystemSettingKeys.NUMBER_OF_NOTICES)
                .orElseGet(() -> systemSettingResolver
                        .getInt(SystemSettingKeys.NOTICE_DISPLAY_LIMIT)
                        .orElse(null));
        if (numberOfNotices == null || numberOfNotices <= 0) {
            return null;
        }
        return numberOfNotices;
    }

    private NoticeListItem toListItem(Notice notice) {
        return new NoticeListItem(
                notice.getNoticeId(),
                notice.getNoticeTitle(),
                formatDate(notice.getStartDate()),
                formatDate(notice.getEndDate()),
                resolveUserName(notice.getCreatorUserId()),
                formatDateTime(notice.getCreatedAt())
        );
    }

    private NoticeDetailResponse toDetailResponse(Notice notice) {
        List<String> docIds = noticeFileRepository
                .findAllByNoticeIdAndDeletedFlagFalse(notice.getNoticeId())
                .stream()
                .map(NoticeFile::getDestinationUrl)
                .collect(Collectors.toList());

        return new NoticeDetailResponse(
                notice.getNoticeId(),
                notice.getNoticeTitle(),
                formatDate(notice.getStartDate()),
                formatDate(notice.getEndDate()),
                notice.getContents(),
                docIds,
                resolveUserName(notice.getCreatorUserId()),
                formatDateTime(notice.getCreatedAt()),
                resolveUserName(notice.getEditorUserId()),
                formatDateTime(notice.getUpdatedAt())
        );
    }

    private void saveNoticeFiles(Long noticeId, List<String> docIds, String userId) {
        if (docIds == null) return;
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        for (String docId : docIds) {
            if (!StringUtils.hasText(docId)) continue;
            NoticeFile nf = new NoticeFile();
            nf.setNoticeId(noticeId);
            nf.setDestinationUrl(docId);
            nf.setFileName(extractFileName(docId));
            nf.setFileFormat(extractExtension(docId));
            nf.setFileSize(resolveFileSize(docId));
            nf.setDeletedFlag(false);
            nf.setCreatorUserId(userId);
            nf.setCreatedDateTime(now);
            nf.setUpdaterUserId(userId);
            nf.setUpdatedDateTime(now);
            noticeFileRepository.save(nf);
        }
    }

    private void syncNoticeFiles(Long noticeId, List<String> docIds, String userId) {
        List<NoticeFile> existing = noticeFileRepository.findAllByNoticeIdAndDeletedFlagFalse(noticeId);
        List<String> newDocIds = (docIds != null) ? docIds : List.of();

        // Soft-delete files no longer in the list
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        for (NoticeFile nf : existing) {
            if (!newDocIds.contains(nf.getDestinationUrl())) {
                nf.setDeletedFlag(true);
                nf.setUpdaterUserId(userId);
                nf.setUpdatedDateTime(now);
                noticeFileRepository.save(nf);
            }
        }

        // Add new files not already present
        List<String> existingUrls = existing.stream()
                .map(NoticeFile::getDestinationUrl)
                .collect(Collectors.toList());
        for (String docId : newDocIds) {
            if (!StringUtils.hasText(docId)) continue;
            if (!existingUrls.contains(docId)) {
                NoticeFile nf = new NoticeFile();
                nf.setNoticeId(noticeId);
                nf.setDestinationUrl(docId);
                nf.setFileName(extractFileName(docId));
                nf.setFileFormat(extractExtension(docId));
                nf.setFileSize(resolveFileSize(docId));
                nf.setDeletedFlag(false);
                nf.setCreatorUserId(userId);
                nf.setCreatedDateTime(now);
                nf.setUpdaterUserId(userId);
                nf.setUpdatedDateTime(now);
                noticeFileRepository.save(nf);
            }
        }
    }

    private BigDecimal resolveFileSize(String docId) {
        try {
            java.util.List<String> keys = storageService.listByPrefix(docId);
            if (!keys.isEmpty()) {
                java.io.File file = storageService.getFileByPath(keys.get(0));
                if (file != null && file.exists()) {
                    return BigDecimal.valueOf(file.length()).divide(BigDecimal.valueOf(1024), 3, java.math.RoundingMode.HALF_UP);
                }
            }
        } catch (Exception e) {
            // fileSize is optional; log and continue
        }
        return null;
    }

    private String extractFileName(String docId) {
        if (docId == null) return null;
        int slashIdx = docId.lastIndexOf('/');
        String name = (slashIdx >= 0) ? docId.substring(slashIdx + 1) : docId;
        if (name.length() > 37) {
            name = name.substring(37);
        }
        return name;
    }

    private String extractExtension(String docId) {
        if (docId == null) return null;
        int dotIdx = docId.lastIndexOf('.');
        if (dotIdx < 0 || dotIdx == docId.length() - 1) return null;
        return docId.substring(dotIdx + 1);
    }

    private String resolveUserName(String userId) {
        if (!StringUtils.hasText(userId)) return "";
        return userRepository.findById(userId)
                .map(u -> u.getSurname() + " " + u.getGivenName())
                .orElse("");
    }

    private String formatDate(LocalDate date) {
        if (date == null) return null;
        return date.format(DATE_FORMAT);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return DateFormatUtil.utcToJst(dateTime).format(DATETIME_FORMAT);
    }
}
