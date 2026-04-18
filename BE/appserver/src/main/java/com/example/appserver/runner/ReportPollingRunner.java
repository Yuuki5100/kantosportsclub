package com.example.appserver.runner;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.example.appserver.config.AsyncJobProperties;
import com.example.appserver.service.NotifyQueuePublisherImpl;
import com.example.servercommon.enums.NotifyEventType;
import com.example.servercommon.enums.StatusType;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.service.AsyncJobArtifactService;
import com.example.servercommon.service.AsyncJobStatusService;
import com.example.servercommon.service.ReportService;
import com.example.servercommon.utils.DateFormatUtil;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.function.BiFunction;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@AllArgsConstructor
public class ReportPollingRunner {
    private final ReportService reportService;
    private final NotifyQueuePublisherImpl notifyQueuePublisherImpl;
    private final JobStatusRepository jobStatusRepository;
    private final AsyncJobStatusService asyncJobStatusService;
    private final AsyncJobArtifactService asyncJobArtifactService;
    private final AsyncJobProperties asyncJobProperties;

    @Async
    public void run(Long reportId, String jobName) {
        runUrlExport(
                reportId,
                jobName,
                "REPORT_EXCEL_URL",
                "excel/" + jobName + ".xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                reportService::generateReportDownloadUrl);
    }

    @Async
    public void runPDF(Long reportId, String jobName) {
        runUrlExport(
                reportId,
                jobName,
                "REPORT_PDF_URL",
                "pdf/" + jobName + ".pdf",
                "application/pdf",
                reportService::generateReportPDFDownloadUrl);
    }

    @Async
    public void runCSV(Long reportId, String jobName) {
        // 現行仕様では csvUrl も PDF 生成系を再利用する
        runUrlExport(
                reportId,
                jobName,
                "REPORT_CSV_URL",
                "pdf/" + jobName + ".pdf",
                "application/pdf",
                reportService::generateReportPDFDownloadUrl);
    }

    // minioに存在するテンプレートファイルに、DBのデータをマッピングして帳票出力する
    // VPN等接続が必要な場合がありますので、注意してください
    @Async
    public void runFileOutput(Long reportId, String fileName, String extension, String jobName) {
        LocalDateTime startTime = LocalDateTime.now();
        String normalizedExtension = normalizeExtension(extension);
        String artifactPath = buildArtifactPath(jobName, normalizedExtension);
        String artifactMimeType = resolveMimeType(normalizedExtension);

        try {
            asyncJobStatusService.markRunning(
                    jobName,
                    "REPORT_FILE_" + normalizedExtension.toUpperCase(Locale.ROOT),
                    resolveDefaultExpiresAt());
            persistJobStatus(jobName, StatusType.RUNNING.getStatusType(), null, startTime, null);

            // 帳票生成処理（InputStreamを取得）
            try (InputStream inputStream = reportService.generateReportPDF(reportId, fileName, extension)) {
                asyncJobArtifactService.save(artifactPath, inputStream);
            }

            // 必要であれば通知
            notifyBuildQueueRegister(reportId);

            asyncJobStatusService.markCompleted(
                    jobName,
                    artifactPath,
                    artifactMimeType,
                    DateFormatUtil.nowUtcLocalDateTime());
            persistJobStatus(jobName, StatusType.SUCCESS.getStatusType(), null, startTime, LocalDateTime.now());
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_REPORT_POLLING_ERROR, e.getMessage(), e);
            asyncJobArtifactService.deleteQuietly(artifactPath);
            markFailedQuietly(jobName, e);
            persistJobStatus(jobName, StatusType.FAILED.getStatusType(), e.getMessage(), startTime, LocalDateTime.now());
        }
    }

    private void notifyBuildQueueRegister(Long reportId) {
        notifyQueuePublisherImpl.publish(NotifyEventType.FILE_DOWNLOAD_COMPLETED, reportId);
    }

    private void persistJobStatus(
            String jobName,
            String status,
            String message,
            LocalDateTime startTime,
            LocalDateTime endTime
    ) {
        JobStatus existing = jobStatusRepository.findByJobName(jobName).orElse(null);
        LocalDateTime resolvedStartTime = startTime;
        if (existing != null && existing.getStartTime() != null) {
            resolvedStartTime = existing.getStartTime();
        }
        if (resolvedStartTime == null) {
            resolvedStartTime = LocalDateTime.now();
        }

        JobStatus updated = JobStatus.builder()
                .id(existing != null ? existing.getId() : null)
                .jobName(jobName)
                .jobType(existing != null ? existing.getJobType() : null)
                .originalFileName(existing != null ? existing.getOriginalFileName() : null)
                .status(status)
                .message(truncate(message, 255))
                .startTime(resolvedStartTime)
                .endTime(endTime)
                .build();

        jobStatusRepository.save(updated);
    }

    private void runUrlExport(
            Long reportId,
            String jobName,
            String jobType,
            String artifactPath,
            String artifactMimeType,
            BiFunction<Long, String, String> downloadUrlGenerator
    ) {
        LocalDateTime startTime = LocalDateTime.now();
        try {
            asyncJobStatusService.markRunning(jobName, jobType, resolveDefaultExpiresAt());
            persistJobStatus(jobName, StatusType.RUNNING.getStatusType(), null, startTime, null);

            downloadUrlGenerator.apply(reportId, jobName);
            notifyBuildQueueRegister(reportId);

            asyncJobStatusService.markCompleted(
                    jobName,
                    artifactPath,
                    artifactMimeType,
                    DateFormatUtil.nowUtcLocalDateTime());
            persistJobStatus(jobName, StatusType.SUCCESS.getStatusType(), null, startTime, LocalDateTime.now());
        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_REPORT_POLLING_ERROR, e.getMessage(), e);
            asyncJobArtifactService.deleteQuietly(artifactPath);
            markFailedQuietly(jobName, e);
            persistJobStatus(jobName, StatusType.FAILED.getStatusType(), e.getMessage(), startTime, LocalDateTime.now());
        }
    }

    private void markFailedQuietly(String jobName, Exception error) {
        try {
            asyncJobStatusService.markFailed(
                    jobName,
                    truncate(error != null ? error.getMessage() : null, 1000),
                    DateFormatUtil.nowUtcLocalDateTime());
        } catch (Exception ex) {
            log.warn(BackendMessageCatalog.LOG_JOB_RUN_FAILED, jobName, ex.getMessage());
        }
    }

    private LocalDateTime resolveDefaultExpiresAt() {
        return DateFormatUtil.nowUtcLocalDateTime().plusMinutes(asyncJobProperties.getStatusTtlMinutes());
    }

    private String buildArtifactPath(String jobName, String extension) {
        String prefix = asyncJobProperties.getArtifactPrefix();
        if (prefix == null || prefix.isBlank()) {
            prefix = "async-jobs";
        }
        String normalizedPrefix = prefix.endsWith("/") ? prefix.substring(0, prefix.length() - 1) : prefix;
        return normalizedPrefix + "/" + jobName + "." + extension;
    }

    private String normalizeExtension(String extension) {
        if (extension == null || extension.isBlank()) {
            return "pdf";
        }
        String trimmed = extension.trim();
        if (trimmed.startsWith(".")) {
            trimmed = trimmed.substring(1);
        }
        if (trimmed.isBlank()) {
            return "pdf";
        }
        return trimmed.toLowerCase(Locale.ROOT);
    }

    private String resolveMimeType(String extension) {
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "csv" -> "text/csv";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            default -> "application/octet-stream";
        };
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
