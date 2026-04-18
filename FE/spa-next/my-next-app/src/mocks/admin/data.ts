import type { AdminUser } from "@/types/admin";

export const mockAdminUsers: AdminUser[] = [
  {
    id: "A001",
    username: "admin-user",
    email: "admin-user@example.com",
    role: "ADMIN",
    createdAt: "2024-01-01 00:00:00",
    updatedAt: "2024-01-10 00:00:00",
  },
  {
    id: "A002",
    username: "operator-user",
    email: "operator@example.com",
    role: "OPERATOR",
    createdAt: "2024-01-05 00:00:00",
    updatedAt: "2024-01-15 00:00:00",
  },
];

