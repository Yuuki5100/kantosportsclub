package com.example.appserver.service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.validationtemplate.GenericFileImporter;
import com.example.servercommon.validationtemplate.mapper.TemplateGetMapper;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FileImportService {

    private final ErrorCodeService errorCodeService;
    private final GenericFileImporter genericFileImporter;
    private final JobStatusRepository jobStatusRepository;
    private final EnvironmentVariableResolver env;

    public FileImportService(ErrorCodeService errorCodeService,
                             GenericFileImporter genericFileImporter,
                             JobStatusRepository jobStatusRepository,
                             EnvironmentVariableResolver env) {
        this.errorCodeService = errorCodeService;
        this.genericFileImporter = genericFileImporter;
        this.jobStatusRepository = jobStatusRepository;
        this.env = env;
    }

    public ResponseEntity<ApiResponse<?>> fileUpload(String templateId, MultipartFile file, String filename,
                                                     Locale locale, String jobName) {
        JobStatus status = new JobStatus();

        try (InputStream inputStream = file.getInputStream()) {

            if (filename == null || filename.isBlank()) {
                String msg = errorCodeService.getErrorMessage(
                        BackendMessageCatalog.CODE_E4001, locale.getLanguage());
                ApiResponse<?> errorResp = ApiResponse.error(
                        BackendMessageCatalog.CODE_E4001,
                        msg + BackendMessageCatalog.MSG_INVALID_FILE_NAME_SUFFIX);
                return ResponseEntity.badRequest().body(errorResp);
            }

            ReturnObj returnObj = validateFileDataCheck(templateId, file, filename, locale, jobName, inputStream);

            List<String> errors = returnObj.getErrors();
            if (errors == null)
                errors = Collections.emptyList();

            List<ValidationResult> results = returnObj.getResults();
            if (results == null)
                results = Collections.emptyList();

            status.setJobName(jobName);
            status.setJobType(3);
            status.setOriginalFileName(filename);
            // TODO(timezone): replace LocalDateTime.now() with UTC clock/provider before persisting.
            status.setStartTime(LocalDateTime.now());
            status.setStatus(errors.isEmpty() ? "SUCCESS" : "FAILED");
            status.setMessage(errors.isEmpty()
                    ? BackendMessageCatalog.format(BackendMessageCatalog.MSG_IMPORT_SUCCESS_DETAIL, results.size())
                    : BackendMessageCatalog.format(
                            BackendMessageCatalog.MSG_VALIDATION_FAILED_DETAIL,
                            System.lineSeparator(),
                            String.join("\n", errors)));
            // TODO(timezone): replace LocalDateTime.now() with UTC clock/provider before persisting.
            status.setEndTime(LocalDateTime.now());
            jobStatusRepository.save(status);

            if (!errors.isEmpty()) {
                String msg = errorCodeService.getErrorMessage(
                        BackendMessageCatalog.CODE_E4001, locale.getLanguage());
                String errorMessage = (msg == null || msg.isBlank()) ? BackendMessageCatalog.MSG_UNKNOWN_ERROR_JA : msg;
                errorMessage += ":\n" + String.join("\n", errors);
                return ResponseEntity.badRequest().body(ApiResponse.error(BackendMessageCatalog.CODE_E4001, errorMessage));
            }

            String successMessage = BackendMessageCatalog.format(BackendMessageCatalog.MSG_IMPORT_SUCCESS, jobName);
            ApiResponse<?> successResp = ApiResponse.success(successMessage);
            log.debug(BackendMessageCatalog.LOG_API_RESPONSE_MESSAGE, successResp.getMessage());

            return ResponseEntity.ok(successResp);

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_FILE_UPLOAD_PROCESS_ERROR, e);
            String msg = errorCodeService.getErrorMessage(BackendMessageCatalog.CODE_E5001, locale.getLanguage());
            if (msg == null || msg.isBlank())
                msg = BackendMessageCatalog.MSG_INTERNAL_ERROR_JA;

            status.setJobName(jobName);
            status.setJobType(3);
            status.setOriginalFileName(filename);
            // TODO(timezone): replace LocalDateTime.now() with UTC clock/provider before persisting.
            status.setStartTime(LocalDateTime.now());
            status.setStatus("FAILED");
            status.setMessage(BackendMessageCatalog.format(BackendMessageCatalog.MSG_EXCEPTION_OCCURRED, e.getMessage()));
            // TODO(timezone): replace LocalDateTime.now() with UTC clock/provider before persisting.
            status.setEndTime(LocalDateTime.now());
            jobStatusRepository.save(status);

            ApiResponse<?> errorResp = ApiResponse.error(BackendMessageCatalog.CODE_E5001, msg);
            return ResponseEntity.internalServerError().body(errorResp);
        }
    }

    private ReturnObj validateFileDataCheck(String templateId, MultipartFile file, String filename, Locale locale,
                                            String jobName, InputStream inputStream) throws Exception {

        ReturnObj returnObj = new ReturnObj();

        String basePath = env.getOrDefault("template.schema.base-path", "classpath:config/templates");
        Map<String, TemplateSchema> yamlData = TemplateGetMapper.templateGet(templateId, basePath);
        if (yamlData == null)
            yamlData = Collections.emptyMap();

        List<ValidationResult> results = genericFileImporter.importFiles(yamlData, templateId, filename, inputStream);
        if (results == null)
            results = Collections.emptyList();

        returnObj.setResults(results);

        log.debug(BackendMessageCatalog.LOG_VALIDATION_RESULT_COUNT, results.size());
        results.forEach(r -> log.debug(BackendMessageCatalog.LOG_VALIDATION_ROW_RESULT,
                r.getRowNumber(), r.isValid(), r.getErrors()));

        List<String> errors = new ArrayList<>();
        for (ValidationResult r : results) {
            if (!r.isValid() && r.getErrors() != null) {
                r.getErrors().forEach(err -> errors
                        .add("Row " + r.getRowNumber() + ": " + err.getField() + " - " + err.getMessage()));
            }
        }

        returnObj.setErrors(errors);

        return returnObj;
    }

    @Data
    private class ReturnObj {
        private List<String> errors = new ArrayList<>();
        private List<ValidationResult> results = new ArrayList<>();
    }
}
