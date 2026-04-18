// components/input/SelectBox.tsx
import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Paper,
  FormControl,
} from "@mui/material";
import HelperText from '@/components/base/Input/HelperText';
import { OptionInfo } from '@/components/base/Input/OptionInfo';

// 定数
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 160;
const PADDING = 1;
const TEXT_COLOR = "black";
const DISABLED_TEXT_COLOR = "#9e9e9e";
const CURSOR_DEFAULT = "default";
const CURSOR_POINTER = "pointer";
const SELECTED_BG_COLOR = "#e3f2fd";

type SelectBoxProps = {
  name: string;
  id?: string;
  options: OptionInfo[];
  selectedValues?: string[]; // オプション：外部制御用
  onBlur?: React.FocusEventHandler<HTMLButtonElement>; // オプション：フォーカスアウトイベント
  onChange?: (selected: string[]) => void; // オプション：外部制御用
  disabled?: boolean;
  customStyle?: object;
  helperText?: string;
  error?: boolean;
  width?: number;
  height?: number;
};

const SelectBox: React.FC<SelectBoxProps> = ({
  options,
  selectedValues,
  onBlur,
  onChange,
  disabled = false,
  customStyle,
  helperText,
  error,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  // 内部状態を持つ（外部制御がなければこれを使う）
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedValues ?? []);

  // 外部 selectedValues が更新されたら内部も更新
  useEffect(() => {
    if (selectedValues) {
      setInternalSelected(selectedValues);
    }
  }, [selectedValues]);

  const handleToggle = (value: string) => {
    if (disabled) return;

    const newSelected = internalSelected.includes(value)
      ? internalSelected.filter((item) => item !== value)
      : [...internalSelected, value];

    // 内部状態更新
    setInternalSelected(newSelected);

    // 外部コールバックがあれば通知
    if (onChange) {
      onChange(newSelected);
    }
  };

  return (
    <FormControl sx={{ width }} disabled={disabled}>
      <Paper
        sx={{
          width,
          maxHeight: height,
          overflowY: "auto",
          padding: PADDING,
          ...customStyle,
        }}
      >
        <List>
          {options.map((option) => {
            const isDisabled = option.disabled || disabled;
            const isSelected = internalSelected.includes(option.value);

            return (
              <ListItem
                key={option.value}
                component="div"
                onClick={() => !isDisabled && handleToggle(option.value)}
                sx={{
                  paddingY: 0,
                  cursor: isDisabled ? CURSOR_DEFAULT : CURSOR_POINTER,
                  backgroundColor: isSelected ? SELECTED_BG_COLOR : "transparent",
                  borderRadius: "4px",
                  transition: "background-color 0.2s ease-in-out",
                }}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  disabled={isDisabled}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={onBlur}
                  onChange={() => handleToggle(option.value)}
                />
                <ListItemText
                  primary={option.label}
                  sx={{ color: isDisabled ? DISABLED_TEXT_COLOR : TEXT_COLOR }}
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
      <HelperText error={error} helperText={helperText} />
    </FormControl>
  );
};

export default SelectBox;
