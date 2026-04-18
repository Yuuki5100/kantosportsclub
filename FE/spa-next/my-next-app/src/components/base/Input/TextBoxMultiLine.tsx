// components/input/TextBoxMultiLine.tsx
import React, { useState } from "react";
import { TextField, FormHelperText, Box } from "@mui/material";
import colors from "@/styles/colors";

// 定数定義
const DEFAULT_FONT_SIZE = "16px";
const DEFAULT_TEXT_COLOR = "black";
const DISABLED_TEXT_COLOR = "black";
const DISABLED_BG_COLOR = colors.nonActiveGray ?? "#f0f0f0";
const DISABLED_BD_COLOR = colors.nonActiveGray ?? "#E0E0E0";
const HELPER_TEXT_COLOR = "#666";
const DEFAULT_MIN_WIDTH = "400px";
const DEFAULT_MAX_WIDTH = "800px";
const DEFAULT_ROWS = 4;

// プロップスの型定義
type TextAreaProps = {
  name: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onBlur?:React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  customStyle?: object;
  width?: string; // 幅をカスタマイズ
  rows?: number; // 行数をカスタマイズ
};

const TextArea: React.FC<TextAreaProps> = ({
  name,
  id,
  value,
  defaultValue = "",
  onBlur,
  onChange,
  maxLength,
  disabled,
  helperText,
  error,
  customStyle,
  width = "100%",
  rows = DEFAULT_ROWS,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const displayValue = value ?? internalValue;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(event);
    }
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let trimmed = e.currentTarget.value;
    if (maxLength !== undefined) {
      trimmed = trimmed.slice(0, maxLength);
    }
    setInternalValue(trimmed);
    e.currentTarget.value = trimmed;
    onBlur?.(e);
  };

  return (
    <Box sx={{ position: "relative", width, minWidth: DEFAULT_MIN_WIDTH, maxWidth: DEFAULT_MAX_WIDTH }}>
      <TextField
        name={name}
        id={id}
        multiline
        rows={rows}
        value={displayValue}
        onBlur={handleBlur}
        onChange={handleChange}
        variant="outlined"
        fullWidth
        disabled={disabled}
        helperText={helperText}
        error={error}
        sx={{
          padding: "4px",
          fontSize: DEFAULT_FONT_SIZE,
          color: DEFAULT_TEXT_COLOR,
          "& .MuiInputBase-input.Mui-disabled": {
            color: DISABLED_TEXT_COLOR,
            WebkitTextFillColor: DISABLED_TEXT_COLOR,
          },
          "& .MuiInputBase-root.Mui-disabled": {
            backgroundColor: DISABLED_BG_COLOR,
            border:DISABLED_BD_COLOR,
          },
          ...customStyle,
        }}
      />
      <FormHelperText sx={{ position: "absolute", bottom: "-20px", right: "8px", fontSize: "12px", color: HELPER_TEXT_COLOR }}>
        {maxLength !== undefined ? `${displayValue.length} / ${maxLength}` : `${displayValue.length} 文字`}
      </FormHelperText>
    </Box>
  );
};

export default TextArea;
