import type { Meta, StoryObj } from '@storybook/react';
import SelectBox from './SelectBox';
import { useState } from 'react';

/**
 * `SelectBox` は複数選択が可能なチェックボックス形式のセレクトボックスコンポーネントです。
 * ユーザーは複数の選択肢から複数の項目を選択できます。
 */
const meta = {
  title: 'common-architecture/input/SelectBox',
  component: SelectBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    options: {
      description: '選択肢のリスト',
      control: 'object',
    },
    selectedValues: {
      description: '選択された値の配列',
      control: 'object',
    },
    onChange: {
      description: '選択値が変更された時に呼び出されるコールバック関数',
      action: 'changed',
    },
    onBlur: {
      description: 'フォーカスが外れた時に呼び出されるコールバック関数',
      action: 'blurred',
    },
    disabled: {
      description: '無効状態かどうか',
      control: 'boolean',
    },
    customStyle: {
      description: 'カスタムスタイル',
      control: 'object',
    },
    helperText: {
      description: 'ヘルパーテキスト',
      control: 'text',
    },
    error: {
      description: 'エラー状態かどうか',
      control: 'boolean',
    },
    width: {
      description: 'コンポーネントの幅',
      control: { type: 'number', min: 100, max: 600, step: 10 },
    },
    height: {
      description: 'コンポーネントの高さ',
      control: { type: 'number', min: 100, max: 600, step: 10 },
    },
  },
} satisfies Meta<typeof SelectBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な使用例
 */
export const Basic: Story = {
  args: {
    name: 'basic-select',
    options: [
      { value: 'option1', label: '選択肢 1' },
      { value: 'option2', label: '選択肢 2' },
      { value: 'option3', label: '選択肢 3' },
      { value: 'option4', label: '選択肢 4' },
      { value: 'option5', label: '選択肢 5' },
    ],
    width: 300,
    height: 200,
  },
};

/**
 * 初期選択値を持つ例
 */
export const WithPreselectedValues: Story = {
  args: {
    ...Basic.args,
    name: 'preselected-select',
    selectedValues: ['option1', 'option3'],
  },
};

/**
 * 無効状態の例
 */
export const Disabled: Story = {
  args: {
    ...Basic.args,
    name: 'disabled-select',
    disabled: true,
  },
};

/**
 * エラー状態の例
 */
export const WithError: Story = {
  args: {
    ...Basic.args,
    name: 'error-select',
    error: true,
    helperText: '選択は必須です',
  },
};

/**
 * 一部の選択肢が無効な例
 */
export const WithDisabledOptions: Story = {
  args: {
    ...Basic.args,
    name: 'disabled-options-select',
    options: [
      { value: 'option1', label: '選択肢 1' },
      { value: 'option2', label: '選択肢 2', disabled: true },
      { value: 'option3', label: '選択肢 3' },
      { value: 'option4', label: '選択肢 4', disabled: true },
      { value: 'option5', label: '選択肢 5' },
    ],
  },
};

/**
 * カスタムスタイルの例
 */
export const WithCustomStyle: Story = {
  args: {
    ...Basic.args,
    name: 'custom-style-select',
    customStyle: {
      border: '1px solid #3f51b5',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  },
};

/**
 * 多数の選択肢を持つ例
 */
export const WithManyOptions: Story = {
  args: {
    ...Basic.args,
    name: 'many-options-select',
    options: Array.from({ length: 20 }, (_, i) => ({
      value: `option${i + 1}`,
      label: `選択肢 ${i + 1}`,
    })),
  },
};

/**
 * 状態を制御する例
 */
const ControlledSelectBox = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>(['option2']);

  const options = [
    { value: 'option1', label: '選択肢 1' },
    { value: 'option2', label: '選択肢 2' },
    { value: 'option3', label: '選択肢 3' },
    { value: 'option4', label: '選択肢 4' },
    { value: 'option5', label: '選択肢 5' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <strong>現在選択されている値:</strong> {selectedValues.join(', ')}
      </div>
      <SelectBox
        name="controlled-select"
        options={options}
        selectedValues={selectedValues}
        onChange={setSelectedValues}
        width={300}
        height={200}
      />
    </div>
  );
};

export const Controlled: Story = {
  args: {
    ...Basic.args,
    name: 'controlled-select',
  },
  render: () => <ControlledSelectBox />,
};

/**
 * onBlurイベントの動作確認
 */
const WithBlurEventDemo = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>(['option2']);
  const [blurCount, setBlurCount] = useState<number>(0);
  const [changeCount, setChangeCount] = useState<number>(0);
  const [lastBlurTime, setLastBlurTime] = useState<string>('');
  const [lastChangeTime, setLastChangeTime] = useState<string>('');

  const options = [
    { value: 'option1', label: '選択肢 1' },
    { value: 'option2', label: '選択肢 2' },
    { value: 'option3', label: '選択肢 3' },
    { value: 'option4', label: '選択肢 4' },
    { value: 'option5', label: '選択肢 5' },
  ];

  const handleChange = (selected: string[]) => {
    setSelectedValues(selected);
    setChangeCount((prev) => prev + 1);
    setLastChangeTime(new Date().toLocaleTimeString());
  };

  const handleBlur: React.FocusEventHandler<HTMLButtonElement> = () => {
    setBlurCount((prev) => prev + 1);
    setLastBlurTime(new Date().toLocaleTimeString());
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>イベント情報</h3>

        <div style={{ marginBottom: '8px' }}>
          <strong>現在選択されている値:</strong> {selectedValues.length > 0 ? selectedValues.join(', ') : '(なし)'}
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <div>
              <span style={{ fontWeight: 'bold', color: '#3f51b5' }}>onChange</span> 発生回数:
              <span style={{ fontWeight: 'bold' }}> {changeCount}</span>
            </div>
            {lastChangeTime && (
              <div>最終変更: {lastChangeTime}</div>
            )}
          </div>

          <div>
            <div>
              <span style={{ fontWeight: 'bold', color: '#f50057' }}>onBlur</span> 発生回数:
              <span style={{ fontWeight: 'bold' }}> {blurCount}</span>
            </div>
            {lastBlurTime && (
              <div>最終発生: {lastBlurTime}</div>
            )}
          </div>
        </div>
      </div>

      <SelectBox
        name="blur-event-demo"
        options={options}
        selectedValues={selectedValues}
        onChange={handleChange}
        onBlur={handleBlur}
        width={300}
        height={200}
      />

      <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
        • 選択肢をクリックすると <strong>onChange</strong> イベントが発生します<br/>
        • SelectBoxの外をクリックすると <strong>onBlur</strong> イベントが発生します<br/>
        • チェックボックスの状態が変わるたびにイベント情報が更新されます
      </div>
    </div>
  );
};

export const EventDemo: Story = {
  args: {
    ...Basic.args,
    name: 'onBlur-demo-select',
  },
  render: () => <WithBlurEventDemo />,
};
