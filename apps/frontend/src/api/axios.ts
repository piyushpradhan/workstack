import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { BASE_URL } from "@/api";
import { AuthError } from "./auth/errorHandler";
import type { ApiResponse } from "./types";

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: Error | null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });
    this.failedQueue = [];
  }

  /**
   * Extracts data from standardized API response
   * Handles both old format (direct data) and new format (wrapped in ApiResponse)
   */
  private extractData<T>(response: AxiosResponse<ApiResponse<T> | T>): T {
    // For 204 No Content, return undefined
    if (response.status === 204) {
      return undefined as T;
    }

    const data = response.data;

    // Handle empty responses
    if (!data) {
      return undefined as T;
    }

    // Check if response follows the new standardized format
    if (typeof data === "object" && "success" in data) {
      const apiResponse = data as ApiResponse<T>;

      // Return the data field from the standardized response
      // If data is undefined, return undefined (for void responses)
      return apiResponse.data as T;
    }

    // Fallback to old format (direct data)
    return data as T;
  }

  private setupInterceptors() {
    // No request auth header injection; backend authenticates via HttpOnly cookies
    this.axiosInstance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error),
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // For 204 No Content, return early
        if (response.status === 204) {
          return response;
        }
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config;

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.axiosInstance(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh the token
            await axios.post(
              `${BASE_URL}/auth/refresh`,
              {},
              {
                withCredentials: true,
              },
            );

            this.processQueue(null);
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError as Error);

            // If refresh fails, redirect to login
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors - extract from standardized error response
        if (error.response) {
          const errorData = error.response.data;
          let message = "An error occurred";
          let errorCode = "UNKNOWN_ERROR";

          // Check if error follows the new standardized format
          if (errorData && typeof errorData === "object" && "success" in errorData) {
            const apiError = errorData as ApiResponse;
            message = apiError.message || apiError.error || message;
            errorCode = apiError.error || errorCode;
          } else if (errorData?.message) {
            // Fallback to old format
            message = errorData.message;
            errorCode = errorData.code || errorData.error || errorCode;
          }

          const authError = new AuthError(
            message,
            errorCode,
            error.response.status,
            errorData?.field,
          );
          return Promise.reject(authError);
        }

        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T> | T>(url, config);
    return this.extractData<T>(response);
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T> | T>(url, data, config);
    return this.extractData<T>(response);
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T> | T>(url, data, config);
    return this.extractData<T>(response);
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T> | T>(url, data, config);
    return this.extractData<T>(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T> | T>(url, config);
    return this.extractData<T>(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
