package com.example.appserver.runner;

import java.util.UUID;
import java.util.Locale;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import com.example.appserver.config.AsyncJobProperties;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.AsyncJobStatusService;
import com.example.servercommon.utils.DateFormatUtil;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class ReportTypeJudge {
    private final ReportPollingRunner reportPollingRunner;
    private final BackendMessageResolver messageResolver;
    private final AsyncJobStatusService asyncJobStatusService;
    private final AsyncJobProperties asyncJobProperties;

    public <T> ResponseEntity<ApiResponse<String>> judge(Long reportId, String exportTarget, Locale locale){
        if (reportId == null || exportTarget == null || exportTarget.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4003,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4003, locale)));
        }

        String jobType = resolveJobType(exportTarget);
        if (jobType == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            BackendMessageCatalog.CODE_E4002,
                            messageResolver.resolveError(BackendMessageCatalog.CODE_E4002, locale)));
        }

        String jobName = exportTarget + "-" + UUID.randomUUID();
        LocalDateTime expiresAt = DateFormatUtil.nowUtcLocalDateTime()
                .plusMinutes(asyncJobProperties.getStatusTtlMinutes());
        asyncJobStatusService.registerPending(jobName, jobType, expiresAt);

        switch (exportTarget) {
            case "excelUrl":
                reportPollingRunner.run(reportId, jobName);
                break;
            case "pdfUrl":
                reportPollingRunner.runPDF(reportId, jobName);
                break;
            case "csvUrl":
                reportPollingRunner.runCSV(reportId, jobName);
                break;
            default:
                break;
        }

        return ResponseEntity.ok(new ApiResponse<>(true, jobName, null));
    }

    private String resolveJobType(String exportTarget) {
        return switch (exportTarget) {
            case "excelUrl" -> "REPORT_EXCEL_URL";
            case "pdfUrl" -> "REPORT_PDF_URL";
            case "csvUrl" -> "REPORT_CSV_URL";
            default -> null;
        };
    }
}
