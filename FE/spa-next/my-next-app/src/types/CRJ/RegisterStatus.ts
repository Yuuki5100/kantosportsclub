/**
 * 登録ステータス
 *
 * -`new`: 新規
 * -`register`: 申請中
 * -`registerRemoved`: 申請取下
 * -`deleted`: 削除
 * -`reject`: 差戻
 * -`approved`: 承認済
 * -`approveRemoved`: 承認取下
 * -`requestingDeletion`: 削除申請中
 * -`deleteApprove`: 承認済削除
 */
export type RegisterStatus =
  | 'new'
  | 'register'
  | 'registerRemoved'
  | 'deleted'
  | 'reject'
  | 'approved'
  | 'approveRemoved'
  | 'requestingDeletion'
  | 'deleteApprove';
