export type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type DeleteUserRequest = {
  userId: string;
};

export type UpdateUserPermissionsRequest = {
  userId: string;
  permissions: Record<string, number>;
};
