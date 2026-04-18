// グリッドのヘッダー部分のコンポーネント

import { SignalCellular4BarRounded } from '@mui/icons-material';
import { generateColumns } from '../utils';
import { CSSProperties } from 'react';

type GridHeaderProps = {
  length: number;
};

export const GridHeader = ({ length }: GridHeaderProps) => {
  const iconHeaderStyle:CSSProperties = {
    padding: 0,
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    width: '42px',
    height: '42px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    position: 'sticky' as const,
    top: 0,
    left: 0,
    zIndex: 11,
    boxSizing: 'border-box' as const,
    boxShadow: 'inset 0 0 0 1px #ddd, 1px 0 0 0 #f1f5f9, 0 1px 0 0 #f1f5f9',
  };

  const iconStyle = {
    color: '#e0e0e0',
  };

  const headerCellStyle:CSSProperties = {
    position: 'sticky' as const,
    top: 0,
    height: '45px',
    minHeight: '45px',
    width: '45px',
    minWidth: '45px',
    textAlign: 'center' as const,
    border: 'none',
    backgroundColor: '#f1f5f9',
    boxSizing: 'border-box' as const,
    zIndex: 2,
    boxShadow: 'inset 0 0 0 1px #ddd, 1px 0 0 0 #f1f5f9, 0 1px 0 0 #f1f5f9, -1px 0 0 0 #f1f5f9',
  };

  return (
    <thead>
      <tr>
        <th className="iconHeader" style={iconHeaderStyle}>
          <SignalCellular4BarRounded className="icon" style={iconStyle} />
        </th>
        {generateColumns(length).map((col) => (
          <th key={col} className="headerCell" style={headerCellStyle}>
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
};