package com.example.servercommon.service.reader;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.model.UserRole;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.UserValidator;
import com.example.servercommon.validation.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExcelUserReader {

    private final UserValidator userValidator;
    private final ErrorCodeService errorCodeService;

    private static final String DEFAULT_LOCALE = "ja";

    // enum ordinal を roleId として使う（SYSTEM_ADMIN=0, EDITOR=1, VIEWER=2, CUSTOM=3）
    private static final int DEFAULT_ROLE_ID = UserRole.VIEWER.ordinal();

    /**
     * 想定カラム:
     * 0: userId(or username)
     * 1: password
     * 2: email
     */
    public List<UserModel> read(InputStream inputStream, String fileName, List<ValidationResult<UserModel>> validationResults) {
        List<UserModel> validUsers = new ArrayList<>();

        try (Workbook workbook = fileName.endsWith(".xls")
                ? new HSSFWorkbook(inputStream)
                : new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();
            int rowNumber = 1;

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (rowNumber == 1) { // ヘッダ行スキップ
                    rowNumber++;
                    continue;
                }

                UserModel user = new UserModel();
                try {
                    user.setUserId(getCellValue(row.getCell(0)));
                    user.setPassword(getCellValue(row.getCell(1)));
                    user.setEmail(getCellValue(row.getCell(2)));

                    // roleId はExcelに列が無い想定なのでデフォで埋める
                    if (user.getRoleId() == null) {
                        user.setRoleId(DEFAULT_ROLE_ID);
                    }

                    ValidationResult<UserModel> result = userValidator.validate(user, rowNumber++);
                    validationResults.add(result);
                    if (result.isValid()) {
                        validUsers.add(user);
                    }
                } catch (Exception e) {
                    ValidationResult<UserModel> result = new ValidationResult<>(null, rowNumber++);
                    String message = errorCodeService.getErrorMessage("E4003", List.of(e.getMessage()), DEFAULT_LOCALE);
                    result.addError(message);
                    validationResults.add(result);
                }
            }
        } catch (Exception e) {
            String logMessage = errorCodeService.getErrorMessage("E4004", List.of(fileName, e.getMessage()), DEFAULT_LOCALE);
            log.error(logMessage, e);
        }

        return validUsers;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue().trim();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf((long) cell.getNumericCellValue());
        if (cell.getCellType() == CellType.BOOLEAN) return String.valueOf(cell.getBooleanCellValue());
        return "";
    }
}
