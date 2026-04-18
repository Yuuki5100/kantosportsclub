package com.example.appserver.runner;

import com.example.servercommon.enums.StatusType;
import com.example.servercommon.file.FileNameResolver;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.config.EnvironmentVariableResolver;
import com.example.servercommon.validationtemplate.GenericFileImporter;
import com.example.servercommon.validationtemplate.mapper.TemplateGetMapper;
import com.example.servercommon.validationtemplate.rule.ValidationResult;
import com.example.servercommon.validationtemplate.schema.TemplateSchema;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileImportRunner {

    private final JobStatusRepository jobStatusRepository;
    private final FileSaver fileSaver;
    private final GenericFileImporter genericFileImporter;
    private final EnvironmentVariableResolver env;

    public void run(MultipartFile file, String jobName, String templateId) throws Exception {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            log.error(BackendMessageCatalog.LOG_FILE_IMPORT_RUNNER_INVALID_FILENAME);
            return;
        }

        String savedFileName = FileNameResolver.resolveWithDate(originalFilename);

        try {
            String basePath = env.getOrDefault("template.schema.base-path", "classpath:config/templates");
            Map<String, TemplateSchema> yamlData = TemplateGetMapper.templateGet(templateId, basePath);
            byte[] fileBytes = file.getBytes();
            fileSaver.save(savedFileName, new ByteArrayInputStream(fileBytes));

            List<ValidationResult> results = genericFileImporter.importFiles(yamlData, templateId, savedFileName,
                    new ByteArrayInputStream(fileBytes));

            StringBuilder messageBuilder = new StringBuilder();
            results.forEach(result -> {
                if (!result.isValid()) {
                    result.getErrors().forEach(error -> {
                        messageBuilder.append("Row ")
                                .append(result.getRowNumber())
                                .append(": ")
                                .append(error.getMessage())
                                .append("\n");
                    });
                }
            });

            boolean hasError = results.stream().anyMatch(r -> !r.isValid());
            String status = hasError ? StatusType.FAILED.getStatusType() : StatusType.SUCCESS.getStatusType();

            JobStatus jobStatus = new JobStatus();
            jobStatus.setJobName(jobName);
            jobStatus.setOriginalFileName(originalFilename);
            jobStatus.setStatus(status);
            jobStatus.setStartTime(LocalDateTime.now());
            jobStatus.setEndTime(LocalDateTime.now());
            jobStatus.setJobType(3);
            jobStatus.setMessage(messageBuilder.toString().trim());

            jobStatusRepository.save(jobStatus);
            log.info(BackendMessageCatalog.LOG_FILE_IMPORT_RUNNER_COMPLETED, jobName, status);
        } catch (ClassNotFoundException e) {
            log.error(BackendMessageCatalog.LOG_FILE_IMPORT_RUNNER_CLASS_NOT_FOUND, e.getMessage(), e);
        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_FILE_IMPORT_RUNNER_FILE_ERROR, originalFilename, e);
        }
    }
}
