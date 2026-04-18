// pages/403.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSnackbar } from "@hooks/useSnackbar";

const ForbiddenPage = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // router.isReady でルーターの初期化完了を待つ
    if (!router.isReady) return;

    // クエリパラメーターから通知情報を取得
    const { snackbarMessage, snackbarType } = router.query;
    console.log("ForbiddenPage: router.query =", router.query);

    if (snackbarMessage) {
      const message = Array.isArray(snackbarMessage)
        ? snackbarMessage[0]
        : snackbarMessage;
      const type = Array.isArray(snackbarType)
        ? snackbarType[0]
        : snackbarType;
      console.log("ForbiddenPage: showSnackbar を呼び出します", { message, type });
      showSnackbar(message, type as "SUCCESS" | "ERROR" | "ALERT");
    }
  }, [router.isReady, router.query, showSnackbar]);

  return (
    <div>
      <h1>403 Forbidden</h1>
      <p>このページへのアクセス権限がありません。</p>
    </div>
  );
};

export default ForbiddenPage;
