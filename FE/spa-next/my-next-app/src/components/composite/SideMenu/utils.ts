import { PageConfigItem } from "@/config/PageConfig";

//パーミッションチェック
export const isAccessible = (
  item: PageConfigItem,
  roleLevel: number | null
): boolean => {
  return (roleLevel ?? 0) >= item.requiredPermission;
};

//再帰的にメニューをフィルタリング（パーミッションによって表示するメニューを制御する）
export const filterPageConfig = (
  config: PageConfigItem[],
  roleLevel: number | null
): PageConfigItem[] => {
  const filtered = config
    .filter((item) => !item.hidden)
    .map((item): PageConfigItem | null => {
      const children = item.children
        ? filterPageConfig(item.children, roleLevel)
        : undefined;

      const accessible = isAccessible(item, roleLevel);
      const hasVisibleChildren = children && children.length > 0;

      if (accessible || hasVisibleChildren) {
        return { ...item, children };
      }

      return null;
    })
    .filter((item): item is PageConfigItem => item !== null);

  return filtered;
};
