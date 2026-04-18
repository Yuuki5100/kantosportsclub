import apiClient from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { handleApiError } from "@/utils/errorHandler";
import type { ApiResponse } from "@/types/api";
import type { AuthStatusResponse, LoginRequest, LoginData } from "@/types/auth";
import { notifySessionTimeout } from "@/utils/SessionTimeoutProvider";
import { getMessage, MessageCodes } from "@/message";

const getResponseStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const { response } = error;
  if (typeof response !== "object" || response === null || !("status" in response)) {
    return undefined;
  }

  return typeof response.status === "number" ? response.status : undefined;
};

/**
 * パスワード忘れAPI
 * POST /api/user/forgot-password
 */
export const forgotPasswordApi = async (email: string): Promise<void> => {
  try {
    await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.USER.FORGOT_PASSWORD,
      { email }
    );
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "パスワードリセットメールの送信"));
    throw error;
  }
};

/**
 * パスワードリセットAPI
 * PUT /api/user/reset-password/{token}
 */
export const resetPasswordApi = async (token: string, password: string): Promise<void> => {
  try {
    await apiClient.put<ApiResponse<unknown>>(
      `${API_ENDPOINTS.USER.RESET_PASSWORD}/${token}`,
      { password }
    );
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "パスワードのリセット"));
    throw error;
  }
};

export const loginApi = async (data: LoginRequest): Promise<ApiResponse<LoginData>> => {
  try {
    const response = await apiClient.post<ApiResponse<LoginData>>(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "ログイン"));
    throw error;
  }
};

export const logoutApi = async (): Promise<void> => {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "ログアウト"));
    throw error;
  }
};

export const refreshAuthApi = async (): Promise<void> => {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
  } catch (error: unknown) {
    handleApiError(error, getMessage(MessageCodes.ACTION_FAILED, "セッション更新"));
    throw error;
  }
};

let cachedPromise: Promise<AuthStatusResponse> | null = null;
let lastTimestamp = 0;

export const checkAuthApi = async (): Promise<AuthStatusResponse> => {
  const now = Date.now();

  // 1 秒以内・既存 Promise がまだ pending なら再利用
  if (cachedPromise && now - lastTimestamp < 1000) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<AuthStatusResponse>>(
        API_ENDPOINTS.AUTH.STATUS,
        { timeout: 10_000 }
      );
      return data.data;
    } catch (error: unknown) {
      // 401 = 未認証（ログイン前 or セッション切れ）→ 正常系として扱う
      if (getResponseStatus(error) === 401) {
        console.log("authService: 未認証状態（401）");
        return { authenticated: false } as AuthStatusResponse;
      }
      // それ以外のエラーはセッションタイムアウトとして通知
      console.log("authServiceでセッションが切れました");
      notifySessionTimeout(error);
      throw error;
    } finally {
      // 成功・失敗に関わらず 1 秒後にキャッシュを捨てる
      setTimeout(() => {
        cachedPromise = null;
      }, 1000);
    }
  })();

  lastTimestamp = now;
  return cachedPromise;
};
