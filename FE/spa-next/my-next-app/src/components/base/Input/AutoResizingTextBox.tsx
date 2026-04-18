import React, { FocusEventHandler } from 'react';
import { FormControl, TextField, InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import colors from '@/styles/colors';

const TEXTBOX_WIDTH = '500px';
const FONT_SIZE = '16px';
const PADDING = '0px';
const DISABLED_BG_COLOR = colors.nonActiveGray ?? '#f0f0f0';
const DISABLED_BD_COLOR = colors.nonActiveGray ?? '#E0E0E0';
const UNIT_MARGIN_LEFT = '4px';

type AutoResizingTextBoxProps = {
  name: string;
  id?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  disabled?: boolean;
  maxLength?: number;
  unit?: string;
  helperText?: string;
  error?: boolean;
  customStyle?: object;
  clearButton?: boolean;
  clearButtonOnClick?: () => void;
  minRows?: number; // デフォルト高さ
};

const AutoResizingTextBox: React.FC<AutoResizingTextBoxProps> = ({
  name,
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  maxLength,
  unit,
  helperText,
  error,
  customStyle,
  clearButton = false,
  clearButtonOnClick,
  minRows = 1,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange?.(event);
  };

  const handleClear = () => {
    if (value !== undefined) {
      if (clearButtonOnClick) {
        clearButtonOnClick();
      } else if (onChange) {
        const dummyEvent = {
          target: { value: '', name },
          currentTarget: { value: '', name },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(dummyEvent);
      }
    } else if (clearButtonOnClick) {
      clearButtonOnClick();
    }
  };

  const showClearButton = clearButton && value !== undefined && value !== '' && !disabled;

  return (
    <FormControl>
      <TextField
        name={name}
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        multiline
        minRows={minRows}
        variant="outlined"
        fullWidth
        disabled={disabled}
        helperText={helperText}
        error={error}
        sx={{
          fontSize: FONT_SIZE,
          width: TEXTBOX_WIDTH,
          '& .MuiInputBase-input': {
            padding: PADDING,
            color: 'black',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          },
          '& .MuiOutlinedInput-root.Mui-disabled': {
            backgroundColor: DISABLED_BG_COLOR,
            border:DISABLED_BD_COLOR,
          },
          '& .MuiInputBase-input.Mui-disabled': {
            opacity: 1,
            WebkitTextFillColor: `${colors.inputText} !important`,
            backgroundColor: DISABLED_BG_COLOR,
            color: `${colors.inputText} !important`,
          },
          '& .MuiInputBase-adornedEnd': {
            paddingRight: 0,
          },
          '& .MuiOutlinedInput-root': {
            alignItems: 'flex-start',
            paddingRight: unit ? 0 : undefined,
          },
          '& .MuiOutlinedInput-notchedOutline': disabled ? { borderColor: 'transparent' } : {},
          position: 'relative',
          ...customStyle,
          '& .MuiFormHelperText-root': {
            whiteSpace: 'normal', // ✅ 折り返し許可
            wordBreak: 'break-word', // ✅ 長文を途中で改行
            overflowWrap: 'anywhere', // ✅ 英単語の途中でもOK
            lineHeight: 1.4,
          },
        }}
        InputProps={{
          endAdornment: (
            <>
              {showClearButton && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClear}
                    edge="end"
                    size="small"
                    aria-label="clear text input"
                    color="error"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )}
              {unit && (
                <InputAdornment position="end">
                  <span
                    style={{
                      color: disabled ? '#aaaaaa' : 'gray',
                      marginLeft: UNIT_MARGIN_LEFT,
                      marginRight: '8px',
                      opacity: disabled ? 0.7 : 1,
                      lineHeight: '1',
                    }}
                  >
                    {unit}
                  </span>
                </InputAdornment>
              )}
            </>
          ),
        }}
      />
    </FormControl>
  );
};

export default AutoResizingTextBox;
