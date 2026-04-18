import React, { FocusEventHandler, useState, useEffect } from 'react';
import { FormControl, TextField, InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { formatValue, unformatNumber } from '@/utils/formatters';
import colors from '@/styles/colors';

const TEXTBOX_WIDTH = '100%';
const FONT_SIZE = '16px';
const PADDING = '8px';
const DISABLED_BG_COLOR = colors.nonActiveGray ?? '#f0f0f0';
const DISABLED_BD_COLOR = colors.nonActiveGrayBorder ?? '#BDBDBD';
const UNIT_MARGIN_LEFT = '4px';

type TextBoxProps = {
  name: string;
  id?: string;
  type?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  disabled?: boolean;
  maxLength?: number;
  /** number型の場合の最大値制限。入力時と focus out 時に適用される */
  maxValue?: number;
  /** number型の場合の最小値制限。入力時と focus out 時に適用される */
  minValue?: number;
  helperText?: string;
  error?: boolean;
  customStyle?: object;
  clearButton?: boolean;
  clearButtonOnClick?: () => void;
  textAlign?: 'left' | 'center' | 'right';
  prefix?: string;
  unit?: string;
  endAdornment?: React.ReactNode;
  format?: 'number' | 'currency' | 'percent' | 'none';
  decimalScale?: number;
};

const TextBox: React.FC<TextBoxProps> = ({
  name,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  disabled = false,
  maxLength,
  maxValue,
  minValue,
  helperText,
  error,
  customStyle,
  clearButton = false,
  clearButtonOnClick,
  textAlign = 'left',
  prefix,
  unit,
  endAdornment,
  format = 'none',
  decimalScale = 2,
}) => {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value ?? '');
  const [showPassword, setShowPassword] = useState(false);

  // 外部valueが変わったら同期
  useEffect(() => {
    if (focused || value === undefined) return;

    if (format !== 'none' && value !== null && value !== '') {
      setDisplayValue(formatValue(value, format, { prefix, decimalScale }));
    } else {
      setDisplayValue(value ?? '');
    }
  }, [value, format, prefix, decimalScale, focused]);

  const handleFocus = () => {
    setFocused(true);
    if (format !== 'none') {
      setDisplayValue(unformatNumber(displayValue));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocused(false);

    // number型の場合の値制限チェック（blur時の調整）
    if (type === 'number' && displayValue !== '' && displayValue !== '-') {
      const numValue = parseFloat(displayValue);
      if (!isNaN(numValue)) {
        let adjustedValue = numValue;
        let valueChanged = false;

        if (minValue !== undefined && numValue < minValue) {
          adjustedValue = minValue;
          valueChanged = true;
        } else if (maxValue !== undefined && numValue > maxValue) {
          adjustedValue = maxValue;
          valueChanged = true;
        }

        if (valueChanged) {
          const adjustedValueStr = adjustedValue.toString();
          setDisplayValue(adjustedValueStr);
          // onChangeイベントを発火して親コンポーネントに調整された値を通知
          if (onChange) {
            const adjustedEvent = {
              ...e,
              target: { ...e.target, value: adjustedValueStr, name },
              currentTarget: { ...e.currentTarget, value: adjustedValueStr, name },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(adjustedEvent);
          }
        }
      }
    }

    if (format !== 'none') {
      setDisplayValue(formatValue(displayValue, format, { prefix, decimalScale }));
    }

    if (format === 'number' && maxLength && maxLength < e.target.value.length) {
      const raw = e.currentTarget.value;
      if (!raw) {
        setDisplayValue('');
        onBlur?.(e);
        return;
      }

      // 数値フォーマット解除
      const unformatted = unformatNumber(raw);

      // 整数部・小数部に分割
      const [intPartRaw, decPartRaw = ''] = unformatted.split('.');

      // 整数部を最大 (maxLength - decimalScale) に切り詰め
      const intPart = intPartRaw.slice(0, (maxLength - decimalScale));

      // 小数部を decimalScale 桁に切り詰め
      const decPart = decimalScale > 0 ? decPartRaw.slice(0, decimalScale) : '';

      // 再構築
      let trimmed = decPart ? `${intPart}.${decPart}` : intPart;
      trimmed = formatValue(trimmed, format, { prefix, decimalScale });
      setDisplayValue(trimmed);
      e.currentTarget.value = trimmed;

    } else if (maxLength && maxLength < e.target.value.length) {
      const trimmed = e.currentTarget.value.slice(0, maxLength);
      setDisplayValue(trimmed);
      e.currentTarget.value = trimmed;
    }
    onBlur?.(e);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    //   if (maxLength && raw.length > maxLength) return;

    // number型の場合の値制限チェック
    if (type === 'number' && raw !== '' && raw !== '-') {
      const numValue = parseFloat(raw);
      if (!isNaN(numValue)) {
        if (minValue !== undefined && numValue < minValue) {
          return; // 最小値未満の場合は入力を受け付けない
        }
        if (maxValue !== undefined && numValue > maxValue) {
          return; // 最大値超過の場合は入力を受け付けない
        }
      }
    }

    setDisplayValue(raw);
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
  const showPrefix = prefix && !focused;
  const showUnit = !!unit;
  const showPasswordToggle = type === 'password';
  const customEndAdornment = endAdornment ? (
    <InputAdornment position="end">{endAdornment}</InputAdornment>
  ) : null;

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormControl fullWidth>
      <TextField
        name={name}
        id={id}
        type={type === 'password' && showPassword ? 'text' : type}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        variant="outlined"
        fullWidth
        disabled={disabled}
        helperText={helperText}
        error={error}
        inputProps={{
          ...(type === 'number' && minValue !== undefined && { min: minValue }),
          ...(type === 'number' && maxValue !== undefined && { max: maxValue }),
        }}
        sx={{
          fontSize: FONT_SIZE,
          width: TEXTBOX_WIDTH,
          '& .MuiInputBase-root.Mui-disabled': {
            opacity: 1,
          },
          '& .MuiInputBase-input': {
            width: '100%',
            padding: PADDING,
            // display: 'flex',
            display: 'block',
            color: 'black',
            textAlign,
            '&::-ms-reveal': {
              display: 'none',
            },
            '&::-ms-clear': {
              display: 'none',
            },
          },
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: colors.inputText,
            backgroundColor: DISABLED_BG_COLOR,
            border:DISABLED_BD_COLOR,
            color: colors.inputText,
          },
          '& .MuiInputBase-adornedEnd': {
            paddingRight: 0,
          },
          '& .MuiOutlinedInput-root': {
            paddingRight: showUnit ? 0 : undefined,
          },
          '& .MuiOutlinedInput-notchedOutline': disabled ? { borderColor: 'transparent' } : {},
          position: 'relative',
          ...customStyle,
        }}
        InputProps={{
          startAdornment: showPrefix ? (
            <InputAdornment position="start">
              <span
                style={{
                  width: '100%',
                  color: disabled ? '#aaaaaa' : 'gray',
                  opacity: disabled ? 0.7 : 1,
                  marginRight: '4px',
                }}
              >
                {prefix}
              </span>
            </InputAdornment>
          ) : undefined,
          endAdornment: (
            <>
              {customEndAdornment}
              {showPasswordToggle && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    size="small"
                    aria-label={showPassword ? 'hide password' : 'show password'}
                    disabled={disabled}
                    sx={{ paddingRight: '6px', marginRight: 0 }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )}
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
              {showUnit && (
                <InputAdornment position="end">
                  <span
                    style={{
                      color: disabled ? '#aaaaaa' : 'gray',
                      marginLeft: UNIT_MARGIN_LEFT,
                      marginRight: '8px',
                      opacity: disabled ? 0.7 : 1,
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

export default TextBox;
