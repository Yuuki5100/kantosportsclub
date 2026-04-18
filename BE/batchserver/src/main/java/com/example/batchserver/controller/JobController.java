package com.example.batchserver.controller;

import com.example.batchserver.model.JobHistoryResponse;
import com.example.batchserver.service.BatchService;
import com.example.servercommon.responseModel.ApiResponse;

import lombok.AllArgsConstructor;

import org.springframework.batch.core.*;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/jobs")
@AllArgsConstructor
public class JobController {

    private final JobExplorer jobExplorer;
    private final BatchService batchService;

    /**
     * 指定したジョブを実行するエンドポイント（例外は GlobalExceptionHandler に委譲）
     */
    @PostMapping("/run/{jobName}")
    public ResponseEntity<ApiResponse<?>> runJob(@PathVariable("jobName") String jobName,@RequestBody Map<String, String> formData)
            throws JobExecutionAlreadyRunningException,
            JobRestartException,
            JobInstanceAlreadyCompleteException,
            JobParametersInvalidException {

        batchService.runJob(jobName,formData);
        return ResponseEntity.ok(ApiResponse.success("ジョブ '" + jobName + "' を起動しました。"));
    }

    /**
     * ジョブの履歴を取得するエンドポイント（例外は GlobalExceptionHandler に委譲）
     */
    @GetMapping("/history")
    public List<JobHistoryResponse> listHistory(
            @RequestParam(defaultValue = "sampleJob") String jobName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<JobInstance> jobInstances = jobExplorer.getJobInstances(jobName, page, size);
        return jobInstances.stream()
                .map(jobExplorer::getJobExecutions)
                .flatMap(List::stream)
                .map(exec -> new JobHistoryResponse(
                        exec.getId(),
                        exec.getJobInstance().getJobName(),
                        exec.getStatus().toString(),
                        exec.getStartTime(),
                        exec.getEndTime(),
                        exec.getExitStatus().getExitDescription()))
                .collect(Collectors.toList());
    }
}
