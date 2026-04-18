// src/slices/langSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LangPattern = 'ja' | 'en';
export type LangState = {
  language: LangPattern;
}

const initialState: LangState = {
  language: 'ja', // 初期値は日本語
};

const langSlice = createSlice({
  name: 'lang',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<LangPattern>) {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = langSlice.actions;
export default langSlice.reducer;
