import type { Meta, StoryObj } from '@storybook/react';
import TextArea from './TextBoxMultiLine';
import { useState } from 'react';

/**
 * `TextArea` は複数行のテキスト入力フィールドです。
 * カスタムスタイルや文字数カウンター、エラー表示などに対応しています。
 */
const meta = {
  title: 'common-architecture/input/TextBoxMultiLine',
  component: TextArea,
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
    value: {
      description: '入力値（制御コンポーネント用）',
      control: 'text',
    },
    defaultValue: {
      description: 'デフォルト値（非制御コンポーネント用）',
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
    maxLength: {
      description: '最大文字数（undefinedの場合は制限なし）',
      control: { 
        type: 'number', 
        min: 1, 
        max: 1000,
        step: 1
      },
      table: {
        type: { summary: 'number | undefined' },
        defaultValue: { summary: 'undefined' },
      },
      // undefinedを設定可能にするため、デフォルト値をundefinedに
      defaultValue: undefined,
    },
    disabled: {
      description: '無効状態かどうか',
      control: 'boolean',
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
      control: 'text',
    },
    rows: {
      description: '表示する行数',
      control: { type: 'number', min: 1, max: 20 },
    },
    customStyle: {
      description: 'カスタムスタイル',
      control: 'object',
    },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な使用例
 */
export const Basic: Story = {
  args: {
    name: 'basic-textarea',
    rows: 4,
    width: '500px',
  },
};

/**
 * 初期値を持つ例
 */
export const WithDefaultValue: Story = {
  args: {
    ...Basic.args,
    name: 'textarea-with-default',
    defaultValue: 'これはデフォルトのテキストです。\n複数行に対応しています。',
  },
};

/**
 * 最大文字数制限付きの例
 */
export const WithMaxLength: Story = {
  args: {
    ...Basic.args,
    name: 'textarea-with-max-length',
    defaultValue: '文字数制限あり',
    maxLength: 50,
    helperText: '最大50文字まで入力可能です',
  },
};

/**
 * 文字数制限なしの例（maxLength: undefined）
 */
export const WithoutMaxLength: Story = {
  args: {
    ...Basic.args,
    name: 'textarea-without-max-length',
    defaultValue: '文字数制限なし\n何文字でも入力可能です。\nmaxLengthがundefinedの場合はカウンターも表示されません。',
    maxLength: undefined,
    helperText: '文字数制限はありません',
  },
};

/**
 * エラー状態の例
 */
export const WithError: Story = {
  args: {
    ...Basic.args,
    name: 'error-textarea',
    defaultValue: 'エラーがある入力',
    error: true,
    helperText: '入力内容に誤りがあります',
  },
};

/**
 * 無効状態の例
 */
export const Disabled: Story = {
  args: {
    ...Basic.args,
    name: 'disabled-textarea',
    defaultValue: '編集できないテキスト\n複数行にわたる場合でも表示されます。',
    disabled: true,
  },
};

/**
 * 行数を変更した例
 */
export const CustomRows: Story = {
  args: {
    ...Basic.args,
    name: 'custom-rows-textarea',
    rows: 8,
    defaultValue:
      '行数を増やした例\nデフォルトよりも多くの行を表示します。\n3行目\n4行目\n5行目\n6行目\n7行目\n8行目',
  },
};

/**
 * カスタムスタイルの例
 */
export const WithCustomStyle: Story = {
  args: {
    ...Basic.args,
    name: 'custom-style-textarea',
    defaultValue: 'カスタムスタイルを適用したテキストエリア',
    customStyle: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #3f51b5',
      },
      '& .MuiInputBase-input': {
        color: '#3f51b5',
        fontWeight: '500',
      },
    },
  },
};

/**
 * 幅を変更した例
 */
export const CustomWidth: Story = {
  args: {
    ...Basic.args,
    name: 'custom-width-textarea',
    defaultValue: '幅を変更したテキストエリア',
    width: '600px',
  },
};

/**
 * 状態を制御する例
 */
const ControlledTextArea = () => {
  const [value, setValue] = useState<string>('制御されたテキストエリア\n値が状態に保持されます');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <strong>現在の値:</strong>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            backgroundColor: '#f5f5f5',
            padding: '8px',
            borderRadius: '4px',
          }}
        >
          {value}
        </pre>
      </div>
      <TextArea
        name="controlled-textarea"
        value={value}
        onChange={handleChange}
        width="500px"
        rows={4}
      />
    </div>
  );
};

export const Controlled: Story = {
  args: {
    ...Basic.args,
  },
  render: () => <ControlledTextArea />,
};

/**
 * onBlurイベントの動作確認
 */
const WithBlurEventDemo = () => {
  const [value, setValue] = useState<string>(
    'このテキストエリアにフォーカスして、その後別の場所をクリックしてください'
  );
  const [blurCount, setBlurCount] = useState<number>(0);
  const [lastBlurTime, setLastBlurTime] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    setBlurCount((prev) => prev + 1);
    setLastBlurTime(new Date().toLocaleTimeString());
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>onBlurイベントの動作確認</div>
        <div>
          フォーカスが外れた回数:{' '}
          <span style={{ color: '#3f51b5', fontWeight: 'bold' }}>{blurCount}</span> 回
        </div>
        {lastBlurTime && (
          <div>
            最後にフォーカスが外れた時間:{' '}
            <span style={{ color: '#3f51b5', fontWeight: 'bold' }}>{lastBlurTime}</span>
          </div>
        )}
      </div>
      <TextArea
        name="onblur-demo-textarea"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        width="500px"
        rows={4}
      />
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        ↑ テキストエリアにフォーカスした後、別の場所をクリックすると、onBlurイベントが発生します
      </div>
    </div>
  );
};

export const WithBlurEvent: Story = {
  args: {
    ...Basic.args,
  },
  render: () => <WithBlurEventDemo />,
};
