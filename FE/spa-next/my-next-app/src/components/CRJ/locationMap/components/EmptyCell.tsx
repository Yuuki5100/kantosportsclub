// 空セルコンポーネント - グループ化されたセルとの境界に青い境界線を描画

import { PlaceMapList } from '../types';
import { COLORS } from '../constants';
import { calculateEmptyCellBorders } from '../utils/emptyCellBorderLogic';

type EmptyCellProps = {
  rowIndex: number;
  colIndex: number;
  gridData: (PlaceMapList | null)[][];
};

export const EmptyCell = ({ rowIndex, colIndex, gridData }: EmptyCellProps) => {
  // 境界線スタイルを計算
  const borderStyles = calculateEmptyCellBorders(rowIndex, colIndex, gridData);
  
  return (
    <td 
      key={`${rowIndex}-${colIndex}`} 
      style={{ 
        ...borderStyles,
        backgroundColor: COLORS.EMPTY,
        width: '45px',
        minWidth: '45px',
        maxWidth: '45px',
        height: '45px',
        minHeight: '45px',
        maxHeight: '45px',
        aspectRatio: '1 / 1',
        boxSizing: 'border-box'
      }} 
    />
  );
};