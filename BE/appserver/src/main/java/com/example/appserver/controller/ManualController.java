package com.example.appserver.controller;

import com.example.appserver.request.manual.ManualCreateRequest;
import com.example.appserver.request.manual.ManualListQuery;
import com.example.appserver.request.manual.ManualUpdateRequest;
import com.example.appserver.response.manual.ManualCreateResponse;
import com.example.appserver.response.manual.ManualListData;
import com.example.appserver.response.manual.ManualUpdateResponse;
import com.example.appserver.response.manual.ManualUploadResponse;
import com.example.appserver.security.RequirePermission;
import com.example.appserver.service.ManualFileUploadService;
import com.example.appserver.service.ManualService;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.StorageService;
import jakarta.validation.Valid;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/manual")
@RequiredArgsConstructor
public class ManualController {

    private static final Set<Integer> TARGET_VALUES = Set.of(0, 1, 2);
    private static final Set<Integer> ISDELETED_VALUES = Set.of(0, 1, 2);
    private final ManualService manualService;
    private final ManualFileUploadService manualFileUploadService;
    private final StorageService storageService;
    private final BackendMessageResolver messageResolver;

    @GetMapping("/list")
    @RequirePermission(permissionId = 5, statusLevelId = 2) // MANUAL, 参照
    public ResponseEntity<?> list(
            @Valid @ModelAttribute ManualListQuery query,
            BindingResult bindingResult,
            Locale locale) {

        if (bindingResult.hasErrors()) {
            String arg = resolveFirstErrorArg(bindingResult);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(BackendMessageCatalog.CODE_E4001, resolveValidationMessage(arg, locale)));
        }

        if (query.getTarget() != null && !TARGET_VALUES.contains(query.getTarget())) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale, BackendMessageCatalog.ARG_TARGET)));
        }
        if (query.getIsdeleted() != null && !ISDELETED_VALUES.contains(query.getIsdeleted())) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    messageResolver.resolveError(
                            BackendMessageCatalog.CODE_E4001, locale, BackendMessageCatalog.ARG_IS_DELETED)));
        }

        ManualListData data = manualService.getList(query);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/create")
    @RequirePermission(permissionId = 5, statusLevelId = 3) // MANUAL, 変更
    public ResponseEntity<?> create(
            @Valid @RequestBody ManualCreateRequest request,
            BindingResult bindingResult,
            Locale locale) {

        if (bindingResult.hasErrors()) {
            String arg = resolveFirstErrorArg(bindingResult);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(BackendMessageCatalog.CODE_E4001, resolveValidationMessage(arg, locale)));
        }

        String userId = manualService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E401,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E401, locale)));
        }

        ManualCreateResponse data = new ManualCreateResponse(
                manualService.create(request, userId).getId());
        return ResponseEntity.ok(data);
    }

    @PostMapping("/upload")
    @RequirePermission(permissionId = 5, statusLevelId = 3) // MANUAL, 変更
    public ResponseEntity<?> upload(
            @RequestParam("files") List<MultipartFile> files,
            Locale locale) {
        try {
            List<String> docIds = manualFileUploadService.uploadFiles(files);
            return ResponseEntity.ok(new ManualUploadResponse(docIds));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale, ex.getMessage())));
        } catch (Exception ex) {
            log.error(BackendMessageCatalog.LOG_MANUAL_UPLOAD_FAILED, ex);
            return ResponseEntity.status(500).body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E5001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E5001, locale)));
        }
    }

    @GetMapping("/download")
    @RequirePermission(permissionId = 5, statusLevelId = 1) // MANUAL, なし
    public ResponseEntity<InputStreamResource> download(@RequestParam("id") String docId) {
        try {
            log.info(BackendMessageCatalog.LOG_MANUAL_DOWNLOAD_REQUESTED, docId);

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
            log.error(BackendMessageCatalog.LOG_MANUAL_DOWNLOAD_FAILED, docId, ex);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/delete/{id}")
    @RequirePermission(permissionId = 5, statusLevelId = 3) // MANUAL, 変更
    public ResponseEntity<?> delete(@PathVariable("id") Long manualId, Locale locale) {
        if (manualId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale, BackendMessageCatalog.ARG_MANUAL_ID)));
        }

        String userId = manualService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E401,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E401, locale)));
        }

        var deletedOpt = manualService.softDelete(manualId, userId);
        if (deletedOpt.isPresent()) {
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.status(404).body(ApiResponse.error(
                BackendMessageCatalog.CODE_E4041,
                messageResolver.resolveError(BackendMessageCatalog.CODE_E4041, locale)));
    }

    @GetMapping("/{id}")
    @RequirePermission(permissionId = 5, statusLevelId = 2) // MANUAL, 参照
    public ResponseEntity<?> detail(
            @PathVariable("id") Long manualId,
            Locale locale) {

        if (manualId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale, BackendMessageCatalog.ARG_MANUAL_ID)));
        }

        var detailOpt = manualService.getDetail(manualId);
        if (detailOpt.isPresent()) {
            return ResponseEntity.ok(detailOpt.get());
        }

        return ResponseEntity.status(404).body(ApiResponse.error(
                BackendMessageCatalog.CODE_E4041,
                messageResolver.resolveError(BackendMessageCatalog.CODE_E4041, locale)));
    }

    @PutMapping("/{id}")
    @RequirePermission(permissionId = 5, statusLevelId = 3) // MANUAL, 変更
    public ResponseEntity<?> update(
            @PathVariable("id") Long manualId,
            @Valid @RequestBody ManualUpdateRequest request,
            BindingResult bindingResult,
            Locale locale) {

        if (bindingResult.hasErrors()) {
            String arg = resolveFirstErrorArg(bindingResult);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(BackendMessageCatalog.CODE_E4001, resolveValidationMessage(arg, locale)));
        }

        String userId = manualService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E401,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E401, locale)));
        }

        var updatedOpt = manualService.update(manualId, request, userId);
        if (updatedOpt.isPresent()) {
            return ResponseEntity.ok(new ManualUpdateResponse(updatedOpt.get().getId()));
        }

        return ResponseEntity.status(404).body(ApiResponse.error(
                BackendMessageCatalog.CODE_E4041,
                messageResolver.resolveError(BackendMessageCatalog.CODE_E4041, locale)));
    }

    private String resolveFirstErrorArg(BindingResult bindingResult) {
        FieldError error = bindingResult.getFieldError();
        if (error == null) return null;
        return error.getField();
    }

    private String resolveValidationMessage(String arg, Locale locale) {
        if (arg == null || arg.isBlank()) {
            return messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale);
        }
        return messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale, arg);
    }

}
