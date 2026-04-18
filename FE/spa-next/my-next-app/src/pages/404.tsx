// pages/404.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSnackbar } from "../hooks/useSnackbar";

const Custom404 = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!router.isReady || shown) return; // ルーターが準備できるまで待つ、または一度表示済みなら何もしない

    // クエリパラメーターから通知情報を取得
    const { snackbarMessage, snackbarType } = router.query;
    const message =
      (Array.isArray(snackbarMessage) ? snackbarMessage[0] : snackbarMessage) ||
      "ページが見つかりません";
    const type =
      (Array.isArray(snackbarType) ? snackbarType[0] : snackbarType) || "ERROR";

    console.log("Custom404: showSnackbar を呼び出します", { message, type });
    showSnackbar(message, type as "SUCCESS" | "ERROR" | "ALERT");
    setShown(true);
  }, [router.isReady, router.query, showSnackbar, shown]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>404 - Page Not Found</h1>
      <p>お探しのページは存在しません。</p>
    </div>
  );
};

export default Custom404;
