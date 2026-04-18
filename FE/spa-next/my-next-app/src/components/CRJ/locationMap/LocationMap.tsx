// リファクタリングされたLocationMapコンポーネント

import { Box } from '@/components/base';
import { PlaceMapList, SelectedPlaceMap } from './types';
import { useLocationGrid } from './useLocationGrid';
import { GridHeader, GridRow } from './components';
import { CSSProperties } from 'react';
import type { SxProps, Theme } from '@/components/base';

/**
 * LocationMapコンポーネントのprops
 */
export type LocationMapProps = {
  /** 配置データの配列（グリッド上に表示される全ての配置情報） */
  data: PlaceMapList[];
  /** 選択された行ID（現在は使用されていない予約プロパティ） */
  selectedRowId: string;
  /** 選択された配置マップ（配置のハイライト表示に使用） */
  selectedPlaceMap: SelectedPlaceMap[];
  /** グリッドの列数（A, B, C...の列の総数） */
  columnLength: number;
  /** グリッドの行数（1, 2, 3...の行の総数） */
  rowLength: number;
  /** コンテナのカスタムスタイル（呼び出す側が柔軟にレイアウト可能） */
  containerSx?: SxProps<Theme>;
  /** テーブルのカスタムスタイル */
  tableSx?: CSSProperties;
  /** 自動高さ計算を無効にするフラグ（デフォルト: false） */
  disableAutoHeight?: boolean;
};

const LocationMap = (props: LocationMapProps) => {

  // グリッドデータを生成（メモ化で無限ループを防止）
  const gridData = useLocationGrid(props.data, props.rowLength, props.columnLength);

  // デフォルトスタイルの定義
  const defaultContainerStyle: SxProps<Theme> = {
    overflow: 'auto',
    position: 'relative' as const,
    // 自動高さ計算が有効な場合のみ高さを設定
    ...(props.disableAutoHeight ? {} : {
      minHeight: '400px',
      maxHeight: `${Math.min(props.rowLength * 45 + 45 + 100, 800)}px`,
    }),
  };

  const defaultTableStyle: CSSProperties = {
    borderCollapse: 'collapse' as const,
    width: `${props.columnLength * 45 + 40}px`,
    tableLayout: 'fixed' as const,
  };

  // カスタムスタイルとデフォルトスタイルをマージ
  const mergedContainerStyle: SxProps<Theme> = {
    ...defaultContainerStyle,
    ...props.containerSx,
  };

  const mergedTableStyle: CSSProperties = {
    ...defaultTableStyle,
    ...props.tableSx,
  };

  return (
    <Box sx={mergedContainerStyle}>
      <table style={mergedTableStyle}>
        <GridHeader length={props.columnLength} />
        <tbody>
          {gridData.map((row, rowIndex) => (
            <GridRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              selectedPlaceMap={props.selectedPlaceMap}
              gridData={gridData}
            />
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default LocationMap;
