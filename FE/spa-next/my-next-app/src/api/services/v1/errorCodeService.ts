import * as real from "./real/errorCodeService";
import * as mock from "./mock/errorCodeService";
import { callWithMockFallback, selectHook } from "./serviceSelector";

export type { ErrorCodePayload, ErrorCodeResponse } from "./real/errorCodeService";

export const useErrorCodeList = selectHook(real.useErrorCodeList, mock.useErrorCodeList);
export const useAddErrorCode = selectHook(real.useAddErrorCode, mock.useAddErrorCode);

export const addErrorCodeApi = (data: Parameters<typeof real.addErrorCodeApi>[0]) =>
  callWithMockFallback(() => mock.addErrorCodeApi(data), () => real.addErrorCodeApi(data));

export const updateErrorCodeApi = (
  code: Parameters<typeof real.updateErrorCodeApi>[0],
  data: Parameters<typeof real.updateErrorCodeApi>[1]
) => callWithMockFallback(() => mock.updateErrorCodeApi(code, data), () => real.updateErrorCodeApi(code, data));

export const reloadErrorCodesApi = () =>
  callWithMockFallback(() => mock.reloadErrorCodesApi(), () => real.reloadErrorCodesApi());
