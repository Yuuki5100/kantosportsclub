// LocationMapで使用する定数

export const COLORS = {
  SELECTED: 'rgb(100, 180, 220)', // 選択中の背景色（少し暗い青）
  SUSPENDED: '#757575',
  NORMAL: '#e0e0e0',
  TRANSPARENT: 'transparent',
  BORDER: '#050505',
  GRID_BORDER: '#ddd',
  GROUP_BORDER: 'rgb(148, 220, 248)', // グルーピング境界線（明るい青色）
  EMPTY: '#ffffff', // 空セルの背景色
} as const;

export const CELL_HEIGHT = 27; // px

export const ASCII_A = 65;