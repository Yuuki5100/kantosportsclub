package com.example.appserver.service;

import com.example.appserver.request.manual.ManualCreateRequest;
import com.example.appserver.request.manual.ManualListQuery;
import com.example.appserver.request.manual.ManualUpdateRequest;
import com.example.appserver.response.manual.ManualDetail;
import com.example.appserver.response.manual.ManualDetailData;
import com.example.appserver.response.manual.ManualListData;
import com.example.appserver.response.manual.ManualListItem;
import com.example.servercommon.model.Manual;
import com.example.servercommon.model.ManualFile;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.repository.ManualFileRepository;
import com.example.servercommon.repository.ManualRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.StorageService;
import com.example.servercommon.utils.DateFormatUtil;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ManualService {

    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    private final ManualRepository manualRepository;
    private final ManualFileRepository manualFileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public ManualListData getList(ManualListQuery query) {
        String titleName = StringUtils.hasText(query.getTitleName()) ? query.getTitleName().trim() : null;
        Integer target = query.getTarget();
        Integer isdeleted = query.getIsdeleted();

        int pageNumber = (query.getPageNumber() != null) ? query.getPageNumber() : 1;
        int pageSize = (query.getPagesize() != null) ? query.getPagesize() : 50;

        Sort sort = Sort.by(Sort.Direction.DESC, "updatedDateTime");
        PageRequest pageable = PageRequest.of(pageNumber - 1, pageSize, sort);

        Page<Manual> page = manualRepository.search(titleName, target, isdeleted, pageable);

        List<ManualListItem> items = page.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        return new ManualListData(items, page.getTotalElements());
    }

    public Optional<ManualDetailData> getDetail(Long manualId) {
        return manualRepository.findById(manualId)
                .map(manual -> {
                    ManualDetail detail = toDetail(manual);
                    return new ManualDetailData(detail);
                });
    }

    public Optional<ManualFile> findDownloadFile(Long docId) {
        return manualFileRepository.findByIdAndDeletedFlagFalse(docId);
    }

    public Manual create(ManualCreateRequest request, String userId) {
        Manual manual = new Manual();
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        manual.setTitle(request.getManualTitle());
        manual.setContent(request.getDescription());
        manual.setGeneralUserFlag(Boolean.TRUE.equals(request.getGeneralUser()));
        manual.setMasterAdminFlag(Boolean.TRUE.equals(request.getSystemUser()));
        manual.setSystemConfiguratorFlag(false);
        manual.setDeletedFlag(false);
        manual.setCreatorUserId(userId);
        manual.setUpdaterUserId(userId);
        manual.setCreatedDateTime(now);
        manual.setUpdatedDateTime(now);
        Manual saved = manualRepository.save(manual);

        saveManualFiles(saved.getId(), request.getDocIds(), userId);

        return saved;
    }

    public Optional<Manual> update(Long manualId, ManualUpdateRequest request, String userId) {
        return manualRepository.findById(manualId).map(existing -> {
            LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
            existing.setTitle(request.getManualTitle());
            existing.setContent(request.getDescription());
            if (request.getGeneralUser() != null) {
                existing.setGeneralUserFlag(request.getGeneralUser());
            }
            if (request.getSystemUser() != null) {
                existing.setMasterAdminFlag(request.getSystemUser());
            }
            existing.setUpdaterUserId(userId);
            existing.setUpdatedDateTime(now);
            Manual saved = manualRepository.save(existing);

            syncManualFiles(saved.getId(), request.getDocIds(), userId);

            return saved;
        });
    }

    public Optional<Manual> softDelete(Long manualId, String userId) {
        return manualRepository.findById(manualId).map(existing -> {
            LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
            existing.setDeletedFlag(true);
            existing.setUpdaterUserId(userId);
            existing.setUpdatedDateTime(now);
            return manualRepository.save(existing);
        });
    }

    public ManualFile uploadFile(Long manualId, String fileName, String filePath, long fileSize, String fileFormat, String userId) {
        ManualFile mf = new ManualFile();
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        mf.setManualId(manualId);
        mf.setFileName(fileName);
        mf.setDestinationUrl(filePath);
        mf.setFileSize(BigDecimal.valueOf(fileSize));
        mf.setFileFormat(fileFormat);
        mf.setDeletedFlag(false);
        mf.setCreatorUserId(userId);
        mf.setUpdaterUserId(userId);
        mf.setCreatedDateTime(now);
        mf.setUpdatedDateTime(now);
        return manualFileRepository.save(mf);
    }

    public void uploadToStorage(String path, InputStream inputStream) {
        storageService.upload(path, inputStream);
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

    private ManualListItem toListItem(Manual manual) {
        return new ManualListItem(
                manual.getId(),
                manual.getTitle(),
                manual.getGeneralUserFlag(),
                manual.getMasterAdminFlag(),
                resolveUserName(manual.getUpdaterUserId()),
                formatDateTime(manual.getUpdatedDateTime())
        );
    }

    private ManualDetail toDetail(Manual manual) {
        List<String> docIds = manualFileRepository
                .findAllByManualIdAndDeletedFlagFalse(manual.getId())
                .stream()
                .map(ManualFile::getDestinationUrl)
                .collect(Collectors.toList());

        return new ManualDetail(
                manual.getId(),
                manual.getTitle(),
                manual.getContent(),
                manual.getGeneralUserFlag(),
                manual.getMasterAdminFlag(),
                formatDateTime(manual.getUpdatedDateTime()),
                docIds,
                manual.getDeletedFlag()
        );
    }

    private String resolveUserName(String userId) {
        if (!StringUtils.hasText(userId)) return "";
        return userRepository.findById(userId)
                .map(u -> u.getSurname() + " " + u.getGivenName())
                .orElse("");
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return DateFormatUtil.utcToJst(dateTime).format(DATETIME_FORMAT);
    }

    private void syncManualFiles(Long manualId, List<String> docIds, String userId) {
        List<ManualFile> existing = manualFileRepository.findAllByManualIdAndDeletedFlagFalse(manualId);
        List<String> newDocIds = (docIds != null) ? docIds : List.of();

        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        for (ManualFile mf : existing) {
            if (!newDocIds.contains(mf.getDestinationUrl())) {
                mf.setDeletedFlag(true);
                mf.setUpdaterUserId(userId);
                mf.setUpdatedDateTime(now);
                manualFileRepository.save(mf);
            }
        }

        List<String> existingUrls = existing.stream()
                .map(ManualFile::getDestinationUrl)
                .collect(Collectors.toList());
        for (String docId : newDocIds) {
            if (!StringUtils.hasText(docId)) continue;
            if (!existingUrls.contains(docId)) {
                ManualFile mf = new ManualFile();
                mf.setManualId(manualId);
                mf.setDestinationUrl(docId);
                mf.setFileName(extractFileName(docId));
                mf.setFileFormat(extractExtension(docId));
                mf.setFileSize(resolveFileSize(docId));
                mf.setDeletedFlag(false);
                mf.setCreatorUserId(userId);
                mf.setCreatedDateTime(now);
                mf.setUpdaterUserId(userId);
                mf.setUpdatedDateTime(now);
                manualFileRepository.save(mf);
            }
        }
    }

    private void saveManualFiles(Long manualId, List<String> docIds, String userId) {
        if (docIds == null) return;
        LocalDateTime now = DateFormatUtil.nowUtcLocalDateTime();
        for (String docId : docIds) {
            if (!StringUtils.hasText(docId)) continue;
            ManualFile mf = new ManualFile();
            mf.setManualId(manualId);
            mf.setDestinationUrl(docId);
            mf.setFileName(extractFileName(docId));
            mf.setFileFormat(extractExtension(docId));
            mf.setFileSize(resolveFileSize(docId));
            mf.setDeletedFlag(false);
            mf.setCreatorUserId(userId);
            mf.setCreatedDateTime(now);
            mf.setUpdaterUserId(userId);
            mf.setUpdatedDateTime(now);
            manualFileRepository.save(mf);
        }
    }

    private BigDecimal resolveFileSize(String docId) {
        try {
            List<String> keys = storageService.listByPrefix(docId);
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
}
