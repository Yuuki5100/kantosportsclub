import type { Meta, StoryObj } from '@storybook/react';
import { ApplicableInfoArea, ApplicableInfoAreaProps } from './ApplicableInfoArea';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import { useState } from 'react';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Dayjs } from 'dayjs';

const meta = {
  title: 'CRJ/ApplicableInfoArea',
  component: ApplicableInfoArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    hidden: {
      control: 'boolean',
      description: 'コンポーネントの表示/非表示',
    },
    role: {
      control: 'select',
      options: ['none', 'view', 'update', 'approve'],
      description: 'ユーザーの権限',
    },
    mode: {
      control: 'select',
      options: ['new', 'edit', 'view', 'refNewEdit', 'edit'],
      description: '画面のモード',
    },
    registerStatus: {
      control: 'select',
      options: [null, 'new', 'register', 'registerRemoved', 'approved', 'reject', 'deleted', 'deleteApprove', 'requestingDeletion'],
      description: '登録ステータス',
    },
    assignedToMe: {
      control: 'boolean',
      description: '自分に割り当てられているか',
    },
    isOnlyApprovedOrDeleted: {
      control: 'boolean',
      description: '承認済みまたは削除済みのみか',
    },
    isTran: {
      control: 'boolean',
      description: 'トランザクションデータか',
    },
    deleteReason: {
      control: 'text',
      description: '削除理由',
    },
    comment: {
      control: 'text',
      description: 'コメント',
    },
    approverErrorMessage: {
      control: 'text',
      description: '承認者エラーメッセージ',
    },
  },
} satisfies Meta<typeof ApplicableInfoArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockApprovers: OptionInfo[] = [
  { value: '1', label: '山田太郎' },
  { value: '2', label: '鈴木一郎' },
  { value: '3', label: '佐藤花子' },
  { value: '4', label: '田中次郎' },
  { value: '5', label: '高橋美咲' },
];

const InteractiveApplicableInfoArea = (args: ApplicableInfoAreaProps) => {
  const [selectedApproverId, setSelectedApproverId] = useState<string>(args.selectedApproverId || '');
  const [deleteReason, setDeleteReason] = useState<string>(args.deleteReason || '');
  const [applicableComment, setApplicableComment] = useState<string>(args.comment || '');
  const [comment, setComment] = useState<string>(args.comment || '');
  const [applicableEndDate, setApplicableEndDate] = useState<Dayjs | undefined>(args.applicableEndDate || undefined);

  return (
    <div style={{ width: '800px', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <ApplicableInfoArea
        {...args}
        selectedApproverId={selectedApproverId}
        setSelectedApproverId={setSelectedApproverId}
        deleteReason={deleteReason}
        setDeleteReason={setDeleteReason}
        comment={comment}
        setComment={setComment}
        applicableEndDate={applicableEndDate}
        setApplicableEndDate={setApplicableEndDate}
      />
    </div>
  );
};

// 基本的な表示
export const Default: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    id: 'TEST-001',
    haveApplicablePeriod: true,
    deleteFlg: false,
    deleteReason: '',
    applicableEndDate: undefined,
    setApplicableEndDate: () => {},
    comment: '',
    setComment: () => {},
    createdBy: 'テストユーザー1',
    createdAt: '2024-01-01 10:00:00',
    updatedBy: 'テストユーザー2',
    updatedAt: '2024-01-02 15:30:00',
    registerStepUpdatedAt: '2024-01-03 12:00:00',
    hidden: false,
    role: 'update',
    mode: 'view',
    registerStatus: 'approved',
    assignedToMe: false,
    isOnlyApprovedOrDeleted: false,
    isTran: false,
    approvers: mockApprovers,
    selectedApproverId: '',
    onEditClick: () => console.log('編集ボタンがクリックされました'),
    onDeleteClick: () => console.log('削除ボタンがクリックされました'),
    onRegisterClick: () => console.log('申請ボタンがクリックされました'),
    onRegisterRemoveClick: () => console.log('申請取下ボタンがクリックされました'),
    onRejectClick: () => console.log('差戻ボタンがクリックされました'),
    onApproveClick: () => console.log('承認ボタンがクリックされました'),
  },
};

// 編集可能な状態（適用期間編集モード）
export const EditMode: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    mode: 'edit',
    registerStatus: 'approved',
    applicableEndDate: new Dayjs('2024-12-31'),
  },
};

// 編集ボタンが表示される状態（更新権限・差戻済み）
export const WithEditButton: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'update',
    mode: 'view',
    registerStatus: 'reject',
  },
};

// 承認者向けの表示（承認待ち・自分に割り当て）
export const ApproverAssignedToMe: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'approve',
    mode: 'view',
    registerStatus: 'register',
    assignedToMe: true,
    selectedApproverId: '1',
  },
};

// 承認者向けの表示（承認待ち・他人に割り当て）
export const ApproverNotAssignedToMe: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'approve',
    mode: 'view',
    registerStatus: 'register',
    assignedToMe: false,
    selectedApproverId: '2',
  },
};

// 申請中の状態
export const Registering: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'update',
    mode: 'view',
    registerStatus: 'register',
  },
};

// 削除申請中の状態
export const RequestingDeletion: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'update',
    mode: 'view',
    registerStatus: 'requestingDeletion',
    deleteReason: '業務要件の変更により不要となったため',
  },
};

// null値のテストケース
export const WithNullStatus: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'update',
    mode: 'view',
    registerStatus: null,
  },
};

// 承認済みまたは削除済みのみフラグがtrueの場合
export const OnlyApprovedOrDeleted: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'update',
    mode: 'view',
    registerStatus: 'approved',
    isOnlyApprovedOrDeleted: true,
  },
};

// トランザクションデータの場合
export const TransactionData: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'update',
    mode: 'view',
    registerStatus: 'register',
    isTran: true,
  },
};

// 参照権限の場合（ボタンなし）
export const ViewOnly: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    role: 'view',
    mode: 'view',
    registerStatus: 'approved',
  },
};

// 非表示の場合
export const Hidden: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    hidden: true,
  },
};

// エラーメッセージがある場合
export const WithError: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    mode: 'edit',
    approverErrorMessage: '承認者を選択してください',
  },
};

// 無効化された状態
export const Disabled: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    mode: 'edit',
  },
};

// 複数ボタン表示（編集モード）
export const MultipleButtons: Story = {
  render: InteractiveApplicableInfoArea,
  args: {
    ...Default.args,
    mode: 'edit',
    registerStatus: 'approved',
    comment: '適用期間を変更します',
  },
};

// 適用終了日バリデーションテスト用
export const ApplicableEndDateValidationTest = () => {
  const [applicableEndDate, setApplicableEndDate] = useState<Dayjs | undefined>(undefined);
  const [mode, setMode] = useState<'view' | 'applicableEdit'>('applicableEdit');
  const [eventLog, setEventLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  const handleSetApplicableEndDate = (newValue: Dayjs | undefined) => {
    setApplicableEndDate(newValue);
    addLog(`日付変更: ${newValue ? newValue.format('YYYY/MM/DD') : '未設定'}`);
  };

  const mockApprovers: OptionInfo[] = [
    { value: '1', label: '承認者A' },
    { value: '2', label: '承認者B' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h4>適用終了日バリデーションテスト（修正版v4）</h4>
        <p><strong>テスト手順:</strong></p>
        <ol style={{ fontSize: '12px' }}>
          <li>適用終了日フィールドをクリック</li>
          <li>何も入力せずに外部をクリック → エラー表示確認</li>
          <li>日付を入力 → エラーが自動でクリアされることを確認</li>
          <li>日付をクリア → 再度外部をクリック → エラー再表示確認</li>
          <li><strong>新規テスト:</strong> 日付入力後、Ctrl+A→Delete → エラー表示確認</li>
          <li><strong>新規テスト:</strong> テキスト直接削除後フォーカス外す → エラー表示確認</li>
          <li><strong>重要テスト:</strong> キーボードで日付を削除（エラー表示）→ フォーカス外す → エラー継続表示確認</li>
        </ol>
        <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '12px' }}>
          <strong>🔧 修正内容v4:</strong> onBlurで入力フィールドの値のみをチェック、propsの値は参照しない（ユーザー入力を優先）
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            <input 
              type="radio" 
              checked={mode === 'applicableEdit'} 
              onChange={() => setMode('applicableEdit')}
            />
            編集モード（入力可能）
          </label>
          <label>
            <input 
              type="radio" 
              checked={mode === 'view'} 
              onChange={() => setMode('view')}
            />
            表示モード（入力不可）
          </label>
        </div>
      </div>

      <ApplicableInfoArea
        hidden={false}
        role="update"
        mode={mode}
        registerStatus="approved"
        isTran={false}
        applicableEndDate={applicableEndDate}
        setApplicableEndDate={handleSetApplicableEndDate}
        approvers={mockApprovers}
        id="TEST-001"
        deleteFlg={false}
        createdBy="テストユーザー"
        createdAt="2024-01-01 10:00:00"
        updatedBy="テストユーザー"
        updatedAt="2024-01-01 10:00:00"
        registerStepUpdatedAt="2024-01-01 10:00:00"
        haveApplicablePeriod={true}
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
          <h5>現在の状態</h5>
          <p><strong>モード:</strong> {mode}</p>
          <p><strong>適用終了日:</strong> {applicableEndDate ? applicableEndDate.format('YYYY/MM/DD') : '未設定'}</p>
          <button onClick={() => {
            setApplicableEndDate(undefined);
            addLog('日付をクリア実行');
          }}>
            日付をクリア
          </button>
        </div>
        
        <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h5>イベントログ</h5>
          <div style={{ 
            height: '120px', 
            overflow: 'auto', 
            fontSize: '11px', 
            fontFamily: 'monospace',
            backgroundColor: 'white',
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '3px'
          }}>
            {eventLog.length === 0 ? (
              <div style={{ color: '#666' }}>イベントログが表示されます...</div>
            ) : (
              eventLog.map((log, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => setEventLog([])}
            style={{ marginTop: '5px', fontSize: '11px', padding: '2px 8px' }}
          >
            ログクリア
          </button>
        </div>
      </div>
    </div>
  );
};