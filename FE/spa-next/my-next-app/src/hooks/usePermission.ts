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
 * 権限チェック Hook
 *
 * @example
 * const { getLevel, canView, canEdit } = usePermission();
 * const level = getLevel("USER");
 * if (!canView("USER")) return <Forbidden />;
 * if (canEdit("USER")) { // show create/update/delete buttons }
 */
export const usePermission = () => {
  const { rolePermissions } = useAuth();

  /**
   * 指定permissionNameの権限レベルを返す（0 = 権限なし）
   */
  const getLevel = useCallback(
    (permissionName: string): number => {
      if (!rolePermissions) return 0;
      return rolePermissions[permissionName] ?? 0;
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

  /** 各機能の参照・更新権限（事前計算） */
  const permissions = {
    canViewUser: canView("USER"),
    canEditUser: canEdit("USER"),
    canViewRole: canView("ROLE"),
    canEditRole: canEdit("ROLE"),
    canViewNotice: canView("NOTICE"),
    canEditNotice: canEdit("NOTICE"),
    canViewManual: canView("MANUAL"),
    canEditManual: canEdit("MANUAL"),
    canViewSystemSettings: canView("SYSTEM_SETTINGS"),
    canEditSystemSettings: canEdit("SYSTEM_SETTINGS"),
  };

  return { getLevel, canView, canEdit, rolePermissions, ...permissions };
};
