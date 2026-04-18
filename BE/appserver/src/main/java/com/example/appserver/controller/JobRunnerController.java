package com.example.appserver.controller;

import com.example.appserver.service.JobRunnerService;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/batch-runner")
@RequiredArgsConstructor
public class JobRunnerController {

    private final JobRunnerService jobRunnerService;

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<String>> startJob(@RequestParam("jobName") String jobName) {
        if (jobName == null || jobName.isBlank()) {
            throw new IllegalArgumentException(BackendMessageCatalog.EX_JOB_NAME_REQUIRED);
        }
        jobRunnerService.runJob(jobName);
        return ResponseEntity.ok(ApiResponse.success(
                BackendMessageCatalog.format(BackendMessageCatalog.MSG_JOB_EXECUTION_STARTED, jobName)));
    }

    @PostMapping("/dummy")
    public ResponseEntity<ApiResponse<String>> runDummyJob() {
        log.info(BackendMessageCatalog.LOG_DUMMY_JOB_REQUEST);
        jobRunnerService.runDummyJob();
        return ResponseEntity.ok(ApiResponse.success(BackendMessageCatalog.MSG_DUMMY_JOB_EXECUTION_STARTED));
    }
}
