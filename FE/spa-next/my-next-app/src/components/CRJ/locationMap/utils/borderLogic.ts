// 境界線判定ロジック

import { PlaceMapList } from '../types';
import { COLORS } from '../constants';

// 定数の定義
const BORDER_STYLES = {
  THICK: '3px',
  THIN: '1px',
  SOLID: 'solid',
  NONE: 'none'
} as const;

// Direction enum
export enum BorderDirection {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

// セルタイプ判定用の定数
const CELL_TYPE = {
  SAME_STORAGE: 'same_storage',
  DIFFERENT_STORAGE: 'different_storage', 
  PASSAGE: 'passage',
  EMPTY: 'empty'
} as const;

type CellType = typeof CELL_TYPE[keyof typeof CELL_TYPE];

// 隣接セル分析結果
type NeighborAnalysis = {
  hasNonEmptyNeighbor: boolean;
  hasSameStorageNeighbor: boolean;
  hasDifferentStorageNeighbor: boolean;
  hasPassageNeighbor: boolean;
  hasEmptyRowNeighbor?: boolean; // 横方向のみ
  hasEmptyColNeighbor?: boolean; // 縦方向のみ
};

export type BorderResult = {
  borderStyle: string;
  needBorder: boolean;
  hasNonEmptyNeighbor: boolean;
  useGroupBorder: boolean;
};

export type BorderInfo = {
  start: { row: number; col: number };
  end: { row: number; col: number };
  gridHeight: number;
  gridWidth: number;
  isTopEdge: boolean;
  isBottomEdge: boolean;
  isLeftEdge: boolean;
  isRightEdge: boolean;
  hasStorageLocationCode: boolean;
  useGroupBorder: boolean;
};

type GetAdjacentCellFunction = (row: number, col: number) => PlaceMapList | null;

/**
 * GridCellのすべての境界線（上下左右）のスタイルを計算する
 * 
 * この関数は、Excelの結合セルのような複数セルにまたがるGridCellの境界線を決定します。
 * EmptyCellとは異なり、結合セルの各方向で隣接する複数のセルとの関係を分析し、
 * 部分隣接パターン（一部のセルのみが隣接している状態）も考慮します。
 * 
 * @param cell - 境界線を計算する対象のセル（GridCell用のPlaceMapList）
 * @param start - セルの開始位置（左上の座標）
 * @param end - セルの終了位置（右下の座標）
 * @param gridData - グリッド全体のデータ（隣接セルの検索に使用）
 * @returns CSS境界線スタイルのオブジェクト（borderTop, borderBottom, borderLeft, borderRight）
 * 
 * @example
 * // 2x2のセルA1:B2の境界線を計算
 * const borders = calculateAllBorders(
 *   cellData,
 *   { row: 0, col: 0 },
 *   { row: 1, col: 1 },
 *   gridData
 * );
 * // returns: { borderTop: "3px solid rgb(148, 220, 248)", ... }
 */
export const calculateAllBorders = (
  cell: PlaceMapList,
  start: { row: number; col: number },
  end: { row: number; col: number },
  gridData: (PlaceMapList | null)[][]
): Record<string, string> => {
  const borderInfo = calculateBorderInfo(cell, start, end, gridData);
  const getAdjacentCell = createGetAdjacentCell(gridData);

  const topBorder = calculateBorder(cell, borderInfo, getAdjacentCell, BorderDirection.TOP);
  const bottomBorder = calculateBorder(cell, borderInfo, getAdjacentCell, BorderDirection.BOTTOM);
  const leftBorder = calculateBorder(cell, borderInfo, getAdjacentCell, BorderDirection.LEFT);
  const rightBorder = calculateBorder(cell, borderInfo, getAdjacentCell, BorderDirection.RIGHT);

  return {
    borderTop: topBorder.borderStyle,
    borderBottom: bottomBorder.borderStyle,
    borderLeft: leftBorder.borderStyle,
    borderRight: rightBorder.borderStyle,
  };
};

/**
 * グリッドデータから隣接セルを安全に取得する関数を作成
 * 
 * グリッドの境界チェックを行い、範囲外アクセス時はnullを返す
 * クロージャを使用してgridDataへの参照を保持し、
 * 各境界線計算で再利用可能な関数を提供します。
 * 
 * @param gridData - 2次元配列のグリッドデータ
 * @returns 座標を指定して隣接セルを取得する関数
 * 
 * @example
 * const getAdjacentCell = createGetAdjacentCell(gridData);
 * const topNeighbor = getAdjacentCell(row - 1, col); // 上のセル
 */
export const createGetAdjacentCell = (
  gridData: (PlaceMapList | null)[][]
): GetAdjacentCellFunction => {
  return (row: number, col: number) => {
    if (row < 0 || row >= gridData.length || col < 0 || col >= gridData[0].length) {
      return null;
    }
    return gridData[row][col];
  };
};

/**
 * セルの境界線計算に必要な基本情報を集約
 * 
 * セルの位置、グリッドのサイズ、エッジ判定、セルタイプなど
 * 境界線計算で共通して使用される情報をBorderInfoオブジェクトとして構築します。
 * 
 * @param cell - 対象セルのデータ
 * @param start - セルの開始位置
 * @param end - セルの終了位置  
 * @param gridData - グリッド全体のデータ
 * @returns 境界線計算用の情報オブジェクト
 * 
 * 判定される内容:
 * - グリッドのエッジ位置かどうか（上下左右）
 * - 保管場所コードの有無（グルーピングありセルかどうか）
 * - グループ境界線の使用設定
 */
export const calculateBorderInfo = (
  cell: PlaceMapList,
  start: { row: number; col: number },
  end: { row: number; col: number },
  gridData: (PlaceMapList | null)[][]
): BorderInfo => {
  const gridHeight = gridData.length;
  const gridWidth = gridData[0]?.length || 0;
  const isTopEdge = start.row === 0;
  const isBottomEdge = end.row >= gridHeight - 1;
  const isLeftEdge = start.col === 0;
  const isRightEdge = end.col >= gridWidth - 1;

  const hasStorageLocationCode = !!(
    cell?.storageLocationCd && cell.storageLocationCd.trim() !== ''
  );
  // グルーピングが未設定でもグルーピング境界線を引く
  const useGroupBorder = true;

  return {
    start,
    end,
    gridHeight,
    gridWidth,
    isTopEdge,
    isBottomEdge,
    isLeftEdge,
    isRightEdge,
    hasStorageLocationCode,
    useGroupBorder,
  };
};
  
/**
 * 指定された方向の境界線スタイルを計算する統合関数
 * 
 * この関数は上下左右すべての方向の境界線計算を統一的に処理します。
 * 結合セル（GridCell）の複雑な境界線ルールを実装しており、以下を考慮します：
 * 
 * 処理フロー:
 * 1. 方向固有パラメータの計算（エッジ判定、隣接セル位置など）
 * 2. エッジでない場合の隣接セル分析
 * 3. 境界線の必要性とスタイル（青/黒）の決定
 * 4. 部分隣接パターンの特別処理
 * 5. 最終的なCSS境界線スタイルの生成
 * 
 * @param cell - 境界線を計算する対象セル
 * @param borderInfo - セルの位置やグリッド情報
 * @param getAdjacentCell - 隣接セル取得関数
 * @param direction - 境界線の方向（TOP/BOTTOM/LEFT/RIGHT）
 * @returns 境界線の計算結果（スタイル、必要性、隣接情報など）
 * 
 * 境界線の種類:
 * - 青い太線（3px）: グループ境界線（異なる保管場所間、通路セル）
 * - 黒い細線（1px）: 標準境界線（同一グループ内、部分隣接時）
 * - なし: 同一保管場所のグルーピングありセル間
 */
export const calculateBorder = (
  cell: PlaceMapList,
  borderInfo: BorderInfo,
  getAdjacentCell: GetAdjacentCellFunction,
  direction: BorderDirection
): BorderResult => {
  const isVertical = direction === BorderDirection.TOP || direction === BorderDirection.BOTTOM;
  
  // 方向固有のパラメータを計算
  let isEdge: boolean;
  let offset: number;
  let basePosition: number;
  
  if (isVertical) {
    isEdge = direction === BorderDirection.TOP ? borderInfo.isTopEdge : borderInfo.isBottomEdge;
    offset = direction === BorderDirection.TOP ? -1 : 1;
    basePosition = direction === BorderDirection.TOP ? borderInfo.start.row : borderInfo.end.row;
  } else {
    isEdge = direction === BorderDirection.LEFT ? borderInfo.isLeftEdge : borderInfo.isRightEdge;
    offset = direction === BorderDirection.LEFT ? -1 : 1;
    basePosition = direction === BorderDirection.LEFT ? borderInfo.start.col : borderInfo.end.col;
  }

  let hasNonEmptyNeighbor = false;
  let needBorder = isEdge;
  let useGroupBorder = borderInfo.useGroupBorder;

  if (!isEdge) {
    const analysis = analyzeNeighbors(cell, borderInfo, getAdjacentCell, basePosition, offset, isVertical);
    
    hasNonEmptyNeighbor = analysis.hasNonEmptyNeighbor;
    
    const borderDecision = determineBorderNeed(analysis, borderInfo, isEdge);
    needBorder = borderDecision.needBorder;
    useGroupBorder = borderDecision.useGroupBorder;
    
    // 部分隣接パターン用の特別処理
    useGroupBorder = applySpecialRules(analysis, borderInfo, useGroupBorder, isVertical);
  }

  const borderStyle = determineBorderStyle(
    hasNonEmptyNeighbor,
    isEdge,
    needBorder,
    useGroupBorder,
    borderInfo.hasStorageLocationCode
  );

  return {
    borderStyle,
    needBorder,
    hasNonEmptyNeighbor,
    useGroupBorder,
  };
};

/**
 * 指定方向の隣接セルを分析して境界線判定に必要な情報を収集
 * 
 * 結合セル（GridCell）の特定方向にある隣接セルをすべて調査し、
 * 境界線の種類や必要性を判定するための分析結果を返します。
 * 
 * 分析内容:
 * - 隣接セルの有無と種類（同一保管場所/異なる保管場所/通路セル）
 * - 部分隣接パターンの検出（一部の行/列のみに隣接セルがある状態）
 * 
 * @param cell - 分析対象のセル
 * @param borderInfo - セルの位置情報
 * @param getAdjacentCell - 隣接セル取得関数
 * @param basePosition - 境界線の基準位置（行または列のインデックス）
 * @param offset - 隣接方向のオフセット（-1: 上/左, +1: 下/右）
 * @param isVertical - 縦方向の境界線かどうか（true: 上下, false: 左右）
 * @returns 隣接セルの分析結果
 * 
 * 座標計算の違い:
 * - 縦方向（上下境界線）: セルの列範囲をループして (basePosition + offset, i) で隣接セル取得
 * - 横方向（左右境界線）: セルの行範囲をループして (i, basePosition + offset) で隣接セル取得
 * 
 * 部分隣接の検出:
 * - hasEmptyColNeighbor: 縦方向で一部の列に隣接セルがない
 * - hasEmptyRowNeighbor: 横方向で一部の行に隣接セルがない
 */
const analyzeNeighbors = (
  cell: PlaceMapList,
  borderInfo: BorderInfo,
  getAdjacentCell: GetAdjacentCellFunction,
  basePosition: number,
  offset: number,
  isVertical: boolean
): NeighborAnalysis => {
  let hasNonEmptyNeighbor = false;
  let hasSameStorageNeighbor = false;
  let hasDifferentStorageNeighbor = false;
  let hasPassageNeighbor = false;
  let hasEmptyRowNeighbor = false;
  let hasEmptyColNeighbor = false;

  // ループ範囲と座標計算を統一
  const startIndex = isVertical ? borderInfo.start.col : borderInfo.start.row;
  const endIndex = isVertical ? borderInfo.end.col : borderInfo.end.row;
  
  for (let i = startIndex; i <= endIndex; i++) {
    // getAdjacentCellの呼び出し方のみが異なる
    const neighbor = isVertical 
      ? getAdjacentCell(basePosition + offset, i)  // 縦方向: (row, col)
      : getAdjacentCell(i, basePosition + offset); // 横方向: (row, col)
    
    if (neighbor) {
      hasNonEmptyNeighbor = true;
      const cellType = determineCellType(cell, neighbor);
      
      switch (cellType) {
        case CELL_TYPE.SAME_STORAGE:
          hasSameStorageNeighbor = true;
          break;
        case CELL_TYPE.PASSAGE:
          hasPassageNeighbor = true;
          break;
        case CELL_TYPE.DIFFERENT_STORAGE:
          hasDifferentStorageNeighbor = true;
          break;
      }
    } else {
      // 隣接セルがない場合の処理も統一
      if (isVertical) {
        hasEmptyColNeighbor = true;
      } else {
        hasEmptyRowNeighbor = true;
      }
    }
  }

  return {
    hasNonEmptyNeighbor,
    hasSameStorageNeighbor,
    hasDifferentStorageNeighbor,
    hasPassageNeighbor,
    hasEmptyRowNeighbor,
    hasEmptyColNeighbor
  };
};


/**
 * 隣接セル分析結果から境界線の必要性とスタイル（青/黒）を決定
 * 
 * CRJシステムの境界線表示ルールに基づいて判定を行います：
 * 
 * 優先度順の判定ルール:
 * 1. 同一保管場所のグルーピングありセル同士 → 境界線なし
 * 2. 通路セル同士 → 青い境界線
 * 3. 異なる保管場所または通路セルとの境界 → 青い境界線
 * 4. 隣接セルがない通路セル → 青い境界線（エッジでない場合）
 * 5. その他 → 条件に応じて決定
 * 
 * @param analysis - 隣接セルの分析結果
 * @param borderInfo - セルの基本情報（保管場所コード等）
 * @param isEdge - グリッドのエッジかどうか
 * @returns 境界線の必要性とグループ境界線使用可否
 * 
 * 境界線の種類:
 * - useGroupBorder: true → 青い太線（3px）を使用
 * - useGroupBorder: false → 黒い細線（1px）を使用
 * - needBorder: false → 境界線なし
 */
const determineBorderNeed = (
  analysis: NeighborAnalysis,
  borderInfo: BorderInfo,
  isEdge: boolean
): { needBorder: boolean; useGroupBorder: boolean } => {
  let needBorder = isEdge;
  let useGroupBorder = borderInfo.useGroupBorder;

  if (!isEdge) {
    const { hasSameStorageNeighbor, hasDifferentStorageNeighbor, hasPassageNeighbor, hasNonEmptyNeighbor } = analysis;

    // 境界線の必要性を判定（優先度順）
    if (hasSameStorageNeighbor && borderInfo.useGroupBorder) {
      // 1. 同一保管場所のグルーピングありセル同士は境界線なし
      needBorder = false;
      useGroupBorder = false;
    } else if (hasPassageNeighbor && !borderInfo.useGroupBorder) {
      // 2. 通路セル同士は青い境界線
      needBorder = true;
      useGroupBorder = true;
    } else if (hasDifferentStorageNeighbor || hasPassageNeighbor) {
      // 3. 異なる保管場所または通路セルとの境界は青い境界線
      needBorder = true;
      const neighborHasGrouping = hasDifferentStorageNeighbor;

      if (!borderInfo.useGroupBorder) {
        // 通路セルは隣接セルがあれば青い境界線
        useGroupBorder = true;
      } else if (!neighborHasGrouping) {
        // グルーピングありセルが通路セルに隣接する場合も青い境界線
        useGroupBorder = true;
      }
    }

    // 通路セルの場合、隣接セルがなくてもエッジでなければ境界線を表示
    if (!hasNonEmptyNeighbor) {
      if (!borderInfo.hasStorageLocationCode && !isEdge) {
        // 通路セルで隣接セルがなく、エッジでもない場合は境界線表示
        needBorder = true;
        // 通路セルはデフォルトで青い境界線を使用
        useGroupBorder = true;
      } else {
        needBorder = false;
      }
    }
  }

  return { needBorder, useGroupBorder };
};

/**
 * 部分隣接パターンでの特別な境界線処理
 * 
 * 結合セル（GridCell）特有の部分隣接パターンを検出し、
 * 通路セルで一部の行/列のみに隣接セルがある場合の境界線スタイルを調整します。
 * 
 * 特別処理のケース:
 * - 通路セル（保管場所コードなし）で部分隣接かつ一部に隣接セルがある場合
 * - この条件下では青い境界線ではなく黒い境界線を使用
 * 
 * 例：3x1の通路セルで真ん中の列のみに隣接セルがある場合
 * A1-C1のセルで、B1のみに下隣接セルがある → 下境界線は黒になる
 * 
 * @param analysis - 隣接セルの分析結果
 * @param borderInfo - セルの基本情報
 * @param useGroupBorder - 現在のグループ境界線使用設定
 * @param isVertical - 縦方向の境界線かどうか
 * @returns 調整後のグループ境界線使用可否
 * 
 * 判定条件:
 * - 通路セル（!borderInfo.useGroupBorder）
 * - 部分隣接（hasEmptyColNeighbor または hasEmptyRowNeighbor）
 * - 隣接セルあり（hasNonEmptyNeighbor）
 */
const applySpecialRules = (
  analysis: NeighborAnalysis,
  borderInfo: BorderInfo,
  useGroupBorder: boolean,
  isVertical: boolean
): boolean => {
  const { hasEmptyRowNeighbor, hasEmptyColNeighbor, hasNonEmptyNeighbor } = analysis;
  
  // 通路セルで一部の行/列に隣接セルがない場合は黒い境界線
  const hasPartialEmpty = isVertical ? hasEmptyColNeighbor : hasEmptyRowNeighbor;
  
  if (!borderInfo.useGroupBorder && hasPartialEmpty && hasNonEmptyNeighbor) {
    return false; // 黒い境界線を使用
  }
  
  return useGroupBorder;
};

/**
 * 現在のセルと隣接セルの関係からセルタイプを判定
 * 
 * 境界線の種類を決定するために、セル間の関係を分類します：
 * 
 * @param cell - 境界線を計算する対象セル
 * @param targetCell - 隣接セル
 * @returns セル間の関係タイプ
 * 
 * 判定ルール:
 * - PASSAGE: 隣接セルに保管場所コードがない（通路セル）
 * - SAME_STORAGE: 同じ保管場所コードを持つ（同一グループ）
 * - DIFFERENT_STORAGE: 異なる保管場所コードを持つ（異なるグループ）
 */
const determineCellType = (cell: PlaceMapList, targetCell: PlaceMapList): CellType => {
  if (!targetCell.storageLocationCd || targetCell.storageLocationCd.trim() === '') {
    return CELL_TYPE.PASSAGE;
  }
  
  if (targetCell.storageLocationCd === cell.storageLocationCd && 
      targetCell.storageLocationCd.trim() !== '') {
    return CELL_TYPE.SAME_STORAGE;
  }
  
  return CELL_TYPE.DIFFERENT_STORAGE;
};

/**
 * 最終的なCSS境界線スタイル文字列を生成
 * 
 * 境界線の必要性とスタイル設定から、実際のCSSプロパティ値を生成します。
 * 
 * @param hasNonEmptyNeighbor - 隣接セルが存在するか
 * @param isEdge - グリッドのエッジ位置か
 * @param needBorder - 境界線が必要か
 * @param useGroupBorder - グループ境界線（青い太線）を使用するか
 * @param hasStorageLocationCode - 保管場所コードを持つか（グルーピングありセル）
 * @returns CSS境界線スタイル文字列
 * 
 * 生成される境界線スタイル:
 * - グループ境界線: "3px solid rgb(148, 220, 248)" （青い太線）
 * - 標準境界線: "1px solid #050505" （黒い細線）
 * - 境界線なし: "none"
 * 
 * 特別な処理:
 * - 隣接セルがなくエッジでもない場合の通路セル処理
 * - グルーピングありセルの境界線なし処理
 */
const determineBorderStyle = (
  hasNonEmptyNeighbor: boolean,
  isEdge: boolean,
  needBorder: boolean,
  useGroupBorder: boolean,
  hasStorageLocationCode: boolean
): string => {
  if (!hasNonEmptyNeighbor && !isEdge) {
    // 隣接セルがない場合
    if (!hasStorageLocationCode) {
      // 通路セルの場合、useGroupBorderに従って境界線を決定
      if (needBorder) {
        return useGroupBorder ? `${BORDER_STYLES.THICK} ${BORDER_STYLES.SOLID} ${COLORS.GROUP_BORDER}` : `${BORDER_STYLES.THIN} ${BORDER_STYLES.SOLID} ${COLORS.BORDER}`;
      } else {
        return `${BORDER_STYLES.THIN} ${BORDER_STYLES.SOLID} ${COLORS.BORDER}`;
      }
    } else {
      // グルーピングありセルは境界線なし
      return BORDER_STYLES.NONE;
    }
  } else if (needBorder || isEdge) {
    if (useGroupBorder) {
      return `${BORDER_STYLES.THICK} ${BORDER_STYLES.SOLID} ${COLORS.GROUP_BORDER}`;
    } else {
      return `${BORDER_STYLES.THIN} ${BORDER_STYLES.SOLID} ${COLORS.BORDER}`;
    }
  } else {
    return `${BORDER_STYLES.THIN} ${BORDER_STYLES.SOLID} ${COLORS.BORDER}`;
  }
};
