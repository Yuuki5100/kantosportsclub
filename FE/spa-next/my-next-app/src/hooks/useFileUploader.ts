// src/hooks/useFileUploader.ts

import { useRef, useState } from 'react';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useMutation } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/api';
import { downloadBlobFile } from '@/utils/downloadBlobFile';
import { deleteFileApi, downloadFileApi, uploadFileApi, UploadedFileResponse } from '@/api/services/v1/fileService';
import { getMessage, MessageCodes } from '@/message';

// ---------- 型定義 ----------

export type UploadedFile = {
  fileId: string;
  fileName: string;
  fileSize: string;
};

export type FileUploaderEndpoints = {
  upload?: (file: File) => Promise<UploadedFileResponse>;
  download?: (file: UploadedFile) => Promise<Blob>;
  delete?: (fileId: string) => Promise<void>;
};

export type UseFileUploaderOptions = {
  onChange?: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
  endpoints?: FileUploaderEndpoints;
};

// ---------- フック本体 ----------

export const useFileUploader = (options?: UseFileUploaderOptions) => {
  const { onChange, initialFiles = [], endpoints = {} } = options || {};
  const { showSnackbar } = useSnackbar();

  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation<ApiResponse<UploadedFileResponse>, Error, File>({
    mutationFn: async (file: File) => {
      // オーバーライドがあればそちらを使用
      if (endpoints.upload) {
        const res = await endpoints.upload(file);
        return { success: true, data: res };
      }

      // デフォルト実装
      return await uploadFileApi(file, 'USER');
    },
    onSuccess: (res, file) => {
      if (res.success && res.data?.fileId && res.data?.originalName) {
        showSnackbar(getMessage(MessageCodes.UPLOAD_SUCCESS), 'SUCCESS');

        const newFile: UploadedFile = {
          fileId: res.data.fileId,
          fileName: res.data.originalName,
          fileSize: `${file.size}`,
        };

        const updated = [...files, newFile];
        setFiles(updated);
        onChange?.(updated);
      } else {
        const messages: string[] =
          Array.isArray(res.error)
            ? res.error
            : typeof res.error === 'string'
            ? [res.error]
            : res.error && 'message' in res.error
            ? [res.error.message]
            : [getMessage(MessageCodes.UPLOAD_FAILED)];

        messages.forEach((msg) => showSnackbar(msg, 'ALERT'));
      }
    },
    onError: (err) => {
      showSnackbar(
        getMessage(MessageCodes.ERROR_OCCURRED_WITH_DETAIL, err.message || getMessage(MessageCodes.UPLOAD_FAILED)),
        'ALERT'
      );
    },
  });

  const handleUpload = async (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
      e.target.value = ''; // 同じファイルの再選択を許可
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      let blob: Blob;

      if (endpoints.download) {
        blob = await endpoints.download(file);
      } else {
        blob = await downloadFileApi(file.fileId);
      }

      downloadBlobFile(blob, file.fileName);
    } catch (err) {
      showSnackbar(
        err instanceof Error ? `🚨 ${err.message}` : getMessage(MessageCodes.DOWNLOAD_FAILED),
        'ALERT'
      );
    }
  };

  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      if (endpoints.delete) {
        await endpoints.delete(fileId);
      } else {
        await deleteFileApi(fileId);
      }

      const updated = files.filter((f) => f.fileId !== fileId);
      setFiles(updated);
      onChange?.(updated);
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, '削除'), 'SUCCESS');
    } catch (err) {
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, '削除'), 'ALERT');
      throw err;
    }
  };

  return {
    files,
    handleUpload,
    handleDownload,
    fileInputRef,
    handleFileChange,
    setFiles,
    deleteFile,
  };
};
