import axios, { AxiosError, AxiosResponse } from "axios";
import qs from "qs";
import { handleApiError } from "@/utils/errorHandler";
import Sentry from "@/utils/sentry";
import { buildTraceparentHeader, isTraceparentEnabled } from "@/utils/otelBrowser";
import { CustomAxiosRequestConfig } from "@/types/api";

// -----------------------------
// 🔧 環境変数設定
// -----------------------------
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000;

// -----------------------------
// 🧱 Axios インスタンス生成
// -----------------------------
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true, // ✅ Cookie (JSESSIONID)共有
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "comma" }),
});

// -----------------------------
// 🕒 リクエスト前：タイムスタンプ付与
// -----------------------------
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    config.metadata = { startTime: performance.now() };
    if (isTraceparentEnabled()) {
      const traceparent = buildTraceparentHeader();
      if (traceparent) {
        const headers = config.headers;
        if (headers && typeof headers.set === "function") {
          headers.set("traceparent", traceparent);
        } else {
          config.headers = {
            ...(headers ?? {}),
            traceparent,
          };
        }
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("🚨 Request setup failed:", error.message);
    return Promise.reject(error);
  }
);

// -----------------------------
// 🎯 Axios レスポンスインターセプター
// -----------------------------
apiClient.interceptors.response.use(
  /** ✅ 成功時の共通ハンドラ */
  (response: AxiosResponse) => {
    const config = response.config as CustomAxiosRequestConfig;
    const startTime = config.metadata?.startTime;
    const duration = startTime ? performance.now() - startTime : null;

    if (duration) {
      console.log(`✅ ${config.url} → ${response.status} (${duration.toFixed(1)} ms)`);
      Sentry.addBreadcrumb({
        category: "api",
        message: `Success: ${config.url} in ${duration.toFixed(1)} ms`,
        level: "info",
      });
    }

    return response;
  },

  /** ❌ エラー時ハンドラ */
  async (error: AxiosError) => {
    const config = error.config as CustomAxiosRequestConfig | undefined;
    const url = config?.url ?? "unknown";
    const startTime = config?.metadata?.startTime;
    const duration = startTime ? performance.now() - startTime : null;

    console.error(`❌ API Error [${url}]: ${error.message}`);
    if (duration) {
      Sentry.addBreadcrumb({
        category: "api",
        message: `Error: ${url} failed in ${duration.toFixed(1)} ms`,
        level: "error",
      });
    }

    if (!config) return Promise.reject(error);

    const status = error.response?.status;

    // ------------------------------------------------------
    // 🔒 認証・認可エラー時のリダイレクト
    // ------------------------------------------------------
    if (typeof window !== "undefined") {
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/status") ||
        url.includes("/forgot-password") ||
        url.includes("/reset-password");

      if (status === 401 && !isAuthEndpoint) {
        console.warn("⚠️ 401 Unauthorized → /login へリダイレクト");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (status === 403 && !isAuthEndpoint) {
        console.warn("⚠️ 403 Forbidden → /403 へリダイレクト");
        window.location.href = "/403";
        return Promise.reject(error);
      }
    }

    // ------------------------------------------------------
    // 🧭 共通エラーハンドリング
    // ------------------------------------------------------
    Sentry.captureException(error);
    handleApiError(error);

    return Promise.reject(error);
  }
);

export default apiClient;
