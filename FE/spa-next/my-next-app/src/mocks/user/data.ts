import type { UserDetailData, UserListItem } from "@/types/userType";

const toUserId = (index: number) => `U${String(index).padStart(4, "0")}`;

const baseUsers = Array.from({ length: 28 }).map((_, i) => {
  const index = i + 1;
  const userId = toUserId(index);
  return {
    userId,
    email: `user${index}@example.com`,
    surname: index % 5 === 0 ? "長文姓長文姓長文姓" : `山田${index}`,
    givenName: index % 7 === 0 ? "" : `太郎${index}`,
    roleId: (index % 3) + 1,
    roleName: index % 3 === 0 ? "管理者" : index % 3 === 1 ? "一般" : "閲覧",
    isLocked: index % 9 === 0,
    failedLoginAttempts: index % 9 === 0 ? 3 : 0,
    lockedAt: index % 9 === 0 ? "2024-01-20 10:00:00" : null,
    updatedAt: "2024-01-15 12:00:00",
  };
});

const edgeCases: UserListItem[] = [
  {
    userId: "U0000",
    email: "",
    surname: "空欄",
    givenName: "",
    roleId: 2,
    roleName: "一般",
    isLocked: false,
    failedLoginAttempts: 0,
    lockedAt: null,
    updatedAt: "2024-01-01 09:00:00",
  },
  {
    userId: "U9999",
    email: "long-email-address-example@example.com",
    surname: "佐藤",
    givenName: "非常に長い名前のユーザー",
    roleId: 1,
    roleName: "管理者",
    isLocked: true,
    failedLoginAttempts: 5,
    lockedAt: "2024-01-10 08:30:00",
    updatedAt: "2024-01-21 18:10:00",
  },
];

export const mockUserListItems: UserListItem[] = [...edgeCases, ...baseUsers];

export const mockUserDetailMap: Record<string, UserDetailData> = mockUserListItems.reduce(
  (acc, item, idx) => {
    const isDeleted = idx % 11 === 0;
    acc[item.userId] = {
      userId: item.userId,
      email: item.email,
      surname: item.surname,
      givenName: item.givenName,
      roleName: item.roleName,
      roleId: item.roleId,
      isLocked: item.isLocked,
      isDeleted,
      mobileNo: "090-0000-0000",
      passwordSetTime: "2024-01-01 00:00:00",
      failedLoginAttempts: item.failedLoginAttempts,
      lockOutTime: item.lockedAt,
      deletionReason: isDeleted ? "デモ削除" : "",
      creatorUserId: "system",
      createdAt: "2024-01-01 00:00:00",
      creatorUserName: "System",
      editorUserId: "system",
      editorUserName: "System",
      updatedAt: item.updatedAt,
    };
    return acc;
  },
  {} as Record<string, UserDetailData>
);

export const mockDeletedUserIds = new Set(
  Object.values(mockUserDetailMap)
    .filter((u) => u.isDeleted)
    .map((u) => u.userId)
);

export const mockUserProfile = {
  name: "Demo User",
  email: "demo-user@example.com",
};
