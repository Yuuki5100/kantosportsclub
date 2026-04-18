// components/input/DropBoxMultiSelected.tsx
import React from 'react';
import { FormControl, MenuItem, Select, ListItemIcon } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import HelperText from '@/components/base/Input/HelperText';
import { MultiSelectOption } from '@/components/base/Input/OptionInfo';

// 定数定義
const DEFAULT_FONT_SIZE = '16px';
const DEFAULT_TEXT_COLOR = 'black';
const DEFAULT_DISABLED_BG_COLOR = '#f0f0f0';
const CHECK_ICON_SELECTED_COLOR = 'green'; // 選択済みのアイコン色
const CHECK_ICON_UNSELECTED_COLOR = 'white'; // 未選択時のアイコン色

/**
 * ドロップダウンコンポーネントのProps
 */
type DropBoxMultiSelectedProps = {
  /**
   * 入力要素の `name` 属性
   */
  name: string;

  /**
   * 入力要素の `id` 属性
   */
  id?: string;

  /**
   * 選択肢
   */
  options?: MultiSelectOption[];

  /**
   * 値が変更されたときに呼び出されるコールバック関数
   *
   * @param event - 更新された選択値を含むイベント
   */
  setSelectedValues: (selectedValues: MultiSelectOption[]) => void;

  /**
   * true に設定するとドロップダウン全体を無効化
   */
  disabled?: boolean;

  /**
   * 外部から渡されるカスタムスタイル
   */
  customStyle?: object;

  /**
   * ドロップダウンの下に表示される補助テキスト
   */
  helperText?: string;

  /**
   * コンポーネントのエラー表示切替
   */
  error?: boolean;
};

/**
 * 複数選択可能なドロップダウンコンポーネント
 *
 * @param {*} {
 *   name,
 *   id,
 *   options = [],
 *   onChange,
 *   disabled = false,
 *   customStyle,
 *   helperText,
 *   error,
 * }
 * @return {*}
 */
const DropBoxMultiSelected: React.FC<DropBoxMultiSelectedProps> = ({
  name,
  id,
  options = [],
  setSelectedValues,
  disabled = false,
  customStyle,
  helperText,
  error,
}) => {
  const selectedOptions = options.filter((option) => option.selected);
  const onClickOption = (selectedValue: string) => {
    console.log(`Selected value: ${selectedValue}`);
    // 選択肢がクリックされたときの処理
    const newSelectedValues: MultiSelectOption[] = [...options];
    for (const value of newSelectedValues) {
      if (value.value === selectedValue) {
        value.selected = !value.selected; // 選択状態をトグル
      }
    }
    setSelectedValues(newSelectedValues);
  };

  /**
   * 選択済みの値をラベルに変換
   *
   * @param {string[]} selected
   * 選択済みの値の配列
   * @return {string}
   */
  const getSelectedLabels = (selected: string[]): string => {
    return selected
      .map((value) => {
        const matchedOption = options.find((opt) => opt.value === value);
        return matchedOption ? matchedOption.label : '';
      })
      .filter((label) => label !== '')
      .join(', ');
  };

  return (
    <FormControl
      sx={{
        minWidth: 'auto',
        width: 'fit-content',
        ...customStyle,
      }}
      disabled={disabled}
      error={error}
    >
      <Select
        multiple // 複数選択を有効化
        name={name}
        id={id}
        value={selectedOptions.map((option) => option.value)}
        renderValue={getSelectedLabels}
        sx={{
          fontSize: DEFAULT_FONT_SIZE,
          color: DEFAULT_TEXT_COLOR,
          whiteSpace: 'nowrap',
          '& .MuiSelect-select': { color: DEFAULT_TEXT_COLOR },
          '& .MuiSelect-select.Mui-disabled': {
            color: DEFAULT_TEXT_COLOR,
            WebkitTextFillColor: DEFAULT_TEXT_COLOR,
            backgroundColor: DEFAULT_DISABLED_BG_COLOR,
          },
        }}
      >
        {options.map((option) => (
          <OptionItem
            key={option.value}
            option={option}
            isSelected={options.find((x) => option.value === x.value)?.selected ?? false}
            onClickOption={() => onClickOption(option.value)}
          />
        ))}
      </Select>
      <HelperText error={error} helperText={helperText} />
    </FormControl>
  );
};

type OptionProps = {
  option: MultiSelectOption;
  isSelected: boolean;
  onClickOption: () => void;
};

const OptionItem: React.FC<OptionProps> = ({ option, isSelected, onClickOption }) => {
  return (
    <MenuItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      onClick={() => onClickOption()}
    >
      {/* チェックアイコン（選択済みだけ緑） */}
      <ListItemIcon>
        <CheckIcon
          sx={{
            color: isSelected ? CHECK_ICON_SELECTED_COLOR : CHECK_ICON_UNSELECTED_COLOR,
          }}
        />
      </ListItemIcon>
      <span style={{ fontSize: DEFAULT_FONT_SIZE, whiteSpace: 'nowrap' }}>{option.label}</span>
    </MenuItem>
  );
};

export default DropBoxMultiSelected;
