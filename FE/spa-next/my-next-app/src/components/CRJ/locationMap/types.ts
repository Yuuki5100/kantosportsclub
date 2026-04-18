/**
 * ストレージロケーションの配置エリアを表現する型
 * 隣接するエリアのマージ処理やグリッド境界線の描画に使用される
 */
export type StorageLocationArea = {
  /** 最小行インデックス（0ベース） */
  minRow: number;
  /** 最小列インデックス（0ベース） */
  minCol: number;
  /** 最大行インデックス（0ベース） */
  maxRow: number;
  /** 最大列インデックス（0ベース） */
  maxCol: number;
  /** 保管場所コード（同一コードのエリアは境界線でグループ化される） */
  storageLocationCd: string;
  /** ロケーションコード（配置の所属先を識別） */
  locationCd: string;
};

/**
 * 配置マップの個別データを表現する型
 * グリッド上の各配置項目の詳細情報を含む
 */
export type PlaceMapList = {
  /** 保管場所コード（ストレージエリアのグループ化に使用） */
  storageLocationCd: string;
  /** 保管場所名（表示用の名称） */
  storageLocationName: string;
  /** 配置コード（個別配置の一意識別子） */
  placementCd: string;
  /** 配置名（グリッドセル内に表示される名称） */
  placementName: string;
  /** 容量（セル内右側に表示される数値、空文字の場合は非表示） */
  capacityQuantity: string;
  /** 一時停止フラグ（trueの場合、セル背景色がグレーに変更） */
  suspendedFlag: boolean;
  /** 配置開始セル（Excel形式、例: "A1", "AA1"） */
  mapAllocationStartCell: string;
  /** 配置終了セル（Excel形式、例: "B2", "AB5"、スパンセルの右下角） */
  mapAllocationEndCell: string;
  /** ロケーションコード（配置の所属先を識別） */
  locationCd: string;
};

/**
 * セル位置を表現する型
 * Excel形式の文字列から変換された数値インデックス
 */
export type CellPosition = {
  /** 行インデックス（0ベース、Excel形式の1から変換） */
  row: number;
  /** 列インデックス（0ベース、Excel形式のAから変換） */
  col: number;
};

/**
 * 選択された配置の情報を表現する型
 * 配置のハイライト表示判定に使用される
 */
export type SelectedPlaceMap = {
  /** 列ID（'storageLocationCd'や'placementCd'などのプロパティ名） */
  columnId: string | number;
  /** 対応する値（選択状態の判定に使用される実際の値） */
  value: string | number | boolean | undefined;
};