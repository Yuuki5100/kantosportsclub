import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import AutoResizingTextBox from './AutoResizingTextBox';
import colors from '@/styles/colors';

const meta: Meta<typeof AutoResizingTextBox> = {
  title: 'Common-architecture/Inputs/AutoResizingTextBox',
  component: AutoResizingTextBox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '自動リサイズ可能なテキストエリア型入力コンポーネントです。ユニット表示やクリアボタン、最大文字数などが設定できます。',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AutoResizingTextBox>;

/**
 * デフォルトのテキストボックス。
 */
export const Default: Story = {
  render: () => {
    const DefaultTextBox = () => {
      const [value, setValue] = React.useState('');
      return (
        <AutoResizingTextBox
          name="default"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText="通常のテキストボックスです"
        />
      );
    };
    return <DefaultTextBox />;
  },
};

/**
 * 単位表示とクリアボタン付きのテキストボックス。
 */
export const WithUnitAndClearButton: Story = {
  render: () => {
    const UnitTextBox = () => {
      const [value, setValue] = React.useState('150');
      return (
        <AutoResizingTextBox
          name="unit"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          unit="kg"
          clearButton
          helperText="ユニットとクリアボタン付き"
        />
      );
    };
    return <UnitTextBox />;
  },
};

/**
 * 最大文字数が設定された例。
 */
export const WithMaxLength: Story = {
  render: () => {
    const MaxLengthTextBox = () => {
      const [value, setValue] = React.useState('');
      return (
        <AutoResizingTextBox
          name="maxlength"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={10}
          helperText="最大10文字まで入力可能"
        />
      );
    };
    return <MaxLengthTextBox />;
  },
};

/**
 * 無効状態のテキストボックス。
 */
export const Disabled: Story = {
  render: () => {
    return (
      <AutoResizingTextBox
        name="disabled"
        value="変更不可のテキスト"
        disabled
        unit="円"
        helperText="このフィールドは無効です"
      />
    );
  },
};

/**
 * エラー状態のテキストボックス。
 */
export const ErrorState: Story = {
  render: () => {
    const ErrorTextBox = () => {
      const [value, setValue] = React.useState('');
      return (
        <AutoResizingTextBox
          name="error"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error
          helperText="エラーが発生しています"
        />
      );
    };
    return <ErrorTextBox />;
  },
};

/**
 * 長文エラーメッセージが折り返されるかどうかを確認するストーリー。
 */
export const LongErrorMessage: Story = {
  render: () => {
    const LongErrorTextBox = () => {
      const [value, setValue] = React.useState('');
      return (
        <div style={{ maxWidth: '600px' }}>
          <AutoResizingTextBox
            name="long-error"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error
            helperText={
              'このエラーメッセージは非常に長く、1行では収まらないため、正しく折り返されて表示される必要があります。内容が途中で省略されたり、途切れたりせずに表示されることを確認してください。'
            }
          />
        </div>
      );
    };
    return <LongErrorTextBox />;
  },
};


/**
 * 初期値とカスタムスタイル付きのテキストボックス。
 */
export const CustomStyle: Story = {
  render: () => {
    return (
      <AutoResizingTextBox
        name="styled"
        value="背景が黄色です"
        customStyle={{ backgroundColor: '#fff8e1' }}
        helperText="カスタムスタイル適用済み"
      />
    );
  },
};

/**
 * 非活性時のスタイルテスト
 */
export const disabledTrue: Story = {
  render: () => {
    return (
      <AutoResizingTextBox
        name="styled"
        value="非活性"
        disabled={true}
        customStyle={{ backgroundColro: colors.inputDisabledBg }}
        helperText="disabledTrue"
      />
    );
  },
};
