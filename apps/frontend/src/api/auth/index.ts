import type { LoginRequest, RegisterRequest, AuthResponse } from './types';
import apiClient from '../axios';

export const login = async ({ email, password }: LoginRequest): Promise<void> => {
  await apiClient.post<void>('/auth/login', { email, password });
};

export const register = async ({ email, password, name }: RegisterRequest): Promise<void> => {
  await apiClient.post<void>('/auth/register', { email, password, name });
};

export const logout = async (): Promise<void> => {
  return apiClient.post<void>('/auth/logout');
};

export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
  return apiClient.get<AuthResponse['user']>('/users/current');
};
