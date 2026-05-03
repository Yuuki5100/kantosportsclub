import type { AuthMode, AuthSession, AuthStatusResponse, ExternalLoginInput, LoginInput } from "./types";

export const getAuthMode = (): AuthMode => "internal";

export const login = async (_input: LoginInput): Promise<AuthSession | null> => {
  return null;
};

export const refresh = async (_refreshToken: string): Promise<AuthSession | null> => {
  return null;
};

export const logout = async (_refreshToken: string): Promise<void> => {
  return;
};

export const status = async (): Promise<AuthStatusResponse> => {
  return { authenticated: false };
};

export const externalLogin = async (_input: ExternalLoginInput): Promise<AuthSession | null> => {
  return null;
};

export const callback = async (_code: string, _state: string): Promise<AuthSession | null> => {
  return null;
};
