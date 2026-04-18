// components/input/RadioButton.tsx
import React, { useState } from "react";
import { FormControl, RadioGroup, FormControlLabel, Radio, Box } from "@mui/material";
import HelperText from '@/components/base/Input/HelperText';

// 定数定義
const RADIO_ICON_SIZE = "16px";
const FONT_SIZE = "16px";
const ENABLED_TEXT_COLOR = "black";
const DISABLED_TEXT_COLOR = "#9e9e9e";

type RadioButtonProps = {
  name: string; // 名前（必須）
  id?: string; // HTML要素のID（オプション）
  options: { value: string; label: string; disabled?: boolean }[]; // ラジオボタンの選択肢リスト
  selectedValue?: string; // 現在選択されている値（オプション）
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // 選択変更時のハンドラー（省略可能）
  disabled?: boolean; // 全体の非活性設定（オプション）
  customStyle?: object; // カスタムスタイルを適用するオプション
  helperText?: string; // 補助テキスト（オプション）
  error?: boolean; // エラーメッセージ（オプション）
  direction?: "row" | "column"; // 並び方向（デフォルト: "column"）
  maxColumns?: number; // direction="row" の場合の最大列数
};

const RadioButton: React.FC<RadioButtonProps> = ({
  name,
  id,
  options,
  selectedValue,
  onBlur,
  onChange,
  disabled = false,
  customStyle,
  helperText,
  error,
  direction = "column",
  maxColumns,
}) => {
  const defaultSelected = options.length > 0 ? options[0].value : ""; // 最初の選択肢をデフォルト選択
  const [internalValue, setInternalValue] = useState<string>(selectedValue ?? defaultSelected);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <FormControl sx={{ ...customStyle }} disabled={disabled} error={error}>
      <RadioGroup
        name={name}
        id={id}
        value={selectedValue ?? internalValue}
        onBlur={onBlur}
        onChange={handleChange}
        sx={{
          display: "flex",
          flexDirection: direction === "column" ? "column" : "row",
          flexWrap: direction === "row" && maxColumns ? "wrap" : "nowrap",
        }}
      >
        {options.map((option) => (
          <Box
            key={option.value}
            sx={{
              flex: direction === "row" && maxColumns ? `1 1 calc(100% / ${maxColumns})` : "auto",
              display: "flex",
            }}
          >
            <FormControlLabel
              value={option.value}
              control={
                <Radio
                  sx={{
                    "& .MuiSvgIcon-root": { fontSize: RADIO_ICON_SIZE },
                    color: disabled ? DISABLED_TEXT_COLOR : "primary",
                  }}
                  checked={(selectedValue ?? internalValue) === option.value}
                  disabled={option.disabled || disabled}
                />
              }
              label={
                <span
                  style={{
                    fontSize: FONT_SIZE,
                    color:
                      disabled && (selectedValue ?? internalValue) !== option.value
                        ? DISABLED_TEXT_COLOR
                        : ENABLED_TEXT_COLOR,
                  }}
                >
                  {option.label}
                </span>
              }
              disabled={option.disabled || disabled}
            />
          </Box>
        ))}
      </RadioGroup>
      <HelperText error={error} helperText={helperText} />
    </FormControl>
  );
};

export default RadioButton;

