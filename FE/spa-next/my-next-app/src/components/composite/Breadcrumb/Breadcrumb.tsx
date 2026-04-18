import React from "react";
import { Breadcrumbs, Link } from "@/components/base";
import type { SxProps, Theme } from "@/components/base";
import { PageConfigItem } from "@/config/PageConfig";
import { PageLang } from "@/config/PageLang";
import { Font16 } from "@/components/base";

// 定数
const TEXT_PRIMARY_COLOR = "text.primary";
const LINK_COLOR = "inherit";
const BREADCRUMB_SEPARATOR = ">";
const LINK_HOVER_STYLE = { textDecoration: "underline" };
const LINK_SX = { cursor: "pointer", "&:hover": LINK_HOVER_STYLE };
const DEFAULT_BREADCRUMB_SX: SxProps<Theme> = { mt: 1 };

/**
 * 現在のページに該当する PageConfigItem を取得
 */
const findCurrentPageItem = (
  pathname: string,
  config: PageConfigItem[]
): PageConfigItem | undefined => {
  for (const item of config) {
    if (item.resourceKey === pathname) return item;
    if (item.children) {
      const found = findCurrentPageItem(pathname, item.children);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * parentId をたどって再帰的にパンくずを構築する
 */
const buildBreadcrumbPath = (
  currentItem: PageConfigItem,
  config: PageConfigItem[]
): PageConfigItem[] => {
  const path: PageConfigItem[] = [];
  let node: PageConfigItem | undefined = currentItem;
  while (node) {
    path.unshift(node);
    const parentId = node.breadcrumb?.parentId;
    if (!parentId) break;
    node = findItemByBreadcrumbId(parentId, config);
  }
  return path;
};

/**
 * breadcrumb.id から該当ページを検索
 */
const findItemByBreadcrumbId = (
  id: string,
  config: PageConfigItem[]
): PageConfigItem | undefined => {
  for (const item of config) {
    if (item.breadcrumb?.id === id) return item;
    if (item.children) {
      const found = findItemByBreadcrumbId(id, item.children);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Breadcrumbコンポーネントのプロパティ
 */
type BreadcrumbProps = {
  currentPath: string;
  pageConfigType: PageConfigItem[];
  language: PageLang;
  onLinkClick: (path: string) => void;
  sx?: SxProps<Theme>;
};

/**
 * Breadcrumbコンポーネント
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentPath,
  pageConfigType,
  language,
  onLinkClick,
  sx,
}) => {
  const current = findCurrentPageItem(currentPath, pageConfigType);
  const breadcrumbItems = current
    ? buildBreadcrumbPath(current, pageConfigType)
    : [];

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={BREADCRUMB_SEPARATOR}
      sx={sx ?? DEFAULT_BREADCRUMB_SX}
    >
      {breadcrumbItems.map((item, index) =>
        index === breadcrumbItems.length - 1 ? (
          <Font16 key={item.resourceKey} bold={false} sx={{ color: TEXT_PRIMARY_COLOR }}>
            {item.langKey ? language[item.langKey] : item.name}
          </Font16>
        ) : (
          <Link
            key={item.resourceKey}
            color={LINK_COLOR}
            onClick={() => onLinkClick(item.resourceKey)}
            sx={LINK_SX}
          >
            {item.langKey ? language[item.langKey] : item.name}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
};

export default Breadcrumb;
