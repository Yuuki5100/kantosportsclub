// StackBox.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import StackBox from './StackBox';
import { Box, Button, TextField, Typography } from '@mui/material';
import { TextBox } from '@/components/base/Input';

/**
 * `StackBox` は MUI の Stack をラップしたレイアウトコンポーネントです。
 * 子要素を縦または横に並べ、spacing や flex 設定を簡単に制御できます。
 */
const meta = {
  title: 'common-architecture/layout/StackBox',
  component: StackBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      description: '子要素の配置方向',
      control: 'radio',
      options: ['row', 'column'],
    },
    spacing: {
      description: '要素間のスペース',
      control: { type: 'number', min: 0, max: 10 },
    },
  },
} satisfies Meta<typeof StackBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デモ用のダミー Box
 */
const DemoBox = ({ label }: { label: string }) => (
  <Box
    sx={{
      p: 2,
      bgcolor: '#e0f7fa',
      border: '1px solid #00796b',
      borderRadius: '4px',
      minWidth: '80px',
      textAlign: 'center',
    }}
  >
    {label}
  </Box>
);

/**
 * 基本的な縦並び
 */
export const BasicColumn: Story = {
  args: {
    direction: 'column',
    spacing: 2,
    children: (
      <>
        <DemoBox label="Item 1" />
        <DemoBox label="Item 2" />
        <DemoBox label="Item 3" />
      </>
    ),
  },
};

/**
 * 横並び
 */
export const BasicRow: Story = {
  args: {
    direction: 'row',
    spacing: 2,
    children: (
      <>
        <DemoBox label="Item A" />
        <DemoBox label="Item B" />
        <DemoBox label="Item C" />
      </>
    ),
  },
};

/**
 * flex=1 で横幅を均等に広げる
 */
export const EqualWidth: Story = {
  args: {
    direction: 'row',
    spacing: 2,
    children: (
      <>
        <Box sx={{ flex: 1 }}><DemoBox label="Left" /></Box>
        <Box sx={{ flex: 1 }}><DemoBox label="Center" /></Box>
        <Box sx={{ flex: 1 }}><DemoBox label="Right" /></Box>
      </>
    ),
  },
};

/**
 * ネストした StackBox
 */
export const NestedStacks: Story = {
  render: () => (
    <StackBox direction="column" spacing={3}>
      <Typography variant="h6">ネストした StackBox</Typography>
      <StackBox direction="row" spacing={2}>
        <DemoBox label="Row 1" />
        <DemoBox label="Row 2" />
        <DemoBox label="Row 3" />
      </StackBox>
      <StackBox direction="column" spacing={1}>
        <DemoBox label="Column 1" />
        <DemoBox label="Column 2" />
      </StackBox>
    </StackBox>
  ),
};

/**
 * 実際のボタン配置例
 */
export const ButtonsRow: Story = {
  render: () => (
    <StackBox direction="row" spacing={2}>
      <Button variant="contained" color="primary">保存</Button>
      <Button variant="outlined">キャンセル</Button>
      <Button variant="text" color="error">削除</Button>
    </StackBox>
  ),
};

/**
 * 非活性（子要素が disabled）
 *//**
 * 非活性（子要素が disabled）
 */
export const DisabledChildren: Story = {
  args: {
    direction: "row",
    spacing: 2,
    children: (
      <>
        <Button variant="contained" disabled>
          ボタン1
        </Button>
        <Button variant="contained" disabled>
          ボタン2
        </Button>
        <TextBox disabled name={'testLabel'} />
      </>
    ),
  },
};
