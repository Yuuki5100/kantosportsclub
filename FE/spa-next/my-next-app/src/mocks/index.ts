import { mockDelay } from "@/mocks/common/response";
import { mockLogin, mockLogout, mockAuthStatus, mockRefresh } from "@/mocks/auth/handlers";
import {
  mockGetUserList,
  mockGetUserListForUseFetch,
  mockGetUserDetail,
  mockCreateUser,
  mockUpdateUser,
  mockDeleteUser,
  mockRestoreUser,
  mockUnlockUser,
  mockGetUserProfile,
  mockUpdateUserProfile,
} from "@/mocks/user/handlers";
import {
  mockGetRoleList,
  mockGetRoleDropdown,
  mockGetRoleDetail,
  mockCreateRole,
  mockUpdateRole,
  mockDeleteRole,
} from "@/mocks/role/handlers";
import {
  mockGetNoticeList,
  mockGetNoticeDetail,
  mockCreateNotice,
  mockUpdateNotice,
  mockUploadNoticeFiles,
  mockDownloadNoticeFile,
} from "@/mocks/notice/handlers";
import {
  mockGetManualList,
  mockGetManualDetail,
  mockCreateManual,
  mockUpdateManual,
  mockDeleteManual,
  mockUploadManualFiles,
  mockDownloadManualFile,
} from "@/mocks/manual/handlers";
import {
  mockGetSystemSetting,
  mockUpdateSystemSetting,
} from "@/mocks/systemSetting/handlers";
import {
  mockGetReportList,
  mockExportReportFile,
  mockKickReportJob,
  mockGetReportPolling,
} from "@/mocks/report/handlers";
import {
  mockGetAdminUsers,
  mockDeleteAdminUser,
  mockUpdateUserPermissions,
} from "@/mocks/admin/handlers";
import {
  mockGetErrorCodes,
  mockAddErrorCode,
  mockUpdateErrorCode,
  mockReloadErrorCodes,
} from "@/mocks/errorCode/handlers";
import {
  mockGetMailTemplates,
  mockUpdateMailTemplate,
  mockReloadMailTemplates,
} from "@/mocks/mailTemplate/handlers";
import {
  mockGetImportHistory,
  mockUploadImportFile,
  mockGetTemplateSchemaResponse,
  mockDownloadReady,
  mockDownloadImportFile,
} from "@/mocks/import/handlers";
import {
  mockUploadFile,
  mockDownloadFile,
  mockDeleteFile,
} from "@/mocks/files/handlers";
import type { UpdateUserPermissionsRequest } from "@/types/admin";
import type { MockErrorCode } from "@/mocks/errorCode/data";
import { getMessage, MessageCodes } from "@/message";
import type {
  ManualCreateRequest,
  ManualListQuery,
  ManualUpdateRequest,
} from "@/types/manual";
import type {
  NoticeCreateRequest,
  NoticeUpdateRequest,
} from "@/types/notice";
import type {
  RoleCreateRequest,
  RoleDeleteRequest,
  RoleListQuery,
  RoleUpdateRequest,
} from "@/types/role";
import type { SystemSettingUpdateRequest } from "@/types/systemSetting";
import type {
  UserCreateRequest,
  UserDeleteRequest,
  UserListQuery,
  UserUpdateRequest,
} from "@/types/userType";

type HttpMethod = "get" | "post" | "put" | "delete";

type MockRequest = {
  method: HttpMethod;
  url: string;
  params?: Record<string, unknown>;
  data?: unknown;
};

type Route = {
  method: HttpMethod;
  match: string | RegExp | ((path: string) => boolean);
  handler: (req: MockRequest & { path: string; query: Record<string, string> }) => Promise<unknown>;
};

const normalizePath = (url: string): { path: string; query: Record<string, string> } => {
  try {
    const parsed = new URL(url, "http://localhost");
    const query: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    return { path: parsed.pathname, query };
  } catch {
    const [path, queryString] = url.split("?");
    const query: Record<string, string> = {};
    if (queryString) {
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        query[key] = value;
      });
    }
    return { path, query };
  }
};

const normalizeKey = (path: string) => path.replace(/^\/+/, "");

const isFormData = (data: unknown): data is FormData =>
  typeof FormData !== "undefined" && data instanceof FormData;

const isFile = (data: unknown): data is File =>
  typeof File !== "undefined" && data instanceof File;

const matchPath = (path: string, matcher: Route["match"]): boolean => {
  const normalized = normalizeKey(path);
  if (typeof matcher === "string") {
    return normalizeKey(matcher) === normalized;
  }
  if (matcher instanceof RegExp) {
    return matcher.test(normalized) || matcher.test(path);
  }
  return matcher(path);
};

const routes: Route[] = [
  // Auth
  {
    method: "post",
    match: "/api/auth/login",
    handler: ({ data }) => mockLogin((data as { user_id?: string })?.user_id),
  },
  {
    method: "post",
    match: "/api/auth/user/access/login",
    handler: ({ data }) => mockLogin((data as { user_id?: string })?.user_id),
  },
  { method: "post", match: "/api/auth/logout", handler: () => mockLogout() },
  { method: "post", match: "/api/auth/user/access/logout", handler: () => mockLogout() },
  { method: "get", match: "/api/auth/status", handler: () => mockAuthStatus() },
  { method: "get", match: "/api/auth/user/access/status", handler: () => mockAuthStatus() },
  { method: "post", match: "/api/auth/refresh", handler: () => mockRefresh() },
  { method: "post", match: "/api/auth/user/access/refresh", handler: () => mockRefresh() },
  { method: "post", match: "/auth/refresh", handler: () => mockRefresh() },

  // User
  {
    method: "get",
    match: "/api/user/list",
    handler: ({ params }) => {
      const query = params ?? {};
      if ("pageNumber" in query || "pagesize" in query || "roleId" in query || "name" in query) {
        return mockGetUserList(query as UserListQuery);
      }
      return mockGetUserListForUseFetch(query);
    },
  },
  {
    method: "get",
    match: "/user/access/list",
    handler: ({ params }) => mockGetUserList((params ?? {}) as UserListQuery),
  },
  {
    method: "get",
    match: "/user/access/profile",
    handler: () => mockGetUserProfile(),
  },
  {
    method: "put",
    match: "/user/access/update",
    handler: () => mockUpdateUserProfile(),
  },
  {
    method: "get",
    match: "/user/profile",
    handler: () => mockGetUserProfile(),
  },
  {
    method: "put",
    match: "/user/update",
    handler: () => mockUpdateUserProfile(),
  },
  {
    method: "get",
    match: /^api\/user\/[^/]+$/,
    handler: ({ path }) => {
      const userId = path.split("/").pop() || "";
      return mockGetUserDetail(userId);
    },
  },
  {
    method: "get",
    match: /^user\/access\/[^/]+$/,
    handler: ({ path }) => {
      const userId = path.split("/").pop() || "";
      return mockGetUserDetail(userId);
    },
  },
  {
    method: "post",
    match: "/api/user/create",
    handler: ({ data }) => mockCreateUser(data as UserCreateRequest),
  },
  {
    method: "post",
    match: "/user/access/create",
    handler: ({ data }) => mockCreateUser(data as UserCreateRequest),
  },
  {
    method: "put",
    match: "/api/user/unlock",
    handler: ({ data }) => mockUnlockUser((data as { lockedUserId?: string })?.lockedUserId ?? ""),
  },
  {
    method: "put",
    match: "/user/access/unlock",
    handler: ({ data }) => mockUnlockUser((data as { lockedUserId?: string })?.lockedUserId ?? ""),
  },
  {
    method: "put",
    match: /^api\/user\/[^/]+$/,
    handler: ({ path, data }) => {
      const userId = path.split("/").pop() || "";
      return mockUpdateUser(userId, data as UserUpdateRequest);
    },
  },
  {
    method: "put",
    match: /^user\/access\/[^/]+$/,
    handler: ({ path, data }) => {
      const userId = path.split("/").pop() || "";
      return mockUpdateUser(userId, data as UserUpdateRequest);
    },
  },
  {
    method: "put",
    match: /^api\/user\/[^/]+\/delete$/,
    handler: ({ path, data }) => {
      const parts = path.split("/");
      const userId = parts[parts.length - 2] || "";
      return mockDeleteUser(userId, data as UserDeleteRequest);
    },
  },
  {
    method: "put",
    match: /^api\/user\/[^/]+\/restore$/,
    handler: ({ path }) => {
      const parts = path.split("/");
      const userId = parts[parts.length - 2] || "";
      return mockRestoreUser(userId);
    },
  },
  {
    method: "put",
    match: /^user\/access\/[^/]+\/delete$/,
    handler: ({ path, data }) => {
      const parts = path.split("/");
      const userId = parts[parts.length - 2] || "";
      return mockDeleteUser(userId, data as UserDeleteRequest);
    },
  },
  {
    method: "put",
    match: /^user\/access\/[^/]+\/restore$/,
    handler: ({ path }) => {
      const parts = path.split("/");
      const userId = parts[parts.length - 2] || "";
      return mockRestoreUser(userId);
    },
  },

  // Admin
  {
    method: "get",
    match: "/admin/users",
    handler: () => mockGetAdminUsers(),
  },
  {
    method: "get",
    match: "/admin/access/users",
    handler: () => mockGetAdminUsers(),
  },
  {
    method: "delete",
    match: /^admin\/user\/delete\/[^/]+$/,
    handler: ({ path }) => {
      const userId = path.split("/").pop() || "";
      return mockDeleteAdminUser(userId);
    },
  },
  {
    method: "delete",
    match: /^admin\/access\/user\/delete\/[^/]+$/,
    handler: ({ path }) => {
      const userId = path.split("/").pop() || "";
      return mockDeleteAdminUser(userId);
    },
  },
  {
    method: "put",
    match: "/admin/user/permissions",
    handler: ({ data }) => mockUpdateUserPermissions(data as UpdateUserPermissionsRequest),
  },
  {
    method: "put",
    match: "/admin/access/user/permissions",
    handler: ({ data }) => mockUpdateUserPermissions(data as UpdateUserPermissionsRequest),
  },

  // Role
  {
    method: "get",
    match: "/api/roles/list",
    handler: ({ params }) => mockGetRoleList((params ?? {}) as RoleListQuery),
  },
  { method: "get", match: "/api/roles/dropdown", handler: () => mockGetRoleDropdown() },
  {
    method: "get",
    match: /^api\/roles\/[^/]+$/,
    handler: ({ path }) => {
      const roleId = Number(path.split("/").pop());
      return mockGetRoleDetail(roleId);
    },
  },
  {
    method: "post",
    match: "/api/roles/create",
    handler: ({ data }) => mockCreateRole(data as RoleCreateRequest),
  },
  {
    method: "put",
    match: /^api\/roles\/[^/]+$/,
    handler: ({ path, data }) => {
      const roleId = Number(path.split("/").pop());
      return mockUpdateRole(roleId, data as RoleUpdateRequest);
    },
  },
  {
    method: "put",
    match: /^api\/roles\/[^/]+\/delete$/,
    handler: ({ path, data }) => {
      const parts = path.split("/");
      const roleId = Number(parts[parts.length - 2]);
      return mockDeleteRole(roleId, data as RoleDeleteRequest);
    },
  },

  // Notice
  { method: "get", match: "/api/notice/list", handler: () => mockGetNoticeList() },
  {
    method: "get",
    match: "/api/notice/notice_id",
    handler: ({ params, query }) => {
      const noticeId = Number((params?.notice_id as string) ?? query.notice_id);
      return mockGetNoticeDetail(noticeId);
    },
  },
  {
    method: "post",
    match: "/api/notice/create",
    handler: ({ data }) => mockCreateNotice(data as NoticeCreateRequest),
  },
  {
    method: "put",
    match: "/api/notice/notice_id",
    handler: ({ params, query, data }) => {
      const noticeId = Number((params?.notice_id as string) ?? query.notice_id);
      return mockUpdateNotice(noticeId, data as NoticeUpdateRequest);
    },
  },
  {
    method: "post",
    match: "/api/notice/upload",
    handler: ({ data }) => {
      const files = isFormData(data)
        ? data.getAll("files").filter((item): item is File => isFile(item))
        : [];
      return mockUploadNoticeFiles(files);
    },
  },
  {
    method: "get",
    match: "/api/notice/download",
    handler: ({ params, query }) => {
      const docId = String((params?.id as string) ?? query.id ?? "");
      return mockDownloadNoticeFile(docId);
    },
  },

  // Manual
  {
    method: "get",
    match: "/api/manual/list",
    handler: ({ params }) => mockGetManualList((params ?? {}) as ManualListQuery),
  },
  {
    method: "get",
    match: /^api\/manual\/[^/]+$/,
    handler: ({ path }) => {
      const manualId = Number(path.split("/").pop());
      return mockGetManualDetail(manualId);
    },
  },
  {
    method: "post",
    match: "/api/manual/create",
    handler: ({ data }) => mockCreateManual(data as ManualCreateRequest),
  },
  {
    method: "put",
    match: /^api\/manual\/[^/]+$/,
    handler: ({ path, data }) => {
      const manualId = Number(path.split("/").pop());
      return mockUpdateManual(manualId, data as ManualUpdateRequest);
    },
  },
  {
    method: "put",
    match: /^api\/manual\/delete\/[^/]+$/,
    handler: ({ path }) => {
      const manualId = Number(path.split("/").pop());
      return mockDeleteManual(manualId);
    },
  },
  {
    method: "post",
    match: "/api/manual/upload",
    handler: ({ data }) => {
      const files = isFormData(data)
        ? data.getAll("files").filter((item): item is File => isFile(item))
        : [];
      return mockUploadManualFiles(files);
    },
  },
  {
    method: "get",
    match: "/api/manual/download",
    handler: ({ params, query }) => {
      const docId = String((params?.id as string) ?? query.id ?? "");
      return mockDownloadManualFile(docId);
    },
  },

  // System Setting
  { method: "get", match: "/api/system", handler: () => mockGetSystemSetting() },
  {
    method: "put",
    match: "/api/system",
    handler: ({ data }) => mockUpdateSystemSetting(data as SystemSettingUpdateRequest),
  },

  // Report
  { method: "get", match: "/report/list", handler: () => mockGetReportList() },
  {
    method: "post",
    match: /^report\/export\/.*\/file$/,
    handler: ({ path }) => mockExportReportFile(path),
  },
  {
    method: "post",
    match: "/report/job",
    handler: () => mockKickReportJob(),
  },
  {
    method: "get",
    match: /^report\/polling\/[^/]+$/,
    handler: () => mockGetReportPolling(),
  },

  // Error Codes
  { method: "get", match: "error-codes", handler: () => mockGetErrorCodes() },
  { method: "post", match: "error-codes", handler: ({ data }) => mockAddErrorCode(data as MockErrorCode) },
  { method: "put", match: /^api\/error-codes\/.+$/, handler: () => mockUpdateErrorCode() },
  { method: "post", match: "api/error-codes/reload", handler: () => mockReloadErrorCodes() },

  // Mail Templates
  { method: "get", match: "mail-templates", handler: () => mockGetMailTemplates() },
  { method: "put", match: /^api\/mail-templates\/.+$/, handler: () => mockUpdateMailTemplate() },
  { method: "post", match: "api/mail-templates/reload", handler: () => mockReloadMailTemplates() },

  // Settings Reload
  { method: "post", match: "api/settings/reload", handler: () => ({ success: true }) },

  // Import
  { method: "get", match: "/import/history", handler: () => mockGetImportHistory() },
  {
    method: "post",
    match: "/import/upload",
    handler: ({ data }) => {
      const file = isFormData(data)
        ? data.get("file")
        : null;
      const uploadFile = isFile(file) ? file : null;
      const fileName = uploadFile?.name ?? "mock.csv";
      const extension = fileName.split(".").pop() || "csv";
      return mockUploadImportFile(fileName, extension);
    },
  },
  {
    method: "post",
    match: "/import/templateGet",
    handler: ({ params, query }) => {
      const kind = String((params?.templateId as string) ?? query.templateId ?? "users");
      return mockGetTemplateSchemaResponse(kind);
    },
  },
  {
    method: "post",
    match: /^import\/downloadReady/,
    handler: () => mockDownloadReady(),
  },
  {
    method: "post",
    match: /^import\/download/,
    handler: () => mockDownloadImportFile(),
  },

  // Files
  {
    method: "post",
    match: "/api/files/upload",
    handler: async ({ data }) => {
      const formFile = isFormData(data) ? data.get("file") : null;
      const file = isFile(formFile) ? formFile : null;
      if (!file) {
        return { success: false, error: "file required" };
      }
      const uploaded = await mockUploadFile(file);
      return { success: true, data: uploaded, error: null };
    },
  },
  {
    method: "get",
    match: "/api/files/download",
    handler: () => mockDownloadFile(),
  },
  {
    method: "delete",
    match: /^api\/files\/[^/]+$/,
    handler: ({ path }) => {
      const fileId = path.split("/").pop() || "";
      return mockDeleteFile(fileId);
    },
  },
];

export const mockApiRequest = async <T>(
  method: HttpMethod,
  url: string,
  options?: { params?: Record<string, unknown>; data?: unknown }
): Promise<T> => {
  const { path, query } = normalizePath(url);
  const params = options?.params ?? {};
  const route = routes.find((r) => r.method === method && matchPath(path, r.match));
  if (!route) {
    throw new Error(getMessage(MessageCodes.ERROR_OCCURRED_WITH_DETAIL, `${method.toUpperCase()} ${path}`));
  }

  await mockDelay(100);

  const result = await route.handler({
    method,
    url,
    path,
    query,
    params,
    data: options?.data,
  });

  return result as T;
};
