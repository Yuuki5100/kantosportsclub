package com.example.batchserver.tasklet;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
public class CsvUserImportTasklet implements Tasklet {

    private static final Logger logger = LoggerFactory.getLogger(CsvUserImportTasklet.class);

    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder;

    public CsvUserImportTasklet(UserService userService, BCryptPasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        logger.info(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_START);

        InputStream is = getResourceInputStream();
        if (is == null) {
            logger.error(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_FILE_NOT_FOUND);
            throw new IllegalStateException(BackendMessageCatalog.EX_USERS_CSV_NOT_FOUND);
        }
        logger.info(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_FILE_OPENED);

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            boolean headerSkipped = false;

            while ((line = reader.readLine()) != null) {
                if (!headerSkipped) {
                    headerSkipped = true;
                    logger.info(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_SKIP_HEADER, line);
                    continue;
                }

                logger.info(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_ROW_READ, line);
                String[] parts = line.split(",", -1); // 空カラムも保持
                if (parts.length < 4) {
                    logger.warn(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_COLUMN_SHORTAGE, line);
                    continue;
                }

                String userId = parts[0].trim();
                String email = parts[1].trim();
                String rawPassword = parts[2].trim();
                String roleStr = parts[3].trim();

                if (userId.isEmpty() || email.isEmpty() || rawPassword.isEmpty()) {
                    logger.warn(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_REQUIRED_EMPTY, line);
                    continue;
                }

                UserModel user = new UserModel();
                user.setUserId(userId);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(rawPassword));

                // roleId に寄せる（UserModelがroleId管理前提）
                UserRole role;
                try {
                    role = UserRole.valueOf(roleStr);
                } catch (IllegalArgumentException e) {
                    logger.warn(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_INVALID_ROLE, roleStr);
                    role = UserRole.VIEWER;
                }
                user.setRoleId(role.getRoleId());

                try {
                    userService.createUser(user);
                    logger.info(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_USER_CREATED, user.getUserId());
                } catch (Exception e) {
                    logger.error(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_USER_CREATE_ERROR, user.getUserId(), e.getMessage(), e);
                }
            }
        }

        logger.info(BackendMessageCatalog.LOG_CSV_IMPORT_TASKLET_END);
        return RepeatStatus.FINISHED;
    }

    /**
     * テストで差し替え可能なCSV読み込みメソッド。
     * 本番では resources/input/users.csv を読み込む。
     */
    protected InputStream getResourceInputStream() {
        return getClass().getClassLoader().getResourceAsStream("input/users.csv");
    }
}
