import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { BASE_URL } from './index';
import TokenStorage from './auth/storage';
import { AuthError } from './auth/errorHandler';

class ApiClient {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = TokenStorage.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const refreshToken = TokenStorage.getRefreshToken();
                    if (refreshToken) {
                        try {
                            const response = await this.axiosInstance.post('/auth/refresh', {
                                refreshToken,
                            });

                            const { token, refreshToken: newRefreshToken } = response.data;
                            TokenStorage.setToken(token);
                            if (newRefreshToken) {
                                TokenStorage.setRefreshToken(newRefreshToken);
                            }

                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return this.axiosInstance(originalRequest);
                        } catch (refreshError) {
                            TokenStorage.clearTokens();
                            window.location.href = '/login';
                            return Promise.reject(refreshError);
                        }
                    } else {
                        TokenStorage.clearTokens();
                        window.location.href = '/login';
                    }
                }

                if (error.response) {
                    const authError = new AuthError(
                        error.response.data?.message || 'An error occurred',
                        error.response.data?.code || 'UNKNOWN_ERROR',
                        error.response.status,
                        error.response.data?.field
                    );
                    return Promise.reject(authError);
                }

                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.put<T>(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.delete<T>(url, config);
        return response.data;
    }
}

export const apiClient = new ApiClient();
export default apiClient;
