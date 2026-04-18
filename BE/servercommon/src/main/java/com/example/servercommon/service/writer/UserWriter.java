package com.example.servercommon.service.writer;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.validation.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
@Slf4j
public class UserWriter {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // enum ordinal を roleId として使う（SYSTEM_ADMIN=0, EDITOR=1, VIEWER=2, CUSTOM=3）
    private static final int DEFAULT_ROLE_ID = UserRole.VIEWER.getRoleId();

    @Transactional
    public void write(List<UserModel> users, List<ValidationResult<UserModel>> validations) {
        for (ValidationResult<UserModel> result : validations) {
            if (!result.isValid()) {
                log.warn(BackendMessageCatalog.LOG_USER_WRITER_VALIDATION_ERROR, result.getRowNumber(), result.getErrors());
            }
        }

        List<UserModel> preparedUsers = users.stream()
                .map(this::prepareUser)
                .collect(Collectors.toList());

        if (!preparedUsers.isEmpty()) {
            userRepository.saveAll(preparedUsers);
            log.info(BackendMessageCatalog.LOG_USER_WRITER_SAVED, preparedUsers.size());
        } else {
            log.warn(BackendMessageCatalog.LOG_USER_WRITER_NO_VALID_USERS);
        }
    }

    private UserModel prepareUser(UserModel user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRoleId() == null) {
            user.setRoleId(DEFAULT_ROLE_ID);
        }
        return user;
    }
}
