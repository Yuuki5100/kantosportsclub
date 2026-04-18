import * as real from "./real/authService";
import * as mock from "./mock/authService";
import { callWithMockFallback } from "./serviceSelector";

export const forgotPasswordApi = (email: string): Promise<void> =>
  callWithMockFallback(() => mock.forgotPasswordApi(email), () => real.forgotPasswordApi(email));

export const resetPasswordApi = (token: string, password: string): Promise<void> =>
  callWithMockFallback(
    () => mock.resetPasswordApi(token, password),
    () => real.resetPasswordApi(token, password)
  );

export const loginApi = (data: Parameters<typeof real.loginApi>[0]) =>
  callWithMockFallback(() => mock.loginApi(data), () => real.loginApi(data));

export const logoutApi = () =>
  callWithMockFallback(() => mock.logoutApi(), () => real.logoutApi());

export const refreshAuthApi = () =>
  callWithMockFallback(() => mock.refreshAuthApi(), () => real.refreshAuthApi());

export const checkAuthApi = () =>
  callWithMockFallback(() => mock.checkAuthApi(), () => real.checkAuthApi());
