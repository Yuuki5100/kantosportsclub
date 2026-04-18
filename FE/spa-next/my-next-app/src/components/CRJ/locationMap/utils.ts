// LocationMapで使用するユーティリティ関数

import { PlaceMapList, StorageLocationArea, CellPosition } from './types';
import { COLORS, ASCII_A } from './constants';

/**
 * 指定された数のカラムラベル（A, B, C...Z, AA, AB...）を生成（Excel形式）
 */
export const generateColumns = (count: number): string[] => {
  const columns: string[] = [];
  
  for (let i = 0; i < count; i++) {
    let columnName = '';
    let num = i;
    
    do {
      columnName = String.fromCharCode(ASCII_A + (num % 26)) + columnName;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);
    
    columns.push(columnName);
  }
  
  return columns;
};

/**
 * セルの背景色を取得
 */
export const getBackgroundColor = (cell: PlaceMapList | null): string => {
  if (!cell) return COLORS.TRANSPARENT;
  return cell.suspendedFlag ? COLORS.SUSPENDED : COLORS.NORMAL;
};

/**
 * PlaceMapListの配列からStorageLocationAreaの配列を生成
 */
export const generateStorageLocationAreas = (items: PlaceMapList[]): StorageLocationArea[] => {
  const initialAreas: StorageLocationArea[] = [];
  
  items.forEach((item) => {
    if (!item.mapAllocationStartCell || !item.mapAllocationEndCell) return;

    const start = parseCellPosition(item.mapAllocationStartCell);
    const end = parseCellPosition(item.mapAllocationEndCell);
    
    if (start.row < 0 || start.col < 0 || end.row < 0 || end.col < 0) return;

    initialAreas.push({
      minRow: start.row,
      minCol: start.col,
      maxRow: end.row,
      maxCol: end.col,
      storageLocationCd: item.storageLocationCd,
      locationCd: item.locationCd,
    });
  });
  
  return mergeAdjacentAreas(initialAreas);
};

/**
 * セル位置文字列（例: "A1", "AA1"）を行・列インデックスに変換
 */
export const parseCellPosition = (cell: string): CellPosition => {
  if (!cell) return { row: -1, col: -1 };
  
  // 文字列から行番号の部分を見つける
  const match = cell.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: -1, col: -1 };
  
  const colStr = match[1];
  const rowNum = parseInt(match[2], 10);
  
  if (isNaN(rowNum)) return { row: -1, col: -1 };
  
  // Excel形式のカラム文字列を数値に変換
  let colIndex = 0;
  for (let i = 0; i < colStr.length; i++) {
    colIndex = colIndex * 26 + (colStr.charCodeAt(i) - ASCII_A + 1);
  }
  
  return {
    row: rowNum - 1,
    col: colIndex - 1,
  };
};

/**
 * 隣接するエリアをマージ
 */
export const mergeAdjacentAreas = (areas: StorageLocationArea[]): StorageLocationArea[] => {
  // ストレージロケーションコードごとにグループ化
  const areasByLocation: Record<string, StorageLocationArea[]> = {};
  
  areas.forEach((area) => {
    if (!areasByLocation[area.storageLocationCd]) {
      areasByLocation[area.storageLocationCd] = [];
    }
    areasByLocation[area.storageLocationCd].push(area);
  });

  const mergedAreas: StorageLocationArea[] = [];

  // 各ストレージロケーションごとに隣接エリアをマージ
  Object.keys(areasByLocation).forEach((storageLocationCd) => {
    const locationAreas = [...areasByLocation[storageLocationCd]];
    let merged = true;

    while (merged) {
      merged = false;
      
      for (let i = 0; i < locationAreas.length; i++) {
        for (let j = i + 1; j < locationAreas.length; j++) {
          const location = locationAreas[i];
          const nextLocation = locationAreas[j];
          
          if (areAreasAdjacent(location, nextLocation)) {
            // マージして新しいエリアを作成
            locationAreas[i] = {
              minRow: Math.min(location.minRow, nextLocation.minRow),
              minCol: Math.min(location.minCol, nextLocation.minCol),
              maxRow: Math.max(location.maxRow, nextLocation.maxRow),
              maxCol: Math.max(location.maxCol, nextLocation.maxCol),
              storageLocationCd,
              locationCd: location.locationCd,
            };
            
            // マージされた要素を削除
            locationAreas.splice(j, 1);
            merged = true;
            break;
          }
        }
        
        if (merged) break;
      }
    }
    
    mergedAreas.push(...locationAreas);
  });
  
  return mergedAreas;
};

/**
 * 2つのエリアが隣接しているかチェック（より柔軟な隣接判定）
 */
export const areAreasAdjacent = (
  location: StorageLocationArea, 
  nextLocation: StorageLocationArea
): boolean => {
  // 行範囲の重複または隣接をチェック
  const rowOverlap = 
    Math.max(location.minRow, nextLocation.minRow) <= Math.min(location.maxRow, nextLocation.maxRow);
  const rowAdjacent = 
    location.maxRow + 1 === nextLocation.minRow || nextLocation.maxRow + 1 === location.minRow;
  const rowConnected = rowOverlap || rowAdjacent;

  // 列範囲の重複または隣接をチェック
  const colOverlap = 
    Math.max(location.minCol, nextLocation.minCol) <= Math.min(location.maxCol, nextLocation.maxCol);
  const colAdjacent = 
    location.maxCol + 1 === nextLocation.minCol || nextLocation.maxCol + 1 === location.minCol;
  const colConnected = colOverlap || colAdjacent;

  // 横方向の隣接（行が重複/隣接し、列が隣接）
  const horizontallyAdjacent = rowConnected && colAdjacent;
  
  // 縦方向の隣接（列が重複/隣接し、行が隣接）
  const verticallyAdjacent = colConnected && rowAdjacent;
  
  return horizontallyAdjacent || verticallyAdjacent;
};
