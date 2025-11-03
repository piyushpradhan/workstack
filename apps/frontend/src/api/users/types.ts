export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  lastLoginAt: Date | null;
  emailVerifiedAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
}

export type UserRole = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}
