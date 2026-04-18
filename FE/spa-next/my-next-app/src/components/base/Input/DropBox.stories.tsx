import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Paper, SelectChangeEvent } from '@mui/material';
import DropBox from './DropBox';
import { OptionInfo } from './OptionInfo';

const meta = {
  title: 'common-architecture/input/DropBox',
  component: DropBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DropBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプル選択肢
const fruitOptions: OptionInfo[] = [
  { value: 'apple', label: 'りんご' },
  { value: 'orange', label: 'オレンジ' },
  { value: 'banana', label: 'バナナ' },
  { value: 'grape', label: 'ぶどう' },
  { value: 'melon', label: 'メロン' },
];

/**
 * 基本的な使用例
 */
export const Default: Story = {
  args: {
    name: 'fruit',
    options: fruitOptions,
  },
};

/**
 * 初期値を設定した例
 */
export const WithSelectedValue: Story = {
  args: {
    name: 'fruit',
    options: fruitOptions,
    selectedValue: 'banana',
  },
};

/**
 * 無効化された例
 */
export const Disabled: Story = {
  args: {
    name: 'fruit',
    options: fruitOptions,
    selectedValue: 'apple',
    disabled: true,
  },
};

/**
 * エラー状態の例
 */
export const WithError: Story = {
  args: {
    name: 'fruit',
    options: fruitOptions,
    error: true,
    helperText: '果物を選択してください',
  },
};

/**
 * 一部の選択肢が無効化された例
 */
export const WithDisabledOptions: Story = {
  args: {
    name: 'fruit',
    options: [
      { value: 'apple', label: 'りんご' },
      { value: 'orange', label: 'オレンジ', disabled: true },
      { value: 'banana', label: 'バナナ' },
      { value: 'grape', label: 'ぶどう', disabled: true },
      { value: 'melon', label: 'メロン' },
    ],
  },
};

/**
 * カスタムスタイルの例
 */
export const WithCustomStyle: Story = {
  args: {
    name: 'fruit',
    options: fruitOptions,
    customStyle: {
      minWidth: '200px',
      marginTop: '10px',
    },
  },
};

/**
 * onChangeとonBlurイベントのデモ
 */
const EventDemoComponent = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [changeCount, setChangeCount] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState<string>('-');

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedValue(event.target.value);
    setChangeCount((prev) => prev + 1);
    setLastChangeTime(new Date().toLocaleTimeString());
  };
  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        DropBoxイベントデモ
      </Typography>

      <Box sx={{ mb: 3 }}>
        <DropBox
          name="fruit"
          options={fruitOptions}
          selectedValue={selectedValue}
          onChange={handleChange}
        />
      </Box>

      <Paper elevation={3} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom>
          イベントモニタリング:
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2">
              <strong>onChange イベント:</strong>
            </Typography>
            <Typography variant="body2">
              発生回数: {changeCount}
            </Typography>
            <Typography variant="body2">
              最終発生時間: {lastChangeTime}
            </Typography>
            <Typography variant="body2">
              選択された値: {selectedValue || 'なし'}
            </Typography>
            <Typography variant="body2">
              選択された果物: {fruitOptions.find(opt => opt.value === selectedValue)?.label || 'なし'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ※ onChangeイベントは選択肢を選択すると発生します。
            onBlurイベントはコンポーネントからフォーカスが外れたときに発生します。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export const EventDemo: Story = {
  args: Default.args,
  render: EventDemoComponent,
};
