import * as real from "./real/systemSettingService";
import * as mock from "./mock/systemSettingService";
import { callWithMockFallback } from "./serviceSelector";

export const getSystemSettingApi = () =>
  callWithMockFallback(() => mock.getSystemSettingApi(), () => real.getSystemSettingApi());

export const updateSystemSettingApi = (data: Parameters<typeof real.updateSystemSettingApi>[0]) =>
  callWithMockFallback(() => mock.updateSystemSettingApi(data), () => real.updateSystemSettingApi(data));

export const reloadSystemSettingCacheApi = () =>
  callWithMockFallback(
    () => mock.reloadSystemSettingCacheApi(),
    () => real.reloadSystemSettingCacheApi()
  );
