// src/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '../api/services/v1/authService';
import { AuthStatusResponse, LoginData, UserPermission } from '@/types/auth';
import { clearStoredAuthTokens } from '@/utils/authTokenStorage';

interface AuthState {
  isAuthenticated: boolean | null;
  roleLevel: number | null;
  rolePermissions: Record<string, number> | null;
  status: 'idle' | 'loading' | 'failed';
  error?: string | null;
  userId?: string | null;
  name?: string | null;
}

const loadSessionState = (): Partial<AuthState> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem('authState');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
};

const saveSessionState = (state: AuthState) => {
  try {
    sessionStorage.setItem('authState', JSON.stringify({
      isAuthenticated: state.isAuthenticated,
      roleLevel: state.roleLevel,
      rolePermissions: state.rolePermissions,
      userId: state.userId,
      name: state.name,
    }));
  } catch { /* ignore */ }
};

const clearSessionState = () => {
  try { sessionStorage.removeItem('authState'); } catch { /* ignore */ }
};

const initialState: AuthState = {
  isAuthenticated: null,
  roleLevel: null,
  rolePermissions: null,
  status: 'idle',
  error: null,
  userId: null,
  name: null,
};

const mapUserPermissionsToRolePermissions = (
  userPermissions?: UserPermission[] | null,
  rolePermissions?: Record<string, number> | null
): Record<string, number> | null => {
  if (rolePermissions) return rolePermissions;
  if (!userPermissions || userPermissions.length === 0) return null;

  return userPermissions.reduce<Record<string, number>>((acc, permission) => {
    acc[String(permission.permissionId)] = permission.statusLevelId;
    if (permission.permissionName) {
      acc[permission.permissionName] = permission.statusLevelId;
    }
    return acc;
  }, {});
};

export const login = createAsyncThunk<
  LoginData,
  { user_id: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ user_id, password }, { rejectWithValue, dispatch }) => {
  try {
    console.log("🚀 login: start", { user_id });

    // ① ログインAPI呼び出し（トークンはCookieで自動管理）
    const loginRes = await authService.loginApi({ user_id, password });
    console.log("✅ login: loginApi result", loginRes);

    const loginData = loginRes?.data;

    if (!loginRes?.success || !loginData?.authenticated) {
      return rejectWithValue("ログイン失敗");
    }

    // ② ログイン成功後、権限情報を即時取得
    dispatch(checkAuth());

    return loginData as LoginData;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ログイン失敗";
    console.error("❌ login: failed", message);
    return rejectWithValue(message);
  }
});

export const checkAuth = createAsyncThunk<
  AuthStatusResponse,
  void,
  { rejectValue: string }
>('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    console.log("🔍 checkAuth: start");
    const result = await authService.checkAuthApi();
    console.log("✅ checkAuth: success", result);
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "認証確認失敗";
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logoutApi();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<AuthState>) {
      return { ...state, ...action.payload };
    },
    hydrateFromSession(state) {
      const saved = loadSessionState();
      if (saved.isAuthenticated != null) {
        state.isAuthenticated = saved.isAuthenticated;
        state.roleLevel = saved.roleLevel ?? null;
        state.rolePermissions = saved.rolePermissions ?? null;
        state.userId = saved.userId ?? null;
        state.name = saved.name ?? null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.authenticated;
        state.name = `${action.payload.givenName} ${action.payload.surname}`;
        state.status = 'idle';
        state.error = null;
        saveSessionState(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.roleLevel = null;
        state.rolePermissions = null;
        state.userId = null;
        state.name = null;
        state.status = 'failed';
        state.error = action.payload as string;
        clearSessionState();
        clearStoredAuthTokens();
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        const { authenticated, roleLevel, user, rolePermissions, userPermissions } = action.payload;
        state.isAuthenticated = authenticated;
        state.roleLevel = roleLevel ?? null;
        state.rolePermissions = mapUserPermissionsToRolePermissions(userPermissions, rolePermissions);
        state.userId = user?.userId ?? null;
        state.name = user ? `${user.givenName} ${user.surname}` : null;
        saveSessionState(state);
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.roleLevel = null;
        state.rolePermissions = null;
        state.userId = null;
        state.name = null;
        state.status = 'failed';
        state.error = action.payload as string;
        clearSessionState();
        clearStoredAuthTokens();
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.roleLevel = null;
        state.rolePermissions = null;
        state.userId = null;
        state.name = null;
        state.status = 'idle';
        clearSessionState();
        clearStoredAuthTokens();
      });
  },
});

export const { setAuthState, hydrateFromSession } = authSlice.actions;
export default authSlice.reducer;
