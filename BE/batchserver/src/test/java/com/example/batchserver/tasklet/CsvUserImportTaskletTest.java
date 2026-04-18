package com.example.batchserver.tasklet;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class CsvUserImportTaskletTest {

    @Mock
    private UserService userService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private CsvUserImportTasklet tasklet;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testExecute_withValidCsv_shouldCreateUsers() throws Exception {
        // Arrange
        String csvContent = "username,email,password,role\njohn,john@example.com,pass123,EDITOR";
        InputStream csvStream = new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));

        CsvUserImportTasklet testTasklet = new CsvUserImportTasklet(userService, passwordEncoder) {
            @Override
            protected InputStream getResourceInputStream() {
                return csvStream;
            }
        };

        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        // Act
        RepeatStatus result = testTasklet.execute(mock(StepContribution.class), mock(ChunkContext.class));

        // Assert
        assertThat(result).isEqualTo(RepeatStatus.FINISHED);
        verify(userService, atLeastOnce()).createUser(any(UserModel.class));
    }

    @Test
    void testExecute_withMissingCsv_shouldThrowException() {
        // Arrange
        CsvUserImportTasklet testTasklet = new CsvUserImportTasklet(userService, passwordEncoder) {
            @Override
            protected InputStream getResourceInputStream() {
                return null; // simulate missing file
            }
        };

        // Act & Assert
        assertThrows(IllegalStateException.class,
            () -> testTasklet.execute(mock(StepContribution.class), mock(ChunkContext.class)));
    }
}
