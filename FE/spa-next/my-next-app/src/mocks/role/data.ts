import type { RoleListItem } from "@/types/role";

export const mockRoleListItems: RoleListItem[] = [
  {
    roleId: 1,
    roleName: "管理者",
    description: "全権限",
    updatedAt: "2024-01-15 10:00:00",
  },
  {
    roleId: 2,
    roleName: "一般",
    description: "閲覧と更新",
    updatedAt: "2024-01-12 09:20:00",
  },
  {
    roleId: 3,
    roleName: "閲覧",
    description: "閲覧のみ",
    updatedAt: "2024-01-05 08:10:00",
  },
];

export const mockRolePermissionLevels: Record<number, Record<string, number>> = {
  1: {
    USER: 3,
    ROLE: 3,
    SYSTEM_SETTINGS: 3,
    NOTICE: 3,
    MANUAL: 3,
  },
  2: {
    USER: 3,
    ROLE: 2,
    SYSTEM_SETTINGS: 2,
    NOTICE: 2,
    MANUAL: 2,
  },
  3: {
    USER: 2,
    ROLE: 1,
    SYSTEM_SETTINGS: 1,
    NOTICE: 1,
    MANUAL: 1,
  },
};

