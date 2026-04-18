import React, { useState, useEffect } from "react";
import axios from "axios";
import { getMessage, MessageCodes } from "@/message";

/**
 * OIDC (OpenID Connect) モック認証のテストページ
 * - Step1: /auth/external-login を叩いて authorizationUrl を取得
 * - Step2: 取得したURLへブラウザをリダイレクト（モックサーバーログイン画面へ）
 * - Step3: 認可コード付きで /auth/callback が呼ばれ、トークンを取得
 */
const OidcLoginTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ axios の共通設定
  axios.defaults.withCredentials = true; // ← Cookie共有（JSESSIONID）

  // ✅ Step1: 外部ログインURLを取得（Java BEへGET）
  const handleGetAuthorizationUrl = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        "http://localhost:8081/auth/external-login",
        {
          params: {
            clientId: "mock-client",
            clientSecret: "mock-secret",
          },
          headers: { Accept: "application/json" },
          withCredentials: true, // ← 各リクエストにもCookieを送信
        }
      );

      if (response.data?.success) {
        const url = response.data.data.authorizationUrl;
        console.log("✅ Authorization URL:", url);
        setAuthUrl(url);

        // ✅ モックログイン画面にリダイレクト
        window.location.href = url;
      } else {
        throw new Error(
          response.data?.error?.message ?? getMessage(MessageCodes.OIDC_AUTH_URL_FAILED)
        );
      }
    } catch (err: any) {
      console.error("❌ Failed to get authorization URL:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step2: 認可コード付きで戻ってきたときの処理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code && state) {
      console.log("📥 Callback detected:", { code, state });
      exchangeCodeForToken(code, state);
    }
  }, []);

  // ✅ Step3: BEの /auth/callback に code / state を送信してトークン取得
  const exchangeCodeForToken = async (code: string, state: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("http://localhost:8081/auth/callback", {
        params: { code, state },
        headers: { Accept: "application/json" },
        withCredentials: true, // ← ここも重要！
      });

      if (response.data?.success) {
        console.log("✅ Token response:", response.data.data);
        setTokenInfo(response.data.data);
      } else {
        throw new Error(
          response.data?.error?.message ?? getMessage(MessageCodes.OIDC_TOKEN_EXCHANGE_FAILED)
        );
      }
    } catch (err: any) {
      console.error("❌ Token exchange failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🔐 OIDC モックログインテスト</h2>

      {/* ステップ1 */}
      {!authUrl && !tokenInfo && (
        <button onClick={handleGetAuthorizationUrl} disabled={loading}>
          {loading ? "通信中..." : "モックログイン開始"}
        </button>
      )}

      {/* ステップ2・3 */}
      {authUrl && !tokenInfo && <p>ログインページへリダイレクト中です...</p>}

      {/* トークン結果 */}
      {tokenInfo && (
        <div style={{ marginTop: "2rem" }}>
          <h3>✅ 認証成功！</h3>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* エラー */}
      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          {getMessage(MessageCodes.ERROR_OCCURRED_WITH_DETAIL, error)}
        </div>
      )}
    </div>
  );
};

export default OidcLoginTest;
