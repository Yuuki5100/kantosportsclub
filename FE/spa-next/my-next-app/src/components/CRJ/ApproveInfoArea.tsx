import { Font20 } from '@/components/base';
import { FormRow } from '@/components/base/Input';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import TextArea from '@/components/base/Input/TextBoxMultiLine';
import { commentDisable, isApproveActionAllowed } from '@/components/CRJ/actionAllowed';
import { ApproverSelect } from '@/components/CRJ/ApproverSelect';
import { Mode } from '@/types/CRJ/Mode';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Role } from '@/types/CRJ/Role';
import { Card } from '@/components/base';

type ApproveInfoAreaProps = {
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
   * - `deleted`: 削除
   * - `reject`: 差戻
   * - `approved`: 承認済
   * - `requestingDeletion`: 削除申請中
   * - `deleteApprove`: 承認済削除
   */
  registerStatus: RegisterStatus;
  /**
   * 選択中の承認者ID
   */
  selectedApproverId?: string;
  /**
   * トラン
   */
  isTran: boolean;

  /**
   * 承認者名
   *
   * 承認者のときだけ使用
   */
  approverName?: string;
  /**
   * 更新日時
   */
  updateDt?: string;
  comment?: string;
  /**
   * コメント変更時のコールバック
   */
  setComment?: (comment: string) => void;
  approvers: OptionInfo[];
  setSelectedApproverId?: (value: string) => void;
  /**
   * 適用期間ありかどうか
   *
   * true: 適用期間あり
   *
   *  false: 適用期間なし
   */
  applicablePeriod?: boolean;
  /**
   * 自分に割り当てられたかどうか
   *
   * 承認者のときだけ使用
   *
   * - true: 自分に割り当てられた
   * - false: 自分に割り当てられていない
   */
  assignedToMe?: boolean;

  /**
   * コメントのヘルパーテキスト
   */
  commentHelperText?: string;

  /**
   * 承認者のエラーメッセージ
   */
  approverErrorMessage?: string;
};

export const ApproveInfoArea = (props: ApproveInfoAreaProps) => {
  
  const isViewMode = props.mode === 'view';
  const isApproveMode = isApproveActionAllowed(props.role, props.registerStatus, props.mode, props.assignedToMe);

  return (
    <Card sx={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '16px' }}>
      <Font20>承認情報</Font20>
      {isViewMode && !isApproveMode && <FormRow label={'承認者ID'}>{props.selectedApproverId}</FormRow>}
      <ApproverSelect
        approvers={props.approvers}
        selectedApproverId={props.selectedApproverId}
        setSelectedApproverId={props.setSelectedApproverId}
        approverErrorMessage={props.approverErrorMessage}
        mode={props.mode}
        fieldName="approveInfoApprover"
        approverSelectable={checkApproverSelectable(props.mode)}
      />
      <FormRow labelAlignment='center' label={'更新日時'}>{props.updateDt}</FormRow>
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
          name={'comment'}
          customStyle={{
            width: '100%',
          }}
          helperText={props.commentHelperText}
          error={props.commentHelperText !== undefined && props.commentHelperText !== ''}
          maxLength={50}
        />
      </FormRow>
    </Card>
  );
};

// /**
//  * 承認者選択可能かどうかを判定する
//  * @param role ユーザー権限
//  * @param registerStatus 登録ステータス
//  * @param mode 画面モード
//  * @returns 承認者選択可能な場合はtrue、そうでない場合はfalse
//  */
export const checkApproverSelectable = (mode: Mode): boolean => {
  // 編集・表示関連のモードかどうかを判定
  const isEditMode = mode === 'edit';
  const isNewMode = mode === 'new';
  const isRefNewEditMode = mode === 'refNewEdit';
  return isNewMode || isEditMode || isRefNewEditMode;
};
