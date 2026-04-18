import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mui/material';
import FormRow from './FormRow';
import TextBox from './TextBox';
import SelectBox from './SelectBox';
import RadioButton from './RadioButton';
import CheckBox from './CheckBox';
import DatePicker from './DatePicker';
import TextBoxMultiLine from './TextBoxMultiLine';

/**
 * FormRowコンポーネントのStorybook設定
 * Inputディレクトリのコンポーネントを使用して様々なパターンを表示
 */
const meta: Meta<typeof FormRow> = {
  title: 'common-architecture/input/FormRow',
  component: FormRow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FormRow>;

/**
 * テキストボックスを含むFormRow（必須）
 */
export const WithRequiredTextBox: Story = {
  args: {
    label: 'ユーザー名',
    required: true,
    labelMinWidth: '380px',
    labelAlignment: 'top',
    children: <TextBox helperText="ユーザー名を入力" name={'userName'} />
  },
  name: '必須テキストボックス',
};

/**
 * テキストボックスを含むFormRow（任意）
 */
export const WithOptionalTextBox: Story = {
  args: {
    label: 'メモ',
    required: false,
    labelAlignment: 'top',
    children: <TextBox helperText="任意入力" name={'arbitrarily'} />
  },
  name: '任意テキストボックス',
};

/**
 * セレクトボックスを含むFormRow（必須）
 */
export const WithRequiredSelectBox: Story = {
  args: {
    label: '部署',
    labelAlignment: 'center',
    required: true,
    children: (
      <SelectBox
        name="selectTeam"
        options={[
          { value: 'sales', label: '営業部' },
          { value: 'marketing', label: 'マーケティング部' },
          { value: 'engineering', label: '開発部' },
          { value: 'hr', label: '人事部' },
        ]}
      />
    ),
  },
  name: '必須セレクトボックス',
};

/**
 * セレクトボックスを含むFormRow（任意）
 */
export const WithOptionalSelectBox: Story = {
  args: {
    label: '所属チーム',
    labelAlignment: 'center',
    children: (
      <SelectBox
        name="selectTeam"
        options={[
          { value: 'team1', label: 'チーム1' },
          { value: 'team2', label: 'チーム2' },
          { value: 'team3', label: 'チーム3' },
        ]}
      />
    ),
  },
  name: '任意セレクトボックス',
};

/**
 * ラジオボタンを含むFormRow（必須）
 */
export const WithRequiredRadioButtons: Story = {
  args: {
    label: '性別',
    required: true,
    children: (
      <RadioButton
        name="gender"
        options={[
          { value: 'male', label: '男性' },
          { value: 'female', label: '女性' },
          { value: 'other', label: 'その他' },
        ]}
      />
    ),
  },
  name: '必須ラジオボタン',
};

/**
 * ラジオボタンを含むFormRow（任意）
 */
export const WithOptionalRadioButtons: Story = {
  args: {
    label: '連絡方法',
    children: (
      <RadioButton
        name="contact"
        options={[
          { value: 'email', label: 'メール' },
          { value: 'phone', label: '電話' },
          { value: 'both', label: '両方' },
        ]}
      />
    ),
  },
  name: '任意ラジオボタン',
};

/**
 * 日付選択を含むFormRow（必須）
 */
export const WithRequiredDatePicker: Story = {
  args: {
    label: '提出日',
    required: true,
    children: (
      <DatePicker />
    ),
  },
  name: '必須日付選択',
};

/**
 * 日付選択を含むFormRow（任意）
 */
export const WithOptionalDatePicker: Story = {
  args: {
    label: '希望日',
    children: (
      <DatePicker />
    ),
  },
  name: '任意日付選択',
};

/**
 * 複数行テキストエリアを含むFormRow（必須）
 */
export const WithRequiredMultiline: Story = {
  args: {
    label: '申請理由',
    required: true,
    children: (
      <TextBoxMultiLine
        helperText="申請理由を入力してください"
        rows={4}
        name={'reason'}
      />
    ),
  },
  name: '必須複数行テキスト',
};

/**
 * 複数のFormRowを並べた例（Chipの右揃えを確認）
 */
export const MultipleFormRows: Story = {
  render: () => (
    <Box>
      <FormRow label="ユーザー名" required={true}>
        <TextBox helperText="ユーザー名を入力してください" name="userName" />
      </FormRow>
      <FormRow label="メールアドレス" required={true}>
        <TextBox helperText="メールアドレスを入力してください" name="email" />
      </FormRow>
      <FormRow label="所属部署" required={true} labelAlignment="center">
        <SelectBox
          name="department"
          options={[
            { value: 'sales', label: '営業部' },
            { value: 'engineering', label: '開発部' },
            { value: 'hr', label: '人事部' },
          ]}
        />
      </FormRow>
      <FormRow label="電話番号" required={false}>
        <TextBox helperText="ハイフン無しで入力" name="phone" />
      </FormRow>
      <FormRow label="メモ" required={false}>
        <TextBox name="memo" />
      </FormRow>
      <FormRow label="申請理由" required={true}>
        <TextBoxMultiLine
          helperText="詳細な理由を入力してください"
          rows={3}
          name="reason"
        />
      </FormRow>
    </Box>
  ),
  name: '複数行表示例',
  parameters: {
    docs: {
      description: {
        story: '複数のFormRowを並べた例です。必須/任意のChipが右端で綺麗に揃うことを確認できます。',
      },
    },
  },
};

/**
 * 異なる長さのラベルでのFormRow（アライメント確認）
 */
export const DifferentLabelLengths: Story = {
  render: () => (
    <Box>
      <FormRow label="名前" required={true}>
        <TextBox name="name" />
      </FormRow>
      <FormRow label="ユーザー名" required={true}>
        <TextBox name="username" />
      </FormRow>
      <FormRow label="メールアドレス" required={true}>
        <TextBox name="email" />
      </FormRow>
      <FormRow label="所属組織・部署名" required={false}>
        <TextBox name="organization" />
      </FormRow>
      <FormRow label="備考" required={false}>
        <TextBox name="notes" />
      </FormRow>
    </Box>
  ),
  name: 'ラベル長さ違い例',
  parameters: {
    docs: {
      description: {
        story: '異なる長さのラベルでも、Chipが右端で揃うことを確認できます。',
      },
    },
  },
};
