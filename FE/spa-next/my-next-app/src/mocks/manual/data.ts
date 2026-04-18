import type { ManualDetailResponse, ManualListItem } from "@/types/manual";

export const mockManualList: ManualListItem[] = [
  {
    manualId: 2001,
    manualTitle: "操作マニュアル（一般）",
    generalUser: true,
    systemUser: false,
    updatedBy: "System",
    updatedAt: "2024-01-10 10:00:00",
  },
  {
    manualId: 2002,
    manualTitle: "管理者マニュアル",
    generalUser: false,
    systemUser: true,
    updatedBy: "Admin",
    updatedAt: "2024-01-12 09:00:00",
  },
  {
    manualId: 2003,
    manualTitle: "長文テストマニュアル",
    generalUser: true,
    systemUser: true,
    updatedBy: "Operator",
    updatedAt: "2024-01-20 15:00:00",
  },
];

export const mockManualDetailMap: Record<number, ManualDetailResponse> = {
  2001: {
    manual: {
      manualId: 2001,
      manualTitle: "操作マニュアル（一般）",
      description: "一般ユーザー向けの操作説明です。",
      generalUser: true,
      systemUser: false,
      updatedAt: "2024-01-10 10:00:00",
      docIds: ["mock/manual/general.pdf"],
      deletedFlag: false,
    },
  },
  2002: {
    manual: {
      manualId: 2002,
      manualTitle: "管理者マニュアル",
      description: "管理者向けの詳細説明です。",
      generalUser: false,
      systemUser: true,
      updatedAt: "2024-01-12 09:00:00",
      docIds: ["mock/manual/admin.pdf"],
      deletedFlag: false,
    },
  },
  2003: {
    manual: {
      manualId: 2003,
      manualTitle: "長文テストマニュアル",
      description: "長文テスト用のマニュアル説明です。",
      generalUser: true,
      systemUser: true,
      updatedAt: "2024-01-20 15:00:00",
      docIds: [],
      deletedFlag: false,
    },
  },
};

