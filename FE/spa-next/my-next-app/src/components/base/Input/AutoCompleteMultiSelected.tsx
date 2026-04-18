// components/input/AutoCompleteMultiSelected.tsx
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Box } from "@mui/material";
import colors from "@/styles/colors";

const DISABLED_BD_COLOR = colors.nonActiveGrayBorder ?? '#BDBDBD';

// 型定義
interface Option {
  label: string;
  value: string;
}

interface AutoCompleteMultiSelectedProps {

  /**
   * 入力要素の `name` 属性
   */
  name: string;

  /**
   * 入力要素の `id` 属性
   */
  id?: string;

  /**
   * 選択肢の配列
   */
  options: Option[];

  /**
   * 初期選択値
   */
  defaultValue?: string[];

  /**
   * ドロップダウンを無効化するかどうか
   */
  disabled?: boolean;

  /**
   * ヘルパーテキスト
   */
  helperText?: string;

  /**
   * エラー表示
   */
  error?: boolean;

  /**
   * フォーカスアウト時のコールバック関数
   */
  onBlur?: React.FocusEventHandler<HTMLDivElement>;

  /**
   * 選択肢が変更されたときのコールバック関数
   * @param value
   * @returns
   */
  onChange?: (value: Option[]) => void;

  /**
   * 外部から渡されるカスタムスタイル
   */
  customStyle?: object;

  /**
   * ユーザーが入力したカスタムの値を許可するかどうか
   * true の場合、ユーザーが入力した値がオプションにない場合でも追加される
   */
  allowCustomValues?: boolean;

  /**
   * プレースホルダーテキスト
   */
  placeholder?: string;
}

const AutoCompleteMultiSelected: React.FC<AutoCompleteMultiSelectedProps> = ({
  name,
  id,
  options,
  defaultValue = [],
  disabled = false,
  helperText,
  error,
  onBlur,
  onChange,
  customStyle,
  allowCustomValues = false,
  placeholder,
}) => {
  // カスタム値を含む選択肢の状態管理
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
  const [customValues, setCustomValues] = useState<Option[]>([]);

  // オプションリストとカスタム値を統合
  const allOptions = [...options, ...customValues];

  // selectedValuesに基づいて選択済みのOption[]を返す
  const selectedOptions = allOptions.filter((opt) => selectedValues.includes(opt.value));

  // 変更ハンドラー - freeSolo時はstring型の値も処理する必要がある
  const handleChange = (_: React.SyntheticEvent, newValues: (Option | string)[]) => {
    // 新しい選択値の処理
    const newSelectedOptions: Option[] = [];
    const newCustomOptions: Option[] = [...customValues];

    newValues.forEach(item => {
      if (typeof item === 'string' && allowCustomValues) {
        // 文字列の場合は新しいカスタムオプションとして扱う
        const existingOption = allOptions.find(opt =>
          opt.value === item || opt.label === item || opt.label.toLowerCase() === item.toLowerCase()
        );

        if (existingOption) {
          // 既存のオプションと一致する場合はそれを使用
          // 重複を避けるため、すでに追加されていないか確認
          if (!newSelectedOptions.some(opt => opt.value === existingOption.value)) {
            newSelectedOptions.push(existingOption);
          }
        } else {
          // 新しいカスタム値を作成
          const newOption: Option = { label: item, value: item };
          // 重複を避けるため、すでに追加されていないか確認
          if (!newCustomOptions.some(opt => opt.value === newOption.value)) {
            newCustomOptions.push(newOption);
          }
          if (!newSelectedOptions.some(opt => opt.value === newOption.value)) {
            newSelectedOptions.push(newOption);
          }
        }
      } else if (typeof item === 'object') {
        // Optionオブジェクトの場合はそのまま追加
        // 重複を避けるため、すでに追加されていないか確認
        if (!newSelectedOptions.some(opt => opt.value === item.value)) {
          newSelectedOptions.push(item);
        }
      }
    });

    setCustomValues(newCustomOptions);
    setSelectedValues(newSelectedOptions.map(opt => opt.value));
    onChange?.(newSelectedOptions);
  };

  return (
    <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-start", ...customStyle }}>
      <Autocomplete
        fullWidth
        multiple
        options={allowCustomValues ? [...options, ...customValues] : options}
        value={selectedOptions}
        onBlur={onBlur}
        onChange={handleChange}
        getOptionLabel={(option) => {
          // optionが文字列の場合（freeSoloモードのとき）
          if (typeof option === 'string') {
            return option;
          }
          // optionがオブジェクトの場合
          return option.label;
        }}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        disabled={disabled}
        disableCloseOnSelect
        filterSelectedOptions
        freeSolo={allowCustomValues}
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
        sx={{
          minWidth: 300,
          // チップ（タグ）の無効化色を上書き
          '& .MuiChip-root.Mui-disabled': {
            opacity: 1, // ← デフォルト0.38を打ち消す
            color: `${colors.inputText} !important`,
            border:DISABLED_BD_COLOR,
            WebkitTextFillColor: `${colors.inputText} !important`,
          },
          '& .MuiButtonBase-root.MuiChip-label': {
            opacity: 1, // ← デフォルト0.38を打ち消す
            color: `${colors.inputText} !important`,
            WebkitTextFillColor: `${colors.inputText} !important`,
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            id={id}
            variant="outlined"
            placeholder={selectedOptions.length === 0 ? placeholder : undefined}
            disabled={disabled}
            helperText={helperText}
            error={error}
          />
        )}
      />
    </Box>
  );
};

export default AutoCompleteMultiSelected;
