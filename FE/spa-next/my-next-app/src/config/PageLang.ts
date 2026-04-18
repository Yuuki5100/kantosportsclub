export const pageLang: PageLangs = {
  ja: {
    top: "トップ",
    component: "コンポーネント",
    dashboard: "ダッシュボード",
    user: "ユーザー管理",
    userList: "ユーザー一覧",
    userDetail: "ユーザー詳細",
    roleList: "ロール一覧",
    roleDetail: "ロール詳細",
    settings: "設定",
    systemSettings: "システム設定",
    manual: "マニュアル管理",
    manualList: "マニュアル一覧",
    manualDetail: "マニュアル詳細",
  },
  en: {
    top: "Top",
    component: "Components",
    dashboard: "Dashboard",
    user: "User Management",
    userList: "User List",
    userDetail: "User Detail",
    roleList: "Role List",
    roleDetail: "Role Detail",
    settings: "Settings",
    systemSettings: "System Settings",
    manual: "Manual Management",
    manualList: "Manual List",
    manualDetail: "Manual Detail",
  },
};

/**
 * Pageコンポーネントの言語設定
 */
export type PageLangs = {
  ja: PageLang;
  en: PageLang;
};

/**
 * Pageコンポーネントの言語設定
 */
export type PageLang = {
  top: string;
  component: string;
  dashboard: string;
  user: string;
  userList: string;
  userDetail: string;
  roleList: string;
  roleDetail: string;
  settings: string;
  systemSettings: string;
  manual: string;
  manualList: string;
  manualDetail: string;
};
