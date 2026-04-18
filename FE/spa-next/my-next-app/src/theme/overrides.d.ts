import type {
  PaletteOptions as _PaletteOptions,
  Palette as _Palette,
} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      tableHeader: string;
      formLabel: string;
      disabledText: string;
      highlight: string;
      errorBackground: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      tableHeader?: string;
      formLabel?: string;
      disabledText?: string;
      highlight?: string;
      errorBackground?: string;
    };
  }
}
