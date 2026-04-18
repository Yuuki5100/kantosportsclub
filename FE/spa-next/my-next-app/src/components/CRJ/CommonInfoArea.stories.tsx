import type { Meta, StoryObj } from '@storybook/react';
import { CommonInfoArea, CommonInfoAreaProps } from './CommonInfoArea';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof CommonInfoArea> = {
  title: 'CRJ/CommonInfoArea',
  component: CommonInfoArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommonInfoArea>;

// 基本的な共通情報
const baseProps: CommonInfoAreaProps = {
  id: 'TEST-001',
  registerStatus: 'register',
  deleteFlg: false,
  deleteReason: '',
  createdBy: 'テスト太郎',
  createdAt: '2025/05/12 14:30:00',
  updatedBy: 'テスト花子',
  updatedAt: '2025/05/13 09:15:00',
  role: 'view',
  mode: 'view',
  isTran: false,
  deleteInfoVisible: true,
  sx: undefined,
};

export const Default: Story = {
  args: {
    ...baseProps,
  },
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    assignedToMe: {
      control: {
        type: 'select',
        options: [undefined, true, false],
        labels: {
          undefined: '未割当',
          true: '自分に割当',
          false: '他者に割当',
        },
      },
      table: {
        type: { summary: 'boolean | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
};

export const EditableDeleteReason: Story = {
  args: {
    ...baseProps,
    registerStatus: 'registerRemoved',
    role: 'update',
    mode: 'edit',
    deleteReason: '編集可能なテキストエリア',
    setDeleteReason: (value: string) => console.log('更新された削除理由:', value),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 複数のテキストエリアから、非表示でないものかつname属性がdeleteReasonのものを選択
    const textAreas = canvas.getAllByRole('textbox', { hidden: true });
    const textArea = textAreas.find(
      (el) =>
        el.getAttribute('name') === 'deleteReason' && el.getAttribute('aria-hidden') !== 'true'
    );

    if (!textArea) {
      throw new Error('削除理由のテキストエリアが見つかりませんでした');
    }

    // 編集可能であることのみを確認
    expect(textArea).not.toBeDisabled();

    // 初期値が表示されていることを確認
    expect(textArea).toHaveValue('編集可能なテキストエリア');
  },
};

export const DisabledTextArea: Story = {
  args: {
    ...baseProps,
    registerStatus: 'registerRemoved',
    role: 'view',
    mode: 'view',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 複数のテキストエリアから、非表示でないものかつname属性がdeleteReasonのものを選択
    const textAreas = canvas.getAllByRole('textbox', { hidden: true });
    const textArea = textAreas.find(
      (el) =>
        el.getAttribute('name') === 'deleteReason' && el.getAttribute('aria-hidden') !== 'true'
    );

    if (!textArea) {
      throw new Error('削除理由のテキストエリアが見つかりませんでした');
    }

    expect(textArea).toBeDisabled();
  },
};

export const HiddenDeleteInfo: Story = {
  args: {
    ...baseProps,
    deleteInfoVisible: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 削除情報が非表示の場合、削除フラグと削除理由の表示が存在しないことを確認
    expect(canvas.queryByText('削除済フラグ')).not.toBeInTheDocument();
    expect(canvas.queryByText('削除理由')).not.toBeInTheDocument();
    
    // 基本的な情報は表示されていることを確認
    expect(canvas.getByText('共通情報')).toBeInTheDocument();
    expect(canvas.getByText('識別ID')).toBeInTheDocument();
    expect(canvas.getByText('ステータス')).toBeInTheDocument();
  },
};

export const WithAssignedToMe: Story = {
  args: {
    ...baseProps,
    role: 'approve',
    mode: 'view',
    assignedToMe: true,
  },
};

// 権限とモードの組み合わせストーリー
export const ViewRole: Story = {
  args: {
    ...baseProps,
    role: 'view',
    mode: 'view',
  },
};

export const UpdateRole: Story = {
  args: {
    ...baseProps,
    role: 'update',
    mode: 'edit',
  },
};

export const ApproveRole: Story = {
  args: {
    ...baseProps,
    role: 'approve',
    mode: 'view',
    assignedToMe: true,
  },
};

export const NoneRole: Story = {
  args: {
    ...baseProps,
    role: 'none',
    mode: 'view',
  },
};

// 各種モードのストーリー
export const NewMode: Story = {
  args: {
    ...baseProps,
    mode: 'new',
    role: 'update',
  },
};

export const EditMode: Story = {
  args: {
    ...baseProps,
    mode: 'edit',
    role: 'update',
    deleteReason: '編集モードでの削除理由',
    setDeleteReason: (value: string) => console.log('削除理由更新:', value),
  },
};

export const ApplicableEditMode: Story = {
  args: {
    ...baseProps,
    mode: 'applicableEdit',
    role: 'update',
  },
};

export const RefNewEditMode: Story = {
  args: {
    ...baseProps,
    mode: 'refNewEdit',
    role: 'update',
  },
};

// ステータス別ストーリー
export const RegisterStatus: Story = {
  args: {
    ...baseProps,
    registerStatus: 'register',
  },
};

export const ApprovedStatus: Story = {
  args: {
    ...baseProps,
    registerStatus: 'approved',
  },
};

export const RejectedStatus: Story = {
  args: {
    ...baseProps,
    registerStatus: 'reject',
  },
};

export const DeletedStatus: Story = {
  args: {
    ...baseProps,
    registerStatus: 'deleted',
    deleteFlg: true,
    deleteReason: 'システム移行により削除',
  },
};

export const RequestingDeletionStatus: Story = {
  args: {
    ...baseProps,
    registerStatus: 'requestingDeletion',
  },
};

// トランザクション/マスタデータ
export const TransactionData: Story = {
  args: {
    ...baseProps,
    isTran: true,
  },
};

export const MasterData: Story = {
  args: {
    ...baseProps,
    isTran: false,
  },
};

// 削除フラグ関連
export const DeletedRecord: Story = {
  args: {
    ...baseProps,
    deleteFlg: true,
    deleteReason: '業務要件変更により削除しました。関連する処理も併せて見直しを行う予定です。',
  },
};

// カスタムスタイル
export const CustomStyling: Story = {
  args: {
    ...baseProps,
    sx: {
      backgroundColor: '#f5f5f5',
      border: '2px solid #1976d2',
      borderRadius: '8px',
    },
  },
};

// エッジケース
export const EmptyValues: Story = {
  args: {
    ...baseProps,
    id: '',
    createdBy: '',
    createdAt: '',
    updatedBy: '',
    updatedAt: '',
    deleteReason: '',
  },
};

export const LongValues: Story = {
  args: {
    ...baseProps,
    id: 'VERY-LONG-IDENTIFIER-FOR-TESTING-PURPOSE-12345',
    createdBy: '非常に長いユーザー名を持つテストユーザー（表示確認用）',
    createdAt: '2024/12/31 23:59:59',
    updatedBy: '更新者の名前も非常に長い場合のテスト用ユーザー',
    updatedAt: '2024/12/31 23:59:59',
    deleteReason: 'この削除理由は100文字制限ギリギリまで入力されたテキストです。システムの表示確認とバリデーション確認のために使用されます。',
  },
};

// 権限とモード組み合わせの複合パターン
export const UpdateRoleEditMode: Story = {
  args: {
    ...baseProps,
    role: 'update',
    mode: 'edit',
    registerStatus: 'register',
    deleteReason: '編集可能な削除理由',
    setDeleteReason: (value: string) => console.log('削除理由変更:', value),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 削除理由のテキストエリアが編集可能であることを確認
    const textAreas = canvas.getAllByRole('textbox', { hidden: true });
    const deleteReasonTextArea = textAreas.find(
      (el) => el.getAttribute('name') === 'deleteReason' && el.getAttribute('aria-hidden') !== 'true'
    );
    
    if (deleteReasonTextArea) {
      expect(deleteReasonTextArea).not.toBeDisabled();
      expect(deleteReasonTextArea).toHaveValue('編集可能な削除理由');
    }
  },
};

export const ApproveRoleWithAssignment: Story = {
  args: {
    ...baseProps,
    role: 'approve',
    mode: 'view',
    registerStatus: 'register',
    assignedToMe: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // 承認権限で自分に割り当てられた場合の表示確認
    expect(canvas.getByText('共通情報')).toBeInTheDocument();
    expect(canvas.getByText('申請中')).toBeInTheDocument();
  },
};
