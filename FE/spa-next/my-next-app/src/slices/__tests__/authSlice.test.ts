import { describe, it, expect, beforeEach } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { checkAuth, login, logout } from "@/slices/authSlice";

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
  });

describe("authSlice", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("updates auth state on login fulfilled", () => {
    const store = createTestStore();

    store.dispatch(
      login.fulfilled(
        {
          authenticated: true,
          authType: "SESSION",
          givenName: "Test",
          surname: "User",
          email: "test@example.com",
        },
        "req-1",
        { user_id: "test", password: "pass" }
      )
    );

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.name).toBe("Test User");
    expect(state.status).toBe("idle");
    expect(state.error).toBeNull();
  });

  it("updates auth state on login rejected", () => {
    const store = createTestStore();

    store.dispatch(
      login.rejected(
        new Error("login failed"),
        "req-2",
        { user_id: "test", password: "wrong" },
        "Invalid credentials"
      )
    );

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.status).toBe("failed");
    expect(state.error).toBe("Invalid credentials");
    expect(state.rolePermissions).toBeNull();
  });

  it("sets rolePermissions from checkAuth rolePermissions payload", () => {
    const store = createTestStore();

    store.dispatch(
      checkAuth.fulfilled(
        {
          authenticated: true,
          rolePermissions: { USER: 2 },
        },
        "req-3",
        undefined
      )
    );

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.rolePermissions).toEqual({ USER: 2 });
  });

  it("maps userPermissions into rolePermissions", () => {
    const store = createTestStore();

    store.dispatch(
      checkAuth.fulfilled(
        {
          authenticated: true,
          userPermissions: [
            { permissionId: 1, permissionName: "NOTICE", statusLevelId: 3 },
          ],
        },
        "req-4",
        undefined
      )
    );

    const state = store.getState().auth;
    expect(state.rolePermissions).toEqual({ NOTICE: 3 });
  });

  it("clears auth state on logout fulfilled", () => {
    const store = createTestStore();

    store.dispatch(
      login.fulfilled(
        {
          authenticated: true,
          authType: "SESSION",
          givenName: "Test",
          surname: "User",
          email: "test@example.com",
        },
        "req-5",
        { user_id: "test", password: "pass" }
      )
    );

    store.dispatch(logout.fulfilled(undefined, "req-6", undefined));

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.rolePermissions).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.name).toBeNull();
  });
});
