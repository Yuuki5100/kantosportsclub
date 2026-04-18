import type { NoticeDetailResponse, NoticeListItem } from "@/types/notice";

export const mockNoticeList: NoticeListItem[] = [
  {
    noticeId: 1001,
    noticeTitle: "システムメンテナンスのお知らせ",
    startDate: "2024/01/10",
    endDate: "2024/01/20",
    creatorUserName: "System",
    createdAt: "2024-01-05 10:00:00",
  },
  {
    noticeId: 1002,
    noticeTitle: "新機能リリース",
    startDate: "2024/02/01",
    endDate: "2024/02/15",
    creatorUserName: "Admin",
    createdAt: "2024-01-25 09:30:00",
  },
  {
    noticeId: 1003,
    noticeTitle: "長文テスト: とても長いタイトルの通知",
    startDate: "2024/03/01",
    endDate: "2024/03/31",
    creatorUserName: "Operator",
    createdAt: "2024-02-01 12:00:00",
  },
];

export const mockNoticeDetailMap: Record<number, NoticeDetailResponse> = {
  1001: {
    noticeId: 1001,
    noticeTitle: "システムメンテナンスのお知らせ",
    startDate: "2024/01/10",
    endDate: "2024/01/20",
    contents: "システムメンテナンスを実施します。",
    docIds: ["mock/notice/maintenance.pdf"],
    creatorUserName: "System",
    createdAt: "2024-01-05 10:00:00",
    editorUserName: "System",
    updatedAt: "2024-01-06 10:00:00",
  },
  1002: {
    noticeId: 1002,
    noticeTitle: "新機能リリース",
    startDate: "2024/02/01",
    endDate: "2024/02/15",
    contents: "新機能をリリースしました。",
    docIds: [],
    creatorUserName: "Admin",
    createdAt: "2024-01-25 09:30:00",
    editorUserName: "Admin",
    updatedAt: "2024-01-26 09:30:00",
  },
  1003: {
    noticeId: 1003,
    noticeTitle: "長文テスト: とても長いタイトルの通知",
    startDate: "2024/03/01",
    endDate: "2024/03/31",
    contents: "これは長文テスト用のコンテンツです。",
    docIds: ["mock/notice/longtext.pdf"],
    creatorUserName: "Operator",
    createdAt: "2024-02-01 12:00:00",
    editorUserName: "Operator",
    updatedAt: "2024-02-10 12:00:00",
  },
};

