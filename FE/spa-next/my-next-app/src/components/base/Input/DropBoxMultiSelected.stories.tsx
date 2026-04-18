import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Box, Typography, Paper } from '@mui/material';
import DropBoxMultiSelected from './DropBoxMultiSelected';
import { MultiSelectOption } from './OptionInfo';

const meta = {
  title: 'common-architecture/input/DropBoxMultiSelected',
  component: DropBoxMultiSelected,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DropBoxMultiSelected>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な使用例
 */
const DefaultComponent = () => {
  const [options, setOptions] = useState<MultiSelectOption[]>([
    { value: 'js', label: 'JavaScript', selected: false },
    { value: 'ts', label: 'TypeScript', selected: false },
    { value: 'react', label: 'React', selected: false },
    { value: 'vue', label: 'Vue.js', selected: false },
    { value: 'angular', label: 'Angular', selected: false },
    { value: 'node', label: 'Node.js', selected: false },
  ]);

  return <DropBoxMultiSelected name="skills" options={options} setSelectedValues={(newOptions) => setOptions(newOptions)} />;
};

export const Default: Story = {
  args: {
    name: 'skills',
    setSelectedValues: () => {},
  },
  render: DefaultComponent,
};

/**
 * 初期選択の例
 */
const WithSelectedValuesComponent = () => {
  const [options, setOptions] = useState<MultiSelectOption[]>([
    { value: 'js', label: 'JavaScript', selected: true },
    { value: 'ts', label: 'TypeScript', selected: true },
    { value: 'react', label: 'React', selected: false },
    { value: 'vue', label: 'Vue.js', selected: false },
    { value: 'angular', label: 'Angular', selected: false },
    { value: 'node', label: 'Node.js', selected: false },
  ]);

  const handleSelectionChange = (newValues: string[]) => {
    const newOptions: MultiSelectOption[] = options.map(option => ({
      ...option,
      selected: newValues.includes(option.value)
    }));
    setOptions(newOptions);
  };

  return <DropBoxMultiSelected name="skills" options={options} setSelectedValues={(newOptions) => setOptions(newOptions)} />;
};

export const WithSelectedValues: Story = {
  args: {
    name: 'skills',
    setSelectedValues: () => {},
  },
  render: WithSelectedValuesComponent,
};

/**
 * 無効化された例
 */
const DisabledComponent = () => {
  const [options] = useState<MultiSelectOption[]>([
    { value: 'js', label: 'JavaScript', selected: true },
    { value: 'ts', label: 'TypeScript', selected: true },
    { value: 'react', label: 'React', selected: false },
    { value: 'vue', label: 'Vue.js', selected: false },
    { value: 'angular', label: 'Angular', selected: false },
    { value: 'node', label: 'Node.js', selected: false },
  ]);

  return <DropBoxMultiSelected name="skills" options={options} setSelectedValues={() => {}} disabled={true} />;
};

export const Disabled: Story = {
  args: {
    name: 'skills',
    setSelectedValues: () => {},
  },
  render: DisabledComponent,
};

/**
 * エラー状態の例
 */
const WithErrorComponent = () => {
  const [options, setOptions] = useState<MultiSelectOption[]>([
    { value: 'js', label: 'JavaScript', selected: false },
    { value: 'ts', label: 'TypeScript', selected: false },
    { value: 'react', label: 'React', selected: false },
    { value: 'vue', label: 'Vue.js', selected: false },
    { value: 'angular', label: 'Angular', selected: false },
    { value: 'node', label: 'Node.js', selected: false },
  ]);

  const handleErrorChange = (newValues: string[]) => {
    const newOptions: MultiSelectOption[] = options.map(option => ({
      ...option,
      selected: newValues.includes(option.value)
    }));
    setOptions(newOptions);
  };

  return (
    <DropBoxMultiSelected
      name="skills"
      options={options}
      setSelectedValues={(newOptions) => setOptions(newOptions)}
      error={true}
      helperText="スキルを選択してください"
    />
  );
};

export const WithError: Story = {
  args: {
    name: 'skills',
    setSelectedValues: () => {},
  },
  render: WithErrorComponent,
};

/**
 * 一部の選択肢が無効化された例
 */
const WithDisabledOptionsComponent = () => {
  const [options, setOptions] = useState<MultiSelectOption[]>([
    { value: 'js', label: 'JavaScript', selected: false },
    { value: 'ts', label: 'TypeScript', selected: false },
    { value: 'react', label: 'React', selected: false, disabled: true },
    { value: 'vue', label: 'Vue.js', selected: false },
    { value: 'angular', label: 'Angular', selected: false, disabled: true },
    { value: 'node', label: 'Node.js', selected: false },
  ]);

  const handleDisabledOptionsChange = (newValues: string[]) => {
    const newOptions: MultiSelectOption[] = options.map(option => ({
      ...option,
      selected: newValues.includes(option.value)
    }));
    setOptions(newOptions);
  };

  return <DropBoxMultiSelected name="skills" options={options} setSelectedValues={(newOptions) => setOptions(newOptions)} />;
};

export const WithDisabledOptions: Story = {
  args: {
    name: 'skills',
    setSelectedValues: () => {},
  },
  render: WithDisabledOptionsComponent,
};

/**
 * カスタムスタイルの例
 */
const WithCustomStyleComponent = () => {
  const [options, setOptions] = useState<MultiSelectOption[]>([
    { value: 'js', label: 'JavaScript', selected: false },
    { value: 'ts', label: 'TypeScript', selected: false },
    { value: 'react', label: 'React', selected: false },
    { value: 'vue', label: 'Vue.js', selected: false },
    { value: 'angular', label: 'Angular', selected: false },
    { value: 'node', label: 'Node.js', selected: false },
  ]);

  const handleStyleChange = (newValues: string[]) => {
    const newOptions: MultiSelectOption[] = options.map(option => ({
      ...option,
      selected: newValues.includes(option.value)
    }));
    setOptions(newOptions);
  };

  return (
    <DropBoxMultiSelected
      name="skills"
      options={options}
      setSelectedValues={(newOptions) => setOptions(newOptions)}
      customStyle={{
        minWidth: '250px',
        marginTop: '10px',
      }}
    />
  );
};

export const WithCustomStyle: Story = {
  args: {
    name: 'skills',
    setSelectedValues: () => {},
  },
  render: WithCustomStyleComponent,
};

/**
 * onChangeとonBlurイベントのデモ
 */
const EventDemoComponent = () => {
  const [options, setOptions] = useState<MultiSelectOption[]>([
    { value: 'js', label: 'JavaScript', selected: false },
    { value: 'ts', label: 'TypeScript', selected: false },
    { value: 'react', label: 'React', selected: false },
    { value: 'vue', label: 'Vue.js', selected: false },
    { value: 'angular', label: 'Angular', selected: false },
    { value: 'node', label: 'Node.js', selected: false },
  ]);

  const [changeCount, setChangeCount] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState<string>('-');

  const handleEventChange = (newValues: string[]) => {
    // すべてのオプションの選択状態を更新
    const newOptions: MultiSelectOption[] = options.map(option => ({
      ...option,
      selected: newValues.includes(option.value)
    }));

    setOptions(newOptions);
    setChangeCount((prev) => prev + 1);
    setLastChangeTime(new Date().toLocaleTimeString());
  };

  // 現在選択されているoptionの値とラベルを取得
  const selectedOptions = options.filter(option => option.selected);
  const selectedValues = selectedOptions.map(option => option.value);
  const selectedLabels = selectedOptions.map(option => option.label);

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        DropBoxMultiSelectedイベントデモ
      </Typography>

      <Box sx={{ mb: 3 }}>
        <DropBoxMultiSelected
          name="skills"
          options={options}
          setSelectedValues={(newOptions) => setOptions(newOptions)}
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
              選択された値: {selectedValues.length > 0 ? selectedValues.join(', ') : 'なし'}
            </Typography>
            <Typography variant="body2">
              選択されたスキル: {selectedLabels.length > 0 ? selectedLabels.join(', ') : 'なし'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ※ onChangeイベントは選択肢を追加または削除するたびに発生します。
            onBlurイベントはコンポーネントからフォーカスが外れたときに発生します。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export const EventDemo: Story = {
  args: {
    name: 'skills',
    setSelectedValues: () => {},
  },
  render: EventDemoComponent,
};
