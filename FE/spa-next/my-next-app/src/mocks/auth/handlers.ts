import type { ApiResponse } from "@/types/api";
import type { AuthStatusResponse, LoginData } from "@/types/auth";
import { mockScenario } from "@/mocks/common/response";
import { defaultMockUser, mockUsers, MockAuthUser } from "./data";
import { getMessage, MessageCodes } from "@/message";

const SESSION_KEY = "mockAuthUser";
const ACCESS_TOKEN_KEY = "mockAccessToken";
const REFRESH_TOKEN_KEY = "mockRefreshToken";
let memoryUser: MockAuthUser | null = null;

const canUseStorage = (): boolean => typeof window !== "undefined";

const setSessionUser = (user: MockAuthUser) => {
  memoryUser = user;
  if (!canUseStorage()) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, `mock-access-${user.userId}`);
    localStorage.setItem(REFRESH_TOKEN_KEY, `mock-refresh-${user.userId}`);
  } catch {
    /* ignore */
  }
};

const clearSessionUser = () => {
  memoryUser = null;
  if (!canUseStorage()) return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

const getSessionUser = (): MockAuthUser | null => {
  if (memoryUser) return memoryUser;
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockAuthUser;
    memoryUser = parsed;
    return parsed;
  } catch {
    return null;
  }
};

const resolveUser = (userId?: string): MockAuthUser => {
  if (!userId) return defaultMockUser;
  const key = userId.toLowerCase();
  if (key.includes("operator")) return mockUsers.operator;
  if (key.includes("readonly")) return mockUsers.readonly;
  if (key.includes("user")) return mockUsers.user;
  if (key.includes("admin")) return mockUsers.admin;
  return defaultMockUser;
};

export const mockLogin = async (userId?: string): Promise<ApiResponse<LoginData>> => {
  if (mockScenario.authError) {
    throw new Error(getMessage(MessageCodes.AUTH_ERROR_GENERIC));
  }
  const user = resolveUser(userId);
  setSessionUser(user);
  return {
    success: true,
    data: {
      authenticated: true,
      authType: "mock",
      givenName: user.givenName,
      surname: user.surname,
      email: user.email,
      accessToken: `mock-access-${user.userId}`,
      refreshToken: `mock-refresh-${user.userId}`,
    },
  };
};

export const mockAuthStatus = async (): Promise<AuthStatusResponse> => {
  if (mockScenario.authError) {
    throw new Error(getMessage(MessageCodes.AUTH_ERROR_GENERIC));
  }
  const user = getSessionUser();
  if (!user) {
    return { authenticated: false };
  }
  return {
    authenticated: true,
    roleLevel: user.roleLevel,
    user: {
      givenName: user.givenName,
      surname: user.surname,
      email: user.email,
      userId: user.userId,
    },
  };
};

export const mockLogout = async (): Promise<void> => {
  clearSessionUser();
};

export const mockRefresh = async (): Promise<void> => {
  return;
};
