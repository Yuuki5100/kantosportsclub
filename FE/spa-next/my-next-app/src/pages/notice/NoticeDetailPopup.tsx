import React, { useState, useEffect, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import ModalWithButtons from '@/components/composite/ModalWindow';
import FormRow from '@/components/base/Input/FormRow';
import TextBox from '@/components/base/Input/TextBox';
import TextArea from '@/components/base/Input/TextBoxMultiLine';
import DatePicker from '@/components/base/Input/DatePicker';
import FileUploader from '@/components/composite/FileUpload/FileUploader';
import { FlexBox, Font14 } from '@/components/base';
import ButtonAction from '@/components/base/Button/ButtonAction';
import { UploadedFile, FileUploaderEndpoints, UploadedFileResponse } from '@hooks/useFileUploader';
import { downloadNoticeFileApi, uploadNoticeFilesApi } from '@/api/services/v1/noticeService';
import { usePermission } from '@/hooks/usePermission';
import { getMessage, MessageCodes } from '@/message';

export type NoticeDetail = {
  id: number;
  title: string;
  periodStart: Dayjs | null;
  periodEnd: Dayjs | null;
  content: string;
  attachments: UploadedFile[];
};

export type NoticeCreateData = {
  title: string;
  periodStart: Dayjs | null;
  periodEnd: Dayjs | null;
  content: string;
  attachments: UploadedFile[];
};

export type NoticePopupMode = 'detail' | 'create';

type NoticeDetailPopupProps = {
  open: boolean;
  onClose: () => void;
  mode?: NoticePopupMode;
  notice?: NoticeDetail | null;
  onUpdate?: (notice: NoticeDetail) => void;
  onDelete?: (noticeId: number) => void;
  onCreate?: (notice: NoticeCreateData) => void;
};

const NoticeDetailPopup: React.FC<NoticeDetailPopupProps> = ({
  open,
  onClose,
  mode = 'detail',
  notice,
  onUpdate,
  onDelete: _onDelete,
  onCreate,
}) => {
  const { canEditNotice } = usePermission();
  const isCreateMode = mode === 'create';
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [periodStart, setPeriodStart] = useState<Dayjs | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Dayjs | null>(null);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  const [titleError, setTitleError] = useState(false);
  const [periodStartError, setPeriodStartError] = useState(false);
  const [periodEndError, setPeriodEndError] = useState(false);

  useEffect(() => {
    if (isCreateMode) {
      setTitle('');
      setPeriodStart(null);
      setPeriodEnd(null);
      setContent('');
      setAttachments([]);
    } else if (notice) {
      setTitle(notice.title);
      setPeriodStart(notice.periodStart);
      setPeriodEnd(notice.periodEnd);
      setContent(notice.content);
      setAttachments(notice.attachments);
    }
    setIsEditMode(false);
    setTitleError(false);
    setPeriodStartError(false);
    setPeriodEndError(false);
  }, [notice, open, isCreateMode]);

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

    if (!periodStart) {
      setPeriodStartError(true);
      isValid = false;
    } else {
      setPeriodStartError(false);
    }

    if (!periodEnd) {
      setPeriodEndError(true);
      isValid = false;
    } else {
      setPeriodEndError(false);
    }

    return isValid;
  };

  const handleUpdateClick = () => {
    if (!validateForm()) {
      return;
    }

    if (notice && onUpdate) {
      onUpdate({
        ...notice,
        title,
        periodStart,
        periodEnd,
        content,
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
        periodStart,
        periodEnd,
        content,
        attachments,
      });
    }
  };

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setAttachments(files);
  };

  const footerContent = isCreateMode ? (
    <FlexBox justifyContent="space-between" width="100%">
      <ButtonAction
        label="戻る"
        onClick={onClose}
        color="info"
        sx={{
          backgroundColor: 'primary',
          '&:hover': {
            backgroundColor: 'primary',
          },
        }}
      />
      {canEditNotice && (
      <ButtonAction
        label="登録"
        onClick={handleCreateClick}
        color="info"
        sx={{
          backgroundColor: 'primary',
          '&:hover': {
            backgroundColor: 'primary',
          },
        }}
      />
      )}
    </FlexBox>
  ) : (
    <FlexBox justifyContent="space-between" width="100%">
      {canEditNotice && (
      <ButtonAction
        label={isEditMode ? '登録' : '変更'}
        onClick={isEditMode ? handleUpdateClick : handleEditClick}
        color="info"
        sx={{
          backgroundColor: 'primary',
          '&:hover': {
            backgroundColor: 'primary',
          },
        }}
      />
      )}
    </FlexBox>
  );

  const isEditable = isCreateMode || isEditMode;

  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const noticeUploadEndpoints: FileUploaderEndpoints = useMemo(() => ({
    upload: async (file: File): Promise<UploadedFileResponse> => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(getMessage(MessageCodes.FILE_SIZE_LIMIT, MAX_FILE_SIZE_MB));
      }
      const response = await uploadNoticeFilesApi([file]);
      const docId = response.docIds[0];
      return { fileId: docId, originalName: file.name };
    },
    download: isCreateMode
      ? async (): Promise<Blob> => new Blob()
      : async (file: UploadedFile): Promise<Blob> => downloadNoticeFileApi(file.fileId),
    delete: async (): Promise<void> => {},
  }), [isCreateMode]);

  return (
    <ModalWithButtons
      open={open}
      onClose={handleClose}
      title={isCreateMode ? "お知らせ登録" : "お知らせ詳細"}
      buttons={[]}
      footerChildren={footerContent}
      width="650px"
      height="auto"
    >
      <FormRow
        label="タイトル"
        required={isEditable}
        labelAlignment="center"
        labelMinWidth="100px"
      >
        <TextBox
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isEditable}
          error={titleError}
          helperText={titleError ? '必須項目です' : undefined}
        />
      </FormRow>

      <FormRow
        label="期間"
        required={isEditable}
        labelAlignment="center"
        labelMinWidth="100px"
      >
        <FlexBox alignItems="center" gap={1}>
          <DatePicker
            label=""
            value={periodStart}
            onChange={(newValue) => setPeriodStart(newValue ?? null)}
            disabled={!isEditable}
            error={periodStartError}
            helperText={periodStartError ? '必須項目です' : undefined}
          />
          <Font14 bold={false} sx={{ mx: 1 }}>～</Font14>
          <DatePicker
            label=""
            value={periodEnd}
            onChange={(newValue) => setPeriodEnd(newValue ?? null)}
            disabled={!isEditable}
            minDate={periodStart ?? undefined}
            error={periodEndError}
            helperText={periodEndError ? '必須項目です' : undefined}
          />
        </FlexBox>
      </FormRow>

      <FormRow
        label="内容"
        labelAlignment="top"
        labelMinWidth="100px"
      >
        <TextArea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isEditable}
          rows={6}
        />
      </FormRow>

      <FormRow
        label="添付"
        labelAlignment="top"
        labelMinWidth="100px"
      >
        <FileUploader
          initialFiles={attachments}
          onChange={handleFilesChange}
          disabled={!isEditable}
          endpoints={noticeUploadEndpoints}
        />
      </FormRow>
    </ModalWithButtons>
  );
};

export default NoticeDetailPopup;
