import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, FlexBox } from "@/components/base/Box";
import FormRow from "@/components/base/Input/FormRow";
import TextBox from "@/components/base/Input/TextBox";
import TextArea from "@/components/base/Input/TextBoxMultiLine";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { Font16, Font20 } from "@/components/base";
import { ModalWithButtons } from "@/components/composite/Modal/ModalWithButtons";
import DropBox from "@/components/base/Input/DropBox";
import colors from "@/styles/colors";
import { createUserApi, getUserDetailApi, updateUserApi, deleteUserApi, restoreUserApi, unlockUserApi } from "@/api/services/v1/userService";
import { getRoleDropdownApi } from "@/api/services/v1/roleService";
import { useSnackbar } from "@/hooks/useSnackbar";
import { usePermission } from "@/hooks/usePermission";
import { getMessage, MessageCodes } from "@/message";

export type UserDetailMode = "detail" | "create";

const UserDetailPage: React.FC = () => {
  const router = useRouter();
  const { mode: queryMode, id } = router.query;

  const mode: UserDetailMode = queryMode === "create" ? "create" : "detail";
  const isCreateMode = mode === "create";
  const { showSnackbar } = useSnackbar();
  const { canEditUser } = usePermission();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [deleteReasonInput, setDeleteReasonInput] = useState("");
  const [userId, setUserId] = useState("");
  const [surname, setSurname] = useState("");
  const [givenName, setGivenName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [roleId, setRoleId] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);
  const [deletedFlag, setDeletedFlag] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordSetDate, setPasswordSetDate] = useState("");
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [lockOutTime, setLockOutTime] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [creatorUserName, setCreatorUserName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [editorUserName, setEditorUserName] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const [userIdError, setUserIdError] = useState(false);
  const [surnameError, setSurnameError] = useState(false);
  const [givenNameError, setGivenNameError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);

  const fetchUserDetail = useCallback(async (userIdParam: string) => {
    try {
      const data = await getUserDetailApi(userIdParam);
      setUserId(data.userId);
      setSurname(data.surname);
      setGivenName(data.givenName);
      setPhoneNumber(data.mobileNo ?? "");
      setEmail(data.email);
      setRole(data.roleName ?? "");
      setRoleId(data.roleId);
      setIsLocked(data.isLocked);
      setDeletedFlag(data.isDeleted);
      setPassword(data.passwordSetTime ? "●●●●●●●●●●●●" : "");
      setPasswordSetDate(data.passwordSetTime ?? "");
      setFailedLoginAttempts(data.failedLoginAttempts ?? 0);
      setLockOutTime(data.lockOutTime ?? "");
      setDeletionReason(data.deletionReason ?? "");
      setCreatorUserName(data.creatorUserName ?? "");
      setCreatedAt(data.createdAt ?? "");
      setEditorUserName(data.editorUserName ?? "");
      setUpdatedAt(data.updatedAt ?? "");
    } catch (error) {
      console.error("Failed to fetch user detail:", error);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "ユーザー情報"), "ERROR");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoleDropdown = useCallback(async () => {
    try {
      const data = await getRoleDropdownApi();
      const options = data.roles.map((r) => ({ value: String(r.roleId), label: r.roleName }));
      setRoleOptions(options);
    } catch (error) {
      console.error("Failed to fetch role dropdown:", error);
    }
  }, []);

  useEffect(() => {
    fetchRoleDropdown();
  }, [fetchRoleDropdown]);

  useEffect(() => {
    if (isCreateMode) {
      setUserId("");
      setSurname("");
      setGivenName("");
      setPhoneNumber("");
      setEmail("");
      setRole("");
      setRoleId(0);
      setIsLocked(false);
      setDeletedFlag(false);
      setPassword("");
      setPasswordSetDate("");
      setFailedLoginAttempts(0);
      setLockOutTime("");
      setDeletionReason("");
      setCreatorUserName("");
      setCreatedAt("");
      setEditorUserName("");
      setUpdatedAt("");
    } else if (id) {
      fetchUserDetail(String(id));
    }
    setIsEditMode(false);
    setUserIdError(false);
    setSurnameError(false);
    setGivenNameError(false);
    setRoleError(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMode, id]);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!userId.trim()) {
      setUserIdError(true);
      isValid = false;
    } else {
      setUserIdError(false);
    }

    if (!surname.trim()) {
      setSurnameError(true);
      isValid = false;
    } else {
      setSurnameError(false);
    }

    if (!givenName.trim()) {
      setGivenNameError(true);
      isValid = false;
    } else {
      setGivenNameError(false);
    }

    if (!roleId) {
      setRoleError(true);
      isValid = false;
    } else {
      setRoleError(false);
    }

    return isValid;
  };

  const handleBack = () => {
    router.push("/admin/user/list");
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      await createUserApi({
        userId,
        email,
        surname,
        givenName,
        roleId,
        phoneNo: phoneNumber,
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ユーザーを作成"), "SUCCESS");
      router.push("/admin/user/list");
    } catch (error) {
      console.error("Failed to create user:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ユーザーの作成"), "ERROR");
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      await updateUserApi(String(id), {
        email,
        surname,
        givenName,
        roleId,
        phoneNo: phoneNumber,
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ユーザーを更新"), "SUCCESS");
      setIsEditMode(false);
      await fetchUserDetail(String(id));
    } catch (error) {
      console.error("Failed to update user:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ユーザーの更新"), "ERROR");
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUserApi(String(id), {
        deletionReason: deleteReasonInput,
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ユーザーを削除"), "SUCCESS");
      setIsDeleteDialogOpen(false);
      router.push("/admin/user/list");
    } catch (error) {
      console.error("Failed to delete user:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ユーザーの削除"), "ERROR");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteReasonInput("");
  };

  const handleRestoreClick = () => {
    setIsRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    try {
      await restoreUserApi(String(id));
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ユーザーを復元"), "SUCCESS");
      setIsRestoreDialogOpen(false);
      router.push("/admin/user/list");
    } catch (error) {
      console.error("Failed to restore user:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ユーザーの復元"), "ERROR");
    }
  };

  const handleRestoreCancel = () => {
    setIsRestoreDialogOpen(false);
  };

  const handleUnlockClick = () => {
    setIsUnlockDialogOpen(true);
  };

  const handleUnlockConfirm = async () => {
    try {
      await unlockUserApi(String(id));
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ロックを解除"), "SUCCESS");
      setIsUnlockDialogOpen(false);
      await fetchUserDetail(String(id));
    } catch (error) {
      console.error("Failed to unlock user:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ロック解除"), "ERROR");
    }
  };

  const handleUnlockCancel = () => {
    setIsUnlockDialogOpen(false);
  };

  const isEditable = isCreateMode || isEditMode;

  const sectionBoxStyle = {
    border: `1px solid ${colors.commonBorderGray}`,
    borderRadius: 1,
    p: 3,
    mb: 3,
    alignItems: "stretch",
  };

  const sectionTitleStyle = {
    fontWeight: 700,
    mb: 2,
    fontSize: "20px",
  };

  const labelRowStyle = {
    "& .MuiTypography-root": {
      color: colors.commonFontColorBlack,
    },
  };

  return (
    <Box sx={{ p: 2, width: "100%", alignItems: "stretch" }}>
      <FlexBox justifyContent="flex-end" width="100%" mb={2} gap={2}>
        <ButtonAction
          label="戻る"
          onClick={handleBack}
          sx={{
            backgroundColor: colors.primary,
            color: colors.commonFontColorWhite,
            "&:hover": {
              backgroundColor: colors.primary,
            },
          }}
        />
        {canEditUser && !isCreateMode && isLocked && (
          <ButtonAction
            label="ロック解除"
            onClick={handleUnlockClick}
            sx={{
              backgroundColor: colors.primary,
              color: colors.commonFontColorWhite,
              "&:hover": {
                backgroundColor: colors.primary,
              },
            }}
          />
        )}
        {canEditUser && !isCreateMode && (
          <ButtonAction
            label={deletedFlag ? "復元" : "削除"}
            onClick={deletedFlag ? handleRestoreClick : handleDeleteClick}
            sx={{
              backgroundColor: deletedFlag ? colors.primary : colors.Red,
              color: colors.commonFontColorWhite,
              "&:hover": {
                backgroundColor: deletedFlag ? colors.primary : colors.Red,
              },
            }}
          />
        )}
        {canEditUser && (
          <ButtonAction
            label={isCreateMode ? "登録" : isEditMode ? "登録" : "更新"}
            onClick={isCreateMode ? handleCreate : isEditMode ? handleUpdate : () => setIsEditMode(true)}
            sx={{
              backgroundColor: colors.primary,
              color: colors.commonFontColorWhite,
              "&:hover": {
                backgroundColor: colors.primary,
              },
            }}
          />
        )}
      </FlexBox>

      <Box sx={sectionBoxStyle} width="100%">
        <Font20 sx={sectionTitleStyle}>ユーザー情報</Font20>

        <FormRow
          label="ユーザーID"
          required={true}
          labelAlignment="center"
          labelMinWidth="150px"
          rowCustomStyle={labelRowStyle}
        >
          <TextBox
            name="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={!isCreateMode}
            error={userIdError}
            helperText={userIdError ? "必須項目です" : undefined}
            customStyle={{ width: "100%" }}
          />
        </FormRow>

          <FormRow
          label="姓"
          required={true}
          labelAlignment="center"
          labelMinWidth="150px"
          rowCustomStyle={labelRowStyle}
        >
          <TextBox
            name="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            disabled={!isEditable}
            error={surnameError}
            helperText={surnameError ? "必須項目です" : undefined}
            customStyle={{ width: "100%" }}
          />
        </FormRow>

        <FormRow
          label="名"
          required={true}
          labelAlignment="center"
          labelMinWidth="150px"
          rowCustomStyle={labelRowStyle}
        >
          <TextBox
            name="givenName"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            disabled={!isEditable}
            error={givenNameError}
            helperText={givenNameError ? "必須項目です" : undefined}
            customStyle={{ width: "100%" }}
          />
        </FormRow>

        <FormRow
          label="電話番号"
          labelAlignment="center"
          labelMinWidth="150px"
          rowCustomStyle={labelRowStyle}
        >
          <TextBox
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!isEditable}
            customStyle={{ width: "100%" }}
          />
        </FormRow>

        <FormRow
          label="メールアドレス"
          labelAlignment="center"
          labelMinWidth="150px"
          rowCustomStyle={labelRowStyle}
        >
          <TextBox
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditable}
            customStyle={{ width: "100%" }}
          />
        </FormRow>

        <FormRow
          label="ロール"
          required={true}
          labelAlignment="center"
          labelMinWidth="150px"
          rowCustomStyle={labelRowStyle}
        >
          {isEditable ? (
            <DropBox
              name="role"
              options={roleOptions}
              selectedValue={String(roleId || "")}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                setRoleId(selectedId);
                const found = roleOptions.find((o) => o.value === e.target.value);
                setRole(found?.label ?? "");
              }}
              error={roleError}
              helperText={roleError ? "必須項目です" : undefined}
            />
          ) : (
            <Font16 bold={false}>{role}</Font16>
          )}
        </FormRow>

        {!isCreateMode && (
          <>
            <FormRow
              label="パスワード"
              labelAlignment="center"
              labelMinWidth="150px"
              rowCustomStyle={labelRowStyle}
            >
              <Font16 bold={false}>{password}</Font16>
            </FormRow>

            <FormRow
              label="パスワード設定日"
              labelAlignment="center"
              labelMinWidth="150px"
              rowCustomStyle={labelRowStyle}
            >
              <Font16 bold={false}>{passwordSetDate}</Font16>
            </FormRow>

            <FormRow
              label="ログイン失敗回数"
              labelAlignment="center"
              labelMinWidth="150px"
              rowCustomStyle={labelRowStyle}
            >
              <Font16 bold={false}>{failedLoginAttempts}</Font16>
            </FormRow>

            <FormRow
              label="ロックアウト日時"
              labelAlignment="center"
              labelMinWidth="150px"
              rowCustomStyle={labelRowStyle}
            >
              <Font16 bold={false}>{lockOutTime}</Font16>
            </FormRow>
          </>
        )}
      </Box>

      {!isCreateMode && (
        <Box sx={sectionBoxStyle} width="100%">
          <Font20 sx={sectionTitleStyle}>共通情報</Font20>

          <FormRow
            label="削除済フラグ"
            labelAlignment="center"
            labelMinWidth="150px"
            rowCustomStyle={labelRowStyle}
          >
            <Font16 bold={false}>{deletedFlag ? "YES" : "NO"}</Font16>
          </FormRow>

          <FormRow
            label="削除理由"
            labelAlignment="top"
            labelMinWidth="150px"
            rowCustomStyle={labelRowStyle}
          >
            <Font16 bold={false}>{deletionReason}</Font16>
          </FormRow>

          <FormRow
            label="作成者"
            labelAlignment="center"
            labelMinWidth="150px"
            rowCustomStyle={labelRowStyle}
          >
            <Font16 bold={false}>{creatorUserName}</Font16>
          </FormRow>

          <FormRow
            label="作成日時"
            labelAlignment="center"
            labelMinWidth="150px"
            rowCustomStyle={labelRowStyle}
          >
            <Font16 bold={false}>{createdAt}</Font16>
          </FormRow>

          <FormRow
            label="更新者"
            labelAlignment="center"
            labelMinWidth="150px"
            rowCustomStyle={labelRowStyle}
          >
            <Font16 bold={false}>{editorUserName}</Font16>
          </FormRow>

          <FormRow
            label="更新日時"
            labelAlignment="center"
            labelMinWidth="150px"
            rowCustomStyle={labelRowStyle}
          >
            <Font16 bold={false}>{updatedAt}</Font16>
          </FormRow>
        </Box>
      )}

      <ModalWithButtons
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        title="削除確認"
        buttons={[
          { label: "キャンセル", onClick: handleDeleteCancel, color: "secondary" },
          { label: "削除", onClick: handleDeleteConfirm, color: "error" },
        ]}
        showCloseButton={false}
        width="500px"
        height="auto"
      >
        <Font16 bold={false} sx={{ mb: 2 }}>このユーザーを削除しますか？</Font16>
        <FormRow
          label="削除理由"
          labelAlignment="top"
          labelMinWidth="100px"
        >
          <Box sx={{ width: "100%", "& > .MuiBox-root": { minWidth: "unset", maxWidth: "100%" } }}>
            <TextArea
              name="deleteReasonInput"
              value={deleteReasonInput}
              onChange={(e) => setDeleteReasonInput(e.target.value)}
              rows={4}
            />
          </Box>
        </FormRow>
      </ModalWithButtons>

      <ModalWithButtons
        open={isRestoreDialogOpen}
        onClose={handleRestoreCancel}
        title="復元確認"
        buttons={[
          { label: "キャンセル", onClick: handleRestoreCancel, color: "secondary" },
          { label: "復元", onClick: handleRestoreConfirm, color: "primary" },
        ]}
        showCloseButton={false}
        width="500px"
        height="auto"
      >
        <Font16 bold={false}>このユーザーを復元しますか？</Font16>
      </ModalWithButtons>
      <ModalWithButtons
        open={isUnlockDialogOpen}
        onClose={handleUnlockCancel}
        title="ロック解除確認"
        buttons={[
          { label: "キャンセル", onClick: handleUnlockCancel, color: "secondary" },
          { label: "解除", onClick: handleUnlockConfirm, color: "primary" },
        ]}
        showCloseButton={false}
        width="500px"
        height="auto"
      >
        <Font16 bold={false}>このユーザーのロックを解除しますか？</Font16>
      </ModalWithButtons>
    </Box>
  );
};

export default UserDetailPage;
