// src/api/apiEndpoints.ts
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";

export const API_ENDPOINTS = {
  AUTH: API_VERSION === "v2" ? {
    LOGIN: '/api/auth/user/access/login',
    LOGOUT: '/api/auth/user/access/logout',
    REFRESH: '/api/auth/user/access/refresh',
    STATUS: '/api/auth/user/access/status',
  } : {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    STATUS: '/api/auth/status',
  },
  USER: API_VERSION === "v2" ? {
    GET_PROFILE: '/user/access/profile',
    UPDATE_PROFILE: '/user/access/update',
    LIST: '/user/access/list',
    CREATE: '/user/access/create',
    DETAIL: '/user/access',
    UNLOCK: '/user/access/unlock',
    RESET_PASSWORD: '/user/access/reset-password',
    FORGOT_PASSWORD: '/user/access/forgot-password',
  } : {
    GET_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
    LIST: '/api/user/list',
    CREATE: '/api/user/create',
    DETAIL: '/api/user',
    UNLOCK: '/api/user/unlock',
    RESET_PASSWORD: '/api/user/reset-password',
    FORGOT_PASSWORD: '/api/user/forgot-password',
  },
  ADMIN: API_VERSION === "v2" ? {
    GET_USERS: '/admin/access/users',
    DELETE_USER: '/admin/access/user/delete',
    UPDATE_PERMISSIONS: '/admin/access/user/permissions',
  } : {
    GET_USERS: '/admin/users',
    DELETE_USER: '/admin/user/delete',
    UPDATE_PERMISSIONS: '/admin/user/permissions',
  },
  REPORT: API_VERSION === "v2" ? {
    GET_REPORT_MASTER_LIST: '/report/list',
    EXPORT_EXCEL_FILE: '/report/export/excel/file',   // POST
    EXPORT_PDF_FILE: '/report/export/pdf/file',       // POST
    EXPORT_EXCEL_URL: '/report/export/excel/url',     // POST
    EXPORT_PDF_URL: '/report/export/pdf/url',         // POST
    GET_REPORT_URL_POLLING: '/report/polling',        // GET (jobId付き)
  } : {
    GET_REPORT_MASTER_LIST: '/report/list',
    EXPORT_EXCEL_FILE: '/report/export/excel/file',   // POST
    EXPORT_PDF_FILE: '/report/export/pdf/file',       // POST
    EXPORT_EXCEL_URL: '/report/export/excel/url',     // POST
    EXPORT_PDF_URL: '/report/export/pdf/url',         // POST
    GET_REPORT_URL_POLLING: '/report/polling',        // GET (jobId付き)
  },
  SETTINGS: API_VERSION === "v2" ? {
    GET_SETTINGS: 'settings',
    REROAD_SETTING: 'api/settings/reload',
    PUT_SETTING: 'settings',
  } : {
    GET_SETTINGS: 'settings',
    REROAD_SETTING: 'api/settings/reload',
    PUT_SETTING: 'settings',
  },
  MAIL_TEMPLATES: API_VERSION === "v2" ? {
    GET: 'mail-templates',
    RELOAD: 'api/mail-templates/reload'
  } : {
    GET: 'mail-templates',
    RELOAD: 'api/mail-templates/reload'
  },
  ERROR_CODES: API_VERSION === "v2" ? {
    GET_ALL: 'error-codes',
    ADD: 'error-codes',
    UPDATE: 'error-codes/',
    RELOAD: 'api/error-codes/reload'
  } : {
    GET_ALL: 'error-codes',
    ADD: 'error-codes',
    UPDATE: 'error-codes/',
    RELOAD: 'api/error-codes/reload'
  },
  ROLE: {
    LIST: '/api/roles/list',
    DETAIL: '/api/roles',
    DROPDOWN: '/api/roles/dropdown',
  },
  NOTICE: {
    LIST: '/api/notice/list',
    DETAIL: '/api/notice/notice_id',
    UPDATE: '/api/notice/notice_id',
    UPLOAD: '/api/notice/upload',
    CREATE: '/api/notice/create',
    DOWNLOAD: '/api/notice/download',
  },
  SYSTEM_SETTING: {
    GET: '/api/system',
    UPDATE: '/api/system',
  },
  MOVIE: {
    LIST: '/api/movies',
  },
  PICTURE: {
    LIST: '/api/pictures',
  },
  MANUAL: {
    LIST: '/api/manual/list',
    DETAIL: '/api/manual',
    CREATE: '/api/manual/create',
    UPDATE: '/api/manual',
    DELETE: '/api/manual/delete',
    UPLOAD: '/api/manual/upload',
    DOWNLOAD: '/api/manual/download',
  },
  BATCH_LIST: 'system-transfer/batch-list',
};
