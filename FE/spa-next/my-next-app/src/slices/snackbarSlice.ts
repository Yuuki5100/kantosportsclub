// src/slices/snackbarSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';

export type SnackbarType = 'SUCCESS' | 'ERROR' | 'ALERT';

/**
 * Snackbarの状態を管理するための型
 */
interface SnackbarState {
  message: ReactNode | null; // ← 修正
  type: SnackbarType | null;
}

/** Snackbarの初期状態 */
const initialState: SnackbarState = {
  message: null,
  type: null,
};

/**
 * Snackbarの状態を管理するSlice
 */
const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar(state, action: PayloadAction<{ message: ReactNode; type: SnackbarType }>) { // ← 修正
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    hideSnackbar(state) {
      state.message = null;
      state.type = null;
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
