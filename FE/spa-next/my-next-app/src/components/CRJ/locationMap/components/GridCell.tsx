// グリッドの個別セルコンポーネント

import { PlaceMapList, SelectedPlaceMap } from '../types';
import { parseCellPosition, getBackgroundColor, generateColumns } from '../utils';
import { COLORS } from '../constants';
import { EmptyCell } from './EmptyCell';
import { calculateAllBorders } from '../utils/borderLogic';
import TooltipWrapper from '@/components/base/utils/TooltipWrapper';

type GridCellProps = {
  cell: PlaceMapList | null;
  rowIndex: number;
  colIndex: number;
  selectedPlaceMap: SelectedPlaceMap[];
  gridData: (PlaceMapList | null)[][];
};


export const GridCell = ({
  cell,
  rowIndex,
  colIndex,
  selectedPlaceMap,
  gridData
}: GridCellProps) => {
  if (!cell) {
    return <EmptyCell rowIndex={rowIndex} colIndex={colIndex} gridData={gridData} />;
  }

  // 開始セルかどうかをチェック（Excel形式のカラム名に対応）
  const columnName = generateColumns(colIndex + 1)[colIndex];
  const isStartCell = cell.mapAllocationStartCell ===
    `${columnName}${rowIndex + 1}`;

  if (!isStartCell) return null;

  // セルの範囲を計算
  const start = parseCellPosition(cell.mapAllocationStartCell);
  const end = parseCellPosition(cell.mapAllocationEndCell);
  const rowSpan = end.row - start.row + 1;
  const colSpan = end.col - start.col + 1;

  // 選択状態をチェック
  const storageLocationCd = selectedPlaceMap?.find(
    (placeMap) => placeMap.columnId === 'storageLocationCd'
  )?.value;
  const placementCd = selectedPlaceMap?.find(
    (placeMap) => placeMap.columnId === 'placementCd'
  )?.value;
  const isSelected =
    storageLocationCd === cell?.storageLocationCd &&
    placementCd === cell?.placementCd;

  // 境界線スタイルを計算
  const borderStyles = calculateAllBorders(cell, start, end, gridData);


  // フォントサイズを20pxに固定
  const fontSize = 16;

  // グレーアウト時のテキスト色を判定
  const isGrayed = cell?.suspendedFlag === true;
  const textColor = isGrayed ? '#ffffff' : '#000000';

  // テキスト表示用の共通スタイル
  const textStyle = {
    fontSize: `${fontSize}px`,
    lineHeight: `${fontSize + 2}px`,
    color: textColor,
  };

  return (
    <td
      key={`${rowIndex}-${colIndex}`}
      rowSpan={rowSpan}
      colSpan={colSpan}
      style={{
        backgroundColor: isSelected ? COLORS.SELECTED : getBackgroundColor(cell),
        position: 'relative',
        ...borderStyles,
        width: '45px',
        minWidth: '45px',
        maxWidth: '45px',
        height: '45px',
        minHeight: '45px',
        maxHeight: '45px',
        aspectRatio: '1 / 1',
        verticalAlign: 'top',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3px',
        boxSizing: 'border-box',
        gap: '1px'
      }}>
        {cell.capacityQuantity && cell.capacityQuantity.trim() !== '' ? (
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px'
          }}>
            <div style={{
              flex: '1 1 50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
              overflow: 'hidden'
            }}>
              <TooltipWrapper
                title={cell.placementName || ''}
                placement="top"
                enterDelay={500}
                spanStyle={{
                  ...textStyle,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  display: 'inline-block',
                  minWidth: 0,
                }}
              >
                <>
                  {cell.placementName || ''}
                </>
              </TooltipWrapper>
            </div>
            <div style={{
              flex: '1 1 50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                ...textStyle,
                textAlign: 'center',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
                {cell.capacityQuantity}
              </span>
            </div>
          </div>
        ) : (
          <TooltipWrapper
            title={cell.placementName || ''}
            placement="top"
            enterDelay={500}
          >
            <span style={{
              ...textStyle,
              textAlign: 'center',
              width: '100%',
              whiteSpace: 'nowrap',
              paddingRight: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {cell.placementName || ''}
            </span>
          </TooltipWrapper>
        )}
      </div>
    </td>
  );
};