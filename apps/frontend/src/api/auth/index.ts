import type { LoginRequest, RegisterRequest, AuthResponse } from './types';
import apiClient from '../axios';

export const login = async ({ email, password }: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
};

export const register = async ({ email, password, name }: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', { email, password, name });
};

export const logout = async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
};

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
};

export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
    return apiClient.get<AuthResponse['user']>('/auth/me');
};