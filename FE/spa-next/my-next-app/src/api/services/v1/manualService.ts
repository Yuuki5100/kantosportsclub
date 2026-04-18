import * as real from "./real/manualService";
import * as mock from "./mock/manualService";
import { callWithMockFallback } from "./serviceSelector";

export const getManualListApi = (query?: Parameters<typeof real.getManualListApi>[0]) =>
  callWithMockFallback(() => mock.getManualListApi(query), () => real.getManualListApi(query));

export const getManualDetailApi = (manualId: Parameters<typeof real.getManualDetailApi>[0]) =>
  callWithMockFallback(() => mock.getManualDetailApi(manualId), () => real.getManualDetailApi(manualId));

export const uploadManualFilesApi = (files: Parameters<typeof real.uploadManualFilesApi>[0]) =>
  callWithMockFallback(() => mock.uploadManualFilesApi(files), () => real.uploadManualFilesApi(files));

export const downloadManualFileApi = (docId: Parameters<typeof real.downloadManualFileApi>[0]) =>
  callWithMockFallback(() => mock.downloadManualFileApi(docId), () => real.downloadManualFileApi(docId));

export const createManualApi = (data: Parameters<typeof real.createManualApi>[0]) =>
  callWithMockFallback(() => mock.createManualApi(data), () => real.createManualApi(data));

export const updateManualApi = (
  manualId: Parameters<typeof real.updateManualApi>[0],
  data: Parameters<typeof real.updateManualApi>[1]
) => callWithMockFallback(() => mock.updateManualApi(manualId, data), () => real.updateManualApi(manualId, data));

export const deleteManualApi = (manualId: Parameters<typeof real.deleteManualApi>[0]) =>
  callWithMockFallback(() => mock.deleteManualApi(manualId), () => real.deleteManualApi(manualId));
