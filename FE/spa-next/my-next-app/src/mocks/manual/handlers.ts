import type {
  ManualCreateRequest,
  ManualCreateResponse,
  ManualDetailResponse,
  ManualListQuery,
  ManualListResponse,
  ManualUpdateRequest,
  ManualUpdateResponse,
  ManualUploadResponse,
} from "@/types/manual";
import { ensureScenario, mockScenario } from "@/mocks/common/response";
import { paginateList } from "@/mocks/common/pagination";
import { includesIgnoreCase } from "@/mocks/common/filters";
import { mockManualDetailMap, mockManualList } from "./data";
import { getMessage, MessageCodes } from "@/message";

export const mockGetManualList = async (query?: ManualListQuery): Promise<ManualListResponse> => {
  ensureScenario(mockScenario.manualListError, "マニュアル一覧の取得に失敗しました");
  let filtered = [...mockManualList];

  if (query?.titleName) {
    filtered = filtered.filter((m) => includesIgnoreCase(m.manualTitle, query.titleName));
  }

  if (typeof query?.target === "number" && query.target !== 0) {
    filtered = filtered.filter((m) =>
      query.target === 1 ? m.generalUser : m.systemUser
    );
  }

  const { items, total } = paginateList(
    filtered,
    query?.pageNumber ?? 1,
    query?.pagesize ?? 50
  );

  return { manuals: items, total };
};

export const mockGetManualDetail = async (manualId: number): Promise<ManualDetailResponse> => {
  const detail = mockManualDetailMap[manualId];
  if (!detail) {
    throw new Error(getMessage(MessageCodes.NOT_FOUND));
  }
  return detail;
};

export const mockUploadManualFiles = async (_files: File[]): Promise<ManualUploadResponse> => {
  return { docIds: ["mock/manual/uploaded.pdf"] };
};

export const mockDownloadManualFile = async (_docId: string): Promise<Blob> => {
  return new Blob(["mock manual file"], { type: "application/pdf" });
};

export const mockCreateManual = async (_data: ManualCreateRequest): Promise<ManualCreateResponse> => {
  return { manualId: 9999 };
};

export const mockUpdateManual = async (
  _manualId: number,
  _data: ManualUpdateRequest
): Promise<ManualUpdateResponse> => {
  return { manualId: _manualId };
};

export const mockDeleteManual = async (_manualId: number): Promise<void> => {
  return;
};
