import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthErrorRecord {
  timestamp: number;
}

export interface AuthErrorState {
  records: AuthErrorRecord[];
}

const LOCAL_STORAGE_KEY = 'authErrorRecords';

// ローカルストレージからエラー記録をロードするユーティリティ関数
function loadErrorRecords(): AuthErrorRecord[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.error("Failed to parse auth error records from localStorage", error);
      }
    }
  }
  return [];
}

// ローカルストレージにエラー記録を保存するユーティリティ関数
function saveErrorRecords(records: AuthErrorRecord[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  }
}

const initialState: AuthErrorState = {
  records: loadErrorRecords(),
};

const authErrorSlice = createSlice({
  name: 'authError',
  initialState,
  reducers: {
    // 401エラー発生時にエラー記録を追加する
    addError(state, action: PayloadAction<number>) {
      const newTimestamp = action.payload || Date.now();
      // 環境変数からエラー期間を取得（未設定の場合はデフォルト5分＝300000ms）
      const period = Number(process.env.NEXT_PUBLIC_AUTH_ERROR_PERIOD) || 300000;
      const now = Date.now();
      // 現在の期間外のエラーは削除
      state.records = state.records.filter(record => now - record.timestamp <= period);
      // 新たなエラーを追加
      state.records.push({ timestamp: newTimestamp });
      saveErrorRecords(state.records);
    },
    // 認証成功時などにエラー記録をクリアする
    clearErrors(state) {
      state.records = [];
      saveErrorRecords(state.records);
    },
    // 定期的に古いエラーを削除するためのアクション（必要に応じて呼び出す）
    pruneErrors(state) {
      const period = Number(process.env.NEXT_PUBLIC_AUTH_ERROR_PERIOD) || 300000;
      const now = Date.now();
      state.records = state.records.filter(record => now - record.timestamp <= period);
      saveErrorRecords(state.records);
    }
  },
});

export const { addError, clearErrors, pruneErrors } = authErrorSlice.actions;
export default authErrorSlice.reducer;
