// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // 既存の基本パレットを上書きしたい場合はここに記述
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    // カスタムカラーは 'custom' のような独自キーで拡張可能
    custom: {
      tableHeader: '#f5f5f5',
      formLabel: '#333333',
      disabledText: '#aaaaaa',
      highlight: '#fff8e1',
      errorBackground: '#fdecea',
    } as const, // ★ TypeScript の型エラー防止
  },
  typography: {
    fontSize: 14,
    fontFamily: ['"Roboto"', '"Noto Sans JP"', 'sans-serif'].join(','),
  },
components: {
  // TableCell の上書き
  MuiTableCell: {
    styleOverrides: {
      head: {
        backgroundColor: '#f5f5f5',
        color: '#333',
      },
    },
  },

  // Button のデフォルトスタイル上書き
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,                // 角丸
        textTransform: 'none',          // 全部大文字 → 通常に戻す
        fontWeight: 600,                // 太字
        fontSize: '14px',               // サイズ指定
        padding: '8px 16px',
      },
      containedPrimary: {
        backgroundColor: '#1976d2',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#1565c0',   // ホバー時の色
        },
      },
      containedSecondary: {
        backgroundColor: '#9c27b0',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#7b1fa2',
        },
      },
    },
  },
}

});

export default theme;
