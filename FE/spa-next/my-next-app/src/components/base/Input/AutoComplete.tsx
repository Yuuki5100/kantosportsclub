// components/input/AutoComplete.tsx
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box'; // ← Container から Box に変更
import { FormControl } from '@mui/material';
import colors from '@/styles/colors';

const DISABLED_BG_COLOR = colors.nonActiveGray ?? "#f0f0f0";
const DISABLED_BD_COLOR = colors.nonActiveGrayBorder ?? '#BDBDBD';

// 選択肢の型定義
type Option = {
  label: string;
  value: string;
}

type AutoCompleteProps = {
  name: string;
  id?: string;
  options: Option[];
  defaultValue?: string;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  freeSolo?: boolean;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  onChange?: (value: Option | null) => void;
  onInputChange?: (value: string) => void;
  customStyle?: object;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  name,
  id,
  options,
  defaultValue,
  disabled = false,
  helperText,
  error,
  freeSolo = false,
  onBlur,
  onChange,
  onInputChange,
  customStyle,
}) => {
  const defaultOption = options.find((option) => option.value === defaultValue) || null;
  const [selectedOption, setSelectedOption] = useState<Option | null>(defaultOption);
  const [inputValue, setInputValue] = useState<string>(defaultOption?.label || defaultValue || '');

  useEffect(() => {
    if (defaultValue !== undefined) {
      const matched = options.find((option) => option.value === defaultValue) || null;
      setSelectedOption(matched);
      setInputValue(matched?.label || defaultValue);
    }
  }, [defaultValue, options]);

  const handleChange = (_: React.SyntheticEvent, value: Option | string | null) => {
    if (freeSolo && typeof value === 'string') {
      // フリーソロモードで文字列が入力された場合
      setSelectedOption(null);
      setInputValue(value);
      onChange?.(null);
    } else if (value && typeof value === 'object') {
      // 選択肢から選ばれた場合
      setSelectedOption(value);
      setInputValue(value.label);
      onChange?.(value);
    } else {
      // nullの場合（クリア）
      setSelectedOption(null);
      setInputValue('');
      onChange?.(null);
    }
  };

  const handleInputChange = (_: React.SyntheticEvent, value: string) => {
    setInputValue(value);
    onInputChange?.(value);
  };

  return (
    <FormControl fullWidth error={error}>
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-start', ...customStyle }}>
        <Autocomplete
          fullWidth
          options={options}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          value={selectedOption}
          inputValue={inputValue}
          freeSolo={freeSolo}
          noOptionsText="一致するものがありません"
          // freeSoloモードでもドロップダウンアイコンを表示し、ドロップダウンリストを利用可能にする
          forcePopupIcon={true}
          openOnFocus={freeSolo}
          selectOnFocus={false}
          handleHomeEndKeys={true}
          onBlur={onBlur}
          onChange={handleChange}
          onInputChange={handleInputChange}
          disabled={disabled}
          sx={{
            minWidth: 240,
            // 下向き矢印を確実に表示
            '& .MuiAutocomplete-endAdornment': {
              display: 'flex',
            },
            '& .MuiAutocomplete-popupIndicator': {
              display: 'block', // 下向き矢印を確実に表示
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              name={name}
              id={id}
              variant="outlined"
              disabled={disabled}
              helperText={helperText}
              error={error}
              sx={{
                // disabled状態でのスタイル調整（TextFieldで一元管理）
                '& .MuiInputBase-input.Mui-disabled': {
                  opacity: 1,
                  WebkitTextFillColor: `${colors.inputText} !important`,
                  color: `${colors.inputText} !important`,
                },
                // 入力ボックスの無効化色を上書き
                '& .MuiInputBase-root.Mui-disabled': {
                  opacity: 1,
                  color: `${colors.inputText} !important`,
                },
                '& .MuiOutlinedInput-root.Mui-disabled': {
                  backgroundColor: DISABLED_BG_COLOR, // 背景色をグレーに
                  '& fieldset': {
                    borderColor: DISABLED_BD_COLOR, // ボーダー色をグレーに
                  },
                },
                '& .MuiFormHelperText-root': {
                  whiteSpace: 'normal', // ✅ 折り返し許可
                  wordBreak: 'break-word', // ✅ 長文を途中で改行
                  overflowWrap: 'anywhere', // ✅ 英単語の途中でもOK
                },
              }}
            />
          )}
        />
      </Box>
    </FormControl>
  );
};

export default AutoComplete;
