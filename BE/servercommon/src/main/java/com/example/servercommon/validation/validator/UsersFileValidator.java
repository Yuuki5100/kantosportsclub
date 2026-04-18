package com.example.servercommon.validation.validator;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.FileValidator;
import com.example.servercommon.validation.ValidationResult;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Component("usersFileValidator")
public class UsersFileValidator implements FileValidator<UserModel> {

    private final ErrorCodeService errorCodeService;
    private static final String DEFAULT_LOCALE = "ja";

    // enum ordinal を roleId として使う（SYSTEM_ADMIN=0, EDITOR=1, VIEWER=2, CUSTOM=3）
    private static final int DEFAULT_ROLE_ID = UserRole.VIEWER.getRoleId();

    @Override
    public List<ValidationResult<UserModel>> validate(InputStream inputStream) {
        List<ValidationResult<UserModel>> results = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreEmptyLines()
                     .parse(reader)) {

            int rowNum = 1;

            for (CSVRecord record : parser) {
                if (record.size() != parser.getHeaderMap().size()) {
                    throw new IllegalArgumentException(BackendMessageCatalog.EX_COLUMN_COUNT_MISMATCH);
                }
                UserModel user = new UserModel();
                ValidationResult<UserModel> result = new ValidationResult<>(user, rowNum++);

                String userId = record.get("username"); // 既存ヘッダ互換：username列をuserIdとして使う
                String password = record.get("password");
                String email = record.get("email");
                String roleStr = null;

                // role列がある前提（無い場合もあるので例外回避）
                try {
                    roleStr = record.get("role");
                } catch (IllegalArgumentException ignore) {
                    // role列が無い場合はデフォにする
                }

                user.setUserId(userId);
                user.setPassword(password);
                user.setEmail(email);

                if (userId == null || userId.trim().isEmpty()) {
                    result.addError(errorCodeService.getErrorMessage("E8001", DEFAULT_LOCALE));
                }
                if (password == null || password.trim().isEmpty()) {
                    result.addError(errorCodeService.getErrorMessage("E8002", DEFAULT_LOCALE));
                }
                if (email == null || !email.contains("@")) {
                    result.addError(errorCodeService.getErrorMessage("E8003", DEFAULT_LOCALE));
                }

                // roleId決定：role列が無い or 空なら VIEWER
                Integer roleId = DEFAULT_ROLE_ID;

                // role列が "VIEWER" 等のenum名で来る想定に寄せる（これが一番安全）
                if (roleStr != null && !roleStr.trim().isEmpty()) {
                    try {
                        roleId = UserRole.valueOf(roleStr.trim()).getRoleId();
                    } catch (IllegalArgumentException e) {
                        result.addError(errorCodeService.getErrorMessage("E8004", DEFAULT_LOCALE));
                    }
                }

                user.setRoleId(roleId);

                results.add(result);
            }

        } catch (RuntimeException e) {
            throw new RuntimeException(errorCodeService.getErrorMessage("E8006", DEFAULT_LOCALE), e);
        } catch (Exception e) {
            throw new RuntimeException(errorCodeService.getErrorMessage("E8007", DEFAULT_LOCALE), e);
        }

        return results;
    }
}
