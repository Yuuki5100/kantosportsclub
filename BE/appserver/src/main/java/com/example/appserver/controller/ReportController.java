// src/main/java/com/example/appserver/controller/ReportController.java
package com.example.appserver.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.appserver.request.report.ReportJobRequest;
import com.example.appserver.runner.ReportTypeJudge;
import com.example.servercommon.enums.AsyncJobExecutionStatus;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.model.AsyncJobExecution;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.AsyncJobArtifactService;
import com.example.servercommon.service.AsyncJobStatusService;
import com.example.servercommon.service.ReportService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/report")
public class ReportController {

    private ReportService reportService;
    private ReportTypeJudge reportTypeJudge;
    private JobStatusRepository jobStatusRepository;
    private BackendMessageResolver messageResolver;
    private AsyncJobStatusService asyncJobStatusService;
    private AsyncJobArtifactService asyncJobArtifactService;

    public ReportController(
            ReportService reportService,
            ReportTypeJudge reportTypeJudge,
            JobStatusRepository jobStatusRepository,
            BackendMessageResolver messageResolver,
            AsyncJobStatusService asyncJobStatusService,
            AsyncJobArtifactService asyncJobArtifactService) {
        this.reportService = reportService;
        this.reportTypeJudge = reportTypeJudge;
        this.jobStatusRepository = jobStatusRepository;
        this.messageResolver = messageResolver;
        this.asyncJobStatusService = asyncJobStatusService;
        this.asyncJobArtifactService = asyncJobArtifactService;
    }

    /** 帳票マスター一覧取得（GET） */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<ReportMaster>>> getReportMaster() {
        List<ReportMaster> reports = reportService.getAllReports();
        if (reports == null || reports.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new ApiResponse<>(true, reports, null));
    }

    /**
     * 帳票ファイル取得（Excel / PDF）POST: /report/export/excel/file or
     * /report/export/pdf/file
     */
    @PostMapping("/export/{type}/file")
    public ResponseEntity<ApiResponse<String>> exportFile(
            @PathVariable("type") String type,
            @RequestBody ReportJobRequest request,
            Locale locale) {
        Long reportId = request.getReportId();
        String result;

        switch (type) {
            case "excel":
                result = reportService.generateReportBase64(reportId);
                break;
            case "pdf":
                result = reportService.generateReportPDFBase64(reportId);
                break;
            default:
                return ResponseEntity.badRequest().body(ApiResponse.error(
                        BackendMessageCatalog.CODE_E4002,
                        messageResolver.resolveError(BackendMessageCatalog.CODE_E4002, locale)));
        }

        if (result == null || result.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    BackendMessageCatalog.CODE_E4001,
                    messageResolver.resolveError(BackendMessageCatalog.CODE_E4001, locale)));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, result, null));
    }

    /** 帳票URLジョブキック（POST）: /report/job */
    @PostMapping("/job")
    public ResponseEntity<ApiResponse<String>> startExportJob(@RequestBody ReportJobRequest request, Locale locale) {
        Long reportId = request.getReportId();
        String exportTarget = request.getExportTarget();
        return reportTypeJudge.judge(reportId, exportTarget, locale);
    }

    /** ジョブステータスのポーリング（GET） */
    @GetMapping("/polling/{jobName}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPollingStatus(
            @PathVariable("jobName") String jobName) {
        String status = "NONE";
        String url = "";

        AsyncJobExecution execution = asyncJobStatusService.findByJobName(jobName).orElse(null);
        if (execution != null) {
            status = normalizeAsyncStatus(execution.getStatus());
            if ("COMPLETED".equals(status)) {
                url = resolveDownloadUrl(jobName, execution.getArtifactPath());
            }
        } else {
            JobStatus persisted = jobStatusRepository.findByJobName(jobName).orElse(null);
            if (persisted != null) {
                status = normalizeLegacyStatus(persisted.getStatus());
                if ("COMPLETED".equals(status)) {
                    url = resolveDownloadUrl(jobName, null);
                }
            }
        }

        Map<String, String> result = new HashMap<>();
        result.put("status", status);
        result.put("url", url);

        return ResponseEntity.ok(new ApiResponse<>(true, result, null));
    }

    private String extractExportTarget(String jobName) {
        if (jobName == null) {
            return null;
        }
        int idx = jobName.indexOf('-');
        if (idx <= 0) {
            return null;
        }
        return jobName.substring(0, idx);
    }

    private String normalizeLegacyStatus(String status) {
        if (status == null || status.isBlank()) {
            return "NONE";
        }
        if ("SUCCESS".equalsIgnoreCase(status)) {
            return "COMPLETED";
        }
        return status;
    }

    private String normalizeAsyncStatus(AsyncJobExecutionStatus status) {
        if (status == null) {
            return "NONE";
        }
        return switch (status) {
            case PENDING, RUNNING -> "RUNNING";
            case COMPLETED -> "COMPLETED";
            case FAILED -> "FAILED";
            case EXPIRED -> "EXPIRED";
        };
    }

    private String resolveDownloadUrl(String jobName, String artifactPath) {
        if (artifactPath != null && !artifactPath.isBlank()) {
            try {
                var presignedUrl = asyncJobArtifactService.generateDownloadUrl(artifactPath);
                if (presignedUrl != null) {
                    return presignedUrl.toString();
                }
            } catch (Exception e) {
                log.warn(BackendMessageCatalog.LOG_REPORT_URL_REGENERATE_FAILED, jobName, e.getMessage());
            }
        }

        String exportTarget = extractExportTarget(jobName);
        if (exportTarget == null) {
            return "";
        }
        try {
            return reportService.generatePresignedUrlByJobName(exportTarget, jobName);
        } catch (Exception e) {
            log.warn(BackendMessageCatalog.LOG_REPORT_URL_REGENERATE_FAILED, jobName, e.getMessage());
            return "";
        }
    }

    @PostMapping("/download/{type}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String type,
            @RequestBody ReportJobRequest request) {
        byte[] fileBytes;
        String fileName;

        switch (type.toLowerCase()) {
            case "excel":
                fileBytes = reportService.generateReportBytes(
                        request.getReportId(), reportService::generateReportExcel, BackendMessageCatalog.EXCEL_GENERATION_FAILED);
                fileName = request.getExportTarget() + ".xlsx";
                break;
            case "pdf":
                fileBytes = reportService.generateReportBytes(
                        request.getReportId(), reportService::generateReportPDF, BackendMessageCatalog.PDF_GENERATION_FAILED);
                fileName = request.getExportTarget() + ".pdf";
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        ByteArrayResource resource = new ByteArrayResource(fileBytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(fileBytes.length)
                .body(resource);
    }
}
