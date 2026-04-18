import React from 'react';
import ClickableFont14 from '@base/Font/ClickableFont14';
import type { UploadedFile } from '@hooks/useFileUploader';
import IconButtonBase from '@/components/base/Button/IconButtonBase';
import CloseIcon from '@mui/icons-material/Close';
import { FlexBox } from '@/components/base';

type FileSlotProps = {
  file?: UploadedFile;
  onClick: () => void;
  onDelete?: () => void;
  disabled?: boolean; // ← 追加
};

export const FileSlot: React.FC<FileSlotProps> = ({
  file,
  onClick,
  onDelete,
  disabled = false,
}) => {
  return (
    <FlexBox
      alignItems="center"
      sx={{
        px: 1,
        py: 0.5,
        backgroundColor: disabled ? '#f5f5f5' : 'transparent',
        transition: 'background-color 0.3s',
        minHeight: 40,
        width: '100%', // ← 親Boxに合わせる
        maxWidth: '100%', // ← overrunを防ぐ
        boxSizing: 'border-box',
      }}
    >
      <ClickableFont14
        sx={{
          flex: 1,
          textAlign: 'right',
          textDecoration: file ? 'underline' : 'none', // ← ★ プレースホルダーは下線なしに
          color: disabled ? 'gray.400' : 'primary.main',
          // cursor: disabled ? 'not-allowed' : 'pointer', // 全権限でDL可能にしたいとのこと Redmine #2306
          '&:hover': {
            color: disabled ? 'gray.400' : 'primary.dark',
          },
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
        onClick={() => {
          // if (!disabled) {
            onClick();
          // }
        }}
      >
        {file ? file.fileName : '------------------------------'}
      </ClickableFont14>

      {file && onDelete && !disabled && (
        <IconButtonBase
          size="small"
          onClick={onDelete}
          sx={{
            ml: 1,
            color: 'gray.400',
            '&:hover': { color: 'gray.700' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButtonBase>
      )}
    </FlexBox>
  );
};
