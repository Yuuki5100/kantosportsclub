import type {
  ManualUploadResponse,
  ManualCreateRequest,
  ManualCreateResponse,
  ManualListQuery,
  ManualListResponse,
  ManualDetailResponse,
  ManualUpdateRequest,
  ManualUpdateResponse,
} from "@/types/manual";
import {
  mockCreateManual,
  mockDeleteManual,
  mockDownloadManualFile,
  mockGetManualDetail,
  mockGetManualList,
  mockUpdateManual,
  mockUploadManualFiles,
} from "@/mocks/manual/handlers";

export const getManualListApi = async (query?: ManualListQuery): Promise<ManualListResponse> => {
  return mockGetManualList(query);
};

export const getManualDetailApi = async (manualId: number): Promise<ManualDetailResponse> => {
  return mockGetManualDetail(manualId);
};

export const uploadManualFilesApi = async (files: File[]): Promise<ManualUploadResponse> => {
  return mockUploadManualFiles(files);
};

export const downloadManualFileApi = async (docId: string): Promise<Blob> => {
  return mockDownloadManualFile(docId);
};

export const createManualApi = async (data: ManualCreateRequest): Promise<ManualCreateResponse> => {
  return mockCreateManual(data);
};

export const updateManualApi = async (
  manualId: number,
  data: ManualUpdateRequest
): Promise<ManualUpdateResponse> => {
  return mockUpdateManual(manualId, data);
};

export const deleteManualApi = async (manualId: number): Promise<void> => {
  return mockDeleteManual(manualId);
};
