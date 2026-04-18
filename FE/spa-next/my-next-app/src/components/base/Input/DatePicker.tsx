import React, { useRef, useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';
import { IconButton, InputAdornment, FormControl } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import colors from '@/styles/colors';
import { getMessage, MessageCodes } from '@/message';

export type DatePickerProps = {
  /**
   * ラベル
   *
   * @type {string}
   */
  label?: string;
  value?: Dayjs | null;
  onChange?: (newValue: Dayjs | undefined) => void;

  /**
   * 最小日付
   *
   * @type {Dayjs}
   */
  minDate?: Dayjs;

  /**
   * 最大日付
   *
   * @type {Dayjs}
   */
  maxDate?: Dayjs;

  /**
   * 選択可能な曜日の配列
   * 0: 日曜日, 1: 月曜日, 2: 火曜日, 3: 水曜日, 4: 木曜日, 5: 金曜日, 6: 土曜日
   *
   * @type {number[]}
   */
  allowedDaysOfWeek?: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];

  /**
   * 入力を無効にするかどうか
   *
   * @type {boolean}
   */
  disabled?: boolean;

  /**
   * ヘルパーテキスト
   *
   * @type {string}
   */
  helperText?: string;

  /**
   * エラー表示切り替え
   *
   * @type {boolean}
   */
  error?: boolean;

  format?: string;

  /**
   * カスタムスタイル
   *
   * @type {object}
   */
  customStyle?: object;

  /**
   * フォーカスが外れた時のコールバック
   *
   * @type {function}
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

const DatePicker: React.FC<DatePickerProps> = ({
  label = '日付を選択',
  value,
  onChange,
  minDate,
  maxDate,
  allowedDaysOfWeek,
  disabled = false,
  helperText,
  error,
  format = 'YYYY/MM/DD',
  customStyle = {},
  onBlur,
}) => {
  const DISABLED_BG_COLOR = colors.nonActiveGray ?? '#f0f0f0';
  const DISABLED_BD_COLOR = colors.nonActiveGray ?? '#E0E0E0';
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalError, setInternalError] = useState(false);
  const [internalHelperText, setInternalHelperText] = useState('');

  const handleChange = (newValue?: Dayjs) => {
    onChange?.(newValue);
  };

  const handleClear = () => {
    onChange?.(undefined);
  };

  // 指定された曜日のみを選択可能にする関数
  const shouldDisableDate = (date: Dayjs) => {
    if (!allowedDaysOfWeek || allowedDaysOfWeek.length === 0) {
      return false; // allowedDaysOfWeekが指定されていない場合は全日選択可能
    }
    return !allowedDaysOfWeek.includes(date.day());
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // relatedTargetがDatePickerの内部要素かどうかをチェック
    const relatedTarget = event.relatedTarget as HTMLElement;
    const container = containerRef.current;

    // MUIのDatePickerポップアップやボタンを判定
    const isDatePickerRelated =
      relatedTarget &&
      // 自身のコンテナ内の要素
      ((container && container.contains(relatedTarget)) ||
        // MUIのDatePickerポップアップ（ポータルで生成される）
        relatedTarget.closest('[role="dialog"]') ||
        relatedTarget.closest('.MuiPickersPopper-root') ||
        relatedTarget.closest('.MuiDateCalendar-root') ||
        relatedTarget.closest('.MuiPickersLayout-root') ||
        // カレンダーボタン
        relatedTarget.closest('button[aria-label*="calendar"]') ||
        relatedTarget.closest('button[aria-label*="Open calendar"]') ||
        // MUIの一般的なポップアップ関連クラス
        relatedTarget.closest('.MuiPopper-root') ||
        relatedTarget.closest('.MuiPopover-root'));

    if (isDatePickerRelated) {
      // フォーカスがDatePickerの内部要素に移動した場合はonBlurを発火させない
      return;
    }

    // 外部への真のフォーカス移動の場合のみonBlurを呼び出す
    // HTMLInputElementのイベントとしてonBlurを呼び出す
    const inputEvent = {
      ...event,
      target: event.target as HTMLInputElement,
    } as React.FocusEvent<HTMLInputElement>;

    onBlur?.(inputEvent);
  };

  // カレンダーポップアップにイベントリスナーを追加
  useEffect(() => {
    if (!onBlur) return;

    const handleDocumentFocusOut = (event: FocusEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const activeElement = document.activeElement as HTMLElement;
      const relatedTarget = event.relatedTarget as HTMLElement;
      const eventTarget = event.target as HTMLElement;

      // MUIのDatePicker関連要素かどうかを判定
      const isDatePickerElement = (element: HTMLElement) => {
        if (!element) return false;
        return (
          container.contains(element) ||
          element.closest('[role="dialog"]') ||
          element.closest('.MuiPickersPopper-root') ||
          element.closest('.MuiDateCalendar-root') ||
          element.closest('.MuiPickersLayout-root') ||
          element.closest('.MuiPopper-root') ||
          element.closest('.MuiPopover-root')
        );
      };

      // カレンダー内の要素からフォーカスが外れた場合
      const isFromCalendar =
        isDatePickerElement(eventTarget) && eventTarget !== container.querySelector('input');

      // フォーカスがDatePicker全体から外れた場合
      const isFocusOutsideDatePicker =
        !isDatePickerElement(activeElement) && !isDatePickerElement(relatedTarget);

      if (isFromCalendar && isFocusOutsideDatePicker) {
        // カレンダーから外部へのフォーカス移動
        const inputElement = container.querySelector('input') as HTMLInputElement;

        // 最小限のFocusEventオブジェクトを作成
        const mockEvent = {
          target: inputElement,
          currentTarget: inputElement,
          relatedTarget: relatedTarget,
        };

        // unknownを経由して型安全にキャスト
        onBlur(mockEvent as unknown as React.FocusEvent<HTMLInputElement>);
      }
    };

    document.addEventListener('focusout', handleDocumentFocusOut, true);

    return () => {
      document.removeEventListener('focusout', handleDocumentFocusOut, true);
    };
  }, [onBlur]);

  return (
    <FormControl fullWidth sx={{ ...customStyle }} error ref={containerRef}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MUIDatePicker
          label={label}
          value={value}
          onChange={(newValue) => handleChange(newValue ?? undefined)}
          minDate={minDate}
          maxDate={maxDate}
          shouldDisableDate={shouldDisableDate}
          disabled={disabled}
          format={format}
          onError={(reason) => {
            if (reason === 'invalidDate') {
              setInternalError(true);
              setInternalHelperText(getMessage(MessageCodes.DATE_INVALID));
            } else {
              setInternalError(false);
              setInternalHelperText('');
            }
          }}
          slotProps={{
            textField: {
              helperText: internalHelperText !=='' ?  internalHelperText : helperText,
              error: internalError ? true : error ? true : false,
              variant: 'outlined',
              onBlur: handleBlur,
              sx: {
                // ⬇️ disabled状態での文字色を強制上書き
                '& .MuiInputBase-input.Mui-disabled': {
                  opacity: 1, // デフォルトの半透明を無効化
                  WebkitTextFillColor: colors.inputText, // Safari/Chrome用
                  backgroundColor: DISABLED_BG_COLOR,
                  color: colors.inputText, // テキスト色
                },
                // 入力枠全体の無効化スタイル
                '& .MuiOutlinedInput-root.Mui-disabled': {
                  backgroundColor: DISABLED_BG_COLOR,
                  border:DISABLED_BD_COLOR,
                },
                // クリアボタン (バッテン) の無効化スタイル
                '& .MuiIconButton-root.Mui-disabled': {
                  backgroundColor: DISABLED_BG_COLOR,
                  color: colors.inputText,
                },
              },
              InputProps: value
                ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClear}
                        edge="end"
                        size="small"
                        disabled={disabled}
                        aria-label="clear DatePicker"
                        color="error"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }
                : {},
            },
          }}
        />
      </LocalizationProvider>
    </FormControl>
  );
};
export default DatePicker;
