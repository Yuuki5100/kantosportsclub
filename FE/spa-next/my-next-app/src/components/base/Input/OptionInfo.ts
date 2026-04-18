/**
 * 選択肢の型定義
 */
export type OptionInfo = {
  /**
   * 選択肢の値
   *
   * @type {string}
   */
  value: string;

  /**
   * 選択肢のラベル
   *
   * @type {string}
   */
  label: string;

  /**
   * 選択肢の無効化
   *
   * @type {boolean}
   */
  disabled?: boolean;
};

/**
 * ドロップダウンの選択肢の状態
 */
export type MultiSelectOption = OptionInfo & {

  /**
   * 選択肢が選択されているかどうか
   *
   * @type {boolean}
   */
  selected?: boolean;
};
