import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ListIcon from "@mui/icons-material/List";
import MovieIcon from "@mui/icons-material/Movie";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import ChecklistIcon from "@mui/icons-material/MenuBook";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import TimelineIcon from "@mui/icons-material/Timeline";
import GroupsIcon from "@mui/icons-material/Settings";
import SpeedIcon from "@mui/icons-material/Speed";
import { ReactNode } from "react";
import { PageLang } from '@/config/PageLang';

export type PageConfigItem = {
  name: string;
  resourceKey: string;
  requiredPermission: number;
  icon?: ReactNode;
  langKey?: keyof PageLang;
  children?: PageConfigItem[];
  section?: "activity" | "assets" | "other";
  breadcrumb?: {
    id: string;
    parentId?: string;
  };
  hidden?: boolean;
};

export type PageConfigType = PageConfigItem[];

const pageConfig: PageConfigType = [
  {
    name: "トップ",
    icon: <HomeIcon />,
    resourceKey: "/",
    requiredPermission: 0,
    langKey: "top",
    section: "activity",
    breadcrumb: { id: "top" },
  },
  {
    name: "練習メニュー",
    resourceKey: "/practiceMenu",
    requiredPermission: 1,
    icon: <ChecklistIcon />,
    section: "activity",
    breadcrumb: { id: "practiceMenu", parentId: "top" },
  },
  // {
  //   name: "動画追加",
  //   resourceKey: "/movies/create",
  //   requiredPermission: 0,
  //   breadcrumb: { id: "moviesCreate", parentId: "movies" },
  //   hidden: true,
  // },

  // {
  //   name: "ユーザー管理",
  //   resourceKey: "/user",
  //   requiredPermission: 2,
  //   permissionTargetKey: "100",
  //   icon: <PeopleIcon />,
  //   langKey: "user",
  //   breadcrumb: { id: "user", parentId: "top" },
  //   children: [
  //     {
  //       name: "ユーザー一覧",
  //       resourceKey: "/admin/user/list",
  //       requiredPermission: 2,
  //       permissionTargetKey: "100",
  //       icon: <ListIcon />,
  //       langKey: "userList",
  //       breadcrumb: { id: "userList", parentId: "top" },
  //     },
  //     {
  //       name: "ユーザー一覧",
  //       resourceKey: "/user/list",
  //       requiredPermission: 2,
  //       permissionTargetKey: "100",
  //       icon: <ListIcon />,
  //       langKey: "userList",
  //       breadcrumb: { id: "userListLegacy", parentId: "top" },
  //       hidden: true,
  //     },
  //     {
  //       name: "ユーザー詳細",
  //       resourceKey: "/user/detail",
  //       requiredPermission: 2,
  //       permissionTargetKey: "100",
  //       langKey: "userDetail",
  //       breadcrumb: { id: "userDetail", parentId: "userList" },
  //       hidden: true,
  //     },
  //     {
  //       name: "ロール一覧",
  //       resourceKey: "/role/list",
  //       requiredPermission: 2,
  //       permissionTargetKey: "100",
  //       icon: <ListIcon />,
  //       langKey: "roleList",
  //       breadcrumb: { id: "roleList", parentId: "top" },
  //     },
  //     {
  //       name: "ロール詳細",
  //       resourceKey: "/role/detail",
  //       requiredPermission: 2,
  //       permissionTargetKey: "100",
  //       langKey: "roleDetail",
  //       breadcrumb: { id: "roleDetail", parentId: "roleList" },
  //       hidden: true,
  //     },
  //   ],
  // },
  // {
  //   name: "マニュアル管理",
  //   resourceKey: "/manual",
  //   requiredPermission: 2,
  //   permissionTargetKey: "100",
  //   icon: <MenuBookIcon />,
  //   langKey: "manual",
  //   breadcrumb: { id: "manual", parentId: "top" },
  //   children: [
  //     {
  //       name: "マニュアル一覧",
  //       resourceKey: "/manual/list",
  //       requiredPermission: 2,
  //       permissionTargetKey: "100",
  //       icon: <ListIcon />,
  //       langKey: "manualList",
  //       breadcrumb: { id: "manualList", parentId: "top" },
  //     },
  //     {
  //       name: "マニュアル詳細",
  //       resourceKey: "/manual/detail",
  //       requiredPermission: 2,
  //       permissionTargetKey: "100",
  //       langKey: "manualDetail",
  //       breadcrumb: { id: "manualDetail", parentId: "manualList" },
  //       hidden: true,
  //     },
  //   ],
  // },
  // {
  //   name: "システム設定",
  //   resourceKey: "/settings",
  //   requiredPermission: 2,
  //   permissionTargetKey: "100",
  //   icon: <SettingsIcon />,
  //   langKey: "systemSettings",
  //   breadcrumb: { id: "systemSettings", parentId: "top" },
  // },
  {
    name: "バスケ概要",
    resourceKey: "/admin/basketball-overview",
    requiredPermission: 1,
    icon: <AccountTreeIcon />,
    section: "activity",
    breadcrumb: { id: "basketballOverview", parentId: "top" },
  },
  {
    name: "活動サマリー",
    resourceKey: "/admin/summary",
    requiredPermission: 1,
    icon: <TimelineIcon />,
    section: "activity",
    breadcrumb: { id: "summary", parentId: "top" },
  },
  // {
  //   name: "ロスター",
  //   resourceKey: "/roster ",
  //   requiredPermission: 1,
  //   icon: <GroupsIcon />,
  //   section: "activity",
  //   breadcrumb: { id: "roster", parentId: "top" },
  // },
  {
    name: "選手一覧",
    resourceKey: "/player",
    requiredPermission: 1,
    icon: <SportsBasketballIcon />,
    section: "activity",
    breadcrumb: { id: "player", parentId: "top" },
  },
  {
    name: "選手ステータス設定",
    resourceKey: "/playerStatus/list",
    requiredPermission: 3,
    icon: <SpeedIcon />,
    section: "activity",
    breadcrumb: { id: "playerStatusList", parentId: "top" },
  },
  {
    name: "ボドゲ一覧",
    resourceKey: "/boardgames",
    requiredPermission: 1,
    icon: <ListIcon />,
    section: "assets",
    breadcrumb: { id: "boardgames", parentId: "top" },
  },
  {
    name: "動画一覧",
    resourceKey: "/movies",
    requiredPermission: 1,
    icon: <MovieIcon />,
    section: "assets",
    breadcrumb: { id: "movies", parentId: "top" },
  },
  {
    name: "写真一覧",
    resourceKey: "/pictures",
    requiredPermission: 1,
    icon: <PhotoLibraryIcon />,
    section: "assets",
    breadcrumb: { id: "pictures", parentId: "top" },
  },
  {
    name: "マイページ",
    resourceKey: "/myPage",
    requiredPermission: 1,
    icon: <PeopleIcon />,
    section: "other",
    breadcrumb: { id: "myPageTrial", parentId: "top" },
  },
  // {
  //   name: "体育館予約手順（開発中）",
  //   resourceKey: "/",
  //   requiredPermission: 1,
  //   icon: <ChecklistIcon />,
  //   section: "other",
  //   breadcrumb: { id: "practiceMenu", parentId: "top" },
  // },
  {
    name: "お問い合わせ",
    resourceKey: "/contact",
    requiredPermission: 1,
    icon: <AdminPanelSettingsIcon />,
    section: "other",
    breadcrumb: { id: "contact", parentId: "  " },
  },
  {
    name: "管理者ページ",
    resourceKey: "/admin/menu",
    requiredPermission: 3,
    icon: <AdminPanelSettingsIcon />,
    section: "other",
    breadcrumb: { id: "adminMenu", parentId: "top" },
  },
];

export const getPageConfig = (): PageConfigType => pageConfig;
