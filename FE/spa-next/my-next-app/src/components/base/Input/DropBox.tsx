// components/input/DropBox.tsx
import React, { useState } from "react";
import { FormControl, MenuItem, Select, SelectChangeEvent, ListItemIcon } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check"; // チェックアイコンを追加
import HelperText from '@/components/base/Input/HelperText';
import { OptionInfo } from '@/components/base/Input/OptionInfo';

// 定数定義
const DEFAULT_FONT_SIZE = "16px";
const DISABLED_BG_COLOR = "#f0f0f0";
const TEXT_COLOR = "black";
const BG_COLOR = "white";
const CHECK_ICON_SELECTED_COLOR = "green"; // 選択済みのチェックアイコンの色
const CHECK_ICON_UNSELECTED_COLOR = "white"; // 未選択時のチェックアイコンの色

type DropBoxProps = {
  name: string; // 名前（必須）
  id?: string; // HTML要素のID（オプション）
  options?: OptionInfo[]; // デフォルトの選択肢リスト（オプション）
  selectedValue?: string; // 現在選択されている値（オプション）
  onChange?: (event: SelectChangeEvent<string>) => void; // 値変更時のコールバック関数（オプション）
  disabled?: boolean; // ドロップダウンを無効化するかどうか（オプション）
  customStyle?: object; // スタイルをカスタマイズするオブジェクト（オプション）
  helperText?: string; // 補助テキスト（オプション）
  error?: boolean; // エラーメッセージ（オプション、未使用）
};

const DropBox: React.FC<DropBoxProps> = ({
  name,
  id,
  options = [], // デフォルト選択肢
  selectedValue, // 現在選択されている値
  onChange, // 値変更時のコールバック
  disabled = false, // 無効化フラグ（デフォルトはfalse）
  customStyle, // カスタムスタイル
  helperText, // 補助テキスト
  error, // エラーメッセージ
}) => {
  const [internalValue, setInternalValue] = useState<string>(selectedValue ?? "");

  const handleChange = (event: SelectChangeEvent<string>) => {
    setInternalValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <FormControl sx={{ width: internalValue ? "auto" : "100px", ...customStyle }} disabled={disabled} error={error}>
      <Select
        name={name}
        id={id}
        value={selectedValue ?? internalValue}
        onChange={handleChange}
        renderValue={(selected) => {
          const selectedOption = options.find((option) => option.value === selected);
          return selectedOption ? selectedOption.label : "";
        }}
        sx={{
          fontSize: DEFAULT_FONT_SIZE,
          color: TEXT_COLOR,
          backgroundColor: BG_COLOR,
          minWidth: "auto",
          width: internalValue ? "fit-content" : "100px",
          "& .MuiSelect-select": { color: TEXT_COLOR },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: TEXT_COLOR },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEXT_COLOR },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: TEXT_COLOR },
          "& .MuiSelect-select.Mui-disabled": {
            color: TEXT_COLOR,
            WebkitTextFillColor: TEXT_COLOR,
            backgroundColor: DISABLED_BG_COLOR,
          },
        }}
      >
        {options.map((option) => {
          const isSelected = internalValue === option.value;
          return (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              <ListItemIcon>
                <CheckIcon sx={{ color: isSelected ? CHECK_ICON_SELECTED_COLOR : CHECK_ICON_UNSELECTED_COLOR }} />
              </ListItemIcon>
              <span style={{ fontSize: DEFAULT_FONT_SIZE }}>{option.label}</span>
            </MenuItem>
          );
        })}
      </Select>
      <HelperText error={error} helperText={helperText} />
    </FormControl>
  );
};

export default DropBox;



