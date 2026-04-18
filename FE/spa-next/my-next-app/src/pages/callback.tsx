import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { getMessage, MessageCodes } from "@/message";

/**
 * GビズID認証後のコールバックページ
 * - URLパラメータ (code, state) を受け取り
 * - BE に送信してトークン取得
 * - 正常なら /user にリダイレクト
 */
const AuthCallbackPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ router.isReady を待つ（URLクエリが確定するまで）
    if (!router.isReady) return;

    const handleCallback = async () => {
      try {
        // URLクエリから code / state を取得
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code || !state) {
          setError(getMessage(MessageCodes.CALLBACK_MISSING_PARAMS));
          setLoading(false);
          return;
        }

        console.log("📥 code/state を取得:", { code, state });

        // ✅ BE の /auth/callback に code/state を送信してトークン取得
        const response = await axios.get("http://localhost:8081/auth/callback", {
          params: { code, state },
          withCredentials: true,
          headers: { Accept: "application/json" },
        });

        const data = response.data;
        console.log("✅ サーバーレスポンス:", data);

        if (data.success) {
          // トークンを保存（必要に応じて sessionStorage / cookie など）
          sessionStorage.setItem("ACCESS_TOKEN", data.data.ACCESS_TOKEN);
          sessionStorage.setItem("ID_TOKEN", data.data.ID_TOKEN);

          // ✅ 成功 → /user ページへ自動遷移
          router.replace("/");
        } else {
          setError(data.error?.message || getMessage(MessageCodes.AUTH_ERROR_GENERIC));
        }
      } catch (err) {
        console.error("❌ Callback error:", err);
        setError(getMessage(MessageCodes.CALLBACK_COMMUNICATION_ERROR));
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router.isReady, router]);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "4rem",
      }}
    >
      {loading && <p>🔄 認証処理中です。しばらくお待ちください...</p>}
      {error && (
        <p style={{ color: "red" }}>
          {getMessage(MessageCodes.ERROR_OCCURRED_WITH_DETAIL, error)}
        </p>
      )}
    </div>
  );
};

export default AuthCallbackPage;
