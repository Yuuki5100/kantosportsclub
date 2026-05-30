export type MockAuthUser = {
  userId: string;
  username: string;
  givenName: string;
  surname: string;
  email: string;
  roleLevel: number;
  rolePermissions: Record<string, number>;
};

export const mockUsers: Record<string, MockAuthUser> = {
  admin: {
    userId: "demo-admin",
    username: "demo-admin",
    givenName: "Demo",
    surname: "Admin",
    email: "demo-admin@example.com",
    roleLevel: 3,
    rolePermissions: {
      USER: 3,
      ROLE: 3,
      SYSTEM_SETTINGS: 3,
      NOTICE: 3,
      MANUAL: 3,
      "1": 3,
      "2": 3,
      "3": 3,
      "4": 3,
      "5": 3,
    },
  },
  operator: {
    userId: "demo-operator",
    username: "demo-operator",
    givenName: "Demo",
    surname: "Operator",
    email: "demo-operator@example.com",
    roleLevel: 2,
    rolePermissions: {
      USER: 3,
      ROLE: 2,
      SYSTEM_SETTINGS: 2,
      NOTICE: 2,
      MANUAL: 2,
      "1": 3,
      "2": 2,
      "3": 2,
      "4": 2,
      "5": 2,
    },
  },
  user: {
    userId: "demo-user",
    username: "demo-user",
    givenName: "Demo",
    surname: "User",
    email: "demo-user@example.com",
    roleLevel: 2,
    rolePermissions: {
      USER: 3,
      ROLE: 2,
      SYSTEM_SETTINGS: 2,
      NOTICE: 2,
      MANUAL: 2,
      "1": 3,
      "2": 2,
      "3": 2,
      "4": 2,
      "5": 2,
    },
  },
  readonly: {
    userId: "demo-readonly",
    username: "demo-readonly",
    givenName: "Demo",
    surname: "ReadOnly",
    email: "demo-readonly@example.com",
    roleLevel: 1,
    rolePermissions: {
      USER: 2,
      ROLE: 1,
      SYSTEM_SETTINGS: 1,
      NOTICE: 1,
      MANUAL: 1,
      "1": 2,
      "2": 1,
      "3": 1,
      "4": 1,
      "5": 1,
    },
  },
};

export const defaultMockUser = mockUsers.admin;
