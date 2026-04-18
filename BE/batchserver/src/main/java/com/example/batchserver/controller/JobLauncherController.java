package com.example.batchserver.controller;

import com.example.servercommon.exception.InvalidJobNameException;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;

import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.JobRegistry;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.NoSuchJobException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/batch-jobs")
public class JobLauncherController {

    private final JobLauncher jobLauncher;
    private final JobRegistry jobRegistry;

    public JobLauncherController(JobLauncher jobLauncher, JobRegistry jobRegistry) {
        this.jobLauncher = jobLauncher;
        this.jobRegistry = jobRegistry;
    }

    /**
     * 任意のジョブ名で起動（パラメータなし or timestampのみ）
     */
    @PostMapping("/run/{jobName}")
    public ApiResponse<Void> runJob(@PathVariable String jobName) {
        try {
            Job job = jobRegistry.getJob(jobName);
            jobLauncher.run(job, new JobParameters());
            return ApiResponse.success(null);
        } catch (NoSuchJobException e) {
            throw new InvalidJobNameException(BackendMessageCatalog.format(BackendMessageCatalog.EX_JOB_NOT_FOUND, jobName));
        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.format(BackendMessageCatalog.EX_JOB_LAUNCH_FAILED, e.getMessage()), e);
        }
    }

}
