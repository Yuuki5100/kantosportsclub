import { Meta, StoryObj } from '@storybook/react';
import { ApproveInfoArea } from './ApproveInfoArea';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from '@/store';

const approvers: OptionInfo[] = [
  { value: '001', label: '承認者1' },
  { value: '002', label: '承認者2' },
  { value: '003', label: '承認者3' },
];

/**
 * 承認情報エリアコンポーネント
 *
 * このコンポーネントは承認者情報、更新日時、コメントを表示・編集するためのものです。
 * モード、ユーザー権限、ステータスによって表示や編集可能かどうかが変わります。
 */
const meta: Meta<typeof ApproveInfoArea> = {
  title: 'CRJ/ApproveInfoArea',
  component: ApproveInfoArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });

      return (
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <Story />
          </QueryClientProvider>
        </Provider>
      );
    },
  ],
  argTypes: {
    mode: {
      control: 'select',
    },
    role: {
      control: 'select',
    },
    registerStatus: {
      control: 'select',
    },
    applicablePeriod: {
      control: 'boolean',
    },
    assignedToMe: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ApproveInfoArea>;

let comment: string = '';
const setComment = (newComment: string) => comment = newComment;

/**
 * デフォルト
 */
export const Default: Story = {
  args: {
    mode: 'view',
    role: 'approve',
    registerStatus: 'register',
    selectedApproverId: '001',
    comment: comment,
    setComment: (comment: string) => {
      console.log('コメント変更:', comment);
      setComment(comment);
    },
    setSelectedApproverId: (id: string) => console.log('承認者選択:', id),
    applicablePeriod: false,
    assignedToMe: true,
    isTran: false,
    approvers: approvers,
  },
};

/**
 * 編集モード
 */
export const EditMode: Story = {
  args: {
    mode: 'edit',
    role: 'update',
    registerStatus: 'register',
    selectedApproverId: '002',
    comment: '修正をお願いします。',
    setComment: (comment: string) => console.log('コメント変更:', comment),
    setSelectedApproverId: (id: string) => console.log('承認者選択:', id),
    applicablePeriod: false,
    approvers: approvers,
  },
};

/**
 * 閲覧モード
 */
export const ViewMode: Story = {
  args: {
    mode: 'view',
    role: 'view',
    registerStatus: 'approved',
    isTran: true,
    selectedApproverId: '003',
    approverName: '承認者3',
    updateDt: '2025-05-07 15:30:00',
    comment: '問題ありません。承認します。',
    applicablePeriod: false,
    approvers: approvers,
  },
};

/**
 * 承認権限で照会モード（自分に割り当てられた場合）
 */
export const ApproveAssignedMode: Story = {
  args: {
    mode: 'view',
    role: 'approve',
    registerStatus: 'register',
    isTran: true,
    selectedApproverId: '001',
    approverName: '承認者1',
    updateDt: '2025-05-06 14:20:00',
    comment: '',
    setComment: (comment: string) => console.log('コメント変更:', comment),
    applicablePeriod: false,
    assignedToMe: true,
    approvers: approvers,
  },
};

/**
 * 承認権限で照会モード（他人に割り当てられた場合）
 */
export const ApproveNotAssignedMode: Story = {
  args: {
    mode: 'view',
    role: 'approve',
    registerStatus: 'register',
    isTran: true,
    selectedApproverId: '002',
    approverName: '承認者2',
    updateDt: '2025-05-06 09:45:00',
    comment: '',
    setComment: (comment: string) => console.log('コメント変更:', comment),
    applicablePeriod: false,
    assignedToMe: false,
    approvers: approvers,
  },
};

// ログインユーザー情報（自己承認防止用）
const loginUser: OptionInfo = { value: 'user001', label: 'ログインユーザー' };

// 承認者一覧にログインユーザーが含まれるケース（将来対応）
const approversWithLoginUser: OptionInfo[] = [
  ...approvers,
  loginUser,
];

/**
 * 編集モード - 自己承認防止パターン
 * 
 * このストーリーでは以下を確認できます：
 * - 編集モードで承認者一覧にログインユーザーが含まれていても、選択肢から除外される
 * - 自己承認を防ぐフィルタリング機能が正しく動作する
 * - 将来バックエンドがログインユーザーを含むようになっても対応できる
 */
export const EditModeSelfApprovalPrevention: Story = {
  args: {
    mode: 'edit',
    role: 'update',
    registerStatus: 'register',
    selectedApproverId: '001',
    comment: '修正をお願いします。',
    setComment: (comment: string) => console.log('コメント変更:', comment),
    setSelectedApproverId: (id: string) => console.log('承認者選択:', id),
    applicablePeriod: false,
    approvers: approversWithLoginUser, // ログインユーザーも含む
  },
};

/**
 * 参照モード - 自分に割り当てられた場合の表示パターン
 * 
 * このストーリーでは以下を確認できます：
 * - 承認者が自分に割り当てられている場合、承認者名が正しく表示される
 * - 承認者一覧に自分が含まれていなくても、表示用として追加される
 * - Redmineチケット1429の対応内容を確認できる
 */
export const ViewModeAssignedToSelf: Story = {
  args: {
    mode: 'view',
    role: 'approve',
    registerStatus: 'register',
    isTran: true,
    selectedApproverId: 'user001', // 自分のID
    approverName: 'ログインユーザー', // 自分の名前
    updateDt: '2025-05-07 10:30:00',
    comment: '',
    setComment: (comment: string) => console.log('コメント変更:', comment),
    applicablePeriod: false,
    assignedToMe: true,
    approvers: approvers, // 通常の承認者一覧（自分は含まれていない）
  },
};

/**
 * 新規作成モード - 自己承認防止パターン
 * 
 * このストーリーでは以下を確認できます：
 * - 新規作成時でも自己承認を防ぐフィルタリングが動作する
 * - 承認者一覧からログインユーザーが除外される
 */
export const NewModeSelfApprovalPrevention: Story = {
  args: {
    mode: 'new',
    role: 'update',
    registerStatus: 'register',
    selectedApproverId: '',
    comment: '',
    setComment: (comment: string) => console.log('コメント変更:', comment),
    setSelectedApproverId: (id: string) => console.log('承認者選択:', id),
    applicablePeriod: false,
    approvers: approversWithLoginUser, // ログインユーザーも含む
  },
};

/**
 * 参照新規編集モード - 自己承認防止パターン
 * 
 * このストーリーでは以下を確認できます：
 * - 参照新規編集モードでも自己承認防止が動作する
 * - 編集可能なモードでは一貫してログインユーザーが除外される
 */
export const RefNewEditModeSelfApprovalPrevention: Story = {
  args: {
    mode: 'refNewEdit',
    role: 'update',
    registerStatus: 'register',
    selectedApproverId: '002',
    comment: '参照新規での修正です。',
    setComment: (comment: string) => console.log('コメント変更:', comment),
    setSelectedApproverId: (id: string) => console.log('承認者選択:', id),
    applicablePeriod: false,
    approvers: approversWithLoginUser, // ログインユーザーも含む
  },
};
