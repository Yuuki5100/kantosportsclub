import { shallowEqual } from "react-redux";
import { useCallback } from "react";
import type { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { login, logout, checkAuth } from "@/slices/authSlice";

let lastCheckTimestamp = 0;
const CHECK_AUTH_INTERVAL = 300000; // 5分

/**
 * 認証状態管理 Hook
 * - Reduxのauth stateと連携
 * - 定期チェック（/auth/status）にも対応
 */
export const useAuth = () => {
  const auth = useAppSelector((state: RootState) => state.auth, shallowEqual);
  const dispatch = useAppDispatch();

  // 🔐 ログイン処理
  const loginUser = useCallback(
    (user_id: string, password: string) => {
      return dispatch(login({ user_id, password }));
    },
    [dispatch]
  );

  // 🚪 ログアウト処理
  const logoutUser = useCallback(() => {
    return dispatch(logout());
  }, [dispatch]);

  // 🔁 定期セッションチェック（5分おき）
  const refreshAuth = useCallback(
    (force = false) => {
      const now = Date.now();
      if (!force && now - lastCheckTimestamp < CHECK_AUTH_INTERVAL) {
        console.log("⏳ refreshAuth スキップ");
        return;
      }
      lastCheckTimestamp = now;
      console.log("🔁 refreshAuth 実行");
      dispatch(checkAuth());
    },
    [dispatch]
  );

  return { ...auth, loginUser, logoutUser, refreshAuth };
};
