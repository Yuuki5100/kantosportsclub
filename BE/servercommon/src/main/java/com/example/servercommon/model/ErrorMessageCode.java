package com.example.servercommon.model;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public final class ErrorMessageCode {

    public static final String DUPLICATE_ITEM_CD_ERR = "E003";
    public static final String INPUT_DATE_BEFORE_SYSTEM_DATE_ERR = "E020";
    public static final String PENDING_STATE_ERR = "E097";
    public static final String APPROVED_LATER_STARTED_DATE_ERR = "E098";
    public static final String FILE_PROCESSING_ERR = "E1012";
    public static final String MASTER_NOT_FOUND_ERR = "E104";
    public static final String SHEET_NOT_FOUND_ERR = "E105";
    public static final String TARGET_DATA_NOT_FOUND_ERR = "E1010";
    public static final String UPDATE_NOT_ALLOWED_ERR = "E121";
    public static final String ESSENTIAL_DATA_NOT_FOUND_ERR = "E008";
    public static final String CONFLICT_ERR = "E009";
    public static final String REPORT_DATA_FETCH_FAILED = "E190";
    public static final String UNEXPECTED_ERROR = "E001";
    public static final String ACTUAL_UNLOAD_AMOUNT_EXCEEDS_CAPACITY = "E090";
}
