package com.example.appserver.testconfig;

import com.example.appserver.runner.FileImportRunner;
import com.example.servercommon.notification.TeamsNotificationService;
import com.example.servercommon.repository.JobStatusRepository;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.FileValidatorDispatcher;
import com.example.servercommon.service.ImportJobExecutor;
import com.example.servercommon.service.writer.UserWriter;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

/**
 * @TestConfiguration を使って @WebMvcTest のみに適用されるよう制限
 */
@TestConfiguration
public class MockBeansForWebMvcTest {

    @Bean
    public FileImportRunner fileImportRunner() {
        return Mockito.mock(FileImportRunner.class);
    }

    @Bean
    public FileValidatorDispatcher fileValidatorDispatcher() {
        return Mockito.mock(FileValidatorDispatcher.class);
    }

    @Bean
    public ErrorCodeService errorCodeService() {
        return Mockito.mock(ErrorCodeService.class);
    }

    @Bean
    public TeamsNotificationService teamsNotificationService() {
        return Mockito.mock(TeamsNotificationService.class);
    }

    @Bean
    public ImportJobExecutor importJobExecutor() {
        return Mockito.mock(ImportJobExecutor.class);
    }

    @Bean
    public UserWriter userWriter() {
        return Mockito.mock(UserWriter.class);
    }

    @Bean
    public JobStatusRepository jobStatusRepository() {
        return Mockito.mock(JobStatusRepository.class);
    }

}
