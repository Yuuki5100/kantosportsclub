import type { Meta, StoryObj } from '@storybook/react';
import { ApproverSelect, ApproverSelectProps } from './ApproverSelect';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import { useState } from 'react';

const meta = {
  title: 'CRJ/ApproverSelect',
  component: ApproverSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['new', 'edit', 'view', 'refNewEdit', 'applicableEdit'],
      description: '画面のモード',
    },
    approverErrorMessage: {
      control: 'text',
      description: 'エラーメッセージ',
    },
  },
} satisfies Meta<typeof ApproverSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockApprovers: OptionInfo[] = [
  { value: '1', label: '山田太郎' },
  { value: '2', label: '鈴木一郎' },
  { value: '3', label: '佐藤花子' },
  { value: '4', label: '田中次郎' },
  { value: '5', label: '高橋美咲' },
];

const InteractiveApproverSelect = (args: ApproverSelectProps) => {
  const [selectedApproverId, setSelectedApproverId] = useState<string>(args.selectedApproverId || '');

  return (
    <div style={{ width: '400px' }}>
      <ApproverSelect
        {...args}
        selectedApproverId={selectedApproverId}
        setSelectedApproverId={setSelectedApproverId}
      />
    </div>
  );
};

export const Default: Story = {
  render: InteractiveApproverSelect,
  args: {
    approvers: mockApprovers,
    selectedApproverId: '',
    mode: 'edit',


    fieldName: 'approverSelect',
  },
};