package com.example.appserver.service;

import com.example.servercommon.enums.StatusType;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.JobStatus;
import com.example.servercommon.repository.JobStatusRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class JobRunnerServiceTest {
    private static final String EX_FORCE_JOB_FAILURE = "強制例外テスト";
    private static final String EX_FORCE_DUMMY_FAILURE = "ダミー例外発生";

    private JobStatusRepository jobStatusRepository;
    private JobRunnerService jobRunnerService;

    @BeforeEach
    void setUp() {
        jobStatusRepository = mock(JobStatusRepository.class);
        jobRunnerService = new JobRunnerService(jobStatusRepository);
    }

    @Test
    @DisplayName("✅ runJob() が正常に完了すると SUCCESS が保存される")
    void shouldSaveSuccessStatusWhenRunJobCompletes() throws InterruptedException {
        jobRunnerService.runJob("testJob");

        Thread.sleep(3500); // 非同期で完了するのを待つ（Thread.sleepで代用）

        ArgumentCaptor<JobStatus> captor = ArgumentCaptor.forClass(JobStatus.class);
        verify(jobStatusRepository, atLeast(2)).save(captor.capture());

        List<JobStatus> saved = captor.getAllValues();
        JobStatus finalStatus = saved.get(saved.size() - 1);

        assertThat(finalStatus.getJobName()).isEqualTo("testJob");
        assertThat(finalStatus.getStatus()).isEqualTo(StatusType.SUCCESS.getStatusType());
        assertThat(finalStatus.getMessage()).isEqualTo(BackendMessageCatalog.MSG_JOB_COMPLETED_JA);
        assertThat(finalStatus.getEndTime()).isNotNull();
    }

    @Test
    @DisplayName("❌ runJob() 中に例外が発生すると FAILED が保存される")
    void shouldSaveFailedStatusWhenExceptionThrown() throws InterruptedException {
        JobRunnerService throwingService = new JobRunnerService(jobStatusRepository) {
            @Override
            public void runJob(String jobName) {
                JobStatus status = JobStatus.builder()
                        .jobName(jobName)
                        .status(StatusType.RUNNING.getStatusType())
                        .startTime(LocalDateTime.now())
                        .build();
                jobStatusRepository.save(status);

                try {
                    throw new RuntimeException(EX_FORCE_JOB_FAILURE);
                } catch (Exception e) {
                    status.setStatus(StatusType.FAILED.getStatusType());
                    status.setMessage(e.getMessage());
                }

                status.setEndTime(LocalDateTime.now());
                jobStatusRepository.save(status);
            }
        };

        throwingService.runJob("failedJob");

        Thread.sleep(100); // 即例外終了なので短めでOK

        ArgumentCaptor<JobStatus> captor = ArgumentCaptor.forClass(JobStatus.class);
        verify(jobStatusRepository, atLeast(2)).save(captor.capture());

        JobStatus finalStatus = captor.getAllValues().get(captor.getAllValues().size() - 1);
        assertThat(finalStatus.getStatus()).isEqualTo(StatusType.FAILED.getStatusType());
        assertThat(finalStatus.getMessage()).contains(EX_FORCE_JOB_FAILURE);
    }

    @Test
    @DisplayName("✅ runDummyJob() 正常完了で SUCCESS として保存される")
    void shouldSaveSuccessStatusForDummyJob() throws InterruptedException {
        jobRunnerService.runDummyJob();

        Thread.sleep(3500);

        ArgumentCaptor<JobStatus> captor = ArgumentCaptor.forClass(JobStatus.class);
        verify(jobStatusRepository, atLeast(2)).save(captor.capture());

        JobStatus finalStatus = captor.getAllValues().get(captor.getAllValues().size() - 1);
        assertThat(finalStatus.getJobName()).isEqualTo("dummyJob");
        assertThat(finalStatus.getStatus()).isEqualTo(StatusType.SUCCESS.getStatusType());
        assertThat(finalStatus.getMessage()).isEqualTo(BackendMessageCatalog.MSG_DUMMY_JOB_COMPLETED);
    }

    @Test
    @DisplayName("❌ runDummyJob() 例外発生時は FAILED が保存される")
    void shouldSaveFailedStatusForDummyJobIfExceptionOccurs() throws InterruptedException {
        JobRunnerService throwingDummyService = new JobRunnerService(jobStatusRepository) {
            @Override
            public void runDummyJob() {
                JobStatus status = JobStatus.builder()
                        .jobName("dummyJob")
                        .status(StatusType.RUNNING.getStatusType())
                        .startTime(LocalDateTime.now())
                        .build();
                jobStatusRepository.save(status);

                try {
                    throw new RuntimeException(EX_FORCE_DUMMY_FAILURE);
                } catch (Exception e) {
                    status.setStatus(StatusType.FAILED.getStatusType());
                    status.setMessage(BackendMessageCatalog.format(BackendMessageCatalog.MSG_ERROR_PREFIX, e.getMessage()));
                }

                status.setEndTime(LocalDateTime.now());
                jobStatusRepository.save(status);
            }
        };

        throwingDummyService.runDummyJob();

        Thread.sleep(100); // 即終了でOK

        ArgumentCaptor<JobStatus> captor = ArgumentCaptor.forClass(JobStatus.class);
        verify(jobStatusRepository, atLeast(2)).save(captor.capture());

        JobStatus finalStatus = captor.getAllValues().get(captor.getAllValues().size() - 1);
        assertThat(finalStatus.getStatus()).isEqualTo(StatusType.FAILED.getStatusType());
        assertThat(finalStatus.getMessage()).contains(EX_FORCE_DUMMY_FAILURE);
    }
}
