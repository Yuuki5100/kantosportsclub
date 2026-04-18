import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';

/**
 * 承認ボタンの表示制御
 * @param role
 * @param registerStatus
 * @param mode
 * @param assignedToMe
 * @returns
 */
export const isApproveActionAllowed = (
  role: Role,
  registerStatus: RegisterStatus | null,
  mode: Mode,
  assignedToMe: boolean | undefined
): boolean => {
  if (mode !== 'view') {
    return false;
  }

  if (role !== 'approve') {
    return false;
  }

  if (assignedToMe !== true) {
    return false;
  }

  // 適用終了日ステータスはnullを許容する
  if (registerStatus === null) {
    return false;
  }

  if (registerStatus === 'register') {
    return true;
  }

  return registerStatus === 'requestingDeletion';
};

/**
 * 申請取下ボタンの表示制御
 * @param role
 * @param registerStatus
 * @param mode
 * @param assignedToMe
 * @returns
 */
export const isRegisterRemoveActionAllowed = (
  role: Role,
  registerStatus: RegisterStatus | null,
  mode: Mode,
  assignedToMe: boolean | undefined,
  isTran: boolean
): boolean => {
  if (isTran) {
    return ((role === 'approve' && assignedToMe === false) || role === 'update') && registerStatus === 'register';
  }

  if (mode !== 'view') {
    return false;
  }

  if (registerStatus !== 'register' && registerStatus !== 'requestingDeletion') {
    return false;
  }

  // 承認者に指定されている場合は申請取下ボタンを表示しない（差戻・承認ボタンを優先）
  if (role === 'approve' && assignedToMe === true) {
    return false;
  }

  // 承認者に指定されていない場合、または更新権限の場合は申請取下ボタンを表示
  if ((role === 'approve' && assignedToMe === false) || role === 'update') {
    return true;
  }

  return false;
};

/**
 * 削除理由のテキストエリアを表示するかどうかを判定する
 * 異常パターンは全てfalse
 * @param role
 * @param registerStatus
 * @param mode
 * @param isTran
 * @returns
 */
export const deleteReasonTextAreaDisabled = (
  role: Role,
  registerStatus: RegisterStatus | null,
  mode: Mode,
  isTran: boolean,
): boolean => {
  if (mode !== 'edit') {
    return true;
  }

  if (role === 'none' || role === 'view') {
    return true;
  }

  if (registerStatus === 'registerRemoved' || registerStatus === 'reject') {
    return false;
  }

  if (registerStatus === 'approveRemoved' && isTran) {
    return false;
  }

  if (registerStatus === 'approved' && !isTran) {
    return false;
  }

  return true;
};

export const commentDisable = (
  role: Role,
  registerStatus: RegisterStatus | null,
  mode: Mode,
  isTran: boolean,
  assignedToMe?: boolean
): boolean => {
  if (role === 'approve' && assignedToMe && mode === 'view') {
    if (registerStatus === 'register') {
      return false;
    }
    if (registerStatus === 'requestingDeletion' && !isTran) {
      return false;
    }
  }
  return true;
};
