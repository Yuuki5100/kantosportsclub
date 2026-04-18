

export const ROLES = {
    ADMIN: "admin",
    EDITOR: "editor",
    VIEWER: "viewer",
    CUSTOM: "custom",
  } as const;
  
  export type RoleType = (typeof ROLES)[keyof typeof ROLES]; // "admin" | "editor" | "viewer"
  