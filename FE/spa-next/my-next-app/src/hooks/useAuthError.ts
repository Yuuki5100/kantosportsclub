import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '../store';
import { addError, clearErrors } from '../slices/authErrorSlice';

// 環境変数から認証エラーの期間と閾値を取得（未設定の場合はデフォルト値を使用）
const AUTH_ERROR_PERIOD = Number(process.env.NEXT_PUBLIC_AUTH_ERROR_PERIOD) || 300000; // 5分
const AUTH_ERROR_THRESHOLD = Number(process.env.NEXT_PUBLIC_AUTH_ERROR_THRESHOLD) || 3;  // 例: 3回

export function useAuthError() {
  const dispatch = useAppDispatch();
  const records = useAppSelector((state: RootState) => state.authError.records);

  // 現在時刻を基に有効なエラーのみを抽出
  const now = Date.now();
  const validErrorCount = records.filter(record => now - record.timestamp <= AUTH_ERROR_PERIOD).length;

  // 一定期間内のエラー数が閾値を下回っていれば認証処理を許可、それ以上なら許可しない
  const authAllowed = validErrorCount < AUTH_ERROR_THRESHOLD;

  // 401エラー発生時に呼び出す
  const recordAuthError = (timestamp?: number) => {
    dispatch(addError(timestamp || Date.now()));
  };

  // 認証成功時にエラー記録をクリアするための関数
  const clearAuthErrors = () => {
    dispatch(clearErrors());
  };

  return { authAllowed, recordAuthError, clearAuthErrors, errorCount: validErrorCount };
}
