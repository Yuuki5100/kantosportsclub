import React, { useEffect, useState } from 'react';
import { Box, Divider, Paper } from '@/components/base';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import { Role } from '@/types/CRJ/Role';
import { RegisterStatus } from '@/types/CRJ/RegisterStatus';
import { Mode } from '@/types/CRJ/Mode';
import { ApproveInfoArea } from '@/components/CRJ/ApproveInfoArea';
import { CommonInfoArea } from '@/components/CRJ/CommonInfoArea';
import { CommonInfo } from '@/types/CRJ/CommonInfo';
import { ButtonArea } from '@/components/CRJ/ButtonArea';
import { ApplicableInfoArea } from '@/components/CRJ/ApplicableInfoArea';
import { Dayjs } from 'dayjs';
import { CRJApiResponse } from '@/types/CRJ/CRJApiResponse';
import { ApproverListResponse } from '@/types/CRJ/ApproverResponse';
import { getApprovers } from '@/api/services/v1/crj/common/approversService';
import { getMessage, MessageCodes } from '@/message';

/**
 * 詳細画面のコンテナコンポーネントのプロパティ
 * role: ユーザーの権限区分
 * registerStatus: レコードの登録ステータス
 */
export type DetailContainerProps = CommonInfo & {
  /**
   * 選択中の承認者ID
   * 登録・編集モードのときだけ使用
   */
  selectedApproverId?: string;
  setSelectedApproverId?: (value: string) => void;

  /**
   * 承認情報の承認者エラーメッセージ
   */
  approverErrorMessage?: string;

  /**
   * 適用期間内かどうか
   * true: 適用期間内
   * false: 適用期間外
   * undefined: 新規画面
   */
  applicablePeriod?: boolean;

  /**
   * ユーザーの権限区分
   * none: なし
   * view: 参照
   * update: 更新
   * approve: 承認
   *
   * @type {Role}
   */
  role: Role;

  /**
   * トラン
   */
  isTran?: boolean;

  /**
   * @description 登録ステータス
   *
   * 1: 申請中
   * 2: 申請取下
   * 3: 削除
   * 4: 差戻
   * 5: 承認済
   * 6: 削除申請中
   * 7: 承認済削除
   *
   * @type {RegisterStatus}
   */
  registerStatus: RegisterStatus;

  /**
   * @description 画面のモード
   * - `new`: 新規
   * - `view`: 照会
   * - `edit`: 編集
   * - `applicableEdit`: 適用期間編集
   * - `refNewEdit`: 参照新規登録
   */
  mode: Mode;

  /**
   * 承認者のときに使用
   * 承認が自身に割り当てられているかどうかで活性非活性の制御を行うときに使用する
   */
  assignedToMe?: boolean;

  /**
   * 表示するコンポーネント
   */
  children?: React.ReactNode;

  /**
   * 承認情報更新日時
   */
  approveUpdateAt?: string;

  /**
   * コメント
   */
  approveComment?: string;

  /**
   * コメントの変更用関数
   * @param comment
   * @returns
   */
  setApproveComment?: (comment: string) => void;

  commentHelperText?: string;

  /**
   * 差戻ボタンがクリックされたときのコールバック
   */
  onRejectClick?: () => void;

  /**
   * 編集ボタンがクリックされたときのコールバック
   */
  onEditClick?: () => void;

  /**
   * 承認ボタンがクリックされたときのコールバック
   *
   */
  onApproveClick?: () => void;

  /**
   * 戻るボタンがクリックされたときのコールバック
   *
   */
  onBackClick?: () => void;

  /**
   * 参照新規登録ボタンがクリックされたときのコールバック
   * @returns
   */
  onRefNewClick?: () => void;

  /**
   * 削除ボタンがクリックされたときのコールバック
   * @returns
   */
  onDeleteClick?: () => void;

  /**
   * 申請ボタンがクリックされたときのコールバック
   * @returns
   */
  onRegisterClick?: () => void;

  /**
   * 申請取下ボタンがクリックされたときのコールバック
   * @returns
   */
  onRegisterRemoveClick?: () => void;

  /**
   * 承認取消ボタンがクリックされたときのコールバック
   * @returns
   */
  onApproveRemoveClick?: () => void;

  /**
   * 削除理由set用関数
   * @param value
   */
  setDeleteReason?: (value: string) => void;

  /**
   * @description カスタムボタンエリア
   *
   */
  customButtonArea?: React.ReactNode;

  deleteInfoVisible?: boolean;

  /**
   * メニューID
   * 承認者一覧を取得するために使用
   */
  menuId: string;

  /**
   * 適用情報のID
   */
  applicableId?: string;

  applicableRegisterStatus?: RegisterStatus | null;

  applicableEndDate?: Dayjs;
  /**
   * 適用終了日のset用関数
   * @param newValue
   * @returns
   */
  setApplicableEndDate?: (newValue: Dayjs | undefined) => void;

  /**
   * 適用情報の表示非表示
   */
  applicableInfoHidden: boolean;

  /**
   * 適用終了日情報の削除フラグ
   */
  applicableDeleteFlg?: boolean;

  /**
   * 適用終了日情報削除理由
   */
  applicableDeleteReason?: string;

  /**
   * 適用終了日情報削除理由のset用関数
   */
  setApplicableDeleteReason?: (newValue: string) => void;

  /**
   * 適用終了日情報作成日時
   */
  applicableCreatedAt?: string;
  /**
   * 適用終了日情報作成者
   */
  applicableCreatedBy?: string;

  /**
   * 適用終了日情報更新日時
   */
  applicableUpdatedAt?: string;

  /**
   * 適用終了日情報更新者
   */
  applicableUpdatedBy?: string;

  /**
   * 適用終了日情報の選択中の承認者ID
   */
  applicableSelectedApproverId?: string;

  /**
   * 適用終了日情報の選択中の承認者IDのset用関数
   */
  setApplicableSelectedApproverId?: (newValue: string) => void;

  /**
   * 適用終了日情報の承認者エラーメッセージ
   */
  applicableApproverErrorMessage?: string;

  /**
   * 適用終了日の承認者が自分に割り当てられているかどうか
   */
  applicableAssignedToMe?: boolean;

  /**
   * 適用終了日情報の登録ステップ更新日時
   */
  registerStepUpdatedAt?: string;

  /**
   * 適用終了日情報のコメント
   */
  applicableComment?: string;

  /**
   * 適用終了日情報のコメントのset用関数
   */
  setApplicableComment?: (newValue: string) => void;

  /**
   * 適用終了日情報の編集ボタンクリック時のコールバック
   */
  onApplicableEditClick?: () => void;

  /**
   * 適用終了日情報の申請取下ボタンクリック時のコールバック
   */
  onApplicableRegisterRemoveClick?: () => void;

  /**
   * 適用終了日情報の削除ボタンクリック時のコールバック
   */
  onApplicableDeleteClick?: () => void;

  /**
   * 適用終了日情報の登録ボタンクリック時のコールバック
   */
  onApplicableRegisterClick?: () => void;

  /**
   * 適用終了日情報の差戻ボタンクリック時のコールバック
   */
  onApplicableRejectClick?: () => void;

  /**
   * 適用終了日情報の承認ボタンクリック時のコールバック
   */
  onApplicableApproveClick?: () => void;

  /**
   * エラー発生時のコールバック
   */
  onError?: (message: string) => void;

  /**
   * 承認済編集可フラグ
   * 該当レコードが承認済み、削除済み、承認済削除以外のレコードがない場合はtrue
   */
  isOnlyApprovedOrDeleted?: boolean;

  /**
   * ログイン中のユーザー情報
   * 自己承認防止のために使用
   */
  loginUser: OptionInfo;

  /**
  * 画面は参照モードでのみ使用できます。
  */
  isOnlyViewMode?: boolean;

  haveApplicablePeriod?: boolean;
};

/**
 * 詳細コンテナコンポーネント
 * ユーザーの権限とレコードの登録ステータスに応じて適切なUIを表示する
 */
const DetailContainer: React.FC<DetailContainerProps> = (props) => {
  const [approvers, setApprovers] = useState<OptionInfo[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { menuId, onError } = props;

  useEffect(() => {
    (async () => {
      const response: CRJApiResponse<ApproverListResponse> = await getApprovers(menuId);
      try {
        if (response.result === 'Failed' || response.data === null) {
          throw new Error(
            getMessage(MessageCodes.FETCH_FAILED_WITH_REASON, '承認者', response.message)
          );
        }
        setApprovers(
          [...response.data.approverList.map((approver) => ({
            value: approver.userId,
            label: approver.userName,
          })), {
            value: '',
            label: ''
          }]
        );
      } catch (error) {
        if (error instanceof Error) {
          props.onError?.(error.message);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
      }}
    >
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          <ButtonArea
            mode={props.mode}
            role={props.role}
            registerStatus={props.registerStatus}
            assignedToMe={props.assignedToMe}
            onBackClick={props.onBackClick}
            onRefNewClick={props.onRefNewClick}
            onDeleteClick={props.onDeleteClick}
            onEditClick={props.onEditClick}
            onApproveClick={props.onApproveClick}
            onRejectClick={props.onRejectClick}
            onRegisterClick={props.onRegisterClick}
            haveApplicablePeriod={props.applicablePeriod}
            onRegisterRemoveClick={props.onRegisterRemoveClick}
            onApproveRemoveClick={props.onApproveRemoveClick}
            isTran={props.isTran ?? false}
            isOnlyApprovedOrDeleted={props.isOnlyApprovedOrDeleted}
            applicableRegisterStatus={props.applicableRegisterStatus}
            // isOnlyViewMode={props.isOnlyViewMode}
          >
            {props.customButtonArea}
          </ButtonArea>
        </Box>
      </Box>
      <br />
      <Divider sx={{ mb: 3 }} />

      {/* コンテンツ領域 */}
      {/* コンポーネントの幅を均一にするためのコンテナ */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '900px', // 最大幅を設定
          mx: 'auto', // 左右中央揃え
          width: '100%', // 親要素の幅を基準に
        }}
      >
        {/* コンテンツ領域 */}
        <Box sx={{ mb: 3, width: '100%' }}>{props.children}</Box>
        <CommonInfoArea
          id={props.id}
          role={props.role}
          registerStatus={props.registerStatus}
          assignedToMe={props.assignedToMe}
          isTran={props.isTran ?? false}
          mode={props.mode}
          deleteFlg={props.deleteFlg}
          deleteReason={props.deleteReason}
          setDeleteReason={props.setDeleteReason}
          createdAt={props.createdAt}
          createdBy={props.createdBy}
          updatedAt={props.updatedAt}
          updatedBy={props.updatedBy}
          deleteInfoVisible={props.deleteInfoVisible ?? true}
        />
        <Box sx={{ my: 2 }} /> {/* brの代わりにマージンを使用 */}
        <ApproveInfoArea
          mode={props.mode}
          selectedApproverId={props.selectedApproverId}
          role={props.role}
          isTran={props.isTran ?? false}
          registerStatus={props.registerStatus}
          applicablePeriod={props.applicablePeriod}
          approvers={approvers}
          setSelectedApproverId={props.setSelectedApproverId}
          comment={props.approveComment}
          setComment={props.setApproveComment}
          updateDt={props.approveUpdateAt}
          commentHelperText={props.commentHelperText}
          assignedToMe={props.assignedToMe}
          approverName={getCurrentApproverName(props.assignedToMe, props.selectedApproverId, approvers, props.loginUser?.label)}
          approverErrorMessage={props.approverErrorMessage}
        />
        <Box sx={{ my: 2 }} /> {/* brの代わりにマージンを使用 */}
        <ApplicableInfoArea
          id={props.applicableId}
          hidden={props.applicableInfoHidden}
          haveApplicablePeriod={props.haveApplicablePeriod}
          applicableEndDate={props.applicableEndDate}
          setApplicableEndDate={props.setApplicableEndDate}
          registerStatus={props.applicableRegisterStatus}
          role={props.role}
          mode={props.mode}
          deleteFlg={props.applicableDeleteFlg}
          deleteReason={props.applicableDeleteReason}
          setDeleteReason={props.setApplicableDeleteReason}
          createdAt={props.applicableCreatedAt}
          createdBy={props.applicableCreatedBy}
          updatedAt={props.applicableUpdatedAt}
          updatedBy={props.applicableUpdatedBy}
          selectedApproverId={props.applicableSelectedApproverId}
          setSelectedApproverId={props.setApplicableSelectedApproverId}
          registerStepUpdatedAt={props.registerStepUpdatedAt}
          comment={props.applicableComment}
          setComment={props.setApplicableComment}
          assignedToMe={props.applicableAssignedToMe}
          onEditClick={props.onApplicableEditClick}
          onRegisterRemoveClick={props.onApplicableRegisterRemoveClick}
          onDeleteClick={props.onApplicableDeleteClick}
          onRegisterClick={props.onApplicableRegisterClick}
          onRejectClick={props.onApplicableRejectClick}
          onApproveClick={props.onApplicableApproveClick}
          approvers={approvers}
          isOnlyApprovedOrDeleted={props.isOnlyApprovedOrDeleted}
          isTran={props.isTran ?? false}
          approverErrorMessage={props.applicableApproverErrorMessage}
        />
      </Box>
    </Paper>
  );
};

/**
 * 現在の承認者名を取得する
 * 承認者が自分に割り当てられている場合の表示名を決定する
 */
const getCurrentApproverName = (
  assignedToMe?: boolean,
  selectedApproverId?: string,
  approvers: OptionInfo[] = [],
  loginUserName?: string
): string | undefined => {
  if (!assignedToMe || !selectedApproverId) {
    return undefined;
  }

  // 既存の承認者リストから名前を検索
  const currentApprover = approvers.find(approver => approver.value === selectedApproverId);
  return currentApprover ? currentApprover.label : loginUserName;
};

export default DetailContainer;
