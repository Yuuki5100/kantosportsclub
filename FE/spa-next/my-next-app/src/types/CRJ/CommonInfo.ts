import { RegisterStatus } from '@/types/CRJ/RegisterStatus';

export type CommonInfo = {
  /**
   * ID
   */
  id: string;
  /**
   * 登録ステータス
   *
   * 実装の都合で新規登録時用にnewを用意
   *
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
   * 削除フラグ
   */
  deleteFlg?: boolean;
  /**
   * 削除理由
   */
  deleteReason?: string;
  /**
   * 作成日時
   */
  createdAt: string;
  /**
   * 作成者
   */
  createdBy: string;
  /**
   * 更新日時
   */
  updatedAt: string;
  /**
   * 更新者
   */
  updatedBy: string;
};
