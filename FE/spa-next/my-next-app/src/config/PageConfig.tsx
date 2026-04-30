import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ListIcon from "@mui/icons-material/List";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupsIcon from "@mui/icons-material/Settings";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import TimelineIcon from "@mui/icons-material/Timeline";
import { ReactNode } from "react";
import { PageLang } from '@/config/PageLang';

export type PageConfigItem = {
  name: string;
  resourceKey: string;
  requiredPermission: number;
  permissionTargetKey?: string;
  icon?: ReactNode;
  langKey?: keyof PageLang;
  children?: PageConfigItem[];
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
    breadcrumb: { id: "top" },
  },
  {
    name: "動画追加",
    resourceKey: "/movies/create",
    requiredPermission: 0,
    breadcrumb: { id: "moviesCreate", parentId: "movies" },
    hidden: true,
  },

  {
    name: "ユーザー管理",
    resourceKey: "/user",
    requiredPermission: 2,
    permissionTargetKey: "USER",
    icon: <PeopleIcon />,
    langKey: "user",
    breadcrumb: { id: "user", parentId: "top" },
    children: [
      {
        name: "ユーザー一覧",
        resourceKey: "/admin/user/list",
        requiredPermission: 2,
        permissionTargetKey: "USER",
        icon: <ListIcon />,
        langKey: "userList",
        breadcrumb: { id: "userList", parentId: "top" },
      },
      {
        name: "ユーザー一覧",
        resourceKey: "/user/list",
        requiredPermission: 2,
        permissionTargetKey: "USER",
        icon: <ListIcon />,
        langKey: "userList",
        breadcrumb: { id: "userListLegacy", parentId: "top" },
        hidden: true,
      },
      {
        name: "ユーザー詳細",
        resourceKey: "/user/detail",
        requiredPermission: 2,
        permissionTargetKey: "USER",
        langKey: "userDetail",
        breadcrumb: { id: "userDetail", parentId: "userList" },
        hidden: true,
      },
      {
        name: "ロール一覧",
        resourceKey: "/role/list",
        requiredPermission: 2,
        permissionTargetKey: "ROLE",
        icon: <ListIcon />,
        langKey: "roleList",
        breadcrumb: { id: "roleList", parentId: "top" },
      },
      {
        name: "ロール詳細",
        resourceKey: "/role/detail",
        requiredPermission: 2,
        permissionTargetKey: "ROLE",
        langKey: "roleDetail",
        breadcrumb: { id: "roleDetail", parentId: "roleList" },
        hidden: true,
      },
    ],
  },
  {
    name: "マニュアル管理",
    resourceKey: "/manual",
    requiredPermission: 2,
    permissionTargetKey: "MANUAL",
    icon: <MenuBookIcon />,
    langKey: "manual",
    breadcrumb: { id: "manual", parentId: "top" },
    children: [
      {
        name: "マニュアル一覧",
        resourceKey: "/manual/list",
        requiredPermission: 2,
        permissionTargetKey: "MANUAL",
        icon: <ListIcon />,
        langKey: "manualList",
        breadcrumb: { id: "manualList", parentId: "top" },
      },
      {
        name: "マニュアル詳細",
        resourceKey: "/manual/detail",
        requiredPermission: 2,
        permissionTargetKey: "MANUAL",
        langKey: "manualDetail",
        breadcrumb: { id: "manualDetail", parentId: "manualList" },
        hidden: true,
      },
    ],
  },
  {
    name: "システム設定",
    resourceKey: "/settings",
    requiredPermission: 2,
    permissionTargetKey: "SYSTEM_SETTINGS",
    icon: <SettingsIcon />,
    langKey: "systemSettings",
    breadcrumb: { id: "systemSettings", parentId: "top" },
  },
  {
    name: "バスケ概要",
    resourceKey: "/admin/basketball-overview",
    requiredPermission: 0,
    icon: <AccountTreeIcon />,
    breadcrumb: { id: "basketballOverview", parentId: "top" },
  },
  {
    name: "活動サマリー",
    resourceKey: "/admin/summary",
    requiredPermission: 0,
    icon: <TimelineIcon />,
    breadcrumb: { id: "summary", parentId: "top" },
  },
  {
    name: "ボドゲ一覧",
    resourceKey: "/boardgames",
    requiredPermission: 0,
    icon: <ListIcon />,
    breadcrumb: { id: "boardgames", parentId: "top" },
  },
  {
    name: "動画一覧",
    resourceKey: "/movies",
    requiredPermission: 0,
    icon: <ListIcon />,
    breadcrumb: { id: "movies", parentId: "top" },
  },
  {
    name: "写真一覧",
    resourceKey: "/pictures",
    requiredPermission: 0,
    icon: <ListIcon />,
    breadcrumb: { id: "pictures", parentId: "top" },
  },
  {
    name: "管理者ページ",
    resourceKey: "/admin/menu",
    requiredPermission: 0,
    icon: <AdminPanelSettingsIcon />,
    breadcrumb: { id: "adminMenu", parentId: "top" },
  },
];

export const getPageConfig = (): PageConfigType => pageConfig;
