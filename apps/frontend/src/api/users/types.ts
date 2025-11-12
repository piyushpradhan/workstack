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

export interface UserStats {
  activeProjects: number;
  myTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

export type UserRole = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

// Note: This type is kept for backward compatibility
// The actual API response now follows the standardized format:
// { success: true, data: User[], message?: string }
export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}
