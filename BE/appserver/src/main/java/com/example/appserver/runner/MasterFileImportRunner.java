
// package com.example.servercommon.runner;

// import com.example.appserver.util.ExcelUtil;
// import com.example.servercommon.entity.MasterItem;
// import com.example.servercommon.entity.MasterItemCategory;
// import com.example.servercommon.entity.MasterItemPlasticFormType;
// import com.example.servercommon.entity.RegistrationStep;
// import com.example.servercommon.entity.RegistrationStep;
// import com.example.servercommon.enums.ProcessCategory;
// import com.example.servercommon.enums.RegistartionStatus;
// import com.example.servercommon.exception.CustomException;
// import com.example.servercommon.file.FileType;
// import com.example.servercommon.model.ErrorMessageCode;
// import com.example.servercommon.repository.GenericCommonMasterRepository;
// import com.example.servercommon.repository.MasterItemPlasticFormTypeRepository;
// import com.example.servercommon.repository.MasterItemRepository;
// import com.example.servercommon.repository.RegistrationStepRepository;
// import com.example.servercommon.service.CommonMasterService;
// import com.example.servercommon.service.ErrorCodeService;
// import com.example.servercommon.service.MasterItemService;
// import jakarta.transaction.Transactional;
// import java.io.InputStream;
// import java.time.LocalDateTime;
// import java.time.format.DateTimeFormatter;
// import java.util.*;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.apache.poi.ss.usermodel.*;
// import org.springframework.stereotype.Component;
// import org.springframework.web.multipart.MultipartFile;

// // このクラスはエクセルからマスタデータを読み込んでマスタの新規作成、参照新規、内容修正処理を行うときのサンプルファイルです。
// //@Slf4j
// //@Component
// //@RequiredArgsConstructor
// public class MasterFileImportRunner {
//     // private final MasterItemService masterItemService;
//     // private final ErrorCodeService errorCodeService;
//     // private final CommonMasterService commonMasterService;
//     // private final GenericCommonMasterRepository genericCommonMasterStartDateRepository;
//     // private final RegistrationStepRepository registrationStatusRepo;
//     // private final MasterItemRepository masterItemRepo;
//     // private final MasterItemPlasticFormTypeRepository masterItemPlasticFormTypeRepository;

//     // @Transactional
//     // public void run(MultipartFile file, Locale locale) {
//     //     try (InputStream inputStream = file.getInputStream();
//     //             Workbook workbook = WorkbookFactory.create(inputStream)) {
//     //         List<String> sheetNames = FileType.MASTER_ITEM.getSheetNames();
//     //         Sheet masterItemSheet = workbook.getSheet(sheetNames.get(0)); // "品目"
//     //         Sheet plasticFormTypeSheet = workbook.getSheet(sheetNames.get(1)); // "品目プラ形態タイプ"
//     //         List<MasterItemPlasticFormType> plasticFormTypes = new ArrayList<>();
//     //         if (plasticFormTypeSheet != null) {
//     //             plasticFormTypes = toMasterItemPlasticFormTypeList(plasticFormTypeSheet);
//     //         }
//     //         if (masterItemSheet != null) {
//     //             processMasterItemSheet(masterItemSheet, locale, plasticFormTypes);
//     //         } else {
//     //             throw new CustomException(ErrorMessageCode.SHEET_NOT_FOUND_ERR,
//     //                     errorCodeService.getErrorMessage(
//     //                             ErrorMessageCode.SHEET_NOT_FOUND_ERR,
//     //                             new Object[] { masterItemSheet }, locale.getLanguage()));
//     //         }
//     //     } catch (Exception e) {
//     //         throw new CustomException(ErrorMessageCode.FILE_PROCESSING_ERR,
//     //                 errorCodeService.getErrorMessage(
//     //                         ErrorMessageCode.FILE_PROCESSING_ERR, locale.getLanguage()));
//     //     }
//     // }

//     // @Transactional
//     // public void processMasterItemSheet(Sheet sheet, Locale locale, List<MasterItemPlasticFormType> plasticFormTypes) {
//     //     Map<Integer, String> headerMap = new HashMap<>();
//     //     Iterator<Row> rows = sheet.iterator();
//     //     if (rows.hasNext()) {
//     //         Row headerRow = rows.next();
//     //         for (Cell cell : headerRow) {
//     //             headerMap.put(cell.getColumnIndex(), cell.getStringCellValue().trim());
//     //         }
//     //     }

//     //     while (rows.hasNext()) {
//     //         Row row = rows.next();
//     //         String processNO = ExcelUtil.getValueByHeader(row, headerMap, "処理区分");
//     //         String approverUserId = ExcelUtil.getValueByHeader(row, headerMap, "承認者ユーザID");
//     //         String registerStepUpdatedTimeStr = ExcelUtil.getValueByHeader(row, headerMap, "登録ステップ更新日時");
//     //         String updateTimeFromExcel = ExcelUtil.getValueByHeader(row, headerMap, "更新日時");
//     //         if (processNO == null || processNO.isBlank())
//     //             continue;
//     //         // 他マスタ存在チェック（品目区分CD、取引先CD）
//     //         validateReferenceMaster(row, headerMap, locale);
//     //         if (processNO.equals(String.valueOf(ProcessCategory.NEW.getCode()))) {
//     //             MasterItem item = ExcelUtil.toMasterItem(row, headerMap);
//     //             masterItemService.saveNewMasterItem(item, plasticFormTypes, "saw");
//     //         } else if (processNO.equals(
//     //                 String.valueOf(ProcessCategory.UPDATE.getCode()))) {
//     //             String identificationId = ExcelUtil.getValueByHeader(row, headerMap, "識別ID");
//     //             if (identificationId == null || identificationId.isBlank()) {
//     //                 throw new CustomException(ErrorMessageCode.IDENTIFICATION_id_NOT_FOUND_ERR,
//     //                         errorCodeService.getErrorMessage(
//     //                                 ErrorMessageCode.IDENTIFICATION_id_NOT_FOUND_ERR,
//     //                                 locale.getLanguage()));
//     //             }

//     //             MasterItem existingItem = genericCommonMasterStartDateRepository
//     //                     .findBy(MasterItem.class, identificationId)
//     //                     .orElseThrow(
//     //                             () -> new CustomException(
//     //                                     ErrorMessageCode.TARGET_DATA_NOT_FOUND_ERR,
//     //                                     errorCodeService.getErrorMessage(
//     //                                             ErrorMessageCode.TARGET_DATA_NOT_FOUND_ERR,
//     //                                             new Object[] { identificationId },
//     //                                             locale.getLanguage())));

//     //             checkStatusAndThrowExceptionIfWrong(existingItem, identificationId, locale);

//     //             // master item を更新する。
//     //             MasterItem updatedItem = ExcelUtil.toMasterItem(row, headerMap);
//     //             updatedItem.setId(identificationId); // reuse識別ID
//     //             masterItemRepo.save(updatedItem);

//     //             Optional<RegistrationStep> registerStep = registrationStatusRepo
//     //                     .findByIdentificationId(identificationId);
//     //             if (registerStep.isPresent()) {
//     //                 RegistrationStep registerStepReal = registerStep.get();
//     //                 registerStepReal
//     //                         .setRegistrationStatus(String.valueOf(RegistartionStatus.APPLICATION_SUBMITTED.getCode()));
//     //                 registerStepReal.setUpdatedDateAndTime(LocalDateTime.now());
//     //                 registrationStatusRepo.save(registerStepReal);
//     //             }

//     //             // 3. 関連の子供レコードを削除
//     //             genericCommonMasterStartDateRepository.logicalDeleteChildrenByParentId(
//     //                     MasterItemPlasticFormType.class,
//     //                     identificationId,
//     //                     "itemId", // Foreign key in child table
//     //                     "deletedFlag", // Logical delete field
//     //                     "XXX", //削除理由
//     //                     masterItemPlasticFormTypeRepository);

//     //             List<MasterItemPlasticFormType> childrenToInsert = plasticFormTypes.stream()
//     //                     .filter(child -> identificationId.equals(child.getItemId()))
//     //                     .toList();

//     //             if (!childrenToInsert.isEmpty()) {
//     //                 masterItemPlasticFormTypeRepository.saveAll(childrenToInsert);
//     //             }
//     //         } else if (processNO.equals(
//     //                 String.valueOf(ProcessCategory.REFERENCE_NEW.getCode()))) {
//     //             String identificationId = ExcelUtil.getValueByHeader(row, headerMap, "識別ID");
//     //             if (identificationId == null || identificationId.isBlank()) {
//     //                 throw new CustomException(ErrorMessageCode.IDENTIFICATION_id_NOT_FOUND_ERR,
//     //                         errorCodeService.getErrorMessage(
//     //                                 ErrorMessageCode.IDENTIFICATION_id_NOT_FOUND_ERR,
//     //                                 locale.getLanguage()));
//     //             }
//     //             // take existing one from DB
//     //             MasterItem existingItem = genericCommonMasterStartDateRepository
//     //                     .findBy(MasterItem.class, identificationId)
//     //                     .orElseThrow(
//     //                             () -> new CustomException(
//     //                                     ErrorMessageCode.TARGET_DATA_NOT_FOUND_ERR,
//     //                                     errorCodeService.getErrorMessage(
//     //                                             ErrorMessageCode.TARGET_DATA_NOT_FOUND_ERR,
//     //                                             new Object[] { identificationId },
//     //                                             locale.getLanguage())));
//     //             // Step 1: Load children from DB
//     //             List<MasterItemPlasticFormType> dbChildren = masterItemPlasticFormTypeRepository
//     //                     .findByItemIdAndDeletedFlagFalse(identificationId);
//     //             // Get children from Excel with same reference ID
//     //             List<MasterItemPlasticFormType> excelChildren = plasticFormTypes.stream()
//     //                     .filter(p -> identificationId.equals(p.getItemId()))
//     //                     .toList();
//     //             // エクセル+DBからの子供レコードを合併する
//     //             Map<String, MasterItemPlasticFormType> mergedMap = new LinkedHashMap<>();
//     //             for (MasterItemPlasticFormType dbChild : dbChildren) {
//     //                 mergedMap.put(dbChild.getPlasticFormTypeId(), dbChild);
//     //             }
//     //             // Step 2: Add/overwrite with Excel children
//     //             for (MasterItemPlasticFormType excelChild : excelChildren) {
//     //                 mergedMap.put(excelChild.getPlasticFormTypeId(), excelChild);
//     //             }
//     //             // Step 3: Convert to list and assign new parent ID
//     //             List<MasterItemPlasticFormType> mergedChildren = new ArrayList<>(mergedMap.values());
//     //             for (MasterItemPlasticFormType child : mergedChildren) {
//     //                 child.setId(null);
//     //                 child.setItemId(null);
//     //                 child.setDeletedFlag(false);
//     //             }

//     //             checkStatusAndThrowExceptionIfWrong(existingItem, identificationId, locale);

//     //             if (updateTimeFromExcel == null || updateTimeFromExcel.isBlank()) {
//     //                 throw new CustomException(ErrorMessageCode.ESSENTIAL_DATA_NOT_FOUND_ERR,
//     //                         errorCodeService.getErrorMessage(
//     //                                 ErrorMessageCode.ESSENTIAL_DATA_NOT_FOUND_ERR,
//     //                                 locale.getLanguage()));
//     //             }

//     //             LocalDateTime inputTime = LocalDateTime.parse(updateTimeFromExcel,
//     //                     DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")); // ← format as needed

//     //             if (!inputTime.equals(existingItem.getUpdatedDateAndTime())) {
//     //                 throw new CustomException(ErrorMessageCode.CONFLICT_ERR,
//     //                         errorCodeService.getErrorMessage(ErrorMessageCode.CONFLICT_ERR,
//     //                                 new Object[] { identificationId }, locale.getLanguage()));
//     //             }

//     //             MasterItem newlyCreatedItemWithExistingCD = ExcelUtil.toMasterItem(row, headerMap);
//     //             newlyCreatedItemWithExistingCD.setId(null);
//     //             masterItemService.saveNewMasterItem(newlyCreatedItemWithExistingCD, mergedChildren, null);
//     //         }

//     //     }
//     // }

//     // private void validateReferenceMaster(
//     //         Row row, Map<Integer, String> headerMap, Locale locale) {
//     //     checkMaster("品目大区分CD", "large_category_cd", "master_item_category",
//     //             row, headerMap, locale);
//     //     checkMaster("品目中区分CD", "medium_category_cd", "master_item_category",
//     //             row, headerMap, locale);
//     //     checkMaster("品目小区分CD", "small_category_cd", "master_item_category",
//     //             row, headerMap, locale);
//     //     checkMaster("品目細区分CD", "subcategory_cd", "master_item_category", row,
//     //             headerMap, locale);
//     //     checkMaster(
//     //             "取引先CD", "client_cd", "master_client", row, headerMap, locale);
//     // }

//     // private void checkMaster(String columnName, String fieldName,
//     //         String masterName, Row row, Map<Integer, String> headerMap,
//     //         Locale locale) {
//     //     String value = ExcelUtil.getValueByHeader(row, headerMap, columnName);
//     //     if (value != null && !value.isBlank()) {
//     //         Class<?> clazz = getMasterClass(masterName);
//     //         boolean exists = genericCommonMasterStartDateRepository.existsByFieldValue(
//     //                 clazz, fieldName, value);
//     //         if (!exists) {
//     //             throw new CustomException(ErrorMessageCode.MASTER_NOT_FOUND_ERR,
//     //                     errorCodeService.getErrorMessage(
//     //                             ErrorMessageCode.MASTER_NOT_FOUND_ERR,
//     //                             new Object[] { columnName, value }, locale.getLanguage()));
//     //         }
//     //     }
//     // }

//     // private Class<?> getMasterClass(String masterName) {
//     //     return switch (masterName) {
//     //         case "master_item_category" -> MasterItemCategory.class;
//     //         case "master_item" -> MasterItem.class;
//     //         default -> throw new IllegalArgumentException(unknown masterName);
//     //     };
//     // }

//     // private List<MasterItemPlasticFormType> toMasterItemPlasticFormTypeList(Sheet sheet) {
//     //     List<MasterItemPlasticFormType> list = new ArrayList<>();
//     //     Map<Integer, String> headerMap = new HashMap<>();

//     //     Iterator<Row> rows = sheet.iterator();
//     //     if (rows.hasNext()) {
//     //         Row headerRow = rows.next();
//     //         for (Cell cell : headerRow) {
//     //             headerMap.put(cell.getColumnIndex(), cell.getStringCellValue().trim());
//     //         }
//     //     }

//     //     while (rows.hasNext()) {
//     //         Row row = rows.next();
//     //         MasterItemPlasticFormType form = new MasterItemPlasticFormType();
//     //         form.setItemId(ExcelUtil.getValueByHeader(row, headerMap, "品目識別ID"));
//     //         form.setItemCd(ExcelUtil.getValueByHeader(row, headerMap, "品目CD"));
//     //         form.setPlasticFormTypeId(ExcelUtil.getValueByHeader(row, headerMap, "プラ形態タイプID"));
//     //         list.add(form);
//     //     }
//     //     return list;
//     // }

//     // private void checkStatusAndThrowExceptionIfWrong(MasterItem existingItem, String identificationId, Locale locale) {
//     //     boolean isapplicationWithdraw = commonMasterService.hasRegistrationStatus(
//     //             List.of(existingItem),
//     //             String.valueOf(RegistartionStatus.APPLICATION_CANCELLED.getCode()),
//     //             MasterItem::getId, registrationStatusRepo

//     //     );

//     //     boolean isapplicationReturned = commonMasterService.hasRegistrationStatus(
//     //             List.of(existingItem),
//     //             String.valueOf(RegistartionStatus.RETURNED.getCode()),
//     //             MasterItem::getId, registrationStatusRepo

//     //     );

//     //     boolean isApproved = commonMasterService.hasRegistrationStatus(
//     //             List.of(existingItem),
//     //             String.valueOf(RegistartionStatus.APPROVED.getCode()),
//     //             MasterItem::getId, registrationStatusRepo

//     //     );

//     //     if (!(isapplicationWithdraw || isapplicationReturned || isApproved)) {
//     //         throw new CustomException(
//     //                 ErrorMessageCode.UPDATE_NOT_ALLOWED_ERR,
//     //                 errorCodeService.getErrorMessage(
//     //                         ErrorMessageCode.UPDATE_NOT_ALLOWED_ERR,
//     //                         new Object[] { identificationId }, locale.getLanguage()));
//     //     }
//     // }

// }
