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
