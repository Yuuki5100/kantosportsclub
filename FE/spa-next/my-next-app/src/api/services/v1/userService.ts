import * as real from "./real/userService";
import * as mock from "./mock/userService";
import { callWithMockFallback, selectHook } from "./serviceSelector";

export const useUserList = selectHook(real.useUserList, mock.useUserList);
export const useUserProfile = selectHook(real.useUserProfile, mock.useUserProfile);
export const useUserDetail = selectHook(real.useUserDetail, mock.useUserDetail);
export const useUpdateUserProfile = selectHook(real.useUpdateUserProfile, mock.useUpdateUserProfile);

export const createUserApi = (request: Parameters<typeof real.createUserApi>[0]) =>
  callWithMockFallback(() => mock.createUserApi(request), () => real.createUserApi(request));

export const getUserDetailApi = (userId: Parameters<typeof real.getUserDetailApi>[0]) =>
  callWithMockFallback(() => mock.getUserDetailApi(userId), () => real.getUserDetailApi(userId));

export const updateUserApi = (
  userId: Parameters<typeof real.updateUserApi>[0],
  request: Parameters<typeof real.updateUserApi>[1]
) => callWithMockFallback(() => mock.updateUserApi(userId, request), () => real.updateUserApi(userId, request));

export const deleteUserApi = (
  userId: Parameters<typeof real.deleteUserApi>[0],
  request: Parameters<typeof real.deleteUserApi>[1]
) => callWithMockFallback(() => mock.deleteUserApi(userId, request), () => real.deleteUserApi(userId, request));

export const restoreUserApi = (userId: Parameters<typeof real.restoreUserApi>[0]) =>
  callWithMockFallback(() => mock.restoreUserApi(userId), () => real.restoreUserApi(userId));

export const unlockUserApi = (lockedUserId: Parameters<typeof real.unlockUserApi>[0]) =>
  callWithMockFallback(() => mock.unlockUserApi(lockedUserId), () => real.unlockUserApi(lockedUserId));

export const getUserListApi = (query: Parameters<typeof real.getUserListApi>[0]) =>
  callWithMockFallback(() => mock.getUserListApi(query), () => real.getUserListApi(query));
