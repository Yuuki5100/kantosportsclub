import React, { useState, useEffect, useMemo } from "react";
import { FlexBox } from "@/components/base/Box";
import FormRow from "@/components/base/Input/FormRow";
import TextBox from "@/components/base/Input/TextBox";
import TextBoxMultiLine from "@/components/base/Input/TextBoxMultiLine";
import CheckBox from "@/components/base/Input/CheckBox";
import ButtonAction from "@/components/base/Button/ButtonAction";
import ModalWithButtons from "@/components/composite/ModalWindow";
import FileUploader from "@/components/composite/FileUpload/FileUploader";
import { UploadedFile, FileUploaderEndpoints, UploadedFileResponse } from "@hooks/useFileUploader";
import { downloadManualFileApi, getManualDetailApi, uploadManualFilesApi } from "@/api/services/v1/manualService";
import { usePermission } from "@/hooks/usePermission";
import { getMessage, MessageCodes } from "@/message";

export type ManualDetail = {
  id: number;
  title: string;
  targetUsers: string[];
  description: string;
  attachments: UploadedFile[];
};

export type ManualCreateData = {
  title: string;
  targetUsers: string[];
  description: string;
  attachments: UploadedFile[];
};

export type ManualPopupMode = "detail" | "create";

type ManualDetailPopupProps = {
  open: boolean;
  onClose: () => void;
  mode?: ManualPopupMode;
  manual?: ManualDetail | null;
  onUpdate?: (manual: ManualDetail) => void;
  onDelete?: (manualId: number) => void;
  onCreate?: (manual: ManualCreateData) => void;
};

const targetUserOptions = [
  { value: "generalUser", label: "一般ユーザー" },
  { value: "systemAdmin", label: "システム設定者管理者" },
];

const ManualDetailPopup: React.FC<ManualDetailPopupProps> = ({
  open,
  onClose,
  mode = "detail",
  manual,
  onUpdate,
  onDelete,
  onCreate,
}) => {
  const isCreateMode = mode === "create";
  const { canEditManual } = usePermission();
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [targetUsers, setTargetUsers] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  const [titleError, setTitleError] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isCreateMode) {
      setTitle("");
      setTargetUsers([]);
      setDescription("");
      setAttachments([]);
    } else if (manual) {
      getManualDetailApi(manual.id)
        .then((res) => {
          const m = res.manual;
          setTitle(m.manualTitle);
          setTargetUsers([
            ...(m.generalUser ? ["generalUser"] : []),
            ...(m.systemUser ? ["systemAdmin"] : []),
          ]);
          setDescription(m.description ?? "");
          setIsDeleted(m.deletedFlag === true);
          const files: UploadedFile[] = (m.docIds ?? []).map((docId) => {
            const nameAfterSlash = docId.includes("/") ? docId.substring(docId.lastIndexOf("/") + 1) : docId;
            const fileName = nameAfterSlash.length > 37 ? nameAfterSlash.substring(37) : nameAfterSlash;
            return { fileId: docId, fileName, fileSize: "" };
          });
          setAttachments(files);
        })
        .catch((err) => {
          console.error("Failed to fetch manual detail:", err);
        });
    }
    setIsEditMode(false);
    setTitleError(false);
    setIsDeleted(false);
  }, [manual, open, isCreateMode]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError(true);
      isValid = false;
    } else {
      setTitleError(false);
    }

    return isValid;
  };

  const handleUpdateClick = () => {
    if (!validateForm()) {
      return;
    }

    if (manual && onUpdate) {
      onUpdate({
        ...manual,
        title,
        targetUsers,
        description,
        attachments,
      });
    }
    setIsEditMode(false);
  };

  const handleCreateClick = () => {
    if (!validateForm()) {
      return;
    }

    if (onCreate) {
      onCreate({
        title,
        targetUsers,
        description,
        attachments,
      });
    }
    onClose();
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (manual && onDelete) {
      onDelete(manual.id);
    }
    setDeleteConfirmOpen(false);
    onClose();
  };

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleTargetUserChange = (selectedValues: string[]) => {
    setTargetUsers(selectedValues);
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setAttachments(files);
  };

  const isEditable = isCreateMode || isEditMode;

  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const manualUploadEndpoints: FileUploaderEndpoints = useMemo(() => ({
    upload: async (file: File): Promise<UploadedFileResponse> => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(getMessage(MessageCodes.FILE_SIZE_LIMIT, MAX_FILE_SIZE_MB));
      }
      const response = await uploadManualFilesApi([file]);
      const docId = response.docIds[0];
      return { fileId: docId, originalName: file.name };
    },
    download: isCreateMode
      ? async (): Promise<Blob> => new Blob()
      : async (file: UploadedFile): Promise<Blob> => downloadManualFileApi(file.fileId),
    delete: async (): Promise<void> => {},
  }), [isCreateMode]);

  const footerContent = isCreateMode ? (
    <FlexBox justifyContent="space-between" width="100%">
      <ButtonAction
        label="戻る"
        onClick={onClose}
        color="info"
        sx={{
          backgroundColor: "primary",
          "&:hover": {
            backgroundColor: "primary",
          },
        }}
      />
      <ButtonAction
        label="登録"
        onClick={handleCreateClick}
        color="info"
        sx={{
          backgroundColor: "primary",
          "&:hover": {
            backgroundColor: "primary",
          },
        }}
      />
    </FlexBox>
  ) : (
    <FlexBox justifyContent="space-between" width="100%">
      {canEditManual && !isDeleted && (
        <ButtonAction
          label="削除"
          onClick={handleDeleteClick}
          color="error"
          sx={{
            backgroundColor: "#d32f2f",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#b71c1c",
            },
          }}
        />
      )}
      {canEditManual && !isDeleted && (
        <ButtonAction
          label={isEditMode ? "登録" : "変更"}
          onClick={isEditMode ? handleUpdateClick : handleEditClick}
          color="info"
          sx={{
            backgroundColor: "primary",
            "&:hover": {
              backgroundColor: "primary",
            },
          }}
        />
      )}
    </FlexBox>
  );

  return (<>
    <ModalWithButtons
      open={open}
      onClose={handleClose}
      title={isCreateMode ? "マニュアル登録" : "マニュアル詳細"}
      buttons={[]}
      footerChildren={footerContent}
      width="650px"
      height="auto"
    >
      <FormRow
        label="タイトル"
        required={isEditable}
        labelAlignment="center"
        labelMinWidth="120px"
      >
        <TextBox
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isEditable}
          error={titleError}
          helperText={titleError ? "必須項目です" : undefined}
        />
      </FormRow>

      <FormRow
        label="対象ユーザー"
        labelAlignment="center"
        labelMinWidth="120px"
      >
        <CheckBox
          name="targetUsers"
          options={targetUserOptions}
          selectedValues={targetUsers}
          onChange={handleTargetUserChange}
          disabled={!isEditable}
          direction="column"
        />
      </FormRow>

      <FormRow
        label="説明"
        labelAlignment="top"
        labelMinWidth="120px"
      >
        <TextBoxMultiLine
          name="description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          disabled={!isEditable}
          rows={5}
        />
      </FormRow>

      <FormRow
        label="添付"
        labelAlignment="top"
        labelMinWidth="120px"
      >
        <FileUploader
          initialFiles={attachments}
          onChange={handleFilesChange}
          disabled={!isEditable}
          endpoints={manualUploadEndpoints}
        />
      </FormRow>
    </ModalWithButtons>

    <ModalWithButtons
      open={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
      title="削除確認"
      buttons={[]}
      footerChildren={
        <FlexBox justifyContent="space-between" width="100%">
          <ButtonAction
            label="キャンセル"
            onClick={() => setDeleteConfirmOpen(false)}
            color="info"
            sx={{
              backgroundColor: "primary",
              "&:hover": { backgroundColor: "primary" },
            }}
          />
          <ButtonAction
            label="削除"
            onClick={handleDeleteConfirm}
            color="error"
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              "&:hover": { backgroundColor: "#b71c1c" },
            }}
          />
        </FlexBox>
      }
      width="400px"
      height="auto"
    >
      <p style={{ textAlign: "center", margin: "16px 0" }}>
        このマニュアルを削除してもよろしいですか？
      </p>
    </ModalWithButtons>
  </>);
};

export default ManualDetailPopup;
