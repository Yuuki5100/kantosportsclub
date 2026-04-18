import { CRJButton } from '@/components/base/Button/CRJ/CRJButtonBase';
import { isApproveActionAllowed, isRegisterRemoveActionAllowed } from '@/components/CRJ/actionAllowed';
import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';
import { ReactNode } from 'react';

type ButtonAreaProps = {
  /**
   * 画面のモード
   */
  mode: Mode;
  /**
   * ユーザーの権限区分
   * - `none`: なし
   * - `view`: 参照
   * - `update`: 更新
   * - `approve`: 承認
   */
  role: Role;
  /**
   * 登録ステータス
   * - `new`: 新規
   * - `register`: 申請中
   * - `registerRemoved`: 申請取下
   * - `approveRemoved`: 承認取下
   * - `deleted`: 削除
   * - `reject`: 差戻
   * - `approved`: 承認済
   * - `requestingDeletion`: 削除申請中
   * - `deleteApprove`: 承認済削除
   */
  registerStatus: RegisterStatus;
  
  isTran: boolean;
  
  /**
   * 承認者が自身に割り当てられているかどうか
   *
   * 承認者のときだけ使用
   *
   * それ以外はundefinedにすること
   */
  assignedToMe?: boolean;
  /**
   * 適用期間があるかどうか
   */
  haveApplicablePeriod?: boolean;
  /**
   * 参照新規登録ボタンの表示制御に使用
   * 承認済編集可フラグとしても使用
   *
   * 該当レコードが承認済み、削除済み、承認済削除以外のレコードがない場合はtrue
   * 承認済レコードの編集ボタン表示制御にも使用
   */
  isOnlyApprovedOrDeleted?: boolean;

  /**
   * 適用終了日の登録ステータス
   * 参照新規登録ボタンの表示制御に使用
   * @returns 
   */
  applicableRegisterStatus?: RegisterStatus | null;

  onBackClick?: () => void;
  onRefNewClick?: () => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onApproveClick?: () => void;
  onRejectClick?: () => void;
  onRegisterClick?: () => void;
  onRegisterRemoveClick?: () => void;
  onApproveRemoveClick?: () => void;
  children?: ReactNode;
};

export const ButtonArea = (props: ButtonAreaProps) => {
  return (
    <>
      {props.children ?? (
        <>
          <CRJButton label='戻る' onClick={props.onBackClick} />
          {editButtonDisplay(props.role, props.registerStatus, props.mode, props.isTran, props.assignedToMe, props.isOnlyApprovedOrDeleted) && (
            <CRJButton label={'編集'} onClick={props.onEditClick} />
          )}
          {isApproveActionAllowed(props.role, props.registerStatus, props.mode, props.assignedToMe) && (
            <>
              <CRJButton label={'差戻'} onClick={props.onRejectClick} />
              <CRJButton label={'承認'} onClick={props.onApproveClick} />
            </>
          )}
          {deleteButtonDisplay(
            props.role,
            props.mode
          ) && <CRJButton label={'削除'} onClick={props.onDeleteClick} />}
          {registerButtonDisplay(
            props.role,
            props.mode,
          ) && <CRJButton label={'申請'} onClick={props.onRegisterClick} />}
          {isRegisterRemoveActionAllowed(
            props.role,
            props.registerStatus,
            props.mode,
            props.assignedToMe,
            props.isTran
          ) && <CRJButton label={'申請取下'} onClick={props.onRegisterRemoveClick} />}
          {approveRemoveButtonDisplay(
            props.role,
            props.registerStatus,
            props.mode,
            props.isTran,
            props.assignedToMe ?? false
          ) && <CRJButton label={'承認取下'} onClick={props.onApproveRemoveClick} />}
          {refNewButtonDisplay(
            props.role,
            props.registerStatus,
            props.mode,
            props.haveApplicablePeriod,
            props.isOnlyApprovedOrDeleted,
            props.applicableRegisterStatus
          ) && <CRJButton label={'参照新規登録'} onClick={props.onRefNewClick} />}
        </>
      )}
    </>
  );
};

/**
 * 編集ボタンの表示制御
 * @param role 
 * @param registerStatus 
 * @param mode 
 * @param isTran 
 * @param assignedToMe 
 * @param isOnlyApprovedOrDeleted 承認済編集可フラグとしても使用
 * @returns 
 */
export const editButtonDisplay = (
  role: Role,
  registerStatus: RegisterStatus,
  mode: Mode,
  isTran: boolean,
  assignedToMe?: boolean,
  isOnlyApprovedOrDeleted?: boolean
): boolean => {
  if (role === 'none' || role === 'view') {
    return false;
  }

  if (mode !== 'view') {
    return false;
  }

  // 承認済の場合：承認済編集可フラグ（isOnlyApprovedOrDeleted）による制御
  if (registerStatus === 'approved') {
    return isOnlyApprovedOrDeleted === true && !isTran;
  }

  // 差戻の場合：承認者指定による制御
  if (registerStatus === 'reject') {
    if (role === 'approve' && assignedToMe === true) {
      return false; // 承認者指定ありの場合は編集ボタンを表示しない
    }
    if ((role === 'approve' && assignedToMe === false) || role === 'update') {
      return true; // 承認者指定なしまたは更新権限の場合は編集ボタンを表示
    }
  }

  // その他のステータス（申請取下など）の場合
  if ((role === 'approve' && assignedToMe === false) || role === 'update') {
    if (registerStatus === 'registerRemoved' || (registerStatus === 'approveRemoved' && isTran)) {
      return true;
    }
  }

  return false;
};

/**
 * 削除ボタンの表示制御
 * @param role
 * @param registerStatus
 * @param mode
 * @param assignedToMe
 * @returns
 */
export const deleteButtonDisplay = (
  role: Role,
  mode: Mode,
): boolean => {
    return (
      (role === 'update' || role === 'approve') &&
      mode === 'edit'
    );
};

/**
 * 申請ボタンの表示制御
 * @param role
 * @param registerStatus
 * @param mode
 * @param assignedToMe
 * @returns
 */
export const registerButtonDisplay = (
  role: Role,
  mode: Mode,
) => {
  if (role === 'view' || role === 'none') {
    return false;
  }

  if (mode === 'new') {
    return true;
  }

  if (mode === 'edit') {
    return true;
  }

  if (mode === 'refNewEdit') {
    return true;
  }

  return false;
};

/**
 * 参照新規登録ボタンの表示制御
 * @param role
 * ユーザーの権限区分
 * @param registerStatus
 * 登録ステータス
 * @param mode
 * 画面のモード
 * @param assignedToMe
 * ユーザーが承認者のとき、ユーザーに割り当てられているかどうか
 * @param haveApplicablePeriod
 * 適用期間があるかどうか
 * @param isOnlyApprovedOrDeleted
 * 該当レコードが承認済み、削除済み、承認済削除以外のレコードがない場合はtrue
 * @returns
 */
export const refNewButtonDisplay = (
  role: Role,
  registerStatus: RegisterStatus,
  mode: Mode,
  haveApplicablePeriod: boolean | undefined,
  isOnlyApprovedOrDeleted: boolean | undefined,
  applicableRegisterStatus?: RegisterStatus | null
): boolean => {
  if (haveApplicablePeriod !== true) {
    return false;
  }

  if (mode !== 'view') {
    return false;
  }

  if (role === 'view' || role === 'none') {
    return false;
  }

  if (isOnlyApprovedOrDeleted !== true) {
    return false;
  }

  if (registerStatus !== 'approved') {
    return false;
  }

  return applicableRegisterStatus === null || applicableRegisterStatus === 'approved';
};

/**
 * 承認取下ボタンの表示制御
 * @param role ユーザーの権限区分
 * @param registerStatus 登録ステータス
 * @param mode 画面のモード
 * @param isTran トランザクション/マスタ区分
 * @returns 
 */
export const approveRemoveButtonDisplay = (
  role: Role,
  registerStatus: RegisterStatus,
  mode: Mode,
  isTran: boolean,
  assignedToMe: boolean
): boolean => {
  if (assignedToMe !== true) {
    return false;
  }

  if (!isTran) {
    return false;
  }
  
  if (role !== 'approve') {
    return false;
  }
  
  if (mode !== 'view') {
    return false;
  }
  
  return registerStatus === 'approved';
};
