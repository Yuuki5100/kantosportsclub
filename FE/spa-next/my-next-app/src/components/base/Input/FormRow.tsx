import React from "react";
import { Box, Typography, Chip, Theme, SxProps } from "@mui/material";

type FormRowProps = {
  /**
   * フォームのラベル
   *
   */
  label: string;
  /**
   * フォームコンポーネント（例: Input, SelectBox, RadioButtonなど）
   */
  children: React.ReactNode;
  /**
   * カスタムスタイル
   */
  rowCustomStyle?: SxProps<Theme>;
  /**
   * 必須項目かどうか
   * true: 必須項目
   * false: 任意項目
   * undefined: 非表示
   */
  required?: boolean;
  /**
   * ラベルの垂直配置
   * - 'top': 上揃え（デフォルト）
   * - 'center': 中央揃え
   */
  labelAlignment?: 'top' | 'center';
  /**
   * ラベル部分の最小幅（指定が無ければ180px）
   */
  labelMinWidth?: string;
};

const FormRow: React.FC<FormRowProps> = ({
  label,
  children,
  rowCustomStyle,
  required,
  labelAlignment = 'top',
  labelMinWidth,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems={labelAlignment === 'center' ? 'center' : 'flex-start'}
      mb={2}
      sx={{
        ...rowCustomStyle,
        padding: rowCustomStyle ? '16px' : undefined,
      }}
    >
      <Box
        display="flex"
        alignItems={labelAlignment === 'center' ? 'center' : 'flex-start'}
        justifyContent="space-between"
        minWidth={labelMinWidth ?? '180px'}
        sx={{
          paddingTop: labelAlignment === 'top' ? '8px' : undefined,
          marginRight: 2,
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: "bold" }}
        >
          {label}
        </Typography>
        {required !== undefined && (
          <Chip
            label={required ? "必須": "任意"}
            size="small"
            color={required ? "error" : "default"}
            sx={{ height: '20px', fontSize: '0.7rem' }}
          />
        )}
      </Box>
      <Box flex="1" width="100%">
        {children}
      </Box>
    </Box>
  );
};

export default FormRow;
