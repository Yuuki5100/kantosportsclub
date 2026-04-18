package com.example.servercommon.service.reader;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.UserValidator;
import com.example.servercommon.validation.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class CsvUserReader {

    private final UserValidator userValidator;
    private final ErrorCodeService errorCodeService;

    private static final String DEFAULT_LOCALE = "ja";

    public List<UserModel> read(InputStream inputStream, String fileName, List<ValidationResult<UserModel>> results) {
        List<UserModel> validUsers = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            int rowNum = 2; // ヘッダー行を除くので2行目から

            for (CSVRecord record : csvParser) {
                UserModel user = new UserModel();
                try {
                    user.setUserId(record.get(0));
                    user.setPassword(record.get(1));
                    user.setEmail(record.get(2));

                    ValidationResult<UserModel> result = userValidator.validate(user, rowNum++);
                    results.add(result);

                    if (result.isValid()) {
                        validUsers.add(user);
                    }

                } catch (Exception e) {
                    ValidationResult<UserModel> result = new ValidationResult<>(null, rowNum++);
                    String message = errorCodeService.getErrorMessage("E4001", List.of(e.getMessage()), DEFAULT_LOCALE);
                    result.addError(message);
                    results.add(result);
                }
            }
        } catch (Exception e) {
            String logMessage = errorCodeService.getErrorMessage("E4002", List.of(fileName, e.getMessage()), DEFAULT_LOCALE);
            log.error(logMessage, e);
        }

        return validUsers;
    }
}
