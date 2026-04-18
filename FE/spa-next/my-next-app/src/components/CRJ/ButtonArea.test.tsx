import { expect, jest, test, describe, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';
import {
  ButtonArea,
  editButtonDisplay,
  deleteButtonDisplay,
  registerButtonDisplay,
  refNewButtonDisplay,
  approveRemoveButtonDisplay,
} from './ButtonArea';

describe('ButtonArea', () => {
  describe('ButtonAreaコンポーネント', () => {
    describe('承認取下ボタンの表示', () => {
      const mockOnApproveRemoveClick = jest.fn();

      beforeEach(() => {
        mockOnApproveRemoveClick.mockClear();
      });

      test('トランザクション承認済で承認権限かつ自身に割り当てられている場合、承認取下ボタンが表示される', () => {
        render(
          <ButtonArea
            mode="view"
            role="approve"
            registerStatus="approved"
            isTran={true}
            assignedToMe={true}
            applicableRegisterStatus={null}
            onApproveRemoveClick={mockOnApproveRemoveClick}
          />
        );

        expect(screen.getByText('承認取下')).toBeInTheDocument();
      });

      test('トランザクション承認済で承認権限だが自身に割り当てられていない場合、承認取下ボタンが表示されない', () => {
        render(
          <ButtonArea
            mode="view"
            role="approve"
            registerStatus="approved"
            isTran={true}
            assignedToMe={false}
            applicableRegisterStatus={null}
            onApproveRemoveClick={mockOnApproveRemoveClick}
          />
        );

        expect(screen.queryByText('承認取下')).not.toBeInTheDocument();
      });

      test('マスタ承認済で承認権限かつ自身に割り当てられている場合、承認取下ボタンが表示されない', () => {
        render(
          <ButtonArea
            mode="view"
            role="approve"
            registerStatus="approved"
            isTran={false}
            assignedToMe={true}
            applicableRegisterStatus={null}
            onApproveRemoveClick={mockOnApproveRemoveClick}
          />
        );

        expect(screen.queryByText('承認取下')).not.toBeInTheDocument();
      });

      test('参照権限の場合、承認取下ボタンが表示されない', () => {
        render(
          <ButtonArea
            mode="view"
            role="view"
            registerStatus="approved"
            isTran={true}
            assignedToMe={true}
            applicableRegisterStatus={null}
            onApproveRemoveClick={mockOnApproveRemoveClick}
          />
        );

        expect(screen.queryByText('承認取下')).not.toBeInTheDocument();
      });

      test('編集モードの場合、承認取下ボタンが表示されない', () => {
        render(
          <ButtonArea
            mode="edit"
            role="approve"
            registerStatus="approved"
            isTran={true}
            assignedToMe={true}
            applicableRegisterStatus={null}
            onApproveRemoveClick={mockOnApproveRemoveClick}
          />
        );

        expect(screen.queryByText('承認取下')).not.toBeInTheDocument();
      });

      test('申請中ステータスの場合、承認取下ボタンが表示されない', () => {
        render(
          <ButtonArea
            mode="view"
            role="approve"
            registerStatus="register"
            isTran={true}
            assignedToMe={true}
            applicableRegisterStatus={null}
            onApproveRemoveClick={mockOnApproveRemoveClick}
          />
        );

        expect(screen.queryByText('承認取下')).not.toBeInTheDocument();
      });

      test('承認取下ボタンクリック時にハンドラが呼ばれる', () => {
        render(
          <ButtonArea
            mode="view"
            role="approve"
            registerStatus="approved"
            isTran={true}
            assignedToMe={true}
            applicableRegisterStatus={null}
            onApproveRemoveClick={mockOnApproveRemoveClick}
          />
        );

        const approveRemoveButton = screen.getByText('承認取下');
        approveRemoveButton.click();

        expect(mockOnApproveRemoveClick).toHaveBeenCalledTimes(1);
      });
    });

    describe('他のボタンとの組み合わせ表示', () => {
      test('承認取下ボタンと他のボタンが同時に表示される', () => {
        render(
          <ButtonArea
            mode="view"
            role="approve"
            registerStatus="approved"
            isTran={true}
            assignedToMe={true}
            isOnlyApprovedOrDeleted={false}
            applicableRegisterStatus={null}
            onApproveRemoveClick={jest.fn()}
          />
        );

        expect(screen.getByText('戻る')).toBeInTheDocument();
        expect(screen.getByText('承認取下')).toBeInTheDocument();
      });

      test('承認取下ボタンと申請取下ボタンの表示制御が独立している', () => {
        render(
          <ButtonArea
            mode="view"
            role="approve"
            registerStatus="approved"
            isTran={true}
            assignedToMe={true}
            applicableRegisterStatus={null}
            onApproveRemoveClick={jest.fn()}
            onRegisterRemoveClick={jest.fn()}
          />
        );

        expect(screen.getByText('承認取下')).toBeInTheDocument();
        expect(screen.queryByText('申請取下')).not.toBeInTheDocument();
      });
    });
  });

  describe('editButtonDisplay', () => {
    // expected=true（編集ボタン表示）のケース
    test.each<{
      role: Role;
      registerStatus: RegisterStatus;
      mode: Mode;
      isTran: boolean;
      assignedToMe?: boolean;
      isOnlyApprovedOrDeleted?: boolean;
      expected: true;
    }>([
      // approved状態で編集表示パターン
      { role: 'update', registerStatus: 'approved', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: true, expected: true, },
      { role: 'approve', registerStatus: 'approved', mode: 'view', isTran: false, assignedToMe: true, isOnlyApprovedOrDeleted: true, expected: true, },
      { role: 'approve', registerStatus: 'approved', mode: 'view', isTran: false, assignedToMe: false, isOnlyApprovedOrDeleted: true, expected: true, },

      // reject状態で編集表示パターン
      { role: 'update', registerStatus: 'reject', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: true, },
      { role: 'update', registerStatus: 'reject', mode: 'view', isTran: true, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: true, },
      { role: 'approve', registerStatus: 'reject', mode: 'view', isTran: false, assignedToMe: false, isOnlyApprovedOrDeleted: undefined, expected: true, },

      // registerRemoved状態で編集表示パターン
      { role: 'update', registerStatus: 'registerRemoved', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: true, },
      { role: 'update', registerStatus: 'registerRemoved', mode: 'view', isTran: true, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: true, },
      { role: 'approve', registerStatus: 'registerRemoved', mode: 'view', isTran: false, assignedToMe: false, isOnlyApprovedOrDeleted: undefined, expected: true, },

      // approveRemoved状態で編集表示パターン
      { role: 'update', registerStatus: 'approveRemoved', mode: 'view', isTran: true, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: true, },
      { role: 'approve', registerStatus: 'approveRemoved', mode: 'view', isTran: true, assignedToMe: false, isOnlyApprovedOrDeleted: undefined, expected: true, },
    ])(
      'role=$role, registerStatus=$registerStatus, mode=$mode, isTran=$isTran, assignedToMe=$assignedToMe, isOnlyApprovedOrDeleted=$isOnlyApprovedOrDeleted → $expected',
      ({ role, registerStatus, mode, isTran, assignedToMe, isOnlyApprovedOrDeleted, expected }) => {
        expect(editButtonDisplay(role, registerStatus, mode, isTran, assignedToMe, isOnlyApprovedOrDeleted)).toBe(expected);
      }
    );

    // expected=false（編集ボタン非表示）のケース
    test.each<{
      role: Role;
      registerStatus: RegisterStatus;
      mode: Mode;
      isTran: boolean;
      assignedToMe?: boolean;
      isOnlyApprovedOrDeleted?: boolean;
      expected: false;
    }>([
      // 基本権限チェック - none/view権限
      { role: 'none', registerStatus: 'approved', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: true, expected: false, },
      { role: 'view', registerStatus: 'approved', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: true, expected: false, },

      // モードチェック - view以外
      { role: 'update', registerStatus: 'approved', mode: 'edit', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: true, expected: false, },
      { role: 'update', registerStatus: 'approved', mode: 'new', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: true, expected: false, },
      { role: 'approve', registerStatus: 'approved', mode: 'refNewEdit', isTran: false, assignedToMe: true, isOnlyApprovedOrDeleted: true, expected: false, },
      { role: 'approve', registerStatus: 'approved', mode: 'edit', isTran: false, assignedToMe: true, isOnlyApprovedOrDeleted: true, expected: false, },

      // approved状態で非表示パターン
      { role: 'update', registerStatus: 'approved', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: false, expected: false, },
      { role: 'update', registerStatus: 'approved', mode: 'view', isTran: true, assignedToMe: undefined, isOnlyApprovedOrDeleted: true, expected: false, },
      { role: 'approve', registerStatus: 'approved', mode: 'view', isTran: false, assignedToMe: true, isOnlyApprovedOrDeleted: false, expected: false, },
      { role: 'approve', registerStatus: 'approved', mode: 'view', isTran: true, assignedToMe: true, isOnlyApprovedOrDeleted: true, expected: false, },
      { role: 'approve', registerStatus: 'approved', mode: 'view', isTran: false, assignedToMe: false, isOnlyApprovedOrDeleted: false, expected: false, },

      // reject状態で非表示パターン
      { role: 'approve', registerStatus: 'reject', mode: 'view', isTran: false, assignedToMe: true, isOnlyApprovedOrDeleted: undefined, expected: false, },

      // registerRemoved状態で非表示パターン
      { role: 'approve', registerStatus: 'registerRemoved', mode: 'view', isTran: false, assignedToMe: true, isOnlyApprovedOrDeleted: undefined, expected: false, },

      // approveRemoved状態で非表示パターン
      { role: 'update', registerStatus: 'approveRemoved', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'approve', registerStatus: 'approveRemoved', mode: 'view', isTran: false, assignedToMe: false, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'approve', registerStatus: 'approveRemoved', mode: 'view', isTran: true, assignedToMe: true, isOnlyApprovedOrDeleted: undefined, expected: false, },

      // その他のステータス - 表示しない
      { role: 'update', registerStatus: 'new', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'update', registerStatus: 'register', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'update', registerStatus: 'deleted', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'update', registerStatus: 'requestingDeletion', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'update', registerStatus: 'deleteApprove', mode: 'view', isTran: false, assignedToMe: undefined, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'approve', registerStatus: 'new', mode: 'view', isTran: false, assignedToMe: false, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'approve', registerStatus: 'register', mode: 'view', isTran: false, assignedToMe: false, isOnlyApprovedOrDeleted: undefined, expected: false, },
      { role: 'approve', registerStatus: 'deleted', mode: 'view', isTran: false, assignedToMe: false, isOnlyApprovedOrDeleted: undefined, expected: false, },
    ])(
      '【非表示】$role, registerStatus=$registerStatus, mode=$mode, isTran=$isTran, assignedToMe=$assignedToMe, isOnlyApprovedOrDeleted=$isOnlyApprovedOrDeleted → $expected',
      ({ role, registerStatus, mode, isTran, assignedToMe, isOnlyApprovedOrDeleted, expected }) => {
        expect(editButtonDisplay(role, registerStatus, mode, isTran, assignedToMe, isOnlyApprovedOrDeleted)).toBe(expected);
      }
    );
  });

  describe('deleteButtonDisplay', () => {
    test.each<[Role, Mode, boolean]>([
      // role, registerStatus, mode, assignedToMe, expected
      ['update', 'view', false], // 更新権限かつ照会モード → 非表示
      ['approve', 'edit', true], // 承認権限かつ編集モード → 表示
      ['view', 'view', false], // 参照権限かつ照会モード → 非表示
      ['update', 'view', false], // 更新権限かつ編集モード → 非表示
      ['update', 'edit', true], // 更新権限かつ編集モード → 非表示
    ])(
      'role=%s, registerStatus=%s, mode=%s, assignedToMe=%s のとき、%s を返す',
      (role, mode, expected) => {
        expect(deleteButtonDisplay(role, mode)).toBe(expected);
      }
    );
  });

  describe('registerButtonDisplay', () => {
    test.each<[Role, Mode, boolean]>([
      // role, registerStatus, mode, assignedToMe, expected
      ['update', 'edit', true], // 更新権限かつ編集モード → 表示
      ['approve', 'edit', true], // 承認権限かつ編集モード → 表示
      ['update', 'new', true], // 更新権限かつ新規モード → 表示
      ['update', 'view', false], // 更新権限かつ照会モード → 非表示
      ['update', 'refNewEdit', true], // 更新権限かつ編集（参照新規登録）モード → 表示
      ['approve', 'refNewEdit', true], // 承認権限かつ編集（参照新規登録）モード → 表示
      ['view', 'view', false], // 参照権限かつ照会モード → 非表示
    ])(
      ' role=%s, mode=%s のとき、%s を返す',
      (role, mode, expected) => {
        expect(registerButtonDisplay(role, mode)).toBe(expected);
      }
    );
  });

  describe('refNewButtonDisplay', () => {
    // 表示されるケース（expected=true）
    test.each<{
      role: Role;
      registerStatus: RegisterStatus;
      mode: Mode;
      haveApplicablePeriod: boolean | undefined;
      isOnlyApprovedOrDeleted: boolean | undefined;
      applicableRegisterStatus: RegisterStatus | null | undefined;
      expected: true;
    }>([
      // 正常表示ケース：全条件を満たすパターン
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: true,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'approved',
        expected: true,
      },
      {
        role: 'approve',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: true,
      },
      {
        role: 'approve',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'approved',
        expected: true,
      },
    ])(
      'role=$role, registerStatus=$registerStatus, mode=$mode, haveApplicablePeriod=$haveApplicablePeriod, isOnlyApprovedOrDeleted=$isOnlyApprovedOrDeleted, applicableRegisterStatus=$applicableRegisterStatus → $expected',
      ({ role, registerStatus, mode, haveApplicablePeriod, isOnlyApprovedOrDeleted, applicableRegisterStatus, expected }) => {
        expect(
          refNewButtonDisplay(
            role,
            registerStatus,
            mode,
            haveApplicablePeriod,
            isOnlyApprovedOrDeleted,
            applicableRegisterStatus
          )
        ).toBe(expected);
      }
    );

    // 表示されないケース（expected=false）
    test.each<{
      role: Role;
      registerStatus: RegisterStatus;
      mode: Mode;
      haveApplicablePeriod: boolean | undefined;
      isOnlyApprovedOrDeleted: boolean | undefined;
      applicableRegisterStatus: RegisterStatus | null | undefined;
      expected: false;
    }>([
      // 権限不足による非表示
      {
        role: 'view',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'none',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },

      // モード違いによる非表示
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'edit',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'new',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'approve',
        registerStatus: 'approved',
        mode: 'refNewEdit',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },

      // haveApplicablePeriodによる制御
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: false,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: undefined,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },

      // isOnlyApprovedOrDeletedによる制御
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: false,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: undefined,
        applicableRegisterStatus: null,
        expected: false,
      },

      // registerStatusによる制御
      {
        role: 'update',
        registerStatus: 'new',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'register',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'registerRemoved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approveRemoved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'deleted',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'reject',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'requestingDeletion',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'deleteApprove',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: null,
        expected: false,
      },

      // applicableRegisterStatusによる制御
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'register',
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'reject',
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'registerRemoved',
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'approveRemoved',
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'deleted',
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'requestingDeletion',
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'deleteApprove',
        expected: false,
      },
      {
        role: 'update',
        registerStatus: 'approved',
        mode: 'view',
        haveApplicablePeriod: true,
        isOnlyApprovedOrDeleted: true,
        applicableRegisterStatus: 'new',
        expected: false,
      },

      // 複合条件での非表示確認
      {
        role: 'approve',
        registerStatus: 'register',
        mode: 'edit',
        haveApplicablePeriod: false,
        isOnlyApprovedOrDeleted: false,
        applicableRegisterStatus: 'register',
        expected: false,
      },
    ])(
      'role=$role, registerStatus=$registerStatus, mode=$mode, haveApplicablePeriod=$haveApplicablePeriod, isOnlyApprovedOrDeleted=$isOnlyApprovedOrDeleted, applicableRegisterStatus=$applicableRegisterStatus → $expected',
      ({ role, registerStatus, mode, haveApplicablePeriod, isOnlyApprovedOrDeleted, applicableRegisterStatus, expected }) => {
        expect(
          refNewButtonDisplay(
            role,
            registerStatus,
            mode,
            haveApplicablePeriod,
            isOnlyApprovedOrDeleted,
            applicableRegisterStatus
          )
        ).toBe(expected);
      }
    );
  });

  describe('approveRemoveButtonDisplay', () => {
    describe('基本的な表示制御', () => {
      test.each<[Role, RegisterStatus, Mode, boolean, boolean, boolean]>([
        // role, registerStatus, mode, isTran, assignedToMe, expected
        ['approve', 'approved', 'view', true, true, true], // 承認権限かつ承認済かつ照会モード(トラン、割当あり) → 表示
        ['approve', 'approved', 'view', false, true, false], // 承認権限かつ承認済かつ照会モード(マスタ、割当あり) → 非表示
        ['approve', 'approved', 'view', true, false, false], // 承認権限かつ承認済かつ照会モード(トラン、割当なし) → 非表示
        ['update', 'approved', 'view', true, true, false], // 更新権限かつ承認済かつ照会モード(トラン) → 非表示
      ])(
        'role=%s, registerStatus=%s, mode=%s, isTran=%s, assignedToMe=%s のとき、%s を返す',
        (role, registerStatus, mode, isTran, assignedToMe, expected) => {
          expect(approveRemoveButtonDisplay(role, registerStatus, mode, isTran, assignedToMe)).toBe(expected);
        }
      );
    });

    describe('権限による制御', () => {
      test.each<[Role, RegisterStatus, Mode, boolean, boolean, boolean]>([
        // role, registerStatus, mode, isTran, assignedToMe, expected
        ['view', 'approved', 'view', true, true, false], // 参照権限 → 非表示
        ['none', 'approved', 'view', true, true, false], // 権限なし → 非表示
        ['update', 'approved', 'view', true, true, false], // 更新権限 → 非表示
        ['approve', 'approved', 'view', true, true, true], // 承認権限(割当あり) → 表示
        ['approve', 'approved', 'view', true, false, false], // 承認権限(割当なし) → 非表示
      ])(
        '権限テスト: role=%s, registerStatus=%s, mode=%s, isTran=%s, assignedToMe=%s のとき、%s を返す',
        (role, registerStatus, mode, isTran, assignedToMe, expected) => {
          expect(approveRemoveButtonDisplay(role, registerStatus, mode, isTran, assignedToMe)).toBe(expected);
        }
      );
    });

    describe('モードによる制御', () => {
      test.each<[Role, RegisterStatus, Mode, boolean, boolean, boolean]>([
        // role, registerStatus, mode, isTran, assignedToMe, expected
        ['approve', 'approved', 'view', true, true, true], // 照会モード → 表示
        ['approve', 'approved', 'edit', true, true, false], // 編集モード → 非表示
        ['approve', 'approved', 'new', true, true, false], // 新規モード → 非表示
        ['approve', 'approved', 'refNewEdit', true, true, false], // 参照新規編集モード → 非表示
      ])(
        'モードテスト: role=%s, registerStatus=%s, mode=%s, isTran=%s, assignedToMe=%s のとき、%s を返す',
        (role, registerStatus, mode, isTran, assignedToMe, expected) => {
          expect(approveRemoveButtonDisplay(role, registerStatus, mode, isTran, assignedToMe)).toBe(expected);
        }
      );
    });

    describe('登録ステータスによる制御', () => {
      test.each<[Role, RegisterStatus, Mode, boolean, boolean, boolean]>([
        // role, registerStatus, mode, isTran, assignedToMe, expected
        ['approve', 'approved', 'view', true, true, true], // 承認済 → 表示
        ['approve', 'new', 'view', true, true, false], // 新規 → 非表示
        ['approve', 'register', 'view', true, true, false], // 申請中 → 非表示
        ['approve', 'registerRemoved', 'view', true, true, false], // 申請取下 → 非表示
        ['approve', 'approveRemoved', 'view', true, true, false], // 承認取下 → 非表示
        ['approve', 'deleted', 'view', true, true, false], // 削除 → 非表示
        ['approve', 'reject', 'view', true, true, false], // 差戻 → 非表示
        ['approve', 'requestingDeletion', 'view', true, true, false], // 削除申請中 → 非表示
        ['approve', 'deleteApprove', 'view', true, true, false], // 承認済削除 → 非表示
      ])(
        'ステータステスト: role=%s, registerStatus=%s, mode=%s, isTran=%s, assignedToMe=%s のとき、%s を返す',
        (role, registerStatus, mode, isTran, assignedToMe, expected) => {
          expect(approveRemoveButtonDisplay(role, registerStatus, mode, isTran, assignedToMe)).toBe(expected);
        }
      );
    });

    describe('isTranフラグによる制御', () => {
      test('トランザクション（isTran=true）の場合のみ表示', () => {
        // トランザクションで承認権限かつ割当ありの場合は表示
        expect(approveRemoveButtonDisplay('approve', 'approved', 'view', true, true)).toBe(true);

        // マスタの場合は非表示
        expect(approveRemoveButtonDisplay('approve', 'approved', 'view', false, true)).toBe(false);

        // 更新権限の場合は非表示
        expect(approveRemoveButtonDisplay('update', 'approved', 'view', true, true)).toBe(false);

        // 割当なしの場合は非表示
        expect(approveRemoveButtonDisplay('approve', 'approved', 'view', true, false)).toBe(false);
      });
    });

    describe('該当条件による制御', () => {
      test('自身に割り当てられている場合のみ表示', () => {
        // assignedToMe=trueの場合のみ表示
        expect(approveRemoveButtonDisplay('approve', 'approved', 'view', true, true)).toBe(true);

        // assignedToMe=falseの場合は非表示
        expect(approveRemoveButtonDisplay('approve', 'approved', 'view', true, false)).toBe(false);
      });
    });

    describe('複合条件のテスト', () => {
      test('すべての条件が満たされた場合のみ表示', () => {
        // 正常パターン
        expect(approveRemoveButtonDisplay('approve', 'approved', 'view', true, true)).toBe(true);

        // いずれかの条件が満たされない場合は非表示
        expect(approveRemoveButtonDisplay('view', 'approved', 'view', true, true)).toBe(false); // 権限不足
        expect(approveRemoveButtonDisplay('approve', 'register', 'view', true, true)).toBe(false); // ステータス不一致
        expect(approveRemoveButtonDisplay('approve', 'approved', 'edit', true, true)).toBe(false); // モード不一致
        expect(approveRemoveButtonDisplay('approve', 'approved', 'view', false, true)).toBe(false); // マスタデータ
        expect(approveRemoveButtonDisplay('approve', 'approved', 'view', true, false)).toBe(false); // 割当なし
      });
    });
  });
});
