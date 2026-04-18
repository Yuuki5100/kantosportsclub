// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import errorReducer from './slices/errorSlice';
import langReducer from './slices/langSlice';
import snackbarReducer from './slices/snackbarSlice';
import authErrorReducer from './slices/authErrorSlice';
import sidebarSliceReducer from './slices/sidebarSlice';
import reportJobSliceReducer from './slices/reportJobSlice'

//各ストアを定義
const store = configureStore({
  reducer: {
    auth: authReducer,
    error: errorReducer,
    lang: langReducer,
    snackbar: snackbarReducer,
    authError:authErrorReducer,
    sidebar: sidebarSliceReducer,
    reportJob:reportJobSliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
