package com.example.appserver.controller;

import com.example.appserver.request.notice.NoticeCreateRequest;
import com.example.appserver.request.notice.NoticeUpdateRequest;
import com.example.appserver.response.notice.NoticeCreateResponse;
import com.example.appserver.response.notice.NoticeDetailResponse;
import com.example.appserver.response.notice.NoticeListResponse;
import com.example.appserver.response.notice.NoticeUpdateResponse;
import com.example.appserver.response.notice.NoticeUploadResponse;
import com.example.appserver.security.RequirePermission;
import com.example.appserver.service.NoticeFileService;
import com.example.appserver.service.NoticeService;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.StorageService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");

    private final NoticeService noticeService;
    private final NoticeFileService noticeFileService;
    private final StorageService storageService;
    private final BackendMessageResolver messageResolver;

    @GetMapping("/list")
    @RequirePermission(permissionId = 4, statusLevelId = 1) // NOTICE, なし
    public ResponseEntity<NoticeListResponse> getList() {
        NoticeListResponse data = noticeService.getList(LocalDate.now(JST));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/notice_id")
    @RequirePermission(permissionId = 4, statusLevelId = 1) // NOTICE, なし
    public ResponseEntity<Object> getDetail(
            @RequestParam("notice_id") Long noticeId,
            java.util.Locale locale) {
        var detailOpt = noticeService.getDetail(noticeId);
        if (detailOpt.isPresent()) {
            return ResponseEntity.ok(detailOpt.get());
        }
        return ResponseEntity.status(404)
                .body(ApiResponse.error(
                        BackendMessageCatalog.CODE_E4041,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E4041, locale)));
    }

    @PostMapping("/create")
    @RequirePermission(permissionId = 4, statusLevelId = 3) // NOTICE, 変更
    public ResponseEntity<?> create(
            @Valid @RequestBody NoticeCreateRequest request,
            BindingResult bindingResult,
            java.util.Locale locale) {

        if (bindingResult.hasErrors()) {
            String arg = resolveFirstErrorArg(bindingResult);
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    resolveValidationMessage(arg, locale)));
        }

        if (noticeService.isInvalidDateRange(request.getStartDate(), request.getEndDate())) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale, BackendMessageCatalog.ARG_START_DATE)));
        }

        String userId = noticeService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E401,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E401, locale)));
        }

        NoticeCreateResponse data = noticeService.create(request, userId);
        return ResponseEntity.ok(data);
    }

    @PutMapping("/notice_id")
    @RequirePermission(permissionId = 4, statusLevelId = 3) // NOTICE, 変更
    public ResponseEntity<Object> update(
            @RequestParam("notice_id") Long noticeId,
            @Valid @RequestBody NoticeUpdateRequest request,
            BindingResult bindingResult,
            java.util.Locale locale) {

        if (bindingResult.hasErrors()) {
            String arg = resolveFirstErrorArg(bindingResult);
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    resolveValidationMessage(arg, locale)));
        }

        if (noticeService.isInvalidDateRange(request.getStartDate(), request.getEndDate())) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale, BackendMessageCatalog.ARG_START_DATE)));
        }

        String userId = noticeService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E401,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E401, locale)));
        }

        var updatedOpt = noticeService.update(noticeId, request, userId);
        if (updatedOpt.isPresent()) {
            return ResponseEntity.ok(updatedOpt.get());
        }
        return ResponseEntity.status(404)
                .body(ApiResponse.error(
                        BackendMessageCatalog.CODE_E4041,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E4041, locale)));
    }

    @PostMapping("/upload")
    @RequirePermission(permissionId = 4, statusLevelId = 3) // NOTICE, 変更
    public ResponseEntity<?> upload(
            @RequestParam("files") List<MultipartFile> files,
            java.util.Locale locale) {
        try {
            List<String> docIds = noticeFileService.uploadFiles(files);
            return ResponseEntity.ok(new NoticeUploadResponse(docIds));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4002,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4002, locale, ex.getMessage())));
        } catch (Exception ex) {
            log.error(BackendMessageCatalog.LOG_NOTICE_UPLOAD_FAILED, ex);
            return ResponseEntity.status(500).body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E5001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E5001, locale)));
        }
    }

    @GetMapping("/download")
    @RequirePermission(permissionId = 4, statusLevelId = 1) // NOTICE, なし
    public ResponseEntity<InputStreamResource> download(
            @RequestParam("id") String docId,
            HttpServletResponse response) {
        return downloadInternal(docId, response);
    }

    private String resolveFirstErrorArg(BindingResult bindingResult) {
        FieldError error = bindingResult.getFieldError();
        if (error == null) return null;
        String field = error.getField();
        return switch (field) {
            case "noticeTitle" -> "notice_title";
            case "startDate" -> "start_date";
            case "endDate" -> "end_date";
            case "contents" -> "contents";
            default -> field;
        };
    }

    private ResponseEntity<InputStreamResource> downloadInternal(String docId, HttpServletResponse response) {
        try {
            log.info(BackendMessageCatalog.LOG_NOTICE_DOWNLOAD_REQUESTED, docId);

            // docId format: "notice/{uuid}-{originalName}" — extract UUID to search by prefix
            String searchPrefix = docId;
            if (docId.contains("/")) {
                searchPrefix = docId.substring(0, docId.lastIndexOf('/') + 1);
                String nameAfterSlash = docId.substring(docId.lastIndexOf('/') + 1);
                if (nameAfterSlash.length() >= 36) {
                    searchPrefix += nameAfterSlash.substring(0, 36);
                }
            }

            log.info(BackendMessageCatalog.LOG_SEARCH_FILE_PREFIX, searchPrefix);
            List<String> keys = storageService.listByPrefix(searchPrefix);
            if (keys.isEmpty()) {
                log.warn(BackendMessageCatalog.LOG_FILE_NOT_FOUND_BY_PREFIX, searchPrefix);
                return ResponseEntity.status(404).build();
            }

            String fileKey = keys.get(0);
            log.info(BackendMessageCatalog.LOG_FOUND_FILE_KEY, fileKey);
            File file = storageService.getFileByPath(fileKey);

            if (file == null || !file.exists()) {
                log.warn(BackendMessageCatalog.LOG_FILE_NOT_FOUND, fileKey);
                return ResponseEntity.status(404).build();
            }

            InputStream is = new FileInputStream(file);
            InputStreamResource resource = new InputStreamResource(is);

            // Extract original filename from the stored key
            String fileName = fileKey;
            int slashIdx = fileName.lastIndexOf('/');
            if (slashIdx >= 0) {
                fileName = fileName.substring(slashIdx + 1);
            }
            if (fileName.length() > 37) {
                fileName = fileName.substring(37);
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentLength(file.length())
                    .body(resource);
        } catch (Exception ex) {
            log.error(BackendMessageCatalog.LOG_NOTICE_DOWNLOAD_FAILED, docId, ex);
            return ResponseEntity.status(500).build();
        }
    }

    private String resolveValidationMessage(String arg, java.util.Locale locale) {
        if (arg == null || arg.isBlank()) {
            return messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale);
        }
        return messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale, arg);
    }
}
