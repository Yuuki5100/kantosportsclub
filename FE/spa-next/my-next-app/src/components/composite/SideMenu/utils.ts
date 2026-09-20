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
  roleLevel: number | null,
  isAuthenticated: boolean | null = true
): PageConfigItem[] => {
  const loginRequiredMenuKeys = new Set([
    "/player",
    "/playerStatus/list",
    "/myPage",
    "/contact",
    "/admin/menu",
  ]);

  const filtered = config
    .filter((item) => !item.hidden)
    .map((item): PageConfigItem | null => {
      const children = item.children
        ? filterPageConfig(item.children, roleLevel, isAuthenticated)
        : undefined;

      // 未ログインでも公開メニューは表示する。ただし一部メニューはログイン必須。
      const isPublicMenu = !loginRequiredMenuKeys.has(item.resourceKey);
      const accessible =
        isAuthenticated === false && isPublicMenu
          ? true
          : isAccessible(item, roleLevel);
      const hasVisibleChildren = children && children.length > 0;

      if (accessible || hasVisibleChildren) {
        return { ...item, children };
      }

      return null;
    })
    .filter((item): item is PageConfigItem => item !== null);

  return filtered;
};
