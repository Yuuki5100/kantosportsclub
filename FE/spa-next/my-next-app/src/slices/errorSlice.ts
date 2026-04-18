// src/slices/errorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ErrorState {
  message: string | null;
}

const initialState: ErrorState = {
  message: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setErrorMessage(state, action: PayloadAction<string | null>) {
      state.message = action.payload;
    },
    clearErrorMessage(state) {
      state.message = null;
    },
  },
});

export const { setErrorMessage, clearErrorMessage } = errorSlice.actions;
export default errorSlice.reducer;
