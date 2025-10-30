import type { LoginRequest, RegisterRequest } from '@/api/auth/types';
import apiClient from '@/api/axios';
import type { User } from '@/api/users/types';

export const login = async ({ email, password }: LoginRequest): Promise<void> => {
  await apiClient.post<void>('/auth/login', { email, password });
};

export const register = async ({ email, password, name }: RegisterRequest): Promise<void> => {
  await apiClient.post<void>('/auth/register', { email, password, name });
};

export const logout = async (): Promise<void> => {
  return apiClient.post<void>('/auth/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  return apiClient.get<User>('/users/current');
};

export const updateCurrentUser = async (payload: Partial<Pick<User, 'name' | 'email'>>): Promise<User> => {
  return apiClient.patch<User>('/users/current', payload);
};
