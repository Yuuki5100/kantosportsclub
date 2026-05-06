/**
 * お知らせ作成リクエスト
 * POST /api/notice/create
 */
export interface NoticeCreateRequest {
  noticeTitle: string;
  startDate: string;
  endDate: string;
  contents?: string;
  docIds?: string[];
}

/**
 * お知らせ一覧アイテム
 * GET /api/notice/list
 */
export interface NoticeListItem {
  noticeId: number;
  noticeTitle: string;
  startDate: string;
  endDate: string;
  creatorUserName: string;
  createdAt: string;
}

/**
 * お知らせ一覧レスポンス
 * GET /api/notice/list
 */
export interface NoticeListResponse {
  noticeList: NoticeListItem[];
}

/**
 * お知らせ詳細レスポンス
 * GET /api/notice/notice_id
 */
export interface NoticeDetailResponse {
  noticeId: number;
  noticeTitle: string;
  station?: string;
  locationId?: number | null;
  locationName?: string;
  dateandtime?: string | null;
  people?: number | null;
  peopleName?: string;
  remarks?: string;
  publicAt?: string;
  closedAt?: string;
  startHour?: string;
  endHour?: string;
  money?: string | number | null;
  startDate: string;
  endDate: string;
  contents: string;
  docIds: string[];
  creatorUserName: string;
  createdAt: string;
  editorUserName: string;
  updatedAt: string;
}

/**
 * お知らせ更新リクエスト
 * PUT /api/notice/notice_id
 */
export interface NoticeUpdateRequest {
  noticeTitle: string;
  startDate: string;
  endDate: string;
  contents?: string;
  docIds?: string[];
}

export interface NoticeDetailEditRequest {
  title: string;
  station: string | null;
  locationId: number | null;
  dateandtime: string | null;
  people: number | null;
  peopleName: string | null;
  remarks: string | null;
  publicAt: string | null;
  closedAt: string | null;
  startHour: string | null;
  endHour: string | null;
  money: string | number | null;
}

/**
 * お知らせファイルアップロードレスポンス
 * POST /api/notice/upload
 */
export interface NoticeUploadResponse {
  docIds: string[];
}

/**
 * お知らせ作成レスポンス
 * POST /api/notice/create
 */
export interface NoticeCreateResponse {
  noticeId: number;
}
