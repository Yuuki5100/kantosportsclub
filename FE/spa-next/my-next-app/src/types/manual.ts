export interface ManualUploadResponse {
  docIds: string[];
}

export interface ManualCreateRequest {
  manualTitle: string;
  description?: string;
  generalUser?: boolean;
  systemUser?: boolean;
  docIds?: string[];
}

export interface ManualCreateResponse {
  manualId: number;
}

export interface ManualListQuery {
  titleName?: string;
  target?: number;
  isdeleted?: number;
  pageNumber?: number;
  pagesize?: number;
}

export interface ManualListItem {
  manualId: number;
  manualTitle: string;
  generalUser: boolean;
  systemUser: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface ManualListResponse {
  manuals: ManualListItem[];
  total: number;
}

export interface ManualDetailItem {
  manualId: number;
  manualTitle: string;
  description: string;
  generalUser: boolean;
  systemUser: boolean;
  updatedAt: string;
  docIds: string[];
  deletedFlag: boolean;
}

export interface ManualDetailResponse {
  manual: ManualDetailItem;
}

export interface ManualUpdateRequest {
  manualTitle: string;
  description?: string;
  generalUser?: boolean;
  systemUser?: boolean;
  docIds?: string[];
}

export interface ManualUpdateResponse {
  manualId: number;
}
