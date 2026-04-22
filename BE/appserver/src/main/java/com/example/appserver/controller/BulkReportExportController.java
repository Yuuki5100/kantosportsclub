package com.example.appserver.controller;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.request.report.BulkExportRequest;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.BulkReportExportService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Locale;

@RestController
@RequestMapping("/api/report/export")
@RequiredArgsConstructor
public class BulkReportExportController {

    private final BulkReportExportService exportService;
    private final BackendMessageResolver messageResolver;

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<String>> exportBulk(@RequestBody @Valid BulkExportRequest request, Locale locale) {
        try {
            String url = exportService.exportBulk(request);
            return ResponseEntity.ok(new ApiResponse<>(true, url, null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E500,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E500, locale)));
        }
    }
}
