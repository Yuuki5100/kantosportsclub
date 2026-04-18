package com.example.servercommon.enums;
import com.example.servercommon.message.BackendMessageCatalog;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RegistartionStatus {

    APPLICATION_SUBMITTED(1, "申請中"),
    APPLICATION_CANCELLED(2, "申請取下"),
    DELETED(3, "削除"),
    RETURNED(4, "差戻"),
    APPROVED(5, "承認済"),
    APPLY_DELETE(6, "削除申請中"),
    APPROVED_APPLIED_DELETE(7, "承認済削除"),
    RETURNED_APPLIED_DELETE(8, "削除申請差戻"),
    CANCEL_APPLIED_DELETE(9, "削除申請取下");

    private final int code;
    private final String registrationStatus;

    // ステータスがEnumに定義されているものであれば、引数の文字列をそのまま返す。定義されていなければ例外をスローする。
    public static String fromRegistrationStatus(String registrationStatus) {
        for (RegistartionStatus status : RegistartionStatus.values()) {
            if (status.getRegistrationStatus() == registrationStatus) {
                return status.registrationStatus;
            }
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_REGISTRATION_STATUS, registrationStatus));
    }

    // ステータスがEnumに定義されているものであれば、引数のコードをそのまま返す。定義されていなければ例外をスローする。
    public static int fromCode(int code) {
        for (RegistartionStatus status : RegistartionStatus.values()) {
            if (status.getCode() == code)
                return status.code;
        }
        throw new IllegalArgumentException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_STATUS_TYPE_CODE, code));
    }

}
