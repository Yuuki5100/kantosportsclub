import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { Box, FlexBox } from "@/components/base/Box";
import FormRow from "@/components/base/Input/FormRow";
import TextBox from "@/components/base/Input/TextBox";
import TextArea from "@/components/base/Input/TextBoxMultiLine";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { Font16, Font20 } from "@/components/base";
import { ModalWithButtons } from "@/components/composite/Modal/ModalWithButtons";
import colors from "@/styles/colors";
import { useSnackbar } from "@/hooks/useSnackbar";
import { usePermission } from "@/hooks/usePermission";
import { getMessage, MessageCodes } from "@/message";
import {
  getRoleDetailApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from "@/api/services/v1/roleService";
import {
  RolePermissionModuleRequest,
  RoleDetailData,
  PERMISSION_MASTER,
  STATUS_LEVEL,
  MODULE_LABELS,
  PERMISSION_NAME_LABELS,
} from "@/types/role";

// ─── 内部用の権限状態型 ─────────────────────────────

type PermissionState = Record<number, number>; // permissionId → statusLevelId

/** PERMISSION_MASTERからデフォルト状態を生成（全てなし=1） */
const buildDefaultPermissionState = (): PermissionState =>
  PERMISSION_MASTER.reduce<PermissionState>((acc, p) => {
    acc[p.permissionId] = STATUS_LEVEL.NONE;
    return acc;
  }, {});

/** PermissionState → API用 permissionDetails に変換 */
const toPermissionDetails = (state: PermissionState): RolePermissionModuleRequest[] => {
  const moduleMap = new Map<string, RolePermissionModuleRequest>();

  for (const master of PERMISSION_MASTER) {
    if (!moduleMap.has(master.module)) {
      moduleMap.set(master.module, { module: master.module, permissions: [] });
    }
    moduleMap.get(master.module)!.permissions.push({
      permissionId: master.permissionId,
      statusLevelId: state[master.permissionId] ?? STATUS_LEVEL.NONE,
    });
  }

  return Array.from(moduleMap.values());
};

/** APIレスポンスの permissionDetails → PermissionState に変換 */
const fromPermissionDetails = (
  details: RoleDetailData["permissionDetails"]
): PermissionState => {
  const state = buildDefaultPermissionState();
  for (const mod of details) {
    for (const item of mod.permissions) {
      state[item.permissionId] = item.statusLevelId;
    }
  }
  return state;
};

/** モジュール別にグループ化されたマスタ */
const groupedPermissions = (() => {
  const map = new Map<string, typeof PERMISSION_MASTER>();
  for (const p of PERMISSION_MASTER) {
    if (!map.has(p.module)) map.set(p.module, []);
    map.get(p.module)!.push(p);
  }
  return Array.from(map.entries()); // [module, items][]
})();

const formatDateTime = (value: string | null): string => {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY/MM/DD HH:mm:ss") : "";
};

// ─── Component ──────────────────────────────────────

export type RoleDetailMode = "detail" | "create";

const RoleDetailPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { canEditRole } = usePermission();
  const { mode: queryMode, id } = router.query;

  const mode: RoleDetailMode = queryMode === "create" ? "create" : "detail";
  const isCreateMode = mode === "create";

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteReasonInput, setDeleteReasonInput] = useState("");

  const [roleId, setRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permState, setPermState] = useState<PermissionState>(buildDefaultPermissionState());
  const [deletedFlag, setDeletedFlag] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const [roleNameError, setRoleNameError] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async (roleIdNum: number) => {
    setLoading(true);
    try {
      const data = await getRoleDetailApi(roleIdNum);
      setRoleId(data.roleId);
      setRoleName(data.roleName);
      setDescription(data.description ?? "");
      setPermState(fromPermissionDetails(data.permissionDetails ?? []));
      setDeletedFlag(data.isDeleted);
      setDeleteReason(data.deletionReason ?? "");
      setCreatedBy(data.creatorUserName ?? "");
      setCreatedAt(formatDateTime(data.createdAt));
      setUpdatedBy(data.editorUserName ?? "");
      setUpdatedAt(formatDateTime(data.updatedAt));
    } catch (error) {
      console.error("Failed to fetch role detail:", error);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "ロール詳細"), "ERROR");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isCreateMode) {
      setRoleId(null);
      setRoleName("");
      setDescription("");
      setPermState(buildDefaultPermissionState());
      setDeletedFlag(false);
      setDeleteReason("");
      setCreatedBy("");
      setCreatedAt("");
      setUpdatedBy("");
      setUpdatedAt("");
    } else if (id) {
      fetchDetail(Number(id));
    }
  }, [isCreateMode, id, fetchDetail]);

  const validateForm = (): boolean => {
    let isValid = true;
    if (!roleName.trim()) {
      setRoleNameError(true);
      isValid = false;
    } else {
      setRoleNameError(false);
    }
    return isValid;
  };

  const handleBack = () => {
    router.push("/role/list");
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await createRoleApi({
        roleName,
        description,
        permissionDetails: toPermissionDetails(permState),
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ロールを作成"), "SUCCESS");
      router.push("/role/list");
    } catch (error) {
      console.error("Create role failed:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ロールの作成"), "ERROR");
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || roleId == null) return;
    try {
      await updateRoleApi(roleId, {
        roleName,
        description,
        permissionDetails: toPermissionDetails(permState),
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ロールを更新"), "SUCCESS");
      setIsEditMode(false);
      fetchDetail(roleId);
    } catch (error) {
      console.error("Update role failed:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ロールの更新"), "ERROR");
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (roleId == null) return;
    try {
      await deleteRoleApi(roleId, { deletionReason: deleteReasonInput });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "ロールを削除"), "SUCCESS");
      setIsDeleteDialogOpen(false);
      router.push("/role/list");
    } catch (error) {
      console.error("Delete role failed:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("use this role")) {
        showSnackbar(getMessage(MessageCodes.ROLE_DELETE_BLOCKED), "ERROR");
      } else {
        showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "ロールの削除"), "ERROR");
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteReasonInput("");
  };

  const handlePermissionChange = (permissionId: number, statusLevelId: number) => {
    if (!isEditable) return;
    setPermState((prev) => ({ ...prev, [permissionId]: statusLevelId }));
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

  const renderStatusButton = (
    permissionId: number,
    targetLevel: number,
    label: string
  ) => {
    const isActive = permState[permissionId] === targetLevel;
    return (
      <ButtonAction
        label={label}
        size="small"
        onClick={() => handlePermissionChange(permissionId, targetLevel)}
        disabled={!isEditable}
        sx={{
          backgroundColor: isActive ? colors.primary : "transparent",
          color: isActive ? colors.commonFontColorWhite : colors.commonFontColorBlack,
          border: isActive ? "none" : `1px solid ${colors.commonBorderGray}`,
          minWidth: "50px",
          "&:hover": {
            backgroundColor: isActive ? colors.primary : colors.commonTableHover,
          },
          "&.Mui-disabled": {
            backgroundColor: isActive ? colors.primary : "transparent",
            color: isActive ? colors.commonFontColorWhite : colors.commonBorderGray,
            border: isActive ? "none" : `1px solid ${colors.commonBorderGray}`,
          },
        }}
      />
    );
  };

  if (loading) {
    return <Font16 bold={false} sx={{ p: 2 }}>読み込み中...</Font16>;
  }

  return (
    <Box sx={{ p: 2, width: "100%", alignItems: "stretch" }}>
      <FlexBox justifyContent="flex-end" width="100%" mb={2} gap={2}>
        <ButtonAction
          label="戻る"
          onClick={handleBack}
          sx={{
            backgroundColor: colors.primary,
            color: colors.commonFontColorWhite,
            "&:hover": { backgroundColor: colors.primary },
          }}
        />
        {canEditRole && !isCreateMode && !deletedFlag && (
          <ButtonAction
            label="削除"
            onClick={handleDeleteClick}
            sx={{
              backgroundColor: colors.Red,
              color: colors.commonFontColorWhite,
              "&:hover": { backgroundColor: colors.Red },
            }}
          />
        )}
        {canEditRole && (!isCreateMode ? !deletedFlag : true) && (
          <ButtonAction
            label={isCreateMode ? "登録" : isEditMode ? "登録" : "更新"}
            onClick={isCreateMode ? handleCreate : isEditMode ? handleUpdate : () => setIsEditMode(true)}
            sx={{
              backgroundColor: colors.primary,
              color: colors.commonFontColorWhite,
              "&:hover": { backgroundColor: colors.primary },
            }}
          />
        )}
      </FlexBox>

      {/* ── ロール情報 ── */}
      <Box sx={sectionBoxStyle} width="100%">
        <Font20 sx={sectionTitleStyle}>ロール情報</Font20>

        <FormRow label="ロールID" labelAlignment="center" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
          <Font16 bold={false}>{isCreateMode ? "" : roleId}</Font16>
        </FormRow>

        <FormRow label="ロール名" required labelAlignment="center" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
          <TextBox
            name="roleName"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            disabled={!isEditable}
            error={roleNameError}
            helperText={roleNameError ? "必須項目です" : undefined}
            customStyle={{ width: "100%" }}
          />
        </FormRow>

        <FormRow label="説明" labelAlignment="top" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
          <TextArea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isEditable}
            rows={3}
          />
        </FormRow>
      </Box>

      {/* ── 機能権限情報 ── */}
      <Box sx={sectionBoxStyle} width="100%">
        <Font20 sx={sectionTitleStyle}>機能権限情報</Font20>

        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            "& th, & td": {
              border: `1px solid ${colors.commonBorderGray}`,
              padding: "8px 12px",
              textAlign: "center",
            },
          }}
        >

          <tbody>
            {groupedPermissions.map(([module, items]) =>
              items.map((perm, idx) => (
                <tr key={perm.permissionId}>
                  {idx === 0 && (
                    <td
                      rowSpan={items.length}
                      style={{ textAlign: "left", verticalAlign: "top", fontWeight: 600 }}
                    >
                      {MODULE_LABELS[module] ?? module}
                    </td>
                  )}
                  <td style={{ textAlign: "left" }}>
                    {PERMISSION_NAME_LABELS[perm.permissionName] ?? perm.permissionName}
                  </td>
                  <td>{renderStatusButton(perm.permissionId, STATUS_LEVEL.NONE, "なし")}</td>
                  <td>{renderStatusButton(perm.permissionId, STATUS_LEVEL.VIEW, "参照")}</td>
                  <td>{renderStatusButton(perm.permissionId, STATUS_LEVEL.EDIT, "更新")}</td>
                </tr>
              ))
            )}
          </tbody>
        </Box>
      </Box>

      {/* ── 共通情報（詳細モードのみ） ── */}
      {!isCreateMode && (
      <Box sx={sectionBoxStyle} width="100%">
        <Font20 sx={sectionTitleStyle}>共通情報</Font20>

          <FormRow label="削除済フラグ" labelAlignment="center" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
            <Font16 bold={false}>{deletedFlag ? "YES" : "NO"}</Font16>
          </FormRow>

          <FormRow label="削除理由" labelAlignment="top" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
            <Font16 bold={false}>{deleteReason}</Font16>
          </FormRow>

          <FormRow label="作成者" labelAlignment="center" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
            <Font16 bold={false}>{createdBy}</Font16>
          </FormRow>

          <FormRow label="作成日時" labelAlignment="center" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
            <Font16 bold={false}>{createdAt}</Font16>
          </FormRow>

          <FormRow label="更新者" labelAlignment="center" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
            <Font16 bold={false}>{updatedBy}</Font16>
          </FormRow>

          <FormRow label="更新日時" labelAlignment="center" labelMinWidth="150px" rowCustomStyle={labelRowStyle}>
            <Font16 bold={false}>{updatedAt}</Font16>
          </FormRow>
        </Box>
      )}

      {/* ── 削除確認ダイアログ ── */}
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
    </Box>
  );
};

export default RoleDetailPage;
