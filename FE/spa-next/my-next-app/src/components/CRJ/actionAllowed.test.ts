import { expect, jest, test } from '@jest/globals';
import {
  commentDisable,
  deleteReasonTextAreaDisabled,
  isApproveActionAllowed,
  isRegisterRemoveActionAllowed,
} from './actionAllowed';
import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';

describe('actionAllowed', () => {
  describe('isApproveActionAllowed', () => {
    describe('モードに関するテスト', () => {
      test.each<[Role, RegisterStatus, Mode, boolean | undefined, boolean]>([
        ['approve', 'register', 'new', true, false],
        ['approve', 'register', 'refNewEdit', true, false],
        ['approve', 'register', 'view', true, true],
        ['approve', 'register', 'edit', true, false],
      ])(
        'role=%s, status=%s, mode=%s, assignedToMe=%s の場合は%sを返す',
        (role, status, mode, assignedToMe, expected) => {
          expect(isApproveActionAllowed(role, status, mode, assignedToMe)).toBe(expected);
        }
      );
    });

    describe('権限に関するテスト', () => {
      test.each<[Role, RegisterStatus, Mode, boolean | undefined, boolean]>([
        ['approve', 'register', 'view', true, true],
        ['view', 'register', 'view', true, false],
        ['update', 'register', 'view', true, false],
        ['none', 'register', 'view', true, false],
      ])(
        'role=%s, status=%s, mode=%s, assignedToMe=%s の場合は%s を返す',
        (role, status, mode, assignedToMe, expected) => {
          expect(isApproveActionAllowed(role, status, mode, assignedToMe)).toBe(expected);
        }
      );
    });

    describe('assignedToMeに関するテスト', () => {
      test.each<[Role, RegisterStatus, Mode, boolean | undefined, boolean]>([
        ['approve', 'register', 'view', true, true],
        ['approve', 'register', 'view', false, false],
        ['approve', 'register', 'view', undefined, false],
      ])(
        'role=%s, status=%s, mode=%s, assignedToMe=%s の場合は%s を返す',
        (role, status, mode, assignedToMe, expected) => {
          expect(isApproveActionAllowed(role, status, mode, assignedToMe)).toBe(expected);
        }
      );
    });

    describe('ステータスに関するテスト', () => {
      test.each<[Role, RegisterStatus, Mode, boolean | undefined, boolean]>([
        ['approve', 'register', 'view', true, true],
        ['approve', 'requestingDeletion', 'view', true, true],
        ['approve', 'approved', 'view', true, false],
        ['approve', 'registerRemoved', 'view', true, false],
        ['approve', 'reject', 'view', true, false],
        ['approve', 'deleted', 'view', true, false],
        ['approve', 'deleteApprove', 'view', true, false],
      ])(
        'role=%s, status=%s, mode=%s, assignedToMe=%s の場合は%s を返す',
        (role, status, mode, assignedToMe, expected) => {
          expect(isApproveActionAllowed(role, status, mode, assignedToMe)).toBe(expected);
        }
      );
    });

    describe('複合条件のテスト', () => {
      test.each<[Role, RegisterStatus, Mode, boolean | undefined, boolean]>([
        ['approve', 'register', 'view', true, true],
        ['view', 'register', 'edit', true, false],
        ['approve', 'approved', 'view', true, false],
        ['approve', 'register', 'new', true, false],
        ['approve', 'register', 'view', false, false],
      ])(
        'role=%s, status=%s, mode=%s, assignedToMe=%s の場合は%s を返す',
        (role, status, mode, assignedToMe, expected) => {
          expect(isApproveActionAllowed(role, status, mode, assignedToMe)).toBe(expected);
        }
      );
    });
  });

  describe('isRegisterRemoveActionAllowed', () => {
    describe('isTran=true の場合', () => {
      test.each<[Role, RegisterStatus, Mode, boolean | undefined, boolean]>([
        // isTran=trueの場合：registerStatusがregisterかつ((approveかつassignedToMe=false) or update)の場合のみtrue
        ['update', 'register', 'view', undefined, true],
        ['update', 'register', 'edit', undefined, true],
        ['approve', 'register', 'view', false, true],
        ['approve', 'register', 'edit', false, true],

        // isTran=trueでも条件に合わない場合はfalse
        ['update', 'registerRemoved', 'view', undefined, false],
        ['update', 'requestingDeletion', 'view', undefined, false],
        ['approve', 'register', 'view', true, false],
        ['approve', 'registerRemoved', 'view', false, false],
        ['view', 'register', 'view', undefined, false],
        ['none', 'register', 'view', undefined, false],
      ])(
        'isTran=true: role=%s, registerStatus=%s, mode=%s, assignedToMe=%s の場合は%s を返す',
        (role, registerStatus, mode, assignedToMe, expected) => {
          expect(
            isRegisterRemoveActionAllowed(role, registerStatus, mode, assignedToMe, true)
          ).toBe(expected);
        }
      );
    });

    describe('isTran=false の場合', () => {
      test.each<[Role, RegisterStatus, Mode, boolean | undefined, boolean]>([
        // 既存のロジック：viewモードかつ特定の条件
        ['update', 'register', 'view', undefined, true],
        ['update', 'requestingDeletion', 'view', undefined, true],
        ['approve', 'registerRemoved', 'view', false, false],
        ['approve', 'register', 'view', false, true],

        ['view', 'register', 'view', undefined, false],
        ['view', 'registerRemoved', 'view', undefined, false],
        ['view', 'deleted', 'view', undefined, false],
        ['view', 'reject', 'view', undefined, false],
        ['view', 'approved', 'view', undefined, false],
        ['view', 'requestingDeletion', 'view', undefined, false],
        ['view', 'deleteApprove', 'view', undefined, false],

        ['update', 'registerRemoved', 'view', undefined, false],
        ['update', 'deleted', 'view', undefined, false],
        ['update', 'reject', 'view', undefined, false],
        ['update', 'approved', 'view', undefined, false],
        ['update', 'deleteApprove', 'view', undefined, false],

        ['update', 'registerRemoved', 'edit', undefined, false],
        ['update', 'reject', 'edit', undefined, false],
        ['update', 'approved', 'edit', undefined, false],

        ['approve', 'deleted', 'view', false, false],
        ['approve', 'reject', 'view', false, false],
        ['approve', 'approved', 'view', false, false],
        ['approve', 'requestingDeletion', 'view', false, true],
        ['approve', 'deleteApprove', 'view', false, false],

        ['approve', 'registerRemoved', 'edit', false, false],
        ['approve', 'reject', 'edit', false, false],
        ['approve', 'approved', 'edit', false, false],

        ['approve', 'register', 'view', true, false],
        ['approve', 'registerRemoved', 'view', true, false],
        ['approve', 'deleted', 'view', true, false],
        ['approve', 'reject', 'view', true, false],
        ['approve', 'approved', 'view', true, false],
        ['approve', 'requestingDeletion', 'view', true, false],
        ['approve', 'deleteApprove', 'view', true, false],
      ])(
        'isTran=false: role=%s, registerStatus=%s, mode=%s, assignedToMe=%s の場合は%s を返す',
        (role, registerStatus, mode, assignedToMe, expected) => {
          expect(
            isRegisterRemoveActionAllowed(role, registerStatus, mode, assignedToMe, false)
          ).toBe(expected);
        }
      );
    });
  });

  describe('deleteReasonDisplayTextArea', () => {
    describe('正常パターン', () => {
      describe('テキストエリアを表示', () => {
        const testCases: [Role, RegisterStatus, Mode, boolean][] = [
          ['update', 'registerRemoved', 'edit', true],
          ['update', 'registerRemoved', 'edit', false],
          ['update', 'reject', 'edit', true],
          ['update', 'reject', 'edit', false],
          ['update', 'approved', 'edit', false],
          ['update', 'approveRemoved', 'edit', true],
          ['approve', 'registerRemoved', 'edit', true],
          ['approve', 'registerRemoved', 'edit', false],
          ['approve', 'reject', 'edit', true],
          ['approve', 'reject', 'edit', false],
          ['approve', 'approved', 'edit', false],
          ['approve', 'approveRemoved', 'edit', true],
        ];
        test.each(testCases)(
          'role: %s, registerStatus: %s, mode: %s, isTran: %s false を返す',
          (role, registerStatus, mode, isTran) => {
            expect(deleteReasonTextAreaDisabled(role, registerStatus, mode, isTran)).toBe(false);
          }
        );
      });

      describe('編集不可', () => {
        const testCases: [Role, RegisterStatus, Mode, boolean][] = [
          ['update', 'new', 'new', true],
          ['update', 'new', 'new', false],
          ['approve', 'new', 'new', true],
          ['approve', 'new', 'new', false],

          ['view', 'register', 'view', true],
          ['view', 'register', 'view', false],
          ['view', 'registerRemoved', 'view', true],
          ['view', 'registerRemoved', 'view', false],
          ['view', 'deleted', 'view', true],
          ['view', 'deleted', 'view', false],
          ['view', 'reject', 'view', true],
          ['view', 'reject', 'view', false],
          ['view', 'approved', 'view', true],
          ['view', 'approved', 'view', false],
          ['view', 'requestingDeletion', 'view', true],
          ['view', 'requestingDeletion', 'view', false],
          ['view', 'deleteApprove', 'view', true],
          ['view', 'deleteApprove', 'view', false],

          ['update', 'register', 'view', true],
          ['update', 'register', 'view', false],
          ['update', 'registerRemoved', 'view', true],
          ['update', 'registerRemoved', 'view', false],
          ['update', 'deleted', 'view', true],
          ['update', 'deleted', 'view', false],
          ['update', 'reject', 'view', true],
          ['update', 'reject', 'view', false],
          ['update', 'approved', 'view', true],
          ['update', 'approved', 'view', false],
          ['update', 'requestingDeletion', 'view', true],
          ['update', 'requestingDeletion', 'view', false],
          ['update', 'deleteApprove', 'view', true],
          ['update', 'deleteApprove', 'view', false],

          ['approve', 'register', 'view', true],
          ['approve', 'register', 'view', false],
          ['approve', 'registerRemoved', 'view', true],
          ['approve', 'registerRemoved', 'view', false],
          ['approve', 'deleted', 'view', true],
          ['approve', 'deleted', 'view', false],
          ['approve', 'reject', 'view', true],
          ['approve', 'reject', 'view', false],
          ['approve', 'approved', 'view', true],
          ['approve', 'approved', 'view', false],
          ['approve', 'requestingDeletion', 'view', true],
          ['approve', 'requestingDeletion', 'view', false],
          ['approve', 'deleteApprove', 'view', true],
          ['approve', 'deleteApprove', 'view', false],

          ['approve', 'register', 'view', true],
          ['approve', 'register', 'view', false],
          ['approve', 'registerRemoved', 'view', true],
          ['approve', 'registerRemoved', 'view', false],
          ['approve', 'deleted', 'view', true],
          ['approve', 'deleted', 'view', false],
          ['approve', 'reject', 'view', true],
          ['approve', 'reject', 'view', false],
          ['approve', 'approved', 'view', true],
          ['approve', 'approved', 'view', false],
          ['approve', 'requestingDeletion', 'view', true],
          ['approve', 'requestingDeletion', 'view', false],
          ['approve', 'deleteApprove', 'view', true],
          ['approve', 'deleteApprove', 'view', false],

          ['update', 'register', 'edit', true],
          ['update', 'register', 'edit', false],
          ['update', 'deleted', 'edit', true],
          ['update', 'deleted', 'edit', false],
          ['update', 'requestingDeletion', 'edit', true],
          ['update', 'requestingDeletion', 'edit', false],
          ['update', 'deleteApprove', 'edit', true],
          ['update', 'deleteApprove', 'edit', false],

          ['approve', 'register', 'edit', true],
          ['approve', 'register', 'edit', false],
          ['approve', 'deleted', 'edit', true],
          ['approve', 'deleted', 'edit', false],
          ['approve', 'requestingDeletion', 'edit', true],
          ['approve', 'requestingDeletion', 'edit', false],
          ['approve', 'deleteApprove', 'edit', true],
          ['approve', 'deleteApprove', 'edit', false],

          ['approve', 'register', 'edit', true],
          ['approve', 'register', 'edit', false],
          ['approve', 'deleted', 'edit', true],
          ['approve', 'deleted', 'edit', false],
          ['approve', 'approved', 'edit', true],
          ['approve', 'requestingDeletion', 'edit', true],
          ['approve', 'requestingDeletion', 'edit', false],
          ['approve', 'deleteApprove', 'edit', true],
          ['approve', 'deleteApprove', 'edit', false],
        ];

        test.each(testCases)(
          'role: %s, registerStatus: %s, mode: %s, isTran: %s true を返す',
          (role, registerStatus, mode, isTran) => {
            expect(deleteReasonTextAreaDisabled(role, registerStatus, mode, isTran)).toBe(true);
          }
        );
      });
    });

    describe('異常パターン(全てfalse)', () => {
      const testCases: [Role, RegisterStatus, Mode, boolean][] = [
        ['update', 'register', 'new', true],
        ['update', 'register', 'new', false],
        ['update', 'registerRemoved', 'new', true],
        ['update', 'registerRemoved', 'new', false],
        ['update', 'reject', 'new', true],
        ['update', 'reject', 'new', false],
        ['update', 'approved', 'new', true],
        ['update', 'approved', 'new', false],
        ['approve', 'register', 'new', true],
        ['approve', 'register', 'new', false],
        ['approve', 'registerRemoved', 'new', true],
        ['approve', 'registerRemoved', 'new', false],
        ['approve', 'reject', 'new', true],
        ['approve', 'reject', 'new', false],
        ['approve', 'approved', 'new', true],
        ['approve', 'approved', 'new', false],
        ['view', 'register', 'edit', true],
        ['view', 'register', 'edit', false],
        ['view', 'registerRemoved', 'edit', true],
        ['view', 'registerRemoved', 'edit', false],
        ['view', 'reject', 'edit', true],
        ['view', 'reject', 'edit', false],
        ['view', 'approved', 'edit', true],
        ['view', 'approved', 'edit', false],

        ['none', 'registerRemoved', 'edit', true],
        ['none', 'registerRemoved', 'edit', false],
      ];

      test.each(testCases)(
        'role: %s, registerStatus: %s, mode: %s, isTran: %s の場合、true を返す',
        (role, registerStatus, mode, isTran) => {
          expect(deleteReasonTextAreaDisabled(role, registerStatus, mode, isTran)).toBe(true);
        }
      );
    });
  });

  describe('commentDisable', () => {
    // テストデータ定数
    const testData = {
      roles: ['none', 'view', 'update', 'approve'] as Role[],
      registerStatuses: [
        'new',
        'register',
        'registerRemoved',
        'deleted',
        'reject',
        'approved',
        'approveRemoved',
        'requestingDeletion',
        'deleteApprove',
      ] as RegisterStatus[],
      modes: {
        view: 'view' as Mode,
        nonView: ['new', 'edit', 'refNewEdit', 'applicableEdit'] as Mode[],
      },
      isTranValues: [true, false],
      assignedToMeValues: [true, false, undefined],
      validConditions: [
        {
          role: 'approve' as Role,
          registerStatus: 'register' as RegisterStatus,
          isTran: false,
          assignedToMe: true,
          expected: false,
        },
        {
          role: 'approve' as Role,
          registerStatus: 'registerRemoved' as RegisterStatus,
          isTran: false,
          assignedToMe: true,
          expected: true,
        },
        {
          role: 'approve' as Role,
          registerStatus: 'approved' as RegisterStatus,
          isTran: true,
          assignedToMe: true,
          expected: true,
        },
        {
          role: 'approve' as Role,
          registerStatus: 'requestingDeletion' as RegisterStatus,
          isTran: false,
          assignedToMe: true,
          expected: false,
        },
        {
          role: 'approve' as Role,
          registerStatus: 'requestingDeletion' as RegisterStatus,
          isTran: true,
          assignedToMe: true,
          expected: true,
        },
      ],
    };

    describe('viewモードでの動作', () => {
      describe('コメント入力有効条件（戻り値：false）', () => {
        testData.validConditions.forEach(
          ({ role, registerStatus, isTran, assignedToMe, expected }) => {
            it(`${role}権限・${registerStatus}・isTran=${isTran}・assignedToMe=${assignedToMe}`, () => {
              expect(
                commentDisable(role, registerStatus, testData.modes.view, isTran, assignedToMe)
              ).toBe(expected);
            });
          }
        );
      });

      describe('コメント入力無効条件（戻り値：true）', () => {
        it('承認権限・申請取下・isTran=true・assignedToMe=true', () => {
          expect(commentDisable('approve', 'registerRemoved', 'view', true, true)).toBe(true);
        });

        it('承認権限・承認済・isTran=false・assignedToMe=true', () => {
          expect(commentDisable('approve', 'approved', 'view', false, true)).toBe(true);
        });

        it('承認権限・assignedToMe=false', () => {
          expect(commentDisable('approve', 'register', 'view', false, false)).toBe(true);
        });

        it('承認権限以外の全権限', () => {
          ['none', 'view', 'update'].forEach((role) => {
            [false, undefined].forEach((assignedToMe) => {
              expect(commentDisable(role as Role, 'register', 'view', false, assignedToMe)).toBe(
                true
              );
            });
          });
        });
      });
    });

    describe('view以外のモードでの動作（常にtrue）', () => {
      describe('全組み合わせパターンテスト', () => {
        testData.modes.nonView.forEach((mode) => {
          describe(`${mode}モード`, () => {
            testData.roles.forEach((role) => {
              testData.registerStatuses.forEach((registerStatus) => {
                testData.isTranValues.forEach((isTran) => {
                  testData.assignedToMeValues.forEach((assignedToMe) => {
                    // 承認権限以外でassignedToMe=trueの場合はエラーになるのでスキップ
                    if (role !== 'approve' && assignedToMe === true) {
                      return;
                    }

                    it(`${role}・${registerStatus}・isTran=${isTran}・assignedToMe=${assignedToMe}`, () => {
                      expect(commentDisable(role, registerStatus, mode, isTran, assignedToMe)).toBe(
                        true
                      );
                    });
                  });
                });
              });
            });
          });
        });
      });

      describe('viewモード有効条件との比較テスト', () => {
        testData.modes.nonView.forEach((mode) => {
          describe(`${mode}モード：viewモードで有効な条件でも無効になる`, () => {
            testData.validConditions.forEach(
              ({ role, registerStatus, isTran, assignedToMe, expected }) => {
                it(`role: ${role}, status: ${registerStatus}, isTran: ${isTran}, assignedToMe: ${assignedToMe} => view: ${expected}, ${mode}: true`, () => {
                  // viewモードではexpected値に従う
                  expect(
                    commentDisable(role, registerStatus, testData.modes.view, isTran, assignedToMe)
                  ).toBe(expected);
                  // 他のモードでは無効（true）
                  expect(commentDisable(role, registerStatus, mode, isTran, assignedToMe)).toBe(true);
                });
              }
            );
          });
        });
      });
    });

    describe('境界値・エッジケーステスト', () => {
      it('承認権限・最小限パラメータ', () => {
        expect(commentDisable('approve', 'register', 'view', false, true)).toBe(false);
      });

      it('none権限・最小限パラメータ', () => {
        expect(commentDisable('none', 'new', 'view', false, undefined)).toBe(true);
      });

      it('全てundefined可能パラメータでのテスト', () => {
        expect(commentDisable('approve', 'register', 'view', false, undefined)).toBe(true);
      });
    });
  });
});
