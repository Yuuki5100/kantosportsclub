import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Typography, Box, Paper, Card, Chip } from '@mui/material';
import { http, HttpResponse } from 'msw';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DetailContainer from './DetailContainer';
import { BaseDetail } from './BaseDetail';
import { Role } from '@/types/CRJ/Role';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import { CRJApiResponse } from '@/types/CRJ/CRJApiResponse';
import { ApproverListResponse } from '@/types/CRJ/ApproverResponse';
import authReducer from '@/slices/authSlice';
import langReducer from '@/slices/langSlice';

// ログインユーザー情報（すべてのストーリーで使用）
const loginUser: OptionInfo = { value: 'user001', label: 'ログインユーザー' };

// Redux用のモックストア作成
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      lang: langReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        rolePermissions: null,
        status: 'idle' as const,
        error: null,
        userId: 'user001',
        name: 'ログインユーザー',
      },
      lang: {
        language: 'ja' as const,
      },
    },
  });
};

/**
 * # DetailContainer
 *
 * 申請管理システムにおいて詳細画面を表示するための共通コンテナコンポーネントです。
 *
 * ## 概要
 * - ユーザーの権限とレコードの登録ステータスに応じて適切なUIを表示
 * - 複数の情報エリア（共通情報、承認情報、適用情報）を一元的に管理
 * - 一貫性のあるユーザー体験を提供
 *
 * ## 適用範囲
 * - 各種申請の詳細表示画面
 * - 編集画面
 * - 承認・差戻し画面
 *
 * ## 主要機能
 * - 権限・ステータスベースのUI制御
 * - 承認者リストのAPI連携
 * - モード制御（表示/編集）
 * - 適用情報操作
 * - エラーハンドリング
 */
const meta: Meta<typeof DetailContainer> = {
  title: 'CRJ/DetailContainer',
  component: DetailContainer,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/common/getApproverList/*', () => {
          // デフォルトの承認者モックデータ
          // クエリパラメータ付きのURLでも対応するように * を使用
          const mockData = {
            result: 'Success' as const,
            message: '承認者一覧取得成功',
            args: '',
            data: {
              approverList: [
                { userId: 'CURRENT_USER_ID', userName: '田中太郎' },
                { userId: '002', userName: '佐藤花子' },
                { userId: '003', userName: '鈴木一郎' },
                { userId: '004', userName: '高橋美咲' },
                { userId: '005', userName: '山田健太' },
              ],
            },
          };
          return HttpResponse.json(mockData);
        }),
      ],
    },
    docs: {
      description: {
        component: `
申請管理システムの詳細画面で使用される共通コンテナコンポーネントです。
ユーザーの権限（none/view/update/approve）とレコードの登録ステータスに応じて、
適切なUIとアクションボタンを表示します。

### アーキテクチャ
- **UIフレームワーク**: Material-UI（MUI）
- **状態管理**: React Hooks（useState, useEffect）
- **API連携**: 承認者リスト動的取得
- **レイアウト**: Flexbox活用

### 統一ルール
- コンテナデザインの一貫性
- モード制御（照会/編集）
- 権限制御（参照/更新/承認）
- サブコンポーネント連携

### 主要サブコンポーネント
- **CommonInfoArea**: 共通情報（ID、ステータス、削除情報等）
- **ApproveInfoArea**: 承認情報（承認者、コメント、更新日時等）
- **ApplicableInfoArea**: 適用情報（適用終了日等）
- **ButtonArea**: アクションボタン群

### 権限とステータスによる制御
- **none**: アクセス制限（通常は表示されない）
- **view**: 参照のみ、編集・承認アクション無効
- **update**: 編集・申請・取下等が可能
- **approve**: 割当状況により承認・差戻が可能

### 承認情報の管理
- **approveUpdateAt**: 承認情報の更新日時
- **approveComment**: 承認者のコメント
- **setApproveComment**: コメント変更用のハンドラ
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['none', 'view', 'update', 'approve'],
      description: 'ユーザーの権限区分',
      table: {
        type: { summary: 'Role' },
        defaultValue: { summary: 'none' },
      },
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
        'approveRemoved',
        'deleteApprove',
      ],
      description: 'レコードの登録ステータス',
      table: {
        type: { summary: 'RegisterStatus' },
        defaultValue: { summary: 'new' },
      },
    },
    mode: {
      control: 'select',
      options: ['new', 'view', 'edit', 'applicableEdit', 'refNewEdit'],
      description: '画面のモード',
      table: {
        type: { summary: 'Mode' },
        defaultValue: { summary: 'view' },
      },
    },
    applicableInfoHidden: {
      control: 'boolean',
      description: '適用情報エリアの表示/非表示',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    assignedToMe: {
      control: 'boolean',
      description: '承認者自身に割り当てられているかどうか',
      table: {
        type: { summary: 'boolean | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
    deleteFlg: {
      control: 'boolean',
      description: '削除フラグ',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    isOnlyApprovedOrDeleted: {
      control: 'boolean',
      description: '承認済・削除済・承認済削除以外のレコードがない場合はtrue',
      table: {
        type: { summary: 'boolean | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
    approveUpdateAt: {
      control: 'text',
      description: '承認情報更新日時',
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
    approveComment: {
      control: 'text',
      description: '承認情報のコメント',
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
    applicableRegisterStatus: {
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
      ],
      description: '適用情報の登録ステータス（適用終了日の表示に必須）',
      table: {
        type: { summary: 'RegisterStatus | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
    children: {
      description: '詳細コンテンツ領域に表示する子要素',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
  },
  decorators: [
    (Story) => {
      const store = createMockStore();
      return (
        <Provider store={store}>
          <Box sx={{ width: '100%', height: '100vh', p: 0 }}>
            <Story />
          </Box>
        </Provider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof DetailContainer>;

// デモ用の詳細コンテンツコンポーネント
const DemoDetailContent: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <Paper sx={{ p: 3, m: 2 }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {description}
    </Typography>
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2">ここに詳細な申請内容や情報が表示されます。</Typography>
    </Box>
  </Paper>
);

/**
 * ## インタラクティブなデフォルト表示
 * 全てのプロパティを自由に変更して動作を確認できる基本表示
 */
export const Default: Story = {
  args: {
    id: 'APP001',
    role: 'approve',
    registerStatus: 'register',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-01 10:00:00',
    createdBy: '山田太郎',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: '鈴木花子',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: true,
    isTran: false,
    applicableComment: '',
    setApproveComment: (comment: string) => console.log('承認コメント変更:', comment),
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'register',
    onError: (message: string) => {
      console.error('エラーが発生しました:', message);
    },
    onEditClick: () => console.log('編集ボタンクリック'),
    onBackClick: () => console.log('戻るボタンクリック'),
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="基本的な詳細表示"
        description="更新権限ユーザーの標準的な詳細画面表示例です。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '更新権限を持つユーザーが登録済みレコードを閲覧している基本的な状態です。編集ボタンが表示され、適用情報エリアも表示されています。',
      },
    },
  },
};

/**
 * ## 承認者による承認待ちレコード表示
 * 承認権限を持つユーザーが自分に割り当てられた承認待ちレコードを表示
 */
export const ApprovalPending: Story = {
  args: {
    id: 'APP002',
    role: 'approve',
    registerStatus: 'register',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-10 09:00:00',
    createdBy: '佐藤次郎',
    updatedAt: '2024-06-10 09:00:00',
    updatedBy: '佐藤次郎',
    selectedApproverId: 'APPROVER001',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: true,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'register',
    approveUpdateAt: '2024-06-10 09:00:00',
    approveComment: '',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="承認待ちレコード"
        description="承認者に割り当てられた承認待ちレコードです。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '承認権限を持つユーザーが自分に割り当てられた承認待ちレコードを表示している状態です。承認・差戻ボタンが表示されます。',
      },
    },
  },
};

/**
 * ## 参照権限ユーザーの表示
 * 参照権限のみのユーザーが承認済みレコードを閲覧
 */
export const ViewOnly: Story = {
  args: {
    id: 'APP003',
    role: 'view',
    registerStatus: 'approved',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-05-15 14:00:00',
    createdBy: '田中三郎',
    updatedAt: '2024-05-20 16:45:00',
    updatedBy: '承認者A',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: true,
    applicableRegisterStatus: 'approved',
    approveUpdateAt: '2024-05-20 16:45:00',
    approveComment: '内容を確認しました。承認いたします。',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="参照専用表示"
        description="参照権限ユーザーが承認済みレコードを閲覧しています。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '参照権限のみのユーザーが承認済みレコードを閲覧している状態です。編集や承認等のアクションボタンは表示されません。',
      },
    },
  },
};

/**
 * ## 編集モード
 * 更新権限ユーザーがレコードを編集している状態
 */
export const EditMode: Story = {
  args: {
    id: 'APP004',
    role: 'update',
    registerStatus: 'new',
    mode: 'edit',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 10:00:00',
    createdBy: '編集者',
    updatedAt: '2024-06-13 10:00:00',
    updatedBy: '編集者',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'new',
    loginUser: loginUser,
    children: <DemoDetailContent title="編集モード" description="レコードを編集中の状態です。" />,
  },
  parameters: {
    docs: {
      description: {
        story:
          '更新権限ユーザーがレコードを編集している状態です。保存・キャンセル等の編集用ボタンが表示されます。',
      },
    },
  },
};

/**
 * ## 適用情報非表示
 * 適用情報エリアを非表示にした表示
 */
export const WithoutApplicableInfo: Story = {
  args: {
    id: 'APP005',
    role: 'update',
    registerStatus: 'register',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-01 10:00:00',
    createdBy: '山田太郎',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: '鈴木花子',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: true,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="適用情報非表示"
        description="適用情報エリアが非表示になっている表示例です。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '適用情報エリアを非表示にした状態の表示です。メニューによっては適用情報が不要な場合があります。',
      },
    },
  },
};

/**
 * ## 削除済みレコード
 * 削除フラグが立っているレコードの表示
 */
export const DeletedRecord: Story = {
  args: {
    id: 'APP006',
    role: 'view',
    registerStatus: 'deleted',
    mode: 'view',
    deleteFlg: true,
    deleteReason: 'システム移行のため削除',
    createdAt: '2024-05-01 09:00:00',
    createdBy: '旧システム',
    updatedAt: '2024-05-31 23:59:59',
    updatedBy: 'システム管理者',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: true,
    applicableRegisterStatus: 'deleted',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="削除済みレコード"
        description="削除済みレコードの表示です。削除理由も併せて表示されます。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '削除フラグが立っているレコードの表示状態です。削除理由が表示され、編集等のアクションは制限されます。',
      },
    },
  },
};

/**
 * ## 差戻しされたレコード
 * 承認者によって差戻しされたレコードの状態
 */
export const RejectedRecord: Story = {
  args: {
    id: 'APP007',
    role: 'update',
    registerStatus: 'reject',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-05 11:00:00',
    createdBy: '申請者',
    updatedAt: '2024-06-12 14:30:00',
    updatedBy: '承認者B',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '内容に不備があるため差戻しします。',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'reject',
    approveUpdateAt: '2024-06-12 14:30:00',
    approveComment: '内容に不備があるため差戻しします。詳細は適用コメントをご確認ください。',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="差戻しされたレコード"
        description="承認者によって差戻しされたレコードです。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '承認者によって差戻しされたレコードの状態です。差戻し理由（適用コメント）が表示され、再編集が可能です。',
      },
    },
  },
};

/**
 * ## 申請取下されたレコード
 * ユーザーによって申請取下されたレコードの状態
 */
export const RegisterRemovedRecord: Story = {
  args: {
    id: 'APP009',
    role: 'update',
    registerStatus: 'registerRemoved',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '申請内容に誤りがあったため取下',
    createdAt: '2024-06-08 13:00:00',
    createdBy: '申請者',
    updatedAt: '2024-06-10 11:20:00',
    updatedBy: '申請者',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'registerRemoved',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="申請取下レコード"
        description="ユーザーによって申請が取下されたレコードです。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'ユーザーによって申請が取下されたレコードの状態です。取下理由が削除理由欄に表示され、再編集が可能です。',
      },
    },
  },
};

/**
 * ## 削除申請中レコード
 * 削除申請中のレコードの状態
 */
export const RequestingDeletionRecord: Story = {
  args: {
    id: 'APP010',
    role: 'approve',
    registerStatus: 'requestingDeletion',
    mode: 'view',
    deleteFlg: false,
    deleteReason: 'システム統合により不要になったため',
    createdAt: '2024-06-05 16:00:00',
    createdBy: '削除申請者',
    updatedAt: '2024-06-11 10:15:00',
    updatedBy: '削除申請者',
    selectedApproverId: 'APPROVER002',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: true,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'requestingDeletion',
    approveUpdateAt: '2024-06-11 10:15:00',
    approveComment: '',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="削除申請中レコード"
        description="削除申請中のレコードです。承認者による承認・差戻が可能です。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '削除申請中のレコードの状態です。承認者は削除理由を確認して、削除を承認または差戻すことができます。',
      },
    },
  },
};

/**
 * ## 適用情報編集モード
 * 適用情報を編集している状態
 */
export const ApplicableEditMode: Story = {
  args: {
    id: 'APP011',
    role: 'update',
    registerStatus: 'approved',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-05-20 08:30:00',
    createdBy: '適用情報編集者',
    updatedAt: '2024-06-13 16:45:00',
    updatedBy: '適用情報編集者',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: true,
    applicableRegisterStatus: 'approved',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="適用情報編集モード"
        description="承認済みレコードの適用情報を編集している状態です。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '承認済みレコードの適用情報を編集している状態です。適用終了日などの適用情報のみが編集可能になります。',
      },
    },
  },
};

/**
 * ## 権限なしユーザー
 * 権限を持たないユーザーのアクセス（通常はルーティングで制限される）
 */
export const NoPermission: Story = {
  args: {
    id: 'APP008',
    role: 'none',
    registerStatus: 'register',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-01 10:00:00',
    createdBy: '山田太郎',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: '鈴木花子',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'register',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="権限なし"
        description="権限を持たないユーザーのアクセス状態（通常は表示されません）。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '権限を持たないユーザーの状態です。通常はルーティングレベルで制限されるため、この状態が表示されることはありません。',
      },
    },
  },
};

/**
 * ## インタラクティブなプレイグラウンド
 * すべてのプロパティを自由に変更して動作を確認できます
 */
export const Playground: Story = {
  args: {
    id: 'PLAYGROUND',
    role: 'update',
    registerStatus: 'register',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 10:00:00',
    createdBy: 'プレイグラウンドユーザー',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: 'プレイグラウンドユーザー',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: true,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'register',
    approveUpdateAt: '2024-06-13 15:30:00',
    approveComment: 'プレイグラウンドでのテストコメントです。',
    onBackClick: () => console.log('戻るボタンクリック'),
    onEditClick: () => console.log('編集ボタンクリック'),
    onApproveClick: () => console.log('承認ボタンクリック'),
    onRejectClick: () => console.log('差戻ボタンクリック'),
    onRegisterRemoveClick: () => console.log('申請取下ボタンクリック'),
    onRegisterClick: () => console.log('申請ボタンクリック'),
    onDeleteClick: () => console.log('削除ボタンクリック'),
    onRefNewClick: () => console.log('参照新規登録ボタンクリック'),
    onApplicableEditClick: () => console.log('適用情報編集ボタンクリック'),
    onApplicableApproveClick: () => console.log('適用情報承認ボタンクリック'),
    onApplicableRejectClick: () => console.log('適用情報差戻ボタンクリック'),
    onApplicableRegisterClick: () => console.log('適用情報申請ボタンクリック'),
    onApplicableRegisterRemoveClick: () => console.log('適用情報申請取下ボタンクリック'),
    onApplicableDeleteClick: () => console.log('適用情報削除ボタンクリック'),
    setApproveComment: (comment: string) => console.log('承認コメント変更:', comment),
    onError: (message: string) => console.error('エラー:', message),
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="インタラクティブなプレイグラウンド"
        description="コントロールパネルからプロパティを変更して、様々な状態でのコンポーネントの動作を確認できます。ボタンをクリックすると、コンソールにイベントが出力されます。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: `
このストーリーでは、すべてのプロパティを自由に変更して、DetailContainerコンポーネントの動作を確認できます。

**使用方法:**
1. 右側のControlsパネルでプロパティを変更
2. ボタンをクリックしてイベントの動作を確認
3. ブラウザのコンソールでイベントログを確認

**確認できる項目:**
- 権限（role）の変更による表示の違い
- 登録ステータス（registerStatus）による動作の違い
- モード（mode）の切り替え
- 各種ボタンのクリックイベント
- 適用情報の表示/非表示
        `,
      },
    },
  },
};

/**
 * ## 編集ボタン → 編集モード遷移例
 *
 * 更新権限ユーザーが承認済みレコードの編集ボタンをクリックして、
 * editモードに遷移する動作を確認できる例です。
 */
export const EditModeTransition: Story = {
  args: {
    id: 'EDIT_TRANSITION001',
    role: 'update',
    registerStatus: 'approved',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 09:00:00',
    createdBy: '申請者',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: '更新者',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'approved',
    approveUpdateAt: '2024-06-13 15:30:00',
    approveComment: '承認済みの内容です。',

    // 編集ボタンクリック時にeditモードに遷移
    onEditClick: () => {
      console.log('✅ 編集ボタンクリック → editモードに遷移');
      alert(`📝 編集ボタンがクリックされました！

🔄 モード遷移:
   viewモード → editモード

📋 利用可能な操作:
   ✅ 申請ボタン（内容を申請）
   ✅ 削除ボタン（編集モード専用）
   ✅ 戻るボタン（viewモードに戻る）

💡 実装ポイント:
   - mode プロパティを 'edit' に変更
   - フォーム要素が編集可能になる
   - ButtonAreaに編集用ボタンが表示される`);
    },

    onBackClick: () => console.log('📱 戻るボタンクリック → viewモードに戻る'),
    onRegisterClick: () => console.log('📤 申請ボタンクリック → 申請処理実行'),
    onDeleteClick: () => console.log('🗑️ 削除ボタンクリック → 削除処理実行'),
    loginUser: loginUser,
    children: (
      <Paper
        sx={{
          p: 3,
          m: 2,
          border: 2,
          borderColor: 'info.main',
          backgroundColor: 'info.light',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom color="info.dark" sx={{ fontWeight: 'bold' }}>
          📝 編集ボタン → 編集モード遷移の例
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          更新権限ユーザーが承認済みレコードの<strong>編集ボタン</strong>をクリックする例です。
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            🎯 現在の状態：
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label="mode: view" size="small" color="primary" variant="filled" />
            <Chip label="role: update" size="small" color="secondary" variant="filled" />
            <Chip label="status: approved" size="small" color="success" variant="filled" />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 1,
            border: 1,
            borderColor: 'info.main',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="info.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔄 遷移後の期待動作：
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>mode</strong> が &apos;edit&apos; に変更される
              </li>
              <li>
                <strong>フォーム要素</strong>が編集可能になる
              </li>
              <li>
                <strong>申請ボタン</strong>が表示される
              </li>
              <li>
                <strong>削除ボタン</strong>（編集モード専用）が表示される
              </li>
              <li>
                <strong>戻るボタン</strong>でviewモードに戻れる
              </li>
            </Box>
          </Typography>
        </Box>
      </Paper>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: `
## 編集ボタンクリック時のモード遷移

更新権限ユーザーが承認済みレコードの編集ボタンをクリックした際の動作例です。

### 遷移フロー
\`\`\`
1. 初期状態: viewモード、approvedステータス
2. 編集ボタンクリック（onEditClickイベント発火）
3. editモードに遷移
4. フォームが編集可能になる
5. 申請・削除ボタンが表示される
\`\`\`

### 実装時のポイント

**1. モード制御**
\`\`\`javascript
const [mode, setMode] = useState('view');

const handleEditClick = () => {
  setMode('edit');
};
\`\`\`

**2. ボタン表示制御**
- editモードでは申請・削除ボタンが表示される
- viewモードでは編集・参照新規登録ボタンが表示される

**3. フォーム制御**
- editモードでは入力フィールドが活性化される
- viewモードでは読み取り専用で表示される

### 関連するプロパティ
- \`mode\`: 'view' → 'edit'
- \`onEditClick\`: 編集ボタンクリックハンドラ
- \`onRegisterClick\`: 申請ボタンクリックハンドラ
- \`onDeleteClick\`: 削除ボタンクリックハンドラ
- \`onBackClick\`: 戻るボタンクリックハンドラ
        `,
      },
    },
  },
};

/**
 * ## 参照新規登録ボタン → 参照新規編集モード遷移例
 *
 * 承認済みレコードから参照新規登録ボタンをクリックして、
 * refNewEditモードに遷移する動作を確認できる例です。
 */
export const RefNewModeTransition: Story = {
  args: {
    id: 'REFNEW_TRANSITION001',
    role: 'update',
    registerStatus: 'approved',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 09:00:00',
    createdBy: '申請者',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: '更新者',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: true,
    applicablePeriod: true,
    applicableRegisterStatus: 'approved',
    approveUpdateAt: '2024-06-13 15:30:00',
    approveComment: '承認済みの内容です。',

    // 参照新規登録ボタンクリック時にrefNewEditモードに遷移
    onRefNewClick: () => {
      console.log('✅ 参照新規登録ボタンクリック → refNewEditモードに遷移');
      alert(`🔗 参照新規登録ボタンがクリックされました！

🔄 モード遷移:
   viewモード → refNewEditモード

📋 動作内容:
   ✅ 既存データを複製して新規レコード作成
   ✅ IDは新規発番される
   ✅ ステータスは 'new' に設定
   ✅ 編集可能状態で表示

💡 実装ポイント:
   - 既存データをテンプレートとして活用
   - 新規レコードとして独立して管理
   - 承認フローを最初から実行`);
    },

    onBackClick: () => console.log('📱 戻るボタンクリック → 一覧画面に戻る'),
    onEditClick: () => console.log('📝 編集ボタンクリック → editモードに遷移'),
    loginUser: loginUser,
    children: (
      <Paper
        sx={{
          p: 3,
          m: 2,
          border: 2,
          borderColor: 'secondary.main',
          backgroundColor: 'secondary.light',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom color="secondary.dark" sx={{ fontWeight: 'bold' }}>
          🔗 参照新規登録ボタン → 参照新規編集モード遷移の例
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          承認済みレコードから<strong>参照新規登録ボタン</strong>をクリックする例です。
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            🎯 現在の状態：
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label="mode: view" size="small" color="primary" variant="filled" />
            <Chip label="role: update" size="small" color="secondary" variant="filled" />
            <Chip label="status: approved" size="small" color="success" variant="filled" />
            <Chip label="isOnlyApprovedOrDeleted: true" size="small" variant="outlined" />
            <Chip label="applicablePeriod: true" size="small" variant="outlined" />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 1,
            border: 1,
            borderColor: 'secondary.main',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="secondary.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
            📋 表示条件（すべて満たす必要がある）：
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>適用期間がある</strong>（applicablePeriod: true）
              </li>
              <li>
                <strong>承認済み・削除済み以外のレコードがない</strong>（isOnlyApprovedOrDeleted:
                true）
              </li>
              <li>
                <strong>承認済みステータス</strong>（registerStatus: approved）
              </li>
              <li>
                <strong>更新または承認権限</strong>（role: update/approve）
              </li>
            </Box>
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'info.light',
            borderRadius: 1,
            border: 1,
            borderColor: 'info.main',
            borderStyle: 'dashed',
            mt: 2,
          }}
        >
          <Typography variant="body2" color="info.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔄 遷移後の期待動作：
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>新規ID</strong>が発番される
              </li>
              <li>
                <strong>registerStatus</strong> が &apos;new&apos; に設定
              </li>
              <li>
                <strong>既存データ</strong>が初期値として設定
              </li>
              <li>
                <strong>編集可能状態</strong>で表示される
              </li>
              <li>
                <strong>申請ボタン</strong>で新規申請が可能
              </li>
            </Box>
          </Typography>
        </Box>
      </Paper>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: `
## 参照新規登録ボタンクリック時のモード遷移

承認済みレコードから参照新規登録ボタンをクリックした際の動作例です。

### 表示条件
参照新規登録ボタンが表示されるには、以下の条件をすべて満たす必要があります：

- **適用期間がある**（applicablePeriod: true）
- **承認済み・削除済み以外のレコードがない**（isOnlyApprovedOrDeleted: true）
- **承認済みステータス**（registerStatus: approved）
- **更新または承認権限**（role: update/approve）

### 遷移フロー
\`\`\`
1. 初期状態: viewモード、approvedステータス
2. 参照新規登録ボタンクリック（onRefNewClickイベント発火）
3. refNewEditモードに遷移
4. 既存データを複製した新規レコードを作成
5. 編集可能状態で表示
\`\`\`

### 実装時のポイント

**1. 新規レコード作成**
\`\`\`javascript
const handleRefNewClick = () => {
  // 新規IDを発番
  const newId = generateNewId();

  // 既存データを複製して新規レコードを作成
  const newRecord = {
    ...existingData,
    id: newId,
    registerStatus: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // refNewEditモードに遷移
  setMode('refNewEdit');
  setCurrentRecord(newRecord);
};
\`\`\`

**2. データの複製とリセット**
- 基本情報は既存データから複製
- ID、作成日時、更新日時は新規設定
- registerStatusは 'new' に設定
- 承認情報はクリア

### 関連するプロパティ
- \`applicablePeriod\`: 適用期間の有無
- \`isOnlyApprovedOrDeleted\`: 承認済み・削除済み以外のレコードの有無
- \`onRefNewClick\`: 参照新規登録ボタンクリックハンドラ
- \`mode\`: 'view' → 'refNewEdit'
- \`registerStatus\`: 'approved' → 'new'
        `,
      },
    },
  },
};

/**
 * ## 適用情報編集ボタン → 適用情報編集モード遷移例
 *
 * 承認済みレコードの適用情報編集ボタンをクリックして、
 * applicableEditモードに遷移する動作を確認できる例です。
 */
export const ApplicableEditModeTransition: Story = {
  args: {
    id: 'APPLICABLE_TRANSITION001',
    role: 'update',
    registerStatus: 'approved',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 09:00:00',
    createdBy: '申請者',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: '更新者',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: true,
    applicableRegisterStatus: 'approved',
    loginUser: loginUser,
    children: (
      <DemoDetailContent
        title="適用情報編集モード"
        description="承認済みレコードの適用情報を編集している状態です。"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: `
## 適用情報編集ボタンクリック時のモード遷移

承認済みレコードの適用情報編集ボタンをクリックした際の動作例です。

### 表示条件
適用情報編集ボタンが表示されるには、以下の条件を満たす必要があります：

- **承認済み・削除済み以外のレコードがない**（isOnlyApprovedOrDeleted: true）
- **承認済みステータス**（registerStatus: approved）
- **更新または承認権限**（role: update/approve）

### 遷移フロー
\`\`\`
1. 初期状態: viewモード、approvedステータス
2. 適用情報編集ボタンクリック（onApplicableEditClickイベント発火）
3. applicableEditモードに遷移
4. 適用情報のみが編集可能になる
\`\`\`

### 編集範囲の制限

**編集可能項目**
- 適用終了日（applicableEndDate）
- 適用情報の削除フラグ・理由
- 適用情報の承認者選択
- 適用情報のコメント

**編集不可項目**
- 基本情報（共通情報エリア）
- 承認情報（承認情報エリア）

### 実装時のポイント

**1. モード制御**
\`\`\`javascript
const [mode, setMode] = useState('view');

const handleApplicableEditClick = () => {
  setMode('applicableEdit');
};
\`\`\`

**2. フィールド制御**
- 適用情報エリアのフィールドのみ編集可能
- 基本情報・承認情報は読み取り専用で維持

**3. ボタン制御**
- 適用情報専用の申請・削除ボタンが表示される
- 基本情報用のボタンは非表示

### 関連するプロパティ
- \`isOnlyApprovedOrDeleted\`: 承認済み・削除済み以外のレコードの有無
- \`onApplicableEditClick\`: 適用情報編集ボタンクリックハンドラ
- \`onApplicableRegisterClick\`: 適用情報申請ボタンクリックハンドラ
- \`onApplicableDeleteClick\`: 適用情報削除ボタンクリックハンドラ
- \`mode\`: 'view' → 'applicableEdit'
        `,
      },
    },
  },
};

/**
 * ## 全プロパティ設定例
 * DetailContainerの全てのプロパティを設定した完全な例
 */
export const CompleteExample: Story = {
  args: {
    // 基本情報
    id: 'COMPLETE001',
    role: 'approve',
    registerStatus: 'register',
    mode: 'view',
    menuId: 'MENU001',

    // 削除情報
    deleteFlg: false,
    deleteReason: '',
    setDeleteReason: (value: string) => console.log('削除理由変更:', value),

    // 作成・更新情報
    createdAt: '2024-06-01 09:00:00',
    createdBy: '申請者 太郎',
    updatedAt: '2024-06-13 14:30:00',
    updatedBy: '更新者 花子',

    // 承認者情報
    selectedApproverId: 'APPROVER001',
    setSelectedApproverId: (value: string) => console.log('承認者ID変更:', value),
    assignedToMe: true,

    // 承認情報
    approveUpdateAt: '2024-06-13 14:30:00',
    approveComment: '詳細な内容を確認いたしました。承認いたします。',
    setApproveComment: (comment: string) => console.log('承認コメント変更:', comment),

    // 適用情報表示制御
    applicableInfoHidden: false,
    applicablePeriod: true,
    isOnlyApprovedOrDeleted: false,

    // 適用情報詳細
    applicableId: 'APPLICABLE001',
    applicableRegisterStatus: 'approved',
    applicableEndDate: undefined, // Dayjsオブジェクトが必要
    setApplicableEndDate: (value) => console.log('適用終了日変更:', value),
    applicableDeleteFlg: false,
    applicableDeleteReason: '',
    setApplicableDeleteReason: (value: string) => console.log('適用削除理由変更:', value),
    applicableCreatedAt: '2024-05-15 10:00:00',
    applicableCreatedBy: '適用情報作成者',
    applicableUpdatedAt: '2024-06-10 16:00:00',
    applicableUpdatedBy: '適用情報更新者',
    applicableSelectedApproverId: 'APPROVER002',
    setApplicableSelectedApproverId: (value: string) => console.log('適用承認者ID変更:', value),
    applicableComment: '適用情報のコメントです。',
    setApplicableComment: (value: string) => console.log('適用コメント変更:', value),

    // 全てのイベントハンドラ
    onBackClick: () => console.log('戻るボタンクリック'),
    onEditClick: () => console.log('編集ボタンクリック'),
    onApproveClick: () => console.log('承認ボタンクリック'),
    onRejectClick: () => console.log('差戻ボタンクリック'),
    onRegisterClick: () => console.log('申請ボタンクリック'),
    onRegisterRemoveClick: () => console.log('申請取下ボタンクリック'),
    onDeleteClick: () => console.log('削除ボタンクリック'),
    onRefNewClick: () => console.log('参照新規登録ボタンクリック'),

    // 適用情報イベントハンドラ
    onApplicableEditClick: () => console.log('適用情報編集ボタンクリック'),
    onApplicableApproveClick: () => console.log('適用情報承認ボタンクリック'),
    onApplicableRejectClick: () => console.log('適用情報差戻ボタンクリック'),
    onApplicableRegisterClick: () => console.log('適用情報申請ボタンクリック'),
    onApplicableRegisterRemoveClick: () => console.log('適用情報申請取下ボタンクリック'),
    onApplicableDeleteClick: () => console.log('適用情報削除ボタンクリック'),

    // エラーハンドリング
    onError: (message: string) => {
      console.error('エラーが発生しました:', message);
      alert(`エラー: ${message}`);
    },

    // カスタムボタンエリア
    customButtonArea: (
      <Box sx={{ p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2">
          カスタムボタンエリア: 独自のボタンやアクションを配置できます
        </Typography>
      </Box>
    ),

    // 子要素
    loginUser: loginUser,
    children: (
      <Paper sx={{ p: 3, m: 2, border: 2, borderColor: 'primary.main' }}>
        <Typography variant="h6" gutterBottom color="primary">
          完全設定例の詳細コンテンツ
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          この例では、DetailContainerコンポーネントで使用可能な全てのプロパティが設定されています。
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          実装時の参考として、以下の項目が全て設定されています：
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>基本情報（ID、ステータス、モード等）</li>
          <li>削除情報（フラグ、理由、ハンドラ）</li>
          <li>作成・更新情報</li>
          <li>承認者情報と承認情報</li>
          <li>適用情報の全詳細設定</li>
          <li>全てのイベントハンドラ</li>
          <li>エラーハンドリング</li>
          <li>カスタムUI要素</li>
        </Box>
        <Typography variant="body2" color="success.main">
          ✅ この例を参考に、実際のプロジェクトで必要なプロパティを選択して実装してください。
        </Typography>
      </Paper>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: `
DetailContainerコンポーネントで使用可能な全てのプロパティを設定した完全な実装例です。

**設定されている全プロパティ:**

**基本情報:**
- id, role, registerStatus, mode, menuId

**削除関連:**
- deleteFlg, deleteReason, setDeleteReason

**作成・更新情報:**
- createdAt, createdBy, updatedAt, updatedBy

**承認者・承認情報:**
- selectedApproverId, setSelectedApproverId, assignedToMe
- approveUpdateAt, approveComment, setApproveComment

**適用情報:**
- applicableInfoHidden, applicablePeriod, isOnlyApprovedOrDeleted
- applicableId, applicableRegisterStatus, applicableEndDate, setApplicableEndDate
- applicableDeleteFlg, applicableDeleteReason, setApplicableDeleteReason
- applicableCreatedAt, applicableCreatedBy, applicableUpdatedAt, applicableUpdatedBy
- applicableSelectedApproverId, setApplicableSelectedApproverId
- applicableComment, setApplicableComment

**イベントハンドラ:**
- 基本アクション: onBackClick, onEditClick, onApproveClick, onRejectClick
- 申請関連: onRegisterClick, onRegisterRemoveClick, onDeleteClick, onRefNewClick
- 適用情報: onApplicableEditClick, onApplicableApproveClick, onApplicableRejectClick, onApplicableRegisterClick, onApplicableRegisterRemoveClick, onApplicableDeleteClick

**その他:**
- onError, customButtonArea, children

**実装時の注意点:**
1. 全てのプロパティが必須ではありません - 必要なもののみ設定
2. イベントハンドラは使用するボタンに対応するもののみ実装
3. 適用情報が不要な場合は applicableInfoHidden を true に設定
4. エラーハンドリングは必ず実装することを推奨
        `,
      },
    },
  },
};

/**
 * ## 使用例とベストプラクティス
 * 実際の実装で参考になる使用例
 */
export const UsageExample: Story = {
  args: {
    id: 'EXAMPLE001',
    role: 'update',
    registerStatus: 'register',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 09:00:00',
    createdBy: '実装例ユーザー',
    updatedAt: '2024-06-13 14:30:00',
    updatedBy: '更新者',
    selectedApproverId: '',
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    applicableRegisterStatus: 'register',
    approveUpdateAt: '2024-06-13 14:30:00',
    approveComment: '実装例での承認コメントです。',
    setApproveComment: (comment: string) => console.log('承認コメント変更:', comment),
    onBackClick: () => alert('戻る処理を実行'),
    onEditClick: () => alert('編集処理を実行'),
    onApproveClick: () => alert('承認処理を実行'),
    onRejectClick: () => alert('差戻処理を実行'),
    onRegisterRemoveClick: () => alert('申請取下処理を実行'),
    onRegisterClick: () => alert('申請処理を実行'),
    onDeleteClick: () => alert('削除処理を実行'),
    onRefNewClick: () => alert('参照新規登録画面に遷移'),
    onApplicableEditClick: () => alert('適用情報編集処理を実行'),
    onApplicableApproveClick: () => alert('適用情報承認処理を実行'),
    onApplicableRejectClick: () => alert('適用情報差戻処理を実行'),
    onApplicableRegisterClick: () => alert('適用情報申請処理を実行'),
    onApplicableRegisterRemoveClick: () => alert('適用情報申請取下処理を実行'),
    onApplicableDeleteClick: () => alert('適用情報削除処理を実行'),
    onError: (message: string) => {
      console.error('エラーが発生しました:', message);
      alert(`エラー: ${message}`);
    },
    isOnlyApprovedOrDeleted: false,
    loginUser: loginUser,
    children: (
      <Paper sx={{ p: 3, m: 2 }}>
        <Typography variant="h6" gutterBottom>
          使用例の詳細コンテンツ
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          この例では、DetailContainerコンポーネントの実装パターンを示しています。
        </Typography>
        <Typography variant="body2" color="text.secondary">
          実際の実装では、API呼び出しやルーティング処理などを 各ハンドラ内で実行することになります。
        </Typography>
      </Paper>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: `
実際のアプリケーションでDetailContainerを使用する際の実装例です。

**ポイント:**
- 適切なイベントハンドラの実装
- エラーハンドリングの考慮
- 実際の処理（API呼び出し、ルーティング）の想定

**実装時の注意点:**
1. 必須プロパティの設定を忘れずに
2. 使用するボタンに対応するコールバック関数を実装
3. 適切なエラーハンドリングの実装
4. 状態管理の連携（親コンポーネント側で実装）
        `,
      },
    },
  },
};

/**
 * ## 各種権限・ステータス組み合わせ一覧
 * 主要な権限とステータスの組み合わせを一覧で確認
 */
export const AllCombinations: Story = {
  render: () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        DetailContainer - 権限・ステータス組み合わせ一覧
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }} color="text.secondary">
        DetailContainerコンポーネントの主要な権限とステータスの組み合わせを一覧で確認できます。
        実際の運用では以下のような表示パターンが想定されます。
      </Typography>

      <Box sx={{ display: 'grid', gap: 3, mt: 3 }}>
        {/* 参照権限 */}
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
          >
            参照権限（view）
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 2,
            }}
          >
            <Card sx={{ p: 2, border: 1, borderColor: 'grey.300' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                承認済みレコード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: view, status: approved
              </Typography>
              <Typography variant="caption">閲覧のみ可能</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'grey.300' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                削除済みレコード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: view, status: deleted
              </Typography>
              <Typography variant="caption">削除理由も含めて閲覧のみ</Typography>
            </Card>
          </Box>
        </Box>

        {/* 更新権限 */}
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
          >
            更新権限（update）
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 2,
            }}
          >
            <Card sx={{ p: 2, border: 1, borderColor: 'success.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                新規レコード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: update, status: new
              </Typography>
              <Typography variant="caption">編集・申請可能</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'info.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                登録済みレコード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: update, status: register
              </Typography>
              <Typography variant="caption">編集・申請取下可能</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'warning.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                差戻しレコード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: update, status: reject
              </Typography>
              <Typography variant="caption">編集・再申請可能</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'orange' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                申請取下レコード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: update, status: registerRemoved
              </Typography>
              <Typography variant="caption">編集・再申請可能</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'error.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                削除申請中レコード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: update, status: requestingDeletion
              </Typography>
              <Typography variant="caption">申請取下可能</Typography>
            </Card>
          </Box>
        </Box>

        {/* 承認権限 */}
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
          >
            承認権限（approve）
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 2,
            }}
          >
            <Card sx={{ p: 2, border: 1, borderColor: 'primary.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                承認待ちレコード（自分割当）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: approve, status: register, assignedToMe: true
              </Typography>
              <Typography variant="caption">承認・差戻可能</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'grey.300' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                承認待ちレコード（他人割当）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: approve, status: register, assignedToMe: false
              </Typography>
              <Typography variant="caption">閲覧のみ</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'success.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                承認済みレコード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: approve, status: approved
              </Typography>
              <Typography variant="caption">閲覧・参照新規登録可能</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'error.main' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                削除申請中レコード（自分割当）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: approve, status: requestingDeletion, assignedToMe: true
              </Typography>
              <Typography variant="caption">削除承認・差戻可能</Typography>
            </Card>
          </Box>
        </Box>

        {/* 特殊ケース */}
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
          >
            特殊ケース
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 2,
            }}
          >
            <Card sx={{ p: 2, border: 1, borderColor: 'error.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                権限なし
              </Typography>
              <Typography variant="body2" color="text.secondary">
                role: none
              </Typography>
              <Typography variant="caption">通常はアクセス制限される</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'warning.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                適用情報非表示
              </Typography>
              <Typography variant="body2" color="text.secondary">
                applicableInfoHidden: true
              </Typography>
              <Typography variant="caption">メニューによっては適用情報不要</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'info.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                適用情報編集モード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                mode: view
              </Typography>
              <Typography variant="body2" color="text.secondary">
              </Typography>
              <Typography variant="caption">適用終了日などの編集が可能</Typography>
            </Card>
            <Card sx={{ p: 2, border: 1, borderColor: 'secondary.light' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                参照新規編集モード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                mode: refNewEdit
              </Typography>
              <Typography variant="caption">承認済みデータを参照して新規作成</Typography>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: `
DetailContainerコンポーネントで想定される主要な権限とステータスの組み合わせを一覧表示しています。

**組み合わせパターン:**
- **参照権限**: 基本的に閲覧のみ
- **更新権限**: 編集・申請・取下等の操作が可能
- **承認権限**: 割当状況により承認・差戻が可能
- **特殊ケース**: 権限なしや適用情報非表示など

このパターンを参考に、実際のアプリケーションでの表示制御を設計してください。
        `,
      },
    },
  },
};

/**
 * ## 実践例：拠点情報詳細画面
 *
 * BaseDetailコンポーネントを使用した実際の業務画面の例です。
 * 拠点情報の詳細画面として、実際のフォーム要素と共にDetailContainerの機能を確認できます。
 */
export const BaseDetailExample: Story = {
  render: (args) => (
    <BaseDetail
      role={args.role as Role}
      registerStatus={args.registerStatus as RegisterStatus}
      assignedToMe={args.assignedToMe as boolean}
      applicableInfoHidden={args.applicableInfoHidden as boolean}
    />
  ),
  args: {
    role: 'update',
    registerStatus: 'register',
    assignedToMe: false,
    applicableInfoHidden: false,
  },
  argTypes: {
    role: {
      control: 'select',
      options: ['none', 'view', 'update', 'approve'],
      description: 'ユーザーの権限区分',
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
      ],
      description: 'レコードの登録ステータス',
    },
    assignedToMe: {
      control: 'boolean',
      description: '承認者自身に割り当てられているかどうか',
    },
    applicableInfoHidden: {
      control: 'boolean',
      description: '適用情報エリアの表示/非表示',
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
## BaseDetailコンポーネントを使用した実践例

この例では、実際の業務で使用される拠点情報の詳細画面を表示しています。

### 特徴
- **実際のフォーム要素**: TextBox、RadioButtonなどの実際の入力コンポーネント
- **業務データ**: 拠点CD、拠点名、住所、電話番号等の実際の項目
- **モード切り替え**: 編集ボタンクリックでeditモードに遷移
- **動的な表示制御**: 権限とステータスに応じたボタン表示

### 表示される項目
- **拠点CD**: 一意の拠点コード（編集不可）
- **拠点名**: 拠点の正式名称
- **略称名**: 拠点の略称
- **郵便番号**: 〒マーク付きの郵便番号
- **住所**: 拠点の所在地
- **電話番号**: 連絡先電話番号
- **FAX番号**: FAX番号
- **拠点区分**: 本社/事業所/営業所の選択

### 使用方法
1. **権限を変更**: role プロパティで表示されるボタンが変わります
2. **ステータス変更**: registerStatus で画面の状態が変わります
3. **編集モード**: 編集ボタンをクリックすると入力フィールドが編集可能になります
4. **適用情報**: applicableInfoHidden で適用情報エリアの表示/非表示を切り替え

### 実装のポイント
- BaseDetailコンポーネント内でDetailContainerを使用
- useState でモード管理を行っている
- 実際のフォームライブラリ（@/components/base）を使用
- Material-UI のCard コンポーネントでレイアウトを整理

### コード例
\`\`\`tsx
<BaseDetail
  role="update"
  registerStatus="register"
  assignedToMe={false}
  applicableInfoHidden={false}
/>
\`\`\`

この例を参考に、他の業務画面でもDetailContainerを活用してください。
        `,
      },
    },
  },
};

/**
 * ## 実践例：拠点情報承認画面
 *
 * 承認者が拠点情報の申請を承認・差戻しする画面の例です。
 */
export const BaseDetailApprovalExample: Story = {
  render: () => (
    <BaseDetail
      role="approve"
      registerStatus="register"
      assignedToMe={true}
      applicableInfoHidden={false}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
## 承認者による拠点情報の承認画面

承認権限を持つユーザーが、自分に割り当てられた拠点情報の申請を承認・差戻しする画面です。

### 機能
- **承認ボタン**: 申請内容を承認
- **差戻しボタン**: 申請を差戻し（理由を入力可能）
- **読み取り専用**: フォーム要素は編集不可
- **承認コメント**: 承認時のコメントを入力可能

### 表示制御
- role: 'approve' - 承認権限
- registerStatus: 'register' - 申請済み状態
- assignedToMe: true - 自分に割り当て済み
- フォーム要素は全て無効化された状態で表示
        `,
      },
    },
  },
};

/**
 * ## 実践例：拠点情報編集画面（編集モード）
 *
 * 拠点情報を編集している状態の画面例です。
 */
export const BaseDetailEditExample: Story = {
  render: () => {
    // 初期状態で編集モードに設定されたBaseDetailのシミュレーション
    return (
      <Box>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'info.light' }}>
          <Typography variant="h6" color="info.dark">
            📝 編集モードの拠点情報画面
          </Typography>
          <Typography variant="body2">
            この例では、初期状態で編集モードになっている拠点情報画面を表示しています。
            実際の実装では、編集ボタンクリック時にモードが切り替わります。
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip label="mode: edit" size="small" color="primary" />
            <Chip label="編集可能" size="small" color="success" sx={{ ml: 1 }} />
            <Chip label="申請・削除ボタン表示" size="small" color="warning" sx={{ ml: 1 }} />
          </Box>
        </Paper>
        <BaseDetail
          role="update"
          registerStatus="new"
          assignedToMe={false}
          applicableInfoHidden={false}
        />
      </Box>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
## 編集モードでの拠点情報画面

拠点情報を編集している状態の画面です。

### 編集モードの特徴
- **入力フィールド活性化**: 全ての入力項目が編集可能
- **申請ボタン**: 編集内容を申請
- **削除ボタン**: レコードを削除（編集モード時のみ表示）
- **戻るボタン**: viewモードに戻る

### フォーム要素の状態
- **拠点CD**: 編集不可（disabled状態）
- **その他の項目**: 編集可能
- **ラジオボタン**: 拠点区分の選択が可能

### 使用場面
- 新規拠点の登録時
- 既存拠点情報の更新時
- 差戻しされた申請の再編集時
        `,
      },
    },
  },
};

/**
 * ## 実践例：拠点情報適用情報なし
 *
 * 適用情報エリアを非表示にした拠点情報画面の例です。
 */
export const BaseDetailWithoutApplicableExample: Story = {
  render: () => (
    <BaseDetail
      role="update"
      registerStatus="approved"
      assignedToMe={false}
      applicableInfoHidden={true}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: `
## 適用情報なしの拠点情報画面

適用情報エリアを非表示にした拠点情報画面です。

### 使用場面
- 適用期間の概念がないマスタデータ
- シンプルな設定画面
- 適用情報が不要な業務画面

### 特徴
- **適用情報エリア非表示**: applicableInfoHidden: true
- **スッキリとしたレイアウト**: 必要最小限の情報のみ表示
- **基本機能**: 編集・申請等の基本機能は利用可能
        `,
      },
    },
  },
};

// 承認者APIレスポンス用のモックデータ
const approversApiMockData = {
  result: 'Success' as const,
  message: '承認者一覧取得成功',
  args: '',
  data: {
    approverList: [
      { userId: '001', userName: '承認者A' },
      { userId: '002', userName: '承認者B' },
      { userId: '003', userName: '承認者C' },
      { userId: 'user001', userName: 'ログインユーザー' },
    ],
  },
};


/**
 * ## 自己承認防止 - 編集モードでのフィルタリング
 *
 * 編集モードで自分が承認者一覧から除外されることを確認できます。
 * 将来バックエンドがログインユーザーを含むようになっても対応できることを確認。
 */
export const SelfApprovalPreventionEditMode: Story = {
  args: {
    id: 'SELF_APPROVAL_EDIT001',
    role: 'update',
    registerStatus: 'register',
    mode: 'edit',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 09:00:00',
    createdBy: 'ログインユーザー',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: 'ログインユーザー',
    selectedApproverId: '001',
    setSelectedApproverId: (id: string) => console.log('承認者ID変更:', id),
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: false,
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'register',
    loginUser: loginUser, // ログインユーザー情報を渡す
    onBackClick: () => console.log('戻るボタンクリック'),
    onEditClick: () => console.log('編集ボタンクリック → 承認者IDクリア処理実行'),
    onRegisterClick: () => console.log('申請ボタンクリック'),
    onDeleteClick: () => console.log('削除ボタンクリック'),
    onError: (message: string) => console.error('エラー:', message),
    children: (
      <Paper
        sx={{
          p: 3,
          m: 2,
          border: 2,
          borderColor: 'warning.main',
          backgroundColor: 'warning.light',
        }}
      >
        <Typography variant="h6" gutterBottom color="warning.dark" sx={{ fontWeight: 'bold' }}>
          🔒 自己承認防止 - 編集モード
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          編集モードで承認者一覧から<strong>ログインユーザー自身が除外される</strong>
          ことを確認できます。
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            🎯 確認ポイント：
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label="mode: edit" size="small" color="primary" variant="filled" />
            <Chip label="loginUser設定済み" size="small" color="success" variant="filled" />
            <Chip
              label="自己承認防止フィルタリング"
              size="small"
              color="warning"
              variant="filled"
            />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 1,
            border: 1,
            borderColor: 'warning.main',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔍 動作確認：
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <li>承認者コンボボックスを開いてください</li>
              <li>
                <strong>「ログインユーザー」が選択肢にない</strong>ことを確認
              </li>
              <li>他の承認者（承認者A、B、C）は表示されることを確認</li>
              <li>
                これにより<strong>自己承認が防止</strong>されています
              </li>
            </Box>
          </Typography>
        </Box>
      </Paper>
    ),
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/common/getApproverList', () => {
          return HttpResponse.json(approversApiMockData);
        }),
      ],
    },
    docs: {
      description: {
        story: `
## 自己承認防止 - 編集モードでのフィルタリング

編集モードで承認者一覧から自分自身が除外されることを確認できるストーリーです。

### 機能概要
- **自己承認防止**: 編集モードでログインユーザーを承認者選択肢から除外
- **将来対応**: バックエンドAPIがログインユーザーを含むようになっても対応
- **フィルタリング**: ApproveInfoAreaで動的にフィルタリング

### テスト手順
1. **承認者コンボボックスを開く**
2. **ログインユーザーが選択肢にないことを確認**
3. **他の承認者は正常に表示されることを確認**

### 実装ポイント
- \`loginUser\` プロパティでログインユーザー情報を渡す
- ApproveInfoAreaの \`getApproverOptions\` 関数で編集モード時にフィルタリング
- \`approverSelectable && props.loginUser\` の条件で自分を除外

### MSW設定
承認者一覧のAPIをモックし、ログインユーザーも含めたレスポンスを返します。
実際のフロントエンドでフィルタリングされることを確認。

### 関連チケット
- **Redmineチケット1426**: 編集時の自己承認防止
- **将来対応**: バックエンドAPI変更への対応
        `,
      },
    },
  },
};

/**
 * ## 自己承認防止 - 参照モードでの承認者名表示
 *
 * 参照モードで自分に割り当てられている場合、承認者名が正しく表示されることを確認できます。
 */
export const SelfApprovalPreventionViewMode: Story = {
  args: {
    id: 'SELF_APPROVAL_VIEW001',
    role: 'approve',
    registerStatus: 'register',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 09:00:00',
    createdBy: '申請者',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: '申請者',
    selectedApproverId: 'user001', // 自分のID
    setSelectedApproverId: (id: string) => console.log('承認者ID変更:', id),
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: true, // 自分に割り当て
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'register',
    approveUpdateAt: '2024-06-13 15:30:00',
    approveComment: '',
    setApproveComment: (comment: string) => console.log('承認コメント変更:', comment),
    loginUser: loginUser,
    onBackClick: () => console.log('戻るボタンクリック'),
    onApproveClick: () => console.log('承認ボタンクリック'),
    onRejectClick: () => console.log('差戻ボタンクリック'),
    onError: (message: string) => console.error('エラー:', message),
    children: (
      <Paper
        sx={{ p: 3, m: 2, border: 2, borderColor: 'info.main', backgroundColor: 'info.light' }}
      >
        <Typography variant="h6" gutterBottom color="info.dark" sx={{ fontWeight: 'bold' }}>
          👁️ 自己承認防止 - 参照モード（承認者名表示）
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          参照モードで自分に割り当てられている場合、<strong>承認者名が正しく表示される</strong>
          ことを確認できます。
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            🎯 確認ポイント：
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label="mode: view" size="small" color="primary" variant="filled" />
            <Chip label="assignedToMe: true" size="small" color="success" variant="filled" />
            <Chip label="承認者名表示" size="small" color="info" variant="filled" />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 1,
            border: 1,
            borderColor: 'info.main',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="info.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔍 動作確認：
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <li>承認情報エリアの承認者欄を確認</li>
              <li>
                <strong>「ログインユーザー」が表示される</strong>ことを確認
              </li>
              <li>参照モードなので編集は不可（自己承認のリスクなし）</li>
              <li>承認・差戻ボタンが表示されることを確認</li>
            </Box>
          </Typography>
        </Box>
      </Paper>
    ),
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/common/getApproverList', () => {
          // 通常の承認者一覧（ログインユーザーなし）
          const approversWithoutLoginUser = {
            result: 'Success' as const,
            message: '承認者一覧取得成功',
            args: '',
            data: {
              approverList: [
                { userId: '001', userName: '承認者A' },
                { userId: '002', userName: '承認者B' },
                { userId: '003', userName: '承認者C' },
              ],
            },
          };
          return HttpResponse.json(approversWithoutLoginUser);
        }),
      ],
    },
    docs: {
      description: {
        story: `
## 自己承認防止 - 参照モードでの承認者名表示

参照モードで自分に割り当てられている場合の承認者名表示を確認できるストーリーです。

### 機能概要
- **承認者名表示**: 参照モードで自分に割り当てられた場合、承認者名を正しく表示
- **空白解消**: Redmineチケット1429の対応内容
- **表示専用**: 参照モードなので自己承認のリスクはなし

### 背景
- **現在**: 承認者一覧APIにはログインユーザーが含まれない
- **問題**: 自分に割り当てられた場合、承認者欄が空白になる
- **解決**: 表示用として承認者名を動的に追加

### テスト手順
1. **承認情報エリアの承認者欄を確認**
2. **「ログインユーザー」が表示されることを確認**
3. **承認・差戻ボタンが表示されることを確認**

### 実装ポイント
- \`assignedToMe: true\` かつ \`approverName\` が設定されている場合
- ApproveInfoAreaで表示用として選択肢に追加
- 参照モードなので編集不可（自己承認のリスクなし）

### MSW設定
通常の承認者一覧（ログインユーザーなし）をモックし、
フロントエンドで動的に追加されることを確認。

### 関連チケット
- **Redmineチケット1429**: 承認者名の表示改善
        `,
      },
    },
  },
};

/**
 * ## 自己承認防止 - 編集ボタンクリック時の承認者IDクリア
 *
 * 自分に割り当てられている状態で編集ボタンをクリックした際の動作を確認できます。
 */
export const SelfApprovalPreventionEditButtonClick: Story = {
  args: {
    id: 'EDIT_BUTTON_CLEAR001',
    role: 'update',
    registerStatus: 'approved',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-13 09:00:00',
    createdBy: '申請者',
    updatedAt: '2024-06-13 15:30:00',
    updatedBy: '承認者',
    selectedApproverId: 'user001', // 自分のIDが設定済み
    setSelectedApproverId: (id: string) => {
      console.log('承認者ID変更:', id);
      if (id === '') {
        alert(
          '✅ 承認者IDがクリアされました！\n\n編集ボタンクリック時の自己承認防止処理が正常に動作しています。'
        );
      }
    },
    menuId: 'MENU001',
    applicableInfoHidden: false,
    assignedToMe: true, // 自分に割り当て済み
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicableRegisterStatus: 'approved',
    approveUpdateAt: '2024-06-13 15:30:00',
    approveComment: '承認済みです。',
    loginUser: loginUser,
    onBackClick: () => console.log('戻るボタンクリック'),
    onEditClick: () => {
      console.log('📝 編集ボタンクリック');
      console.log('🔄 DetailContainerのhandleEditClick処理実行');
      console.log('✅ assignedToMe=true のため、承認者IDをクリア');
    },
    onRegisterClick: () => console.log('申請ボタンクリック'),
    onDeleteClick: () => console.log('削除ボタンクリック'),
    onError: (message: string) => console.error('エラー:', message),
    children: (
      <Paper
        sx={{
          p: 3,
          m: 2,
          border: 2,
          borderColor: 'secondary.main',
          backgroundColor: 'secondary.light',
        }}
      >
        <Typography variant="h6" gutterBottom color="secondary.dark" sx={{ fontWeight: 'bold' }}>
          ✂️ 自己承認防止 - 編集ボタンクリック時の承認者IDクリア
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          自分に割り当てられた状態で<strong>編集ボタンをクリック</strong>
          した際の動作を確認できます。
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            🎯 初期状態：
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label="selectedApproverId: user001"
              size="small"
              color="primary"
              variant="filled"
            />
            <Chip label="assignedToMe: true" size="small" color="success" variant="filled" />
            <Chip label="承認者に自分が設定済み" size="small" color="warning" variant="filled" />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 1,
            border: 1,
            borderColor: 'secondary.main',
            borderStyle: 'dashed',
            mb: 3,
          }}
        >
          <Typography variant="body2" color="secondary.dark" sx={{ fontWeight: 'bold', mb: 2 }}>
            🔍 動作確認手順：
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>編集ボタンをクリック</strong>してください
              </li>
              <li>承認者IDクリアのアラートが表示されることを確認</li>
              <li>コンソールで処理ログを確認</li>
              <li>実際のアプリでは editモード に遷移し、承認者が未選択になります</li>
            </Box>
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'success.light',
            borderRadius: 1,
            border: 1,
            borderColor: 'success.main',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
            ✅ 期待される動作：
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>setSelectedApproverId(&apos;&apos;)</strong> が呼び出される
              </li>
              <li>承認者が未選択状態になる</li>
              <li>ユーザーは適切な承認者を再選択する必要がある</li>
              <li>
                <strong>自己承認が防止</strong>される
              </li>
            </Box>
          </Typography>
        </Box>
      </Paper>
    ),
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/common/getApproverList', () => {
          return HttpResponse.json(approversApiMockData);
        }),
      ],
    },
    docs: {
      description: {
        story: `
## 自己承認防止 - 編集ボタンクリック時の承認者IDクリア

自分に割り当てられた状態で編集ボタンをクリックした際の動作を確認できるストーリーです。

### 機能概要
- **編集時クリア**: 自分に割り当てられている場合、編集ボタンクリック時に承認者IDをクリア
- **自己承認防止**: ユーザーは適切な承認者を再選択する必要がある
- **安全性確保**: 承認フローの整合性を保つ

### 背景
Redmineチケット1426の要件：
> 編集ボタンクリック処理に、当該レコードの承認者 = ログインユーザの場合、承認者コンボの設定値（Key）をクリアする処理を追加

### テスト手順
1. **初期状態確認**: 承認者に自分が設定済み
2. **編集ボタンクリック**: 編集ボタンをクリック
3. **クリア確認**: 承認者IDがクリアされることを確認
4. **再選択**: ユーザーは適切な承認者を選び直す

### 実装詳細
DetailContainerの\`handleEditClick\`関数で実装されています。
この機能により、承認フローの整合性が保たれ、自己承認が防止されます。
        `,
      },
    },
  },
};

/**
 * ## 統合テスト - Redmine #1426 修正対応
 *
 * Redmine チケット #1426「組織詳細 編集ボタン処理の仕様追加」に対する
 * 包括的な統合テストストーリーです。
 *
 * ### テスト対象
 * - 編集ボタンクリック時の承認者IDクリア処理
 * - 自己承認防止機能の動作確認
 * - 承認者コンボの空白表示対応
 * - 必須チェックエラーの適切な発生
 *
 * ### 修正内容
 * > 編集ボタンクリック処理に、当該レコードの承認者 = ログインユーザの場合、
 * > 承認者コンボの設定値（Key）をクリアする処理を追加
 *
 * ### 横展開対応
 * 組織詳細以外の画面でも同様の修正が必要となるため、
 * 基本パターンとなる動作を統合テストとして定義
 */
export const IntegrationTest_Redmine1426: Story = {
  args: {
    id: 'ORG001',
    role: 'approve',
    registerStatus: 'approved',
    mode: 'view',
    deleteFlg: false,
    deleteReason: '',
    createdAt: '2024-06-23 10:00:00',
    createdBy: 'システム利用者',
    updatedAt: '2024-06-23 10:00:00',
    updatedBy: 'システム利用者',
    selectedApproverId: '',
    menuId: 'ORG_MENU',
    applicableInfoHidden: false,
    assignedToMe: true, // 重要：自分に割り当てられている状態
    applicableComment: '',
    isOnlyApprovedOrDeleted: false,
    applicablePeriod: true,
    applicableRegisterStatus: 'new',
    approveUpdateAt: '2024-06-23 10:00:00',
    approveComment: '承認待ちの状態です。',
    loginUser: {
      value: 'USER001',
      label: 'テストユーザー（ログイン中）',
    },

    // 編集ボタンクリック時のハンドラー（テスト用）
    onEditClick: () => {
      console.log('編集ボタンクリック - 承認者IDがクリアされました');
    },
    setSelectedApproverId: (value: string) => {
      console.log('承認者ID更新:', value === '' ? '空白（クリア済み）' : value);
    },

    onBackClick: () => console.log('📱 戻るボタン → 一覧画面'),
    onApproveClick: () => console.log('✅ 承認ボタン → 承認処理'),
    onRejectClick: () => console.log('❌ 差戻ボタン → 差戻処理'),
    onRegisterClick: () => console.log('📝 申請ボタン → 申請処理'),
    onDeleteClick: () => console.log('🗑️ 削除ボタン → 削除処理'),
    children: (
      <Paper
        sx={{
          p: 3,
          m: 2,
          border: 3,
          borderColor: 'warning.main',
          backgroundColor: 'warning.light',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom color="warning.dark" sx={{ fontWeight: 'bold' }}>
          🧪 統合テスト: Redmineチケット#1426
        </Typography>
        <Typography variant="h6" gutterBottom color="warning.dark">
          自己承認防止機能の完全検証
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
            📋 テスト概要
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            編集ボタンクリック時に、自分に割り当てられた承認者IDが適切にクリアされることを検証します。
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            🎯 現在のテスト状態：
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label="mode: view" size="small" color="primary" variant="filled" />
            <Chip label="role: update" size="small" color="secondary" variant="filled" />
            <Chip label="status: register" size="small" color="info" variant="filled" />
            <Chip label="assignedToMe: true" size="small" color="warning" variant="filled" />
            <Chip label="selectedApproverId: USER001" size="small" color="error" variant="filled" />
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 1,
            border: 2,
            borderColor: 'warning.main',
            borderStyle: 'solid',
            mb: 3,
          }}
        >
          <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 'bold', mb: 2 }}>
            🧪 テストシナリオ（編集ボタンをクリックして確認）:
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
              ✅ ステップ1: 初期状態確認
            </Typography>
            <Typography variant="body2" component="div">
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>承認者が自分に設定済み（assignedToMe: true）</li>
                <li>承認者ID: USER001 が設定済み</li>
                <li>ログインユーザー: テストユーザー</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.dark' }}>
              🔄 ステップ2: 編集ボタンクリック
            </Typography>
            <Typography variant="body2" component="div">
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>DetailContainer.handleEditClick() 実行</li>
                <li>assignedToMe=true & setSelectedApproverId存在確認</li>
                <li>setSelectedApproverId(&apos;&apos;)でIDクリア実行</li>
                <li>元のonEditClick()処理実行</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.dark' }}>
              ✨ ステップ3: 結果確認
            </Typography>
            <Typography variant="body2" component="div">
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>承認者IDがクリアされる（&apos;&apos; に変更）</li>
                <li>承認者選択フィールドが未選択状態</li>
                <li>編集モードに遷移</li>
                <li>ユーザーは新たに承認者を選択する必要がある</li>
              </Box>
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'error.light',
            borderRadius: 1,
            border: 1,
            borderColor: 'error.main',
            borderStyle: 'dashed',
            mb: 2,
          }}
        >
          <Typography variant="body2" color="error.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
            🎯 検証ポイント:
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <strong>自己承認防止</strong>: 自分に割り当てられた状態で編集時にIDクリア
              </li>
              <li>
                <strong>処理順序</strong>: クリア処理→元の編集処理の順序確認
              </li>
              <li>
                <strong>条件分岐</strong>: assignedToMe判定の正確性
              </li>
              <li>
                <strong>UI整合性</strong>: クリア後の表示状態確認
              </li>
            </Box>
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'success.light',
            borderRadius: 1,
            border: 1,
            borderColor: 'success.main',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔧 実装コード（DetailContainer.tsx）:
          </Typography>
          <Box
            sx={{
              backgroundColor: 'grey.100',
              p: 1,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
            }}
          >
            <pre>{`const handleEditClick = () => {
  if (props.assignedToMe && props.setSelectedApproverId) {
    // 承認者が自分に割り当てられている場合、承認者IDをクリア
    props.setSelectedApproverId('');
  }
  // 元の編集ボタンクリック処理を実行
  props.onEditClick?.();
};`}</pre>
          </Box>
        </Box>
      </Paper>
    ),
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/common/getApproverList*', () => {
          // テスト用の承認者モックデータ
          // クエリパラメータ付きのURLでも対応するように * を使用
          const mockData: CRJApiResponse<ApproverListResponse> = {
            result: 'Success' as const,
            message: '承認者一覧取得成功',
            args: '',
            data: {
              approverList: [
                { userId: 'USER001', userName: 'テストユーザー（ログイン中）' },
                { userId: 'USER002', userName: '田中太郎' },
                { userId: 'USER003', userName: '佐藤花子' },
                { userId: 'USER004', userName: '鈴木一郎' },
                { userId: 'USER005', userName: '高橋美咲' },
              ],
            },
          };
          return HttpResponse.json(mockData);
        }),
      ],
    },
    docs: {
      description: {
        story: "統合テスト: Redmineチケット#1426 - 自己承認防止機能。編集ボタンクリック時に、自分に割り当てられた承認者IDが適切にクリアされる機能の統合テストです。"
      }
    }
  }
};