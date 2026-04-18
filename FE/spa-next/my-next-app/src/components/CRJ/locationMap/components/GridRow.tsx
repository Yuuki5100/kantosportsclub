// グリッドの行コンポーネント

import { PlaceMapList, SelectedPlaceMap } from '../types';
import { GridCell } from './GridCell';

type GridRowProps = {
  row: (PlaceMapList | null)[];
  rowIndex: number;
  selectedPlaceMap: SelectedPlaceMap[];
  gridData: (PlaceMapList | null)[][];
};

export const GridRow = ({ 
  row, 
  rowIndex, 
  selectedPlaceMap,
  gridData
}: GridRowProps) => {
  const rowHeaderStyle = {
    position: 'sticky' as const,
    left: 0,
    zIndex: 2,
    textAlign: 'center' as const,
    fontWeight: 'bold',
    border: 'none',
    backgroundColor: '#f1f5f9',
    minWidth: '30px',
    height: '45px',
    minHeight: '45px',
    maxHeight: '45px',
    boxSizing: 'border-box' as const,
    boxShadow: 'inset 0 0 0 1px #ddd, 1px 0 0 0 #f1f5f9, 0 1px 0 0 #f1f5f9, -1px 0 0 0 #f1f5f9',
  };

  return (
    <tr key={rowIndex}>
      <td style={rowHeaderStyle}>{rowIndex + 1}</td>
      {row.map((cell, colIndex) => (
        <GridCell
          key={`${rowIndex}-${colIndex}`}
          cell={cell}
          rowIndex={rowIndex}
          colIndex={colIndex}
          selectedPlaceMap={selectedPlaceMap}
          gridData={gridData}
        />
      ))}
    </tr>
  );
};