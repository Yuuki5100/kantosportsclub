import type { Meta, StoryObj } from '@storybook/react';
import RadioButton from './RadioButton';
import { useState } from 'react';

/**
 * `RadioButton` は単一選択のラジオボタングループコンポーネントです。
 * 水平・垂直方向の配置、無効化された選択肢、カスタムスタイルなどに対応しています。
 */
const meta = {
  title: 'common-architecture/input/RadioButton',
  component: RadioButton,
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
    options: {
      description: '選択肢のリスト',
      control: 'object',
    },
    selectedValue: {
      description: '選択されている値',
      control: 'text',
    },
    onChange: {
      description: '選択が変更された時に呼び出されるコールバック関数',
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
    direction: {
      description: 'ラジオボタンの並び方向',
      control: 'radio',
      options: ['row', 'column'],
    },
    maxColumns: {
      description: '水平方向の最大列数',
      control: { type: 'number', min: 1, max: 6 },
    },
  },
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的な使用例
 */
export const Basic: Story = {
  args: {
    name: 'basic-radio',
    options: [
      { value: 'option1', label: '選択肢 1' },
      { value: 'option2', label: '選択肢 2' },
      { value: 'option3', label: '選択肢 3' },
    ],
    selectedValue: 'option1',
  },
};

/**
 * 垂直方向に並んだラジオボタン
 */
export const VerticalLayout: Story = {
  args: {
    ...Basic.args,
    name: 'vertical-radio',
    direction: 'column',
  },
};

/**
 * 水平方向に並んだラジオボタン
 */
export const HorizontalLayout: Story = {
  args: {
    ...Basic.args,
    name: 'horizontal-radio',
    direction: 'row',
  },
};

/**
 * 水平方向に最大列数を指定したラジオボタン
 */
export const HorizontalWithMaxColumns: Story = {
  args: {
    ...Basic.args,
    name: 'horizontal-max-radio',
    options: [
      { value: 'option1', label: '選択肢 1' },
      { value: 'option2', label: '選択肢 2' },
      { value: 'option3', label: '選択肢 3' },
      { value: 'option4', label: '選択肢 4' },
      { value: 'option5', label: '選択肢 5' },
      { value: 'option6', label: '選択肢 6' },
    ],
    direction: 'row',
    maxColumns: 3,
  },
};

/**
 * 一部の選択肢が無効な例
 */
export const WithDisabledOptions: Story = {
  args: {
    ...Basic.args,
    name: 'disabled-options-radio',
    options: [
      { value: 'option1', label: '選択肢 1' },
      { value: 'option2', label: '選択肢 2', disabled: true },
      { value: 'option3', label: '選択肢 3' },
    ],
  },
};

/**
 * すべて無効状態の例
 */
export const Disabled: Story = {
  args: {
    ...Basic.args,
    name: 'disabled-radio',
    disabled: true,
  },
};

/**
 * エラー状態の例
 */
export const WithError: Story = {
  args: {
    ...Basic.args,
    name: 'error-radio',
    error: true,
    helperText: '選択が必要です',
  },
};

/**
 * カスタムスタイルの例
 */
export const WithCustomStyle: Story = {
  args: {
    ...Basic.args,
    name: 'custom-style-radio',
    customStyle: {
      border: '1px solid #3f51b5',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#f5f5f5',
    },
  },
};

/**
 * 状態を制御する例
 */
const ControlledRadioButton = () => {
  const [selectedValue, setSelectedValue] = useState<string>('option1');

  const options = [
    { value: 'option1', label: '選択肢 1' },
    { value: 'option2', label: '選択肢 2' },
    { value: 'option3', label: '選択肢 3' },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <strong>現在選択されている値:</strong> {selectedValue}
      </div>
      <RadioButton
        name="controlled-radio"
        options={options}
        selectedValue={selectedValue}
        onChange={handleChange}
      />
    </div>
  );
};

export const Controlled: Story = {
  args: {
    ...Basic.args,
  },
  render: () => <ControlledRadioButton />,
};

/**
 * onChangeとonBlurイベントの動作確認
 */
const EventDemoRadioButton = () => {
  const [selectedValue, setSelectedValue] = useState<string>('option1');
  const [blurCount, setBlurCount] = useState<number>(0);
  const [changeCount, setChangeCount] = useState<number>(0);
  const [lastBlurTime, setLastBlurTime] = useState<string>('');
  const [lastChangeTime, setLastChangeTime] = useState<string>('');

  const options = [
    { value: 'option1', label: '選択肢 1' },
    { value: 'option2', label: '選択肢 2' },
    { value: 'option3', label: '選択肢 3' },
    { value: 'option4', label: '選択肢 4' },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    setChangeCount((prev) => prev + 1);
    setLastChangeTime(new Date().toLocaleTimeString());
  };

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = () => {
    setBlurCount((prev) => prev + 1);
    setLastBlurTime(new Date().toLocaleTimeString());
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>イベント情報</h3>

        <div style={{ marginBottom: '8px' }}>
          <strong>現在選択されている値:</strong> {selectedValue}
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

      <RadioButton
        name="event-demo-radio"
        options={options}
        selectedValue={selectedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        direction="row"
        maxColumns={2}
      />

      <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
        • 選択肢をクリックすると <strong>onChange</strong> イベントが発生します<br/>
        • コンポーネントからフォーカスが外れると <strong>onBlur</strong> イベントが発生します<br/>
        • 選択が変わるたびにイベント情報が更新されます
      </div>
    </div>
  );
};

export const EventDemo: Story = {
  args: Basic.args,
  render: () => <EventDemoRadioButton />,
};
