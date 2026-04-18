import { Box, DatePicker, Font20, FormRow } from '@/components/base';
import { CRJButton } from '@/components/base/Button/CRJ/CRJButtonBase';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import TextArea from '@/components/base/Input/TextBoxMultiLine';
import { deleteFlgText } from '@/components/CRJ/deleteFlgText';
import { commentDisable, deleteReasonTextAreaDisabled, isApproveActionAllowed, isRegisterRemoveActionAllowed } from '@/components/CRJ/actionAllowed';
import { ApproverSelect } from '@/components/CRJ/ApproverSelect';
import { RegisterStatusNames } from '@/const/CRJ/RegisterStatusNames';
import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';
import { Card } from '@/components/base';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

export type ApplicableInfoAreaProps = {
  /**
   * 識別ID
   */
  id?: string;
  /**
   * コンポーネントの表示非表示
   */
  hidden: boolean;

  /**
   * 適用終了日情報が存在するか
   */
  haveApplicablePeriod: boolean | undefined;

  /**
   * 適用終了日
   */
  applicableEndDate?: Dayjs;
  /**
   * 適用終了日の変更
   * @param value
   * @returns
   */
  setApplicableEndDate?: (value: Dayjs | undefined) => void;
  /**
   * 登録ステータス
   */
  registerStatus?: RegisterStatus | null;
  /**
   * ユーザーの権限区分
   */
  role: Role;
  /**
   * 画面のモード
   */
  mode?: Mode;
  /**
   * 削除フラグ
   */
  deleteFlg?: boolean;
  /**
   * 削除理由
   */
  deleteReason?: string;
  /**
   * 削除理由の変更
   * @param value
   * @returns
   */
  setDeleteReason?: (value: string) => void;
  /**
   * 作成日時
   */
  createdAt?: string;
  /**
   * 作成者
   */
  createdBy?: string;
  /**
   * 更新日時
   */
  updatedAt?: string;
  /**
   * 更新者
   */
  updatedBy?: string;
  /**
   * 承認者一覧
   */
  approvers: OptionInfo[];

  /**
   * 登録ステップの更新日時
   */
  registerStepUpdatedAt?: string;
  /**
   * 選択された承認者ID
   */
  selectedApproverId?: string;

  /**
   * 選択された承認者IDの変更
   * @param value
   * @returns
   */
  setSelectedApproverId?: (value: string) => void;

  /**
   * 承認者のエラーメッセージ
   */
  approverErrorMessage?: string;

  /**
   * コメント
   */
  comment?: string;
  /**
   * コメントの変更
   * @param value
   * @returns
   */
  setComment?: (value: string) => void;
  /**
   * 編集ボタンクリック時のコールバック
   * @returns
   */
  onEditClick?: () => void;
  /**
   * 登録ボタンクリック時のコールバック
   * @returns
   */
  onRegisterClick?: () => void;

  /**
   * 申請取下ボタンクリック時のコールバック
   * @returns
   */
  onRegisterRemoveClick?: () => void;

  /**
   * 差戻ボタンクリック時のコールバック
   * @returns
   */
  onRejectClick?: () => void;

  /**
   * 削除ボタンクリック時のコールバック
   */
  onDeleteClick?: () => void;

  /**
   * 承認ボタンクリック時のコールバック
   * @returns
   */
  onApproveClick?: () => void;
  /**
   * 参照新規登録ボタンの表示制御に使用
   *
   * 該当レコードが承認済み、削除済み、承認済削除以外のレコードがない場合はtrue
   */
  isOnlyApprovedOrDeleted?: boolean;
  /**
   * 承認者のとき、自身に割り当てられているか
   */
  assignedToMe?: boolean;

  /**
   * トラン
   */
  isTran: boolean;
};

export const ApplicableInfoArea = (props: ApplicableInfoAreaProps) => {
  const [applicableEndDateError, setApplicableEndDateError] = useState<string>('');

  // 適用終了日のバリデーション
  useEffect(() => {
    if (props.mode && !applicableEndDateDisabled(props.mode)) {
      if (props.applicableEndDate) {
        if (props.applicableEndDate.isBefore(dayjs(), 'day')) {
          setApplicableEndDateError('適用終了日はシステム日付以降の日付を入力してください。');
        } else {
          setApplicableEndDateError('');
        }
      } else {
        // 値が空の場合はエラーをクリア（初期状態ではエラーを表示しない）
        setApplicableEndDateError('');
      }
    }
  }, [props.applicableEndDate, props.mode]);

  if (props.hidden === true || props.registerStatus === undefined || props.mode === undefined) {
    return <></>;
  }

  const canApproveAction = isApproveActionAllowed(
    props.role,
    props.registerStatus,
    props.mode,
    props.assignedToMe
  );

  const handleApplicableEndDateChange = (newValue: Dayjs | undefined) => {
    // まず親コンポーネントの状態を更新
    props.setApplicableEndDate?.(newValue);

    // バリデーション実行
    if (props.mode && !applicableEndDateDisabled(props.mode)) {
      if (newValue) {
        // システム日付以前の日付かチェック
        if (newValue.isBefore(dayjs(), 'day')) {
          setApplicableEndDateError('適用終了日はシステム日付以降の日付を入力してください。');
        } else {
          // 値が入力された場合はエラーをクリア
          setApplicableEndDateError('');
        }
      } else {
        // 値が空の場合はエラーを表示
        setApplicableEndDateError('適用終了日は必須項目です。');
      }
    }
  };

  const handleApplicableEndDateBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (props.mode === undefined) {
      return;
    }

    // 編集可能な状態でない場合はバリデーションを実行しない
    if (applicableEndDateDisabled(props.mode)) {
      return;
    }

    // イベントから入力値を取得
    const inputValue = event.target.value;

    // プレースホルダーや無効な値をチェック
    // DatePickerのプレースホルダー「YYYY/MM/DD」や空文字列を無効な値として扱う
    const isEmpty = !inputValue ||
      inputValue.trim() === '' ||
      inputValue === 'YYYY/MM/DD' ||
      inputValue === 'Invalid Date' ||
      inputValue === '__/__/__';

    // propsの値も確認（Reactの状態とDOMの状態が異なる場合がある）
    const hasDateValue = props.applicableEndDate && props.applicableEndDate.isValid();

    // 入力フィールドが空またはプレースホルダーで、かつReactの状態も無効な場合
    if (isEmpty && !hasDateValue) {
      setApplicableEndDateError('適用終了日は必須項目です。');
    } else if (hasDateValue && props.applicableEndDate!.isBefore(dayjs(), 'day')) {
      // システム日付以前の日付かチェック
      setApplicableEndDateError('適用終了日はシステム日付以降の日付を入力してください。');
    } else if (hasDateValue) {
      // 有効な日付で、システム日付以降の場合はエラーをクリア
      setApplicableEndDateError('');
    }
  };

  return (
    <Card sx={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '16px' }}>
      <Font20>適用終了日情報</Font20>
      <Box
        sx={{
          mt: 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: 2,
            marginLeft: 'auto',
            overflow: 'auto'
          }}
        >
          {editButtonDisplay(
            props.role,
            props.registerStatus,
            props.mode,
            props.isOnlyApprovedOrDeleted,
            props.assignedToMe
          ) && <CRJButton label={'編集'} onClick={props.onEditClick} />}
          {deleteButtonDisplay(props.haveApplicablePeriod, props.mode) && (
            <CRJButton label={'削除'} onClick={props.onDeleteClick} />
          )}
          {registerButtonDisplay(props.mode) && (
            <CRJButton label={'申請'} onClick={props.onRegisterClick} />
          )}
          {isRegisterRemoveActionAllowed(props.role, props.registerStatus, props.mode, props.assignedToMe, props.isTran) && (
            <CRJButton label={'申請取下'} onClick={props.onRegisterRemoveClick} />
          )}
          {canApproveAction && (
            <>
              <CRJButton label={'差戻'} onClick={props.onRejectClick} />
              <CRJButton label={'承認'} onClick={props.onApproveClick} />
            </>
          )}
        </Box>
      </Box>
      <FormRow labelAlignment='center' label={'適用終了日'} required={props.mode !== 'view' ? true : undefined}>
        <DatePicker
          value={props.applicableEndDate}
          onChange={handleApplicableEndDateChange}
          disabled={applicableEndDateDisabled(props.mode)}
          onBlur={handleApplicableEndDateBlur}
          error={!!applicableEndDateError}
          helperText={applicableEndDateError}
          minDate={dayjs()}
        />
      </FormRow>
      <FormRow labelAlignment='center' label={'識別ID'}>{props.id}</FormRow>
      <FormRow labelAlignment='center' label={'ステータス'}>{props.registerStatus ? RegisterStatusNames[props.registerStatus] : ''}</FormRow>
      <FormRow labelAlignment='center' label={'削除フラグ'}>{deleteFlgText(props.deleteFlg)}</FormRow>
      <FormRow label={'削除理由'}>
        <TextArea
          rows={3}
          value={props.deleteReason}
          onChange={(e) => props.setDeleteReason?.(e.target.value)}
          name={'deleteReason'}
          customStyle={{
            width: '100%',
          }}
          disabled={deleteReasonTextAreaDisabled(
            props.role,
            props.registerStatus,
            props.mode,
            props.isTran
          )}
          maxLength={100}
        />
      </FormRow>
      <br />
      <FormRow labelAlignment='center' label={'作成者'}>{props.createdBy}</FormRow>
      <FormRow labelAlignment='center' label={'作成日時'}>{props.createdAt}</FormRow>
      <br />
      <FormRow labelAlignment='center' label={'更新者'}>{props.updatedBy}</FormRow>
      <FormRow labelAlignment='center' label={'更新日時'}>{props.updatedAt}</FormRow>
      <ApproverSelect
        approvers={props.approvers}
        selectedApproverId={props.selectedApproverId}
        setSelectedApproverId={props.setSelectedApproverId}
        approverErrorMessage={props.approverErrorMessage}
        mode={props.mode}
        fieldName="applicableInfoApprover"
        approverSelectable={!applicableEndDateDisabled(props.mode)}
      />
      <FormRow labelAlignment='center' label={'更新日時'}>{props.registerStepUpdatedAt}</FormRow>
      <FormRow label={'コメント'}>
        <TextArea
          rows={4}
          value={props.comment}
          onChange={(e) => props.setComment?.(e.target.value)}
          disabled={commentDisable(
            props.role,
            props.registerStatus,
            props.mode,
            props.isTran,
            props.assignedToMe
          )}
          name={'applicableComment'}
          customStyle={{
            width: '100%',
          }}
          maxLength={50}
        />
      </FormRow>
    </Card>
  );
};

export const registerButtonDisplay = (mode: Mode): boolean => {
  return mode == 'applicableEdit';
};

export const editButtonDisplay = (
  role: Role,
  registerStatus: RegisterStatus | null,
  mode: Mode,
  isOnlyApprovedOrDeleted: boolean | undefined,
  assignedToMe: boolean | undefined
): boolean => {
  if (role === 'view' || role === 'none' || mode !== 'view') {
    return false;
  }

  if (role === 'approve') {
    return handleApproveRoleDisplay(registerStatus, isOnlyApprovedOrDeleted, assignedToMe);
  }

  if (role === 'update') {
    return handleUpdateRoleDisplay(registerStatus, isOnlyApprovedOrDeleted, assignedToMe);
  }

  return false;
};

/**
 * 承認権限のときの編集ボタン表示制御
 */
const handleApproveRoleDisplay = (
  registerStatus: RegisterStatus | null,
  isOnlyApprovedOrDeleted: boolean | undefined,
  assignedToMe: boolean | undefined
): boolean => {
  const isAssignedExplicitly = assignedToMe === true || assignedToMe === false;
  const isApprovedOrNullStatus = registerStatus === null || registerStatus === 'approved';
  const isRejectedOrRemovedStatus = registerStatus === 'registerRemoved' || registerStatus === 'reject';

  if (isAssignedExplicitly && isOnlyApprovedOrDeleted === true && isApprovedOrNullStatus) {
    return true;
  }

  if (assignedToMe === false && isOnlyApprovedOrDeleted === false && isRejectedOrRemovedStatus) {
    return true;
  }

  return false;
};

/**
 * 更新権限のときの編集ボタン表示制御
 */
const handleUpdateRoleDisplay = (
  registerStatus: RegisterStatus | null,
  isOnlyApprovedOrDeleted: boolean | undefined,
  assignedToMe: boolean | undefined
): boolean => {
  if (registerStatus === 'requestingDeletion' || registerStatus === 'register') {
    return false;
  }

  if (registerStatus === null) {
    if (isOnlyApprovedOrDeleted === true && assignedToMe !== false) {
      return true;
    }
    return false;
  }

  if (isOnlyApprovedOrDeleted === true && (registerStatus === 'approved' || registerStatus === 'new')) {
    return true;
  }

  if ((registerStatus === 'registerRemoved' || registerStatus === 'reject') && isOnlyApprovedOrDeleted === false) {
    return true;
  }

  // Handle deleted/deleteApprove status - always show
  if (registerStatus === 'deleted' || registerStatus === 'deleteApprove') {
    return true;
  }

  return false;
};

/**
 * 適用終了日を編集可能にするかどうかを判定する
 * @param applicableEditClicked
 * @returns
 */
export const applicableEndDateDisabled = (mode: Mode) => {
  // 適用終了日情報の編集ボタンが押されたときに有効化したい
  // 適用終了日情報の編集ボタンは編集・更新権限のみ表示される
  // 適用終了日情報の編集ボタンが押されたときは編集モード
  // よって、適用終了日情報の編集ボタンが押されているかどうかのみで判定できる
  return mode !== 'applicableEdit';
};

export const deleteButtonDisplay = (haveApplicablePeriod: boolean | undefined, mode: Mode): boolean => {
  return haveApplicablePeriod === true && mode == 'applicableEdit';
}
