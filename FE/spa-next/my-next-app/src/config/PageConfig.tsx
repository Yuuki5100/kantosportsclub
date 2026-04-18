import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ListIcon from "@mui/icons-material/List";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuBookIcon from "@mui/icons-material/MenuBook";
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

];

export const getPageConfig = (): PageConfigType => pageConfig;
