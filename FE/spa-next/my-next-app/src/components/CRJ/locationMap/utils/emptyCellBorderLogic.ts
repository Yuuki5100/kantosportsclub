// EmptyCell用の境界線判定ロジック

import { PlaceMapList } from '../types';
import { COLORS } from '../constants';
import { generateColumns } from '../utils';

export interface EmptyCellBorderResult {
  borderTop: string;
  borderRight: string;
  borderBottom: string;
  borderLeft: string;
}

export type AdjacentCell = PlaceMapList | null | 'outside';

/**
 * EmptyCellの全境界線スタイルを計算
 */
export const calculateEmptyCellBorders = (
  rowIndex: number,
  colIndex: number,
  gridData: (PlaceMapList | null)[][]
): EmptyCellBorderResult => {
  const gridHeight = gridData.length;
  const gridWidth = gridData[0]?.length || 0;
  const getAdjacentCell = createGetAdjacentCellForEmpty(gridData, gridHeight, gridWidth);
  
  // 各方向の隣接セルを取得
  const topCell = getAdjacentCell(rowIndex - 1, colIndex);
  const rightCell = getAdjacentCell(rowIndex, colIndex + 1);
  const bottomCell = getAdjacentCell(rowIndex + 1, colIndex);
  const leftCell = getAdjacentCell(rowIndex, colIndex - 1);
  
  return {
    borderTop: calculateEmptyCellBorderStyle(topCell),
    borderRight: calculateEmptyCellBorderStyle(rightCell),
    borderBottom: calculateEmptyCellBorderStyle(bottomCell),
    borderLeft: calculateEmptyCellBorderStyle(leftCell),
  };
};

/**
 * 隣接セルを取得する関数を作成
 */
export const createGetAdjacentCellForEmpty = (
  gridData: (PlaceMapList | null)[][],
  gridHeight: number,
  gridWidth: number
) => {
  return (row: number, col: number): AdjacentCell => {
    // グリッドの外側の場合
    if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) {
      return 'outside';
    }
    
    // マルチセルスパンを考慮して隣接セルを取得
    const cell = gridData[row][col];
    if (!cell) return null;
    
    // 開始セルかどうかを確認
    const columnName = generateColumns(col + 1)[col];
    const isStartCell = cell.mapAllocationStartCell === `${columnName}${row + 1}`;
    
    return isStartCell ? cell : cell;
  };
};

/**
 * 隣接セルがグルーピングを持っているかチェック
 */
export const hasGrouping = (cell: AdjacentCell): boolean => {
  if (cell === null || cell === 'outside') return false;
  return !!(cell.storageLocationCd && cell.storageLocationCd.trim() !== '');
};

/**
 * 単一の境界線スタイルを計算
 */
export const calculateEmptyCellBorderStyle = (adjacentCell: AdjacentCell): string => {
  // 隣接セルが空の場合は従来の黒い境界線
  if (adjacentCell === null || adjacentCell === 'outside') {
    return `1px solid ${COLORS.GRID_BORDER}`;
  }
  
  // セルが存在する場合は常にグループ境界線を表示
  return `3px solid ${COLORS.GROUP_BORDER}`;
};
