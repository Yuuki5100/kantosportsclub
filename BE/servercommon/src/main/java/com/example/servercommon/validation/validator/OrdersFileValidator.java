package com.example.servercommon.validation.validator;

import com.example.servercommon.enums.FileJobImportCellType;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.UserModel;
import com.example.servercommon.service.ErrorCodeService;
import com.example.servercommon.validation.FileValidator;
import com.example.servercommon.validation.ValidationResult;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component("ordersFileValidator")
public class OrdersFileValidator implements FileValidator<UserModel> {

    private final ErrorCodeService errorCodeService;
    private static final String DEFAULT_LOCALE = "ja";

    public OrdersFileValidator(ErrorCodeService errorCodeService) {
        this.errorCodeService = errorCodeService;
    }

    @Override
    public List<ValidationResult<UserModel>> validate(InputStream inputStream) {
        List<ValidationResult<UserModel>> results = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            boolean isFirstRow = true;
            int rowNum = 1;

            for (Row row : sheet) {
                if (isFirstRow) {
                    isFirstRow = false;
                    continue;
                }

                UserModel user = new UserModel();
                ValidationResult<UserModel> result = new ValidationResult<>(user, rowNum++);

                Cell nameCell = row.getCell(FileJobImportCellType.CellName.getColumNumber(), FileJobImportCellType.CellName.getPolicy());
                Cell emailCell = row.getCell(FileJobImportCellType.CellEmail.getColumNumber(), FileJobImportCellType.CellEmail.getPolicy());

                String name = nameCell != null ? nameCell.toString().trim() : "";
                String email = emailCell != null ? emailCell.toString().trim() : "";

                user.setUserId(name);
                user.setEmail(email);

                if (name.isEmpty()) {
                    result.addError(errorCodeService.getErrorMessage("E7001", DEFAULT_LOCALE));
                }

                if (email.isEmpty() || !email.contains("@")) {
                    result.addError(errorCodeService.getErrorMessage("E7002", DEFAULT_LOCALE));
                }

                results.add(result);
            }

        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.EX_EXCEL_READ_PROCESS_FAILED, e);
        }

        return results;
    }
}
