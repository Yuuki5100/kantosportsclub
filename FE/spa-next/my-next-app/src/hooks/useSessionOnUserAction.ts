import { useEffect } from "react";
import { refreshAuthApi } from "@/api/services/v1/authService";

const useSessionOnUserAction = () => {
  const refreshSession = async () => {
    try {
      await refreshAuthApi();
    } catch (error) {
      console.error("セッション更新に失敗しました:", error);
    }
  };

  useEffect(() => {
    const handleUserActivity = () => {
      refreshSession();
    };

    // ユーザーアクション（クリック、キーボード入力など）
    document.addEventListener("click", handleUserActivity);
    document.addEventListener("keydown", handleUserActivity);

    return () => {
      document.removeEventListener("click", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
    };
  }, []);

  return null;
};

export default useSessionOnUserAction;
