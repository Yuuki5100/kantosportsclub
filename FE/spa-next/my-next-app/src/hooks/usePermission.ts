import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * 権限レベル定数
 * 1: なし（非表示）
 * 2: 参照（読み取り専用）
 * 3: 更新（フルアクセス）
 */
export const PERMISSION_LEVEL = {
  NONE: 1,
  VIEW: 2,
  EDIT: 3,
} as const;

/**
 * permissionId 定数
 * BE の /auth/status は permissionId をキーにした rolePermissions を返す
 */
export const PERMISSION_ID = {
  USER: 1,
  ROLE: 2,
  NOTICE: 4,
  SYSTEM_SETTINGS: 3,
  MANUAL: 5,
} as const;

/**
 * 権限チェック Hook
 *
 * @example
 * const { getLevel, canView, canEdit } = usePermission();
 * const level = getLevel("USER");
 * if (!canView("USER")) return <Forbidden />;
 * if (canEdit("USER")) { // show create/update/delete buttons }
 */
export const usePermission = () => {
  const { roleLevel, rolePermissions } = useAuth() as {
    roleLevel?: number | null;
    rolePermissions?: Record<string, number> | null;
  };

  /**
   * 指定permissionNameの権限レベルを返す（0 = 権限なし）
   */
  const getLevel = useCallback(
    (permissionName: string): number => {
      if (!rolePermissions) return 0;
      return rolePermissions[permissionName] ?? rolePermissions[String(permissionName)] ?? 0;
    },
    [rolePermissions]
  );

  /**
   * 参照権限（statusLevelId >= 2）があるか
   */
  const canView = useCallback(
    (permissionName: string): boolean => getLevel(permissionName) >= PERMISSION_LEVEL.VIEW,
    [getLevel]
  );

  /**
   * 更新権限（statusLevelId >= 3）があるか
   */
  const canEdit = useCallback(
    (permissionName: string): boolean => getLevel(permissionName) >= PERMISSION_LEVEL.EDIT,
    [getLevel]
  );

  const canViewByRoleLevel = (requiredLevel: number = PERMISSION_LEVEL.NONE): boolean =>
    (roleLevel ?? 0) >= requiredLevel;

  const canEditByRoleLevel = (requiredLevel: number = PERMISSION_LEVEL.EDIT): boolean =>
    (roleLevel ?? 0) >= requiredLevel;

  /** 各機能の参照・更新権限（事前計算） */
  const permissions = {
    canViewUser: canViewByRoleLevel(PERMISSION_LEVEL.VIEW),
    canEditUser: canEditByRoleLevel(),
    canViewRole: canViewByRoleLevel(PERMISSION_LEVEL.VIEW),
    canEditRole: canEditByRoleLevel(),
    canViewNotice: canViewByRoleLevel(PERMISSION_LEVEL.VIEW),
    canEditNotice: canEditByRoleLevel(),
    canViewManual: canViewByRoleLevel(PERMISSION_LEVEL.VIEW),
    canEditManual: canEditByRoleLevel(),
    canViewSystemSettings: canViewByRoleLevel(PERMISSION_LEVEL.VIEW),
    canEditSystemSettings: canEditByRoleLevel(),
  };

  return { getLevel, canView, canEdit, rolePermissions, ...permissions };
};
