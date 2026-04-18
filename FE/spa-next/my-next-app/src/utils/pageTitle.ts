import { PageConfigItem } from '@/config/PageConfig';

type PageLabelMap = Partial<Record<NonNullable<PageConfigItem['langKey']>, string>>;

type ResolvePageTitleArgs = {
  pathname: string;
  appTitle: string;
  pageConfig: PageConfigItem[];
  pageLabels: PageLabelMap;
  publicPageTitles?: Record<string, string>;
};

const findPageConfigByPath = (
  config: PageConfigItem[],
  path: string
): PageConfigItem | undefined => {
  for (const item of config) {
    if (item.resourceKey === path) {
      return item;
    }
    if (item.children) {
      const found = findPageConfigByPath(item.children, path);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

const formatTitle = (pageTitle: string | undefined, appTitle: string): string => {
  if (!pageTitle || pageTitle === appTitle) {
    return appTitle;
  }
  return `${pageTitle} | ${appTitle}`;
};

export const resolvePageTitle = ({
  pathname,
  appTitle,
  pageConfig,
  pageLabels,
  publicPageTitles = {},
}: ResolvePageTitleArgs): string => {
  const publicPageTitle = publicPageTitles[pathname];
  if (publicPageTitle) {
    return formatTitle(publicPageTitle, appTitle);
  }

  const page = findPageConfigByPath(pageConfig, pathname);
  const pageTitle = page?.langKey ? pageLabels[page.langKey] ?? page.name : page?.name;

  return formatTitle(pageTitle, appTitle);
};
