import React, { useEffect } from 'react';
import Box from '@base/Box/Box';
import FlexBox from '@base/Box/FlexBox';
import Section from '@base/Layout/Section';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useFileUploader, UploadedFile, FileUploaderEndpoints } from '@hooks/useFileUploader';
import { FileSlot } from '@/components/composite/FileUpload/FileSlot';
import Font14 from '@/components/base/Font/Font14';

type FileUploaderProps = {
  onChange?: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
  disabled?: boolean;
  endpoints?: FileUploaderEndpoints;
};

const FileUploader: React.FC<FileUploaderProps> = ({
  onChange,
  initialFiles = [],
  disabled = false,
  endpoints,
}) => {
  const { files, setFiles, handleDownload, fileInputRef, handleFileChange, deleteFile } =
    useFileUploader({
      onChange,
      initialFiles,
      endpoints,
    });

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles, setFiles]);

  const handleDelete = async (index: number) => {
    if (disabled) return;
    const file = files[index];
    if (!file) return;

    try {
      await deleteFile(file.fileId);
    } catch (err) {
      console.error('ファイル削除失敗:', err);
    }
  };

  return (
    <Section sx={{ maxWidth: 480, minWidth: 360, mx: 'auto', my: 2 }}>
      <Font14
        sx={{
          mt: 2,
          mb: 2,
          color: 'grey.600',
          textAlign: 'center',
        }}
      >
        ファイル名は50文字まで添付できます
      </Font14>

      <FlexBox alignItems="flex-start" gap={2}>
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: 1,
            padding: '4px 8px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            ml: 5,
            mr: 5,
            bgcolor: disabled ? '#f0f0f0' : 'transparent',
            borderColor: disabled ? '#ddd' : '#ccc',
            opacity: 1,
          }}
        >
          <AttachFileIcon fontSize="small" sx={{ color: disabled ? '#aaa' : 'primary.main' }} />
        </Box>

        <Box display="flex" flexDirection="column" gap={1} sx={{ flex: 1, p: 1 }}>
          {[0, 1, 2].map((i) => {
            const file = files[i];
            const isDeletable = !disabled && !!file;

            return (
              <FileSlot
                key={i}
                file={file}
                onClick={() => {
                  if (file) {
                    handleDownload(file);
                  } else if (!disabled) {
                    fileInputRef.current?.click();
                  }
                }}
                onDelete={isDeletable ? () => handleDelete(i) : undefined}
                disabled={disabled}
              />
            );
          })}
        </Box>
      </FlexBox>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled}
      />
    </Section>
  );
};

export default FileUploader;
