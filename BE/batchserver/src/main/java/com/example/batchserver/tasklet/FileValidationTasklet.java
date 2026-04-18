package com.example.batchserver.tasklet;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.example.servercommon.file.FileToMultipartConverter;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.model.NotifyQueue;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.repository.NotifyQueueRepository;
import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.service.StorageService;
import com.example.servercommon.validationtemplate.GenericFileImporter;
import com.example.servercommon.validationtemplate.mapper.TemplateGetMapper;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class FileValidationTasklet implements Tasklet {

    private final GenericFileImporter genericFileImporter;
    private final ErrorCodeService errorCodeService;
    private final JobStatusRepository jobStatusRepository;
    private final NotifyQueueRepository notifyQueueRepository;
    private final EnvironmentVariableResolver env;
    private final StorageService storageService;
    private final RestTemplate restTemplate;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        JobParameters params = chunkContext.getStepContext().getStepExecution().getJobParameters();

        String templateId = params.getString("templateId");
        String filename = params.getString("fileName");
        String jobName = params.getString("jobName");
        Long refId = params.getLong("refid");
        String locale = params.getString("locale");

        JobStatus status = new JobStatus();
        status.setJobName(jobName);
        status.setJobType(3);
        status.setOriginalFileName(filename);
        status.setStartTime(LocalDateTime.now());

        // 入力バリデーション（Fail-fast）
        if (filename == null || filename.isBlank()) {
            String msg = errorCodeService.getErrorMessage(BackendMessageCatalog.CODE_E4001, locale);
            log.warn(BackendMessageCatalog.LOG_BATCH_INVALID_FILENAME, msg);
            status.setStatus("FAILED");
            status.setMessage(msg);
            status.setEndTime(LocalDateTime.now());
            jobStatusRepository.save(status);
            return RepeatStatus.FINISHED;
        }

        File file = storageService.getFileByPath(filename);

        try (InputStream inputStream = new FileInputStream(file)) {
            MultipartFile multipartFile = FileToMultipartConverter.convert(file);

            ReturnObj result = validateFileDataCheck(templateId, multipartFile, filename, new Locale(locale), jobName,
                    inputStream);

            List<String> errors = result.getErrors();
            List<ValidationResult> results = result.getResults();

            status.setStatus(errors.isEmpty() ? "SUCCESS" : "FAILED");
            status.setMessage(errors.isEmpty()
                    ? BackendMessageCatalog.format(BackendMessageCatalog.MSG_IMPORT_SUCCESS_DETAIL, results.size())
                    : BackendMessageCatalog.format(
                            BackendMessageCatalog.MSG_VALIDATION_FAILED_DETAIL,
                            System.lineSeparator(),
                            String.join("\n", errors)));
            status.setEndTime(LocalDateTime.now());
            jobStatusRepository.save(status);

            log.info(BackendMessageCatalog.LOG_BATCH_RESULT, status.getMessage());

            // websocketにて監視しているテーブルにキューを登録する（FEに通知を出力する）
            NotifyQueue notify = NotifyQueue.builder()
                    .eventType("FILE_UPLOAD_COMPLETED")
                    .refId(refId)
                    .notified(false)
                    .retryCount(0)
                    .createdAt(LocalDateTime.now())
                    .build();

            notifyQueueRepository.save(notify);
        } catch (

        Exception e) {
            log.error(BackendMessageCatalog.LOG_BATCH_FILE_PROCESS_EXCEPTION, e);
            status.setStatus("FAILED");
            status.setMessage(BackendMessageCatalog.format(BackendMessageCatalog.MSG_EXCEPTION_OCCURRED, e.getMessage()));
            status.setEndTime(LocalDateTime.now());
            jobStatusRepository.save(status);
            throw e;
        }
        return RepeatStatus.FINISHED;
    }

    private ReturnObj validateFileDataCheck(String templateId, MultipartFile file, String filename, Locale locale,
            String jobName, InputStream inputStream) throws Exception {
        String basePath = env.getOrDefault("template.schema.base-path", "classpath:config/templates");
        Map<String, TemplateSchema> yamlData = TemplateGetMapper.templateGet(templateId, basePath);
        List<ValidationResult> results = genericFileImporter.importFiles(yamlData, templateId, filename, inputStream);

        log.debug(BackendMessageCatalog.LOG_VALIDATION_RESULT_COUNT, results.size());
        results.forEach(r -> {
            log.debug(BackendMessageCatalog.LOG_VALIDATION_ROW_RESULT, r.getRowNumber(), r.isValid(), r.getErrors());
        });

        List<String> errors = results.stream()
                .filter(r -> !r.isValid())
                .flatMap(r -> r.getErrors().stream()
                        .map(err -> "Row " + r.getRowNumber() + ": " + err.getField() + " - " + err.getMessage()))
                .toList();

        return new ReturnObj(errors, results);
    }

    // DTOは static class または別ファイルにしてもOK
    private static class ReturnObj {
        private final List<String> errors;
        private final List<ValidationResult> results;

        public ReturnObj(List<String> errors, List<ValidationResult> results) {
            this.errors = errors;
            this.results = results;
        }

        public List<String> getErrors() {
            return errors;
        }

        public List<ValidationResult> getResults() {
            return results;
        }
    }
}
