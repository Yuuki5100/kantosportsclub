import { useMemo } from 'react';
import { PlaceMapList } from './types';
import { parseCellPosition } from './utils';

/**
 * グリッドデータを生成する純粋関数
 * @param data PlaceMapListの配列
 * @param rowLength 行数
 * @param columnLength 列数
 * @returns グリッドデータ（2次元配列）
 */
export const generateLocationGrid = (
  data: PlaceMapList[],
  rowLength: number,
  columnLength: number
): (PlaceMapList | null)[][] => {
  // グリッド初期化
  const gridData: (PlaceMapList | null)[][] = Array.from(
    { length: rowLength },
    () => Array(columnLength).fill(null)
  );

  // データをグリッドに配置
  data.forEach((item) => {
    if (!item.mapAllocationStartCell || !item.mapAllocationEndCell) return;

    const start = parseCellPosition(item.mapAllocationStartCell);
    const end = parseCellPosition(item.mapAllocationEndCell);
    
    // 有効性チェック
    if (start.row < 0 || start.col < 0 || end.row < 0 || end.col < 0) return;
    if (start.row >= rowLength || start.col >= columnLength) return;
    if (end.row >= rowLength || end.col >= columnLength) return;
    if (start.row > end.row || start.col > end.col) return;

    // 指定範囲の全セルにアイテムを配置
    for (let row = start.row; row <= end.row; row++) {
      for (let col = start.col; col <= end.col; col++) {
        gridData[row][col] = item;
      }
    }
  });

  return gridData;
};

/**
 * グリッドデータを生成するカスタムフック
 * generateLocationGridをuseMemoでラップしてパフォーマンスを最適化
 * @param data PlaceMapListの配列
 * @param rowLength 行数
 * @param columnLength 列数
 * @returns グリッドデータ（2次元配列）
 */
export const useLocationGrid = (
  data: PlaceMapList[],
  rowLength: number,
  columnLength: number
): (PlaceMapList | null)[][] => {
  return useMemo(
    () => generateLocationGrid(data, rowLength, columnLength),
    [data, rowLength, columnLength]
  );
};