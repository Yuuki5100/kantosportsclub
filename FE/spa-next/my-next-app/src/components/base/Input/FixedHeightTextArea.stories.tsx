import type { Meta, StoryObj } from '@storybook/react';
import FixedHeightTextArea from './FixedHeightTextArea';
import { useState } from 'react';

/**
 * `FixedHeightTextArea` は行数に応じて縦幅が固定される複数行入力コンポーネントです。
 * テキストの内容に関係なく、指定された `rowLength` に基づいて表示領域が常に一定となります。
 */
const meta = {
  title: 'common-architecture/input/FixedHeightTextArea',
  component: FixedHeightTextArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    id: { control: 'text' },
    value: { control: 'text' },
    defaultValue: { control: 'text' },
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
    maxLength: {
      control: { type: 'number', min: 1, max: 1000 },
      defaultValue: undefined,
    },
    disabled: { control: 'boolean' },
    helperText: { control: 'text' },
    error: { control: 'boolean' },
    width: { control: 'text' },
    rowLength: {
      control: { type: 'number', min: 1, max: 20 },
      defaultValue: 4,
    },
    customStyle: { control: 'object' },
  },
} satisfies Meta<typeof FixedHeightTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な使用例
 */
export const Basic: Story = {
  args: {
    name: 'fixed-textarea-basic',
    defaultValue: '',
    rowLength: 4,
    width: '500px',
  },
};

/**
 * 初期値あり
 */
export const WithDefaultValue: Story = {
  args: {
    ...Basic.args,
    defaultValue: 'このフィールドは\n4行分の固定高さを持っています。\n縦幅は常に一定です。',
  },
};

/**
 * 行数を増やす例
 */
export const MoreRows: Story = {
  args: {
    ...Basic.args,
    rowLength: 8,
    defaultValue: '8行の高さに固定されています。\n2\n3\n4\n5\n6\n7\n8',
  },
};

/**
 * 最大文字数制限付き
 */
export const WithMaxLength: Story = {
  args: {
    ...Basic.args,
    rowLength: 5,
    defaultValue: '50文字までの制限があります。',
    maxLength: 50,
    helperText: '最大50文字',
  },
};

/**
 * 無効状態の例
 */
export const Disabled: Story = {
  args: {
    ...Basic.args,
    rowLength: 6,
    defaultValue: 'これは編集不可のテキストです。\n背景色も変更されます。',
    disabled: true,
  },
};

/**
 * エラー表示の例
 */
export const WithError: Story = {
  args: {
    ...Basic.args,
    error: true,
    defaultValue: 'バリデーションエラーがあります',
    helperText: '入力に問題があります',
  },
};

/**
 * カスタムスタイルの適用
 */
export const WithCustomStyle: Story = {
  args: {
    ...Basic.args,
    rowLength: 5,
    defaultValue: 'カスタムスタイルが適用されています',
    customStyle: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fff8e1',
        border: '1px solid #ff9800',
      },
      '& .MuiInputBase-input': {
        color: '#ff9800',
        fontWeight: 600,
      },
    },
  },
};

/**
 * 状態を制御する例（controlled component）
 */
const ControlledFixedTextArea = () => {
  const [value, setValue] = useState('これは状態で制御された入力値です。\n変更は即座に反映されます。');

  return (
    <div>
      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#555' }}>
        現在の値:
        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '8px' }}>{value}</pre>
      </div>
      <FixedHeightTextArea
        name="controlled-fixed"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rowLength={6}
        width="500px"
      />
    </div>
  );
};

export const Controlled: Story = {
  args: {
    name: 'controlled', // 省略可能でも最低1つ入れておくと意図が伝わる
    rowLength: 4,
    width: '500px',
  },
  render: () => <ControlledFixedTextArea />,
};
/**
 * onBlur イベントの確認
 */
const WithBlurDemo = () => {
  const [count, setCount] = useState(0);
  const [lastTime, setLastTime] = useState('');

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        フォーカスを外した回数: <strong>{count}</strong><br />
        最後の時刻: <strong>{lastTime}</strong>
      </div>
      <FixedHeightTextArea
        name="blur-check"
        defaultValue="onBlurイベント確認用です"
        onBlur={() => {
          setCount(c => c + 1);
          setLastTime(new Date().toLocaleTimeString());
        }}
        rowLength={4}
        width="500px"
      />
    </div>
  );
};

export const WithBlurEvent: Story = {
  args: {
    name: 'blur-event',
    rowLength: 4,
    width: '500px',
  },
  render: () => <WithBlurDemo />,
};
