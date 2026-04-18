import { PageConfigItem } from "@/config/PageConfig";

//パーミッションチェック
export const isAccessible = (
  item: PageConfigItem,
  rolePermissions: Record<string, number>
): boolean => {
  const key = item.permissionTargetKey || item.resourceKey;
  const userLevel = rolePermissions[key] ?? 0;
  return userLevel >= item.requiredPermission;
};

//再帰的にメニューをフィルタリング（パーミッションによって表示するメニューを制御する）
export const filterPageConfig = (
  config: PageConfigItem[],
  rolePermissions: Record<string, number>
): PageConfigItem[] => {
  const filtered = config
    .filter((item) => !item.hidden)
    .map((item): PageConfigItem | null => {
      const children = item.children
        ? filterPageConfig(item.children, rolePermissions)
        : undefined;

      const accessible = isAccessible(item, rolePermissions);
      const hasVisibleChildren = children && children.length > 0;

      if (accessible || hasVisibleChildren) {
        return { ...item, children };
      }

      return null;
    })
    .filter((item): item is PageConfigItem => item !== null);

  return filtered;
};
