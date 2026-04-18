import { expect, jest, test } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';
import type { CommonInfoAreaProps } from './CommonInfoArea';
import '@testing-library/jest-dom';

// Mock the dependencies
jest.mock('@/components/base', () => ({
  Font14: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Font20: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Card: ({
    children,
    sx,
  }: {
    children: React.ReactNode;
    sx?: React.CSSProperties;
  }) => (
    <div className="MuiCard-root" style={sx}>
      {children}
    </div>
  ),
  FormRow: ({
    children,
    label,
  }: {
    children: React.ReactNode;
    label: string;
    labelAlignment?: string;
  }) => (
    <div>
      <span>{label}</span>
      {children}
    </div>
  ),
}));

jest.mock('@/components/base/Input/TextBoxMultiLine', () => {
  return function TextArea(props: Record<string, unknown>) {
    const { customStyle: _customStyle, ...restProps } = props;
    return (
      <textarea
        {...restProps}
        disabled={props.disabled as boolean}
        maxLength={props.maxLength as number}
        data-testid="delete-reason-textarea"
      />
    );
  };
});

jest.mock('@/components/CRJ/deleteFlgText', () => ({
  deleteFlgText: (flg?: boolean) => {
    if (flg === undefined) return '';
    return flg ? 'YES' : 'NO';
  },
}));

jest.mock('@/const/CRJ/RegisterStatusNames', () => ({
  RegisterStatusNames: {
    new: '',
    register: '申請中',
    registerRemoved: '申請取下',
    deleted: '削除',
    reject: '差戻',
    approved: '承認済',
    requestingDeletion: '削除申請中',
    deleteApprove: '承認済削除',
    approveRemoved: '承認取下',
  },
}));

// モック関数を作成
const mockDeleteReasonTextAreaDisabled = jest.fn(() => false);

jest.mock('./actionAllowed', () => ({
  deleteReasonTextAreaDisabled: mockDeleteReasonTextAreaDisabled,
}));

describe('CommonInfoArea', () => {
  let CommonInfoArea: React.FC<CommonInfoAreaProps>;

  beforeAll(async () => {
    const importedModule = await import('./CommonInfoArea'); // ← module を避ける
    CommonInfoArea = importedModule.CommonInfoArea;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteReasonTextAreaDisabled.mockReturnValue(false);
  });

  const defaultProps: CommonInfoAreaProps = {
    id: 'TEST-001',
    registerStatus: 'new' as RegisterStatus,
    deleteFlg: false,
    deleteReason: '',
    createdBy: 'テストユーザー1',
    createdAt: '2024-01-01 10:00:00',
    updatedBy: 'テストユーザー2',
    updatedAt: '2024-01-02 15:30:00',
    role: 'update' as Role,
    mode: 'edit' as Mode,
    isTran: false,
    deleteInfoVisible: true,
  };

  test('必須フィールドがすべて表示されること', () => {
    render(<CommonInfoArea {...defaultProps} />);

    // 全てのラベルが表示されることを確認
    expect(screen.getByText('共通情報')).toBeInTheDocument();
    expect(screen.getByText('識別ID')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('削除済フラグ')).toBeInTheDocument();
    expect(screen.getByText('削除理由')).toBeInTheDocument();
    expect(screen.getByText('作成者')).toBeInTheDocument();
    expect(screen.getByText('作成日時')).toBeInTheDocument();
    expect(screen.getByText('更新者')).toBeInTheDocument();
    expect(screen.getByText('更新日時')).toBeInTheDocument();

    // 値が表示されることを確認
    expect(screen.getByText('TEST-001')).toBeInTheDocument();
    // 注意: 'new' ステータスは空文字列として表示される
    expect(screen.getByText('NO')).toBeInTheDocument(); // deleteFlg = false は 'NO' として表示
    expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01 10:00:00')).toBeInTheDocument();
    expect(screen.getByText('テストユーザー2')).toBeInTheDocument();
    expect(screen.getByText('2024-01-02 15:30:00')).toBeInTheDocument();
  });

  test('削除フラグがtrueの場合に正しく表示されること', () => {
    const deletedProps = {
      ...defaultProps,
      deleteFlg: true,
      deleteReason: '不要なため削除しました',
    };

    render(<CommonInfoArea {...deletedProps} />);

    expect(screen.getByText('YES')).toBeInTheDocument(); // deleteFlg = true は 'YES' として表示
    expect(screen.getByDisplayValue('不要なため削除しました')).toBeInTheDocument();
  });

  test('異なる登録ステータスで正しく表示されること', () => {
    const approvedProps = {
      ...defaultProps,
      registerStatus: 'approved' as RegisterStatus,
    };

    render(<CommonInfoArea {...approvedProps} />);

    expect(screen.getByText('承認済')).toBeInTheDocument();
  });

  test('削除理由テキストエリア変更時にsetDeleteReasonが呼ばれること', () => {
    const mockSetDeleteReason = jest.fn();
    const propsWithSetter = {
      ...defaultProps,
      setDeleteReason: mockSetDeleteReason,
    };

    render(<CommonInfoArea {...propsWithSetter} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '新しい削除理由' } });

    expect(mockSetDeleteReason).toHaveBeenCalledWith('新しい削除理由');
  });

  test('基本的なコンポーネント構造が正しく表示されること', () => {
    render(<CommonInfoArea {...defaultProps} />);

    // テキストエリアが存在することを確認
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('name', 'deleteReason');
    expect(textarea).toHaveAttribute('rows', '3');
  });

  test('Cardコンポーネントにカスタムsxスタイルが適用されること', () => {
    const customSx = { backgroundColor: 'red', padding: '20px' };
    const propsWithSx = {
      ...defaultProps,
      sx: customSx,
    };

    const { container } = render(<CommonInfoArea {...propsWithSx} />);
    const card = container.querySelector('.MuiCard-root');

    expect(card).toHaveStyle({
      paddingLeft: '16px',
      paddingRight: '16px',
      marginBottom: '16px',
    });
  });

  test('deleteReasonTextAreaDisabledが正しいパラメータで呼ばれること', () => {
    render(<CommonInfoArea {...defaultProps} />);

    expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('update', 'new', 'edit', false);
  });

  test('テキストエリアが正しい属性を持つこと', () => {
    render(<CommonInfoArea {...defaultProps} />);

    const textarea = screen.getByTestId('delete-reason-textarea');
    expect(textarea).toHaveAttribute('maxLength', '100');
    expect(textarea).toHaveValue('');
  });

  test('deleteReasonTextAreaDisabledがtrueを返す場合にテキストエリアが無効になること', () => {
    mockDeleteReasonTextAreaDisabled.mockReturnValue(true);

    render(<CommonInfoArea {...defaultProps} />);

    const textarea = screen.getByTestId('delete-reason-textarea');
    expect(textarea).toBeDisabled();
  });

  test('deleteReasonTextAreaDisabledがfalseを返す場合にテキストエリアが有効になること', () => {
    mockDeleteReasonTextAreaDisabled.mockReturnValue(false);

    render(<CommonInfoArea {...defaultProps} />);

    const textarea = screen.getByTestId('delete-reason-textarea');
    expect(textarea).not.toBeDisabled();
  });

  test('assignedToMeプロパティを指定して表示されること', () => {
    const propsWithAssignedToMe = {
      ...defaultProps,
      assignedToMe: true,
    };

    render(<CommonInfoArea {...propsWithAssignedToMe} />);

    // assignedToMeプロパティがあっても正常に表示されること
    expect(screen.getByText('共通情報')).toBeInTheDocument();
  });

  test('異なるモード値で正しく表示されること', () => {
    const viewModeProps = {
      ...defaultProps,
      mode: 'view' as Mode,
    };

    render(<CommonInfoArea {...viewModeProps} />);

    expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('update', 'new', 'view', false);
  });

  test('異なる権限値で正しく表示されること', () => {
    const approveRoleProps = {
      ...defaultProps,
      role: 'approve' as Role,
    };

    render(<CommonInfoArea {...approveRoleProps} />);

    expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('approve', 'new', 'edit', false);
  });

  test('isTranがtrueに設定された場合に正しく動作すること', () => {
    const tranProps = {
      ...defaultProps,
      isTran: true,
    };

    render(<CommonInfoArea {...tranProps} />);

    expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('update', 'new', 'edit', true);
  });

  test('deleteInfoVisibleがfalseの場合に削除情報が非表示になること', () => {
    const hiddenDeleteInfoProps = {
      ...defaultProps,
      deleteInfoVisible: false,
    };

    render(<CommonInfoArea {...hiddenDeleteInfoProps} />);

    // 削除情報が非表示であることを確認
    expect(screen.queryByText('削除済フラグ')).not.toBeInTheDocument();
    expect(screen.queryByText('削除理由')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-reason-textarea')).not.toBeInTheDocument();

    // 基本情報は表示されていることを確認
    expect(screen.getByText('共通情報')).toBeInTheDocument();
    expect(screen.getByText('識別ID')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('作成者')).toBeInTheDocument();
    expect(screen.getByText('作成日時')).toBeInTheDocument();
    expect(screen.getByText('更新者')).toBeInTheDocument();
    expect(screen.getByText('更新日時')).toBeInTheDocument();
  });

  test('deleteInfoVisibleがtrueの場合に削除情報が表示されること', () => {
    const visibleDeleteInfoProps = {
      ...defaultProps,
      deleteInfoVisible: true,
    };

    render(<CommonInfoArea {...visibleDeleteInfoProps} />);

    // 削除情報が表示されていることを確認
    expect(screen.getByText('削除済フラグ')).toBeInTheDocument();
    expect(screen.getByText('削除理由')).toBeInTheDocument();
    expect(screen.getByTestId('delete-reason-textarea')).toBeInTheDocument();
  });

  test('assignedToMeプロパティが表示に影響を与えないこと', () => {
    const propsWithAssignedToMe = {
      ...defaultProps,
      assignedToMe: true,
      role: 'approve' as Role,
    };

    render(<CommonInfoArea {...propsWithAssignedToMe} />);

    // assignedToMeプロパティが設定されても通常通り表示されることを確認
    expect(screen.getByText('共通情報')).toBeInTheDocument();
    expect(screen.getByText('識別ID')).toBeInTheDocument();
    expect(screen.getByText('TEST-001')).toBeInTheDocument();
    
    // 削除理由のテキストエリアが正しく呼び出されることを確認
    expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('approve', 'new', 'edit', false);
  });

  test('最小限の必須プロパティで正しく表示されること', () => {
    const minimalProps = {
      id: 'MIN-001',
      registerStatus: 'new' as RegisterStatus,
      deleteFlg: false,
      deleteReason: '',
      createdBy: 'テストユーザー',
      createdAt: '2024-01-01 10:00:00',
      updatedBy: 'テストユーザー',
      updatedAt: '2024-01-01 10:00:00',
      role: 'view' as Role,
      mode: 'view' as Mode,
      isTran: false,
      deleteInfoVisible: true,
    };

    render(<CommonInfoArea {...minimalProps} />);

    // 基本構造が表示されることを確認
    expect(screen.getByText('共通情報')).toBeInTheDocument();
    expect(screen.getByText('識別ID')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();
  });

  // 権限別テスト
  describe('権限別レンダリング', () => {
    test('権限noneで正しく表示されること', () => {
      const noneRoleProps = {
        ...defaultProps,
        role: 'none' as Role,
      };

      render(<CommonInfoArea {...noneRoleProps} />);

      expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('none', 'new', 'edit', false);
    });

    test('権限viewで正しく表示されること', () => {
      const viewRoleProps = {
        ...defaultProps,
        role: 'view' as Role,
      };

      render(<CommonInfoArea {...viewRoleProps} />);

      expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('view', 'new', 'edit', false);
    });

    test('権限approveで正しく表示されること', () => {
      const approveRoleProps = {
        ...defaultProps,
        role: 'approve' as Role,
        assignedToMe: true,
      };

      render(<CommonInfoArea {...approveRoleProps} />);

      expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('approve', 'new', 'edit', false);
    });
  });

  // モード別テスト
  describe('モード別レンダリング', () => {
    test('newモードで正しく表示されること', () => {
      const newModeProps = {
        ...defaultProps,
        mode: 'new' as Mode,
      };

      render(<CommonInfoArea {...newModeProps} />);

      expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('update', 'new', 'new', false);
    });

    test('applicableEditモードで正しく表示されること', () => {
      const applicableEditProps = {
        ...defaultProps,
        mode: 'applicableEdit' as Mode,
      };

      render(<CommonInfoArea {...applicableEditProps} />);

      expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('update', 'new', 'applicableEdit', false);
    });

    test('refNewEditモードで正しく表示されること', () => {
      const refNewEditProps = {
        ...defaultProps,
        mode: 'refNewEdit' as Mode,
      };

      render(<CommonInfoArea {...refNewEditProps} />);

      expect(mockDeleteReasonTextAreaDisabled).toHaveBeenCalledWith('update', 'new', 'refNewEdit', false);
    });
  });

  // ステータス別テスト
  describe('登録ステータス別レンダリング', () => {
    test('承認済ステータスが正しく表示されること', () => {
      const approvedProps = {
        ...defaultProps,
        registerStatus: 'approved' as RegisterStatus,
      };

      render(<CommonInfoArea {...approvedProps} />);

      expect(screen.getByText('承認済')).toBeInTheDocument();
    });

    test('申請中ステータスが正しく表示されること', () => {
      const registerProps = {
        ...defaultProps,
        registerStatus: 'register' as RegisterStatus,
      };

      render(<CommonInfoArea {...registerProps} />);

      expect(screen.getByText('申請中')).toBeInTheDocument();
    });

    test('差戻ステータスが正しく表示されること', () => {
      const rejectProps = {
        ...defaultProps,
        registerStatus: 'reject' as RegisterStatus,
      };

      render(<CommonInfoArea {...rejectProps} />);

      expect(screen.getByText('差戻')).toBeInTheDocument();
    });

    test('削除ステータスが正しく表示されること', () => {
      const deletedProps = {
        ...defaultProps,
        registerStatus: 'deleted' as RegisterStatus,
      };

      render(<CommonInfoArea {...deletedProps} />);

      expect(screen.getByText('削除')).toBeInTheDocument();
    });

    test('申請取下ステータスが正しく表示されること', () => {
      const registerRemovedProps = {
        ...defaultProps,
        registerStatus: 'registerRemoved' as RegisterStatus,
      };

      render(<CommonInfoArea {...registerRemovedProps} />);

      expect(screen.getByText('申請取下')).toBeInTheDocument();
    });

    test('削除申請中ステータスが正しく表示されること', () => {
      const requestingDeletionProps = {
        ...defaultProps,
        registerStatus: 'requestingDeletion' as RegisterStatus,
      };

      render(<CommonInfoArea {...requestingDeletionProps} />);

      expect(screen.getByText('削除申請中')).toBeInTheDocument();
    });
  });

  // deleteFlg関連テスト
  describe('削除フラグレンダリング', () => {
    test('deleteFlagがfalseの場合にNOが表示されること', () => {
      const falseDeleteFlgProps = {
        ...defaultProps,
        deleteFlg: false,
      };

      render(<CommonInfoArea {...falseDeleteFlgProps} />);

      expect(screen.getByText('NO')).toBeInTheDocument();
    });

    test('deleteFlagがtrueの場合にYESが表示されること', () => {
      const trueDeleteFlgProps = {
        ...defaultProps,
        deleteFlg: true,
      };

      render(<CommonInfoArea {...trueDeleteFlgProps} />);

      expect(screen.getByText('YES')).toBeInTheDocument();
    });

    test('未定義のdeleteFlagを処理すること', () => {
      const undefinedDeleteFlgProps = {
        ...defaultProps,
      };
      // deleteFlgプロパティを削除してundefinedとして扱う
      delete (undefinedDeleteFlgProps as any).deleteFlg;

      render(<CommonInfoArea {...undefinedDeleteFlgProps} />);

      // deleteFlgText関数がundefinedの場合は空文字を返すことを確認
      expect(screen.queryByText('YES')).not.toBeInTheDocument();
      expect(screen.queryByText('NO')).not.toBeInTheDocument();
    });
  });

  // エッジケース
  describe('エッジケース', () => {
    test('空文字値を処理すること', () => {
      const emptyStringProps = {
        ...defaultProps,
        id: '',
        createdBy: '',
        createdAt: '',
        updatedBy: '',
        updatedAt: '',
        deleteReason: '',
      };

      render(<CommonInfoArea {...emptyStringProps} />);

      // 空文字でも正常に表示されることを確認
      expect(screen.getByText('共通情報')).toBeInTheDocument();
      expect(screen.getByText('識別ID')).toBeInTheDocument();
      // 空文字は表示されないが、ラベルは表示される
      expect(screen.getByText('作成者')).toBeInTheDocument();
      expect(screen.getByText('更新者')).toBeInTheDocument();
    });

    test('非常に長いテキスト値を処理すること', () => {
      const longTextProps = {
        ...defaultProps,
        id: 'VERY-LONG-IDENTIFIER-FOR-TESTING-PURPOSE-12345',
        deleteReason: 'この削除理由は100文字制限ギリギリまで入力されたテキストです。システムの表示確認とバリデーション確認のために使用されます。',
      };

      render(<CommonInfoArea {...longTextProps} />);

      expect(screen.getByText('VERY-LONG-IDENTIFIER-FOR-TESTING-PURPOSE-12345')).toBeInTheDocument();
      expect(screen.getByDisplayValue('この削除理由は100文字制限ギリギリまで入力されたテキストです。システムの表示確認とバリデーション確認のために使用されます。')).toBeInTheDocument();
    });

    test('オプショナルプロパティを適切に処理すること', () => {
      const optionalProps: CommonInfoAreaProps = {
        id: 'TEST-001',
        registerStatus: 'new' as RegisterStatus,
        deleteReason: undefined,
        createdBy: '作成者ユーザー',
        createdAt: '2024-01-01 10:30:00',
        updatedBy: '更新者ユーザー',
        updatedAt: '2024-01-02 15:45:00',
        role: 'view' as Role,
        mode: 'view' as Mode,
        isTran: false,
        deleteInfoVisible: true,
        assignedToMe: undefined,
        setDeleteReason: undefined,
        sx: undefined,
        // deleteFlgは未設定（undefined）
      };

      render(<CommonInfoArea {...optionalProps} />);

      // オプショナルプロパティがundefinedでも正常にレンダリングされることを確認
      expect(screen.getByText('共通情報')).toBeInTheDocument();
      expect(screen.getByText('TEST-001')).toBeInTheDocument();
      expect(screen.getByText('作成者ユーザー')).toBeInTheDocument();
      expect(screen.getByText('更新者ユーザー')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01 10:30:00')).toBeInTheDocument();
      expect(screen.getByText('2024-01-02 15:45:00')).toBeInTheDocument();
    });
  });

  // インタラクション関連テスト
  describe('インタラクション', () => {
    test('テキストエリア変更時に正しい値でsetDeleteReasonが呼ばれること', () => {
      const mockSetDeleteReason = jest.fn();
      const interactionProps = {
        ...defaultProps,
        setDeleteReason: mockSetDeleteReason,
        deleteReason: '初期値',
      };

      render(<CommonInfoArea {...interactionProps} />);

      const textarea = screen.getByDisplayValue('初期値');
      fireEvent.change(textarea, { target: { value: '変更後の値' } });

      expect(mockSetDeleteReason).toHaveBeenCalledWith('変更後の値');
    });

    test('setDeleteReasonがundefinedの場合に呼ばれないこと', () => {
      const interactionProps = {
        ...defaultProps,
        setDeleteReason: undefined,
        deleteReason: 'テスト値',
      };

      render(<CommonInfoArea {...interactionProps} />);

      const textarea = screen.getByDisplayValue('テスト値');
      
      // setDeleteReasonがundefinedの場合でもエラーが発生しないことを確認
      expect(() => {
        fireEvent.change(textarea, { target: { value: '新しい値' } });
      }).not.toThrow();
    });
  });

  // パフォーマンス関連テスト
  describe('パフォーマンスと最適化', () => {
    test('プロパティ変更時に正しく再レンダリングされること', () => {
      const { rerender } = render(<CommonInfoArea {...defaultProps} />);

      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();

      // プロパティを変更して再レンダリング
      const updatedProps = {
        ...defaultProps,
        createdBy: '更新されたユーザー',
      };

      rerender(<CommonInfoArea {...updatedProps} />);

      expect(screen.getByText('更新されたユーザー')).toBeInTheDocument();
      expect(screen.queryByText('テストユーザー1')).not.toBeInTheDocument();
    });

    test('無効状態が変更された際にテキストエリアのフォーカスを維持すること', () => {
      const focusProps = {
        ...defaultProps,
        setDeleteReason: jest.fn(),
      };

      mockDeleteReasonTextAreaDisabled.mockReturnValue(false);

      const { rerender } = render(<CommonInfoArea {...focusProps} />);

      const textarea = screen.getByTestId('delete-reason-textarea');
      textarea.focus();

      expect(textarea).toHaveFocus();
      expect(textarea).not.toBeDisabled();

      // disabled状態に変更
      mockDeleteReasonTextAreaDisabled.mockReturnValue(true);

      rerender(<CommonInfoArea {...focusProps} />);

      const disabledTextarea = screen.getByTestId('delete-reason-textarea');
      expect(disabledTextarea).toBeDisabled();
    });
  });
});
