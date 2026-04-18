import React, { useState } from "react";
import { TextField, FormHelperText, Box } from "@mui/material";

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_TEXT_COLOR = "black";
const DISABLED_TEXT_COLOR = "black";
const DISABLED_BG_COLOR = "#f0f0f0";
const HELPER_TEXT_COLOR = "#666";
const DEFAULT_MIN_WIDTH = "400px";
const DEFAULT_MAX_WIDTH = "800px";

type FixedHeightTextAreaProps = {
  name: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  customStyle?: object;
  width?: string;
  rowLength: number;
};

const FixedHeightTextArea: React.FC<FixedHeightTextAreaProps> = ({
  name,
  id,
  value,
  defaultValue = "",
  onBlur,
  onChange,
  maxLength,
  disabled,
  error,
  customStyle,
  width = "100%",
  rowLength,
}) => {
  const [internalValue, setInternalValue] = useState(
    defaultValue.replace(/\n/g, "")
  );

  const displayValue = value !== undefined ? value.replace(/\n/g, "") : internalValue;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.replace(/\n/g, ""); // 改行除去
    if (maxLength !== undefined && newValue.length > maxLength) {
      return;
    }
    setInternalValue(newValue);
    onChange?.({ ...event, target: { ...event.target, value: newValue } });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // 改行を防ぐ
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width,
        minWidth: DEFAULT_MIN_WIDTH,
        maxWidth: DEFAULT_MAX_WIDTH,
      }}
    >
      <TextField
        name={name}
        id={id}
        multiline
        rows={rowLength}
        value={displayValue}
        onBlur={onBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        variant="outlined"
        fullWidth
        disabled={disabled}
        error={error}
        inputProps={{ style: { whiteSpace: "normal" } }}
        sx={{
          fontSize: `${DEFAULT_FONT_SIZE}px`,
          color: DEFAULT_TEXT_COLOR,
          "& .MuiInputBase-input": {
            lineHeight: `${DEFAULT_LINE_HEIGHT}em`,
            fontSize: `${DEFAULT_FONT_SIZE}px`,
            overflowY: "auto",
          },
          "& .MuiInputBase-input.Mui-disabled": {
            color: DISABLED_TEXT_COLOR,
            WebkitTextFillColor: DISABLED_TEXT_COLOR,
          },
          "& .MuiInputBase-root.Mui-disabled": {
            backgroundColor: DISABLED_BG_COLOR,
          },
          ...customStyle,
        }}
      />
      <FormHelperText
        sx={{
          position: "absolute",
          bottom: "-20px",
          right: "8px",
          fontSize: "12px",
          color: HELPER_TEXT_COLOR,
        }}
      >
        {maxLength !== undefined
          ? `${displayValue.length} / ${maxLength}`
          : `${displayValue.length} 文字`}
      </FormHelperText>
    </Box>
  );
};

export default FixedHeightTextArea;
