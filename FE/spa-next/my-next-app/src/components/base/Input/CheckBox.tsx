// components/input/CheckBox.tsx
import React, { useEffect, useState } from "react";
import { FormControl, FormGroup, FormControlLabel, Checkbox, Box } from "@mui/material";
import HelperText from '@/components/base/Input/HelperText';
import { OptionInfo } from '@/components/base/Input/OptionInfo';

// 定数定義
const CHECKBOX_ICON_SIZE = "16px";
const FONT_SIZE = "16px";
const ENABLED_TEXT_COLOR = "black";
const DISABLED_TEXT_COLOR = "#9e9e9e";

type CheckBoxProps = {
  name: string; // 名前（必須）
  id?: string; // HTML要素のID（オプション）
  options: OptionInfo[]; // チェックボックスの選択肢リスト
  selectedValues?: string[]; // 現在選択されている値（オプション）
  onChange?: (selectedValues: string[]) => void; // 選択変更時のハンドラー（省略可能）
  disabled?: boolean; // 全体の非活性設定（オプション）
  customStyle?: object; // カスタムスタイルを適用するオプション
  helperText?: string; // 補助テキスト（オプション）
  error?: boolean; // エラーメッセージ（オプション）
  direction?: "row" | "column"; // 並び方向（デフォルト: "column"）
  maxColumns?: number; // direction="row" の場合の最大列数
};

const CheckBox: React.FC<CheckBoxProps> = ({
  id,
  options,
  selectedValues = [],
  onChange,
  disabled = false,
  customStyle,
  helperText,
  error,
  direction = "column",
  maxColumns,
}) => {
  const [internalValues, setInternalValues] = useState<string[]>(selectedValues);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const newSelectedValues = internalValues.includes(newValue)
      ? internalValues.filter((value) => value !== newValue)
      : [...internalValues, newValue];

    setInternalValues(newSelectedValues);
    if (onChange) {
      onChange(newSelectedValues);
    }
  };

  useEffect(()=>{
	setInternalValues(selectedValues);
  }, [selectedValues])

  return (
    <FormControl sx={{ ...customStyle }} disabled={disabled}>
      <FormGroup
        id={id}
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
              control={
                <Checkbox
                  sx={{
                    "& .MuiSvgIcon-root": { fontSize: CHECKBOX_ICON_SIZE },
                    color: disabled ? DISABLED_TEXT_COLOR : "primary",
                  }}
                  checked={internalValues.includes(option.value)}
                  onChange={handleChange}
                  value={option.value}
                  disabled={option.disabled || disabled}
                />
              }
              label={
                <span
                  style={{
                    fontSize: FONT_SIZE,
                    color:
                      disabled && !internalValues.includes(option.value)
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
      </FormGroup>
      <HelperText error={error} helperText={helperText} />
    </FormControl>
  );
};

export default CheckBox;


