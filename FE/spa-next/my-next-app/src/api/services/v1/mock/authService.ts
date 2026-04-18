import type { ApiResponse } from "@/types/api";
import type { AuthStatusResponse, LoginRequest, LoginData } from "@/types/auth";
import { mockAuthStatus, mockLogin, mockLogout, mockRefresh } from "@/mocks/auth/handlers";
import { MockNotImplementedError } from "../serviceSelector";

export const forgotPasswordApi = async (_email: string): Promise<void> => {
  throw new MockNotImplementedError("forgotPasswordApi is not mocked");
};

export const resetPasswordApi = async (_token: string, _password: string): Promise<void> => {
  throw new MockNotImplementedError("resetPasswordApi is not mocked");
};

export const loginApi = async (data: LoginRequest): Promise<ApiResponse<LoginData>> => {
  return mockLogin(data.user_id);
};

export const logoutApi = async (): Promise<void> => {
  await mockLogout();
};

export const refreshAuthApi = async (): Promise<void> => {
  await mockRefresh();
};

export const checkAuthApi = async (): Promise<AuthStatusResponse> => {
  return mockAuthStatus();
};
