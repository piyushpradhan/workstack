export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export interface DatabaseConfig {
  url: string;
  options: {
    ssl?: boolean | { rejectUnauthorized: boolean };
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  };
}
