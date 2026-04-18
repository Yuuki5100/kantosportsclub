export type UserListRequest = {
  /**
   * 拠点
   */
  base: string;
  /**
   * 組織
   */
  org: string;
  /**
   * 氏名
   */
  user: string;
  /**
   * 削除済表示フラグ
   */
  deletedDisplayFlag: string;
  /**
   * ページ番号
   */
  pageNo: number;
  /**
   * ページ毎件数
   */
  pageSize: number;
  /**
   * ソートキー
   */
  sortKey: string;
  /**
   * ソート順
   */
  sortOrder: string;
  /**
   * 拠点完全一致フラグ
   */
  baseExtMatFlag: string;
  /**
   * 組織完全一致フラグ
   */
  orgExtMatFlag: string;
  /**
   * 氏名完全一致フラグ
   */
  userExtMatFlag: string;
};

