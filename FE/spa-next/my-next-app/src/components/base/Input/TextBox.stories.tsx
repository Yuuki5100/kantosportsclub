import type { Meta, StoryObj } from '@storybook/react';
import TextBox from './TextBox';
import { useState } from 'react';
import { formatValue, unformatNumber } from '@utils/formatters';

/**
 * `TextBox` は単行のテキスト入力フィールドです。
 * カスタムスタイルや単位表示、クリアボタンの表示などに対応しています。
 */
const meta = {
  title: 'common-architecture/input/TextBox',
  component: TextBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      description: 'フィールド名',
      control: 'text',
    },
    id: {
      description: 'フィールドID',
      control: 'text',
    },
    type: {
      description: '入力タイプ',
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
    },
    value: {
      description: '入力値',
      control: 'text',
    },
    onChange: {
      description: '値が変更された時に呼び出されるコールバック関数',
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
    maxLength: {
      description: '最大文字数',
      control: { type: 'number', min: 1, max: 100 },
    },
    unit: {
      description: '単位（右）',
      control: 'text',
    },
    prefix: {
      description: '単位(左）',
      control: 'text',
    },
    helperText: {
      description: 'ヘルパーテキスト',
      control: 'text',
    },
    error: {
      description: 'エラー状態かどうか',
      control: 'boolean',
    },
    customStyle: {
      description: 'カスタムスタイル',
      control: 'object',
    },
    clearButton: {
      description: 'クリアボタンを表示するかどうか',
      control: 'boolean',
    },
    clearButtonOnClick: {
      description: 'クリアボタンがクリックされた時に呼び出されるコールバック関数',
      action: 'cleared',
    },
  },
} satisfies Meta<typeof TextBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な使用例
 */
export const Basic: Story = {
  args: {
    name: 'basic-text',
    type: 'text',
    value: '',
    disabled: false,
    clearButton: false,
  },
};

/**
 * 初期値を持つ例
 */
export const WithValue: Story = {
  args: {
    ...Basic.args,
    name: 'text-with-value',
    value: 'これは初期値です',
  },
};

/**
 * クリアボタン付きの例
 */
export const WithClearButton: Story = {
  args: {
    ...Basic.args,
    name: 'text-with-clear-button',
    value: 'クリアボタンで消せます',
    clearButton: true,
  },
};

/**
 * 単位付きの例
 */
export const WithUnit: Story = {
  args: {
    ...Basic.args,
    name: 'text-with-unit',
    value: '100',
    unit: 'kg',
  },
};

/**
 * 無効状態の例
 */
export const Disabled: Story = {
  args: {
    ...Basic.args,
    name: 'disabled-text',
    value: '編集できません',
    disabled: true,
  },
};

/**
 * エラー状態の例
 */
export const WithError: Story = {
  args: {
    ...Basic.args,
    name: 'error-text',
    value: '不正な値',
    error: true,
    helperText: '正しい値を入力してください',
  },
};

/**
 * パスワード入力の例
 */
export const Password: Story = {
  args: {
    ...Basic.args,
    name: 'password-text',
    type: 'password',
    value: 'password123',
  },
};

/**
 * 最大文字数制限の例
 */
export const WithMaxLength: Story = {
  args: {
    ...Basic.args,
    name: 'max-length-text',
    value: 'ABC',
    maxLength: 10,
    helperText: '最大10文字まで入力できます',
  },
};

/**
 * カスタムスタイルの例
 */
export const WithCustomStyle: Story = {
  args: {
    ...Basic.args,
    name: 'custom-style-text',
    value: 'カスタムスタイル',
    customStyle: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#f5f5f5',
      },
      '& .MuiInputBase-input': {
        fontWeight: 'bold',
        color: '#3f51b5',
      },
    },
  },
};

/**
 * 状態を制御する例
 */
const ControlledTextBox = () => {
  const [value, setValue] = useState<string>('制御された値');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleClear = () => {
    setValue('');
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <strong>現在の値:</strong> {value}
      </div>
      <TextBox
        name="controlled-text"
        value={value}
        onChange={handleChange}
        clearButton={true}
        clearButtonOnClick={handleClear}
      />
    </div>
  );
};

export const Controlled: Story = {
  args: {
    ...Basic.args,
  },
  render: () => <ControlledTextBox />,
};

/**
 * onBlurとonChangeイベントの動作確認
 */
const EventDemoTextBox = () => {
  const [value, setValue] = useState<string>('テキストを入力して動作を確認してください');
  const [blurCount, setBlurCount] = useState<number>(0);
  const [changeCount, setChangeCount] = useState<number>(0);
  const [lastChangeValue, setLastChangeValue] = useState<string>('');
  const [lastBlurTime, setLastBlurTime] = useState<string>('');
  const [lastChangeTime, setLastChangeTime] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    setChangeCount((prev) => prev + 1);
    setLastChangeValue(newValue);
    setLastChangeTime(new Date().toLocaleTimeString());
  };

  const handleBlur = () => {
    setBlurCount((prev) => prev + 1);
    setLastBlurTime(new Date().toLocaleTimeString());
  };

  const handleClear = () => {
    setValue('');
    setChangeCount((prev) => prev + 1);
    setLastChangeValue('');
    setLastChangeTime(new Date().toLocaleTimeString());
  };

  return (
    <div>
      <div
        style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>イベント情報</h3>

        <div style={{ marginBottom: '8px' }}>
          <strong>現在の値:</strong> <span style={{ fontFamily: 'monospace' }}>{value}</span>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <div>
              <span style={{ fontWeight: 'bold', color: '#3f51b5' }}>onChange</span> 発生回数:
              <span style={{ fontWeight: 'bold' }}> {changeCount}</span>
            </div>
            {lastChangeTime && <div>最終変更: {lastChangeTime}</div>}
            {lastChangeValue && (
              <div>
                最終値: <span style={{ fontFamily: 'monospace' }}>{lastChangeValue}</span>
              </div>
            )}
          </div>

          <div>
            <div>
              <span style={{ fontWeight: 'bold', color: '#f50057' }}>onBlur</span> 発生回数:
              <span style={{ fontWeight: 'bold' }}> {blurCount}</span>
            </div>
            {lastBlurTime && <div>最終発生: {lastBlurTime}</div>}
          </div>
        </div>
      </div>

      <TextBox
        name="event-demo-text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        clearButton={true}
        clearButtonOnClick={handleClear}
      />

      <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
        • テキストを入力すると <strong>onChange</strong> イベントが発生します
        <br />• フィールドの外をクリックすると <strong>onBlur</strong> イベントが発生します
        <br />• クリアボタンをクリックすると値がクリアされ <strong>onChange</strong>{' '}
        イベントが発生します
      </div>
    </div>
  );
};

/**
 * Prefix（接頭）付きの例
 */
export const WithPrefix: Story = {
  args: {
    ...Basic.args,
    name: 'text-with-prefix',
    value: '1000',
    prefix: '¥',
  },
};

/**
 * Prefix + Suffix（接頭＋接尾）付きの例
 */
export const WithPrefixAndSuffix: Story = {
  args: {
    ...Basic.args,
    name: 'text-with-prefix-suffix',
    value: '12345.67',
    prefix: '$',
    unit: 'USD',
    textAlign: 'right',
  },
};


export const EventDemo: Story = {
  args: {
    ...Basic.args,
  },
  render: () => <EventDemoTextBox />,
};

/**
 * 通貨フォーマット（currency）対応の例
 */
export const WithCurrencyFormat: Story = {
  args: {
    ...Basic.args,
    name: 'text-with-currency',
    value: '1234567.89',
    format: 'currency',
    decimalScale: 2,
    textAlign: 'right',
    clearButton: false,
  },
};

/**
 * Redmine不良用
 */
export const RedmineTests: Story = {
  args: {
    ...Basic.args,
    name: 'text-with-prefix',
    value: '1000',

  },
};
