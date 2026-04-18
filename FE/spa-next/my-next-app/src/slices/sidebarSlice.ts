// src/slices/sidebarSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SidebarState {
  selectedMenuKey: string | null; // ← resourceKeyベースに変更
}

const initialState: SidebarState = {
  selectedMenuKey: null,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSelectedMenu: (state, action: PayloadAction<string>) => {
      state.selectedMenuKey = action.payload; // resourceKeyを格納
    },
    clearSelectedMenu: (state) => {
      state.selectedMenuKey = null;
    },
  },
});

export const { setSelectedMenu, clearSelectedMenu } = sidebarSlice.actions;
export default sidebarSlice.reducer;
