import type { Meta, StoryObj } from '@storybook/react';
import { ButtonArea } from './ButtonArea';
import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof ButtonArea> = {
  title: 'CRJ/ButtonArea',
  component: ButtonArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['view', 'edit', 'new', 'approve'] as Mode[],
    },
    role: {
      control: 'select',
      options: ['none', 'view', 'update', 'approve'] as Role[],
    },
    registerStatus: {
      control: 'select',
      options: [
        'new',
        'register',
        'registerRemoved',
        'deleted',
        'reject',
        'approved',
        'requestingDeletion',
        'deleteApprove',
      ] as RegisterStatus[],
    },
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
    haveApplicablePeriod: {
      control: 'boolean',
    },
    isOnlyApprovedOrDeleted: {
      control: 'boolean',
    },
    onBackClick: { action: 'back clicked' },
    onRefNewClick: { action: 'reference new clicked' },
    onDeleteClick: { action: 'delete clicked' },
    onEditClick: { action: 'edit clicked' },
    onApproveClick: { action: 'approve clicked' },
    onRejectClick: { action: 'reject clicked' },
    onRegisterClick: { action: 'register clicked' },
    onRegisterRemoveClick: { action: 'register remove clicked' },
    onApproveRemoveClick: { action: 'approve remove clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonArea>;

// 基本的なデフォルトボタンエリア（戻るボタンのみ）
export const Default: Story = {
  args: {
    mode: 'view',
    role: 'view',
    registerStatus: 'new',
    assignedToMe: undefined,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 戻るボタンが表示されているか確認
    const backButton = canvas.getByRole('button', { name: '戻る' });
    expect(backButton).toBeInTheDocument();

    // 他のボタンは表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '申請' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '申請取下' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '承認' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '差戻' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '参照新規登録' })).not.toBeInTheDocument();
  },
};

// 編集ボタンが表示される場合
export const WithEditButton: Story = {
  args: {
    mode: 'view',
    role: 'update',
    registerStatus: 'approved',
    assignedToMe: false,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 編集ボタンが表示されているか確認
    const editButton = canvas.getByRole('button', { name: '編集' });
    expect(editButton).toBeInTheDocument();

    // ボタンをクリックしてアクション実行確認
    await userEvent.click(editButton);
  },
};

// 削除ボタンが表示される場合
export const WithDeleteButton: Story = {
  args: {
    mode: 'edit',
    role: 'update',
    registerStatus: 'approved',
    assignedToMe: false,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 削除ボタンが表示されているか確認
    const deleteButton = canvas.getByRole('button', { name: '削除' });
    expect(deleteButton).toBeInTheDocument();

    // 申請ボタンも表示されているか確認
    const registerButton = canvas.getByRole('button', { name: '申請' });
    expect(registerButton).toBeInTheDocument();
  },
};

// 申請取下ボタンが表示される場合
export const WithRegisterRemoveButton: Story = {
  args: {
    mode: 'view',
    role: 'update',
    registerStatus: 'register',
    assignedToMe: false,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 申請取下ボタンが表示されているか確認
    const registerRemoveButton = canvas.getByRole('button', { name: '申請取下' });
    expect(registerRemoveButton).toBeInTheDocument();
  },
};

// 承認ボタンと差戻ボタンが表示される場合
export const WithApproveButtons: Story = {
  args: {
    mode: 'edit',
    role: 'approve',
    registerStatus: 'register',
    assignedToMe: true,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 承認ボタンと差戻ボタンが表示されているか確認
    const approveButton = canvas.getByRole('button', { name: '承認' });
    expect(approveButton).toBeInTheDocument();

    const rejectButton = canvas.getByRole('button', { name: '差戻' });
    expect(rejectButton).toBeInTheDocument();
  },
};

// 参照新規登録ボタンが表示される場合
export const WithRefNewButton: Story = {
  args: {
    mode: 'view',
    role: 'update',
    registerStatus: 'approved',
    assignedToMe: false,
    haveApplicablePeriod: true,
    isOnlyApprovedOrDeleted: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 参照新規登録ボタンが表示されているか確認
    const refNewButton = canvas.getByRole('button', { name: '参照新規登録' });
    expect(refNewButton).toBeInTheDocument();
  },
};

// 承認者自身に割り当てられた承認済みレコードを編集する場合
export const ApproverEditAssignedToMe: Story = {
  args: {
    mode: 'edit',
    role: 'approve',
    registerStatus: 'approved',
    assignedToMe: true,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 削除ボタンと申請ボタンが表示されているか確認
    const deleteButton = canvas.getByRole('button', { name: '削除' });
    expect(deleteButton).toBeInTheDocument();

    const registerButton = canvas.getByRole('button', { name: '申請' });
    expect(registerButton).toBeInTheDocument();
  },
};

// 新規モードの場合
export const NewMode: Story = {
  args: {
    mode: 'new',
    role: 'update',
    registerStatus: 'new',
    haveApplicablePeriod: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 申請ボタンが表示されているか確認
    const registerButton = canvas.getByRole('button', { name: '申請' });
    expect(registerButton).toBeInTheDocument();
  },
};

// カスタムコンテンツが指定された場合
export const WithCustomContent: Story = {
  args: {
    mode: 'view',
    role: 'update',
    registerStatus: 'approved',
    children: <div data-testid="custom-content">カスタムボタンエリアコンテンツ</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // カスタムコンテンツが表示されていることを確認
    const customContent = canvas.getByTestId('custom-content');
    expect(customContent).toBeInTheDocument();
    expect(customContent).toHaveTextContent('カスタムボタンエリアコンテンツ');

    // 通常のボタンが表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
  },
};

// 承認取下ボタンが表示される場合（承認権限）
export const WithApproveRemoveButtonApprovalRole: Story = {
  args: {
    mode: 'view',
    role: 'approve',
    registerStatus: 'approved',
    isTran: true,
    assignedToMe: true,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 承認取下ボタンが表示されているか確認
    const approveRemoveButton = canvas.getByRole('button', { name: '承認取下' });
    expect(approveRemoveButton).toBeInTheDocument();

    // 戻るボタンも表示されているか確認
    const backButton = canvas.getByRole('button', { name: '戻る' });
    expect(backButton).toBeInTheDocument();
  },
};

// 承認取下ボタンが表示されない場合（マスタデータ）
export const ApproveRemoveButtonNotShownForMaster: Story = {
  args: {
    mode: 'view',
    role: 'update',
    registerStatus: 'approved',
    isTran: false,
    assignedToMe: false,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 承認取下ボタンが表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '承認取下' })).not.toBeInTheDocument();

    // 戻るボタンは表示されているか確認
    const backButton = canvas.getByRole('button', { name: '戻る' });
    expect(backButton).toBeInTheDocument();
  },
};

// 承認取下ボタンが表示されない場合（参照権限）
export const ApproveRemoveButtonNotShownForViewRole: Story = {
  args: {
    mode: 'view',
    role: 'view', // 参照権限
    registerStatus: 'approved',
    isTran: true,
    assignedToMe: false,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 承認取下ボタンが表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '承認取下' })).not.toBeInTheDocument();

    // 戻るボタンは表示されているか確認
    const backButton = canvas.getByRole('button', { name: '戻る' });
    expect(backButton).toBeInTheDocument();
  },
};

// 承認取下ボタンが表示されない場合（編集モード）
export const ApproveRemoveButtonNotShownInEditMode: Story = {
  args: {
    mode: 'edit', // 編集モード
    role: 'update',
    registerStatus: 'approved',
    isTran: true,
    assignedToMe: false,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 承認取下ボタンが表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '承認取下' })).not.toBeInTheDocument();

    // 削除ボタンと申請ボタンは表示されているか確認
    const deleteButton = canvas.getByRole('button', { name: '削除' });
    expect(deleteButton).toBeInTheDocument();

    const registerButton = canvas.getByRole('button', { name: '申請' });
    expect(registerButton).toBeInTheDocument();
  },
};

// 承認取下ボタンが表示されない場合（申請中ステータス）
export const ApproveRemoveButtonNotShownForRegisterStatus: Story = {
  args: {
    mode: 'view',
    role: 'update',
    registerStatus: 'register', // 申請中ステータス
    isTran: true,
    assignedToMe: false,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 承認取下ボタンが表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '承認取下' })).not.toBeInTheDocument();

    // 申請取下ボタンは表示されているか確認
    const registerRemoveButton = canvas.getByRole('button', { name: '申請取下' });
    expect(registerRemoveButton).toBeInTheDocument();
  },
};

// 複数ボタンの組み合わせ表示（承認取下ボタン含む）
export const MultipleButtonsWithApproveRemove: Story = {
  args: {
    mode: 'view',
    role: 'approve',
    registerStatus: 'approved',
    isTran: true,
    assignedToMe: false,
    haveApplicablePeriod: true,
    isOnlyApprovedOrDeleted: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 戻るボタンが表示されているか確認
    const backButton = canvas.getByRole('button', { name: '戻る' });
    expect(backButton).toBeInTheDocument();

    // 承認取下ボタンが表示されているか確認
    const approveRemoveButton = canvas.getByRole('button', { name: '承認取下' });
    expect(approveRemoveButton).toBeInTheDocument();

    // 参照新規登録ボタンが表示されているか確認
    const refNewButton = canvas.getByRole('button', { name: '参照新規登録' });
    expect(refNewButton).toBeInTheDocument();

    // 他のボタンは表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '申請取下' })).not.toBeInTheDocument();
  },
};

// エラーケース：承認権限なし
export const ApproveRemoveButtonNotShownForNoRole: Story = {
  args: {
    mode: 'view',
    role: 'none', // 権限なし
    registerStatus: 'approved',
    isTran: true,
    assignedToMe: false,
    haveApplicablePeriod: false,
    isOnlyApprovedOrDeleted: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 承認取下ボタンが表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '承認取下' })).not.toBeInTheDocument();

    // 戻るボタンのみ表示されているか確認
    const backButton = canvas.getByRole('button', { name: '戻る' });
    expect(backButton).toBeInTheDocument();

    // その他のボタンも表示されていないことを確認
    expect(canvas.queryByRole('button', { name: '編集' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '申請' })).not.toBeInTheDocument();
  },
};
