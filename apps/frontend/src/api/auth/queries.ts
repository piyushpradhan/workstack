import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, register, logout, refreshToken, getCurrentUser } from './index';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from './types';
import TokenStorage from './storage';
import { AuthError } from './errorHandler';

export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
    token: () => [...authKeys.all, 'token'] as const,
    session: () => [...authKeys.all, 'session'] as const,
} as const;

export const useUser = () => {
    return useQuery({
        queryKey: authKeys.user(),
        queryFn: async (): Promise<User | null> => {
            const token = TokenStorage.getToken();
            if (!token) return null;

            try {
                return await getCurrentUser();
            } catch (error) {
                if (error instanceof AuthError && error.statusCode === 401) {
                    TokenStorage.clearTokens();
                    return null;
                }
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error instanceof AuthError && error.statusCode >= 400 && error.statusCode < 500) {
                return false;
            }
            return failureCount < 3;
        },
        enabled: TokenStorage.isAuthenticated(),
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginRequest): Promise<AuthResponse> => {
            return login(credentials);
        },
        onSuccess: (data: AuthResponse) => {
            TokenStorage.setToken(data.token);
            if (data.refreshToken) {
                TokenStorage.setRefreshToken(data.refreshToken);
            }

            queryClient.setQueryData(authKeys.user(), data.user);
            queryClient.invalidateQueries({ queryKey: authKeys.user() });
        },
        onError: (error: AuthError) => {
            console.error('Login failed:', error.message);
            TokenStorage.clearTokens();
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: RegisterRequest): Promise<AuthResponse> => {
            return register(userData);
        },
        onSuccess: (data: AuthResponse) => {
            TokenStorage.setToken(data.token);
            if (data.refreshToken) {
                TokenStorage.setRefreshToken(data.refreshToken);
            }

            queryClient.setQueryData(authKeys.user(), data.user);
            queryClient.invalidateQueries({ queryKey: authKeys.user() });
        },
        onError: (error: AuthError) => {
            console.error('Registration failed:', error.message);
            TokenStorage.clearTokens();
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<void> => {
            try {
                await logout();
            } catch (error) {
                console.warn('Server logout failed, clearing local state:', error);
            }
        },
        onSuccess: () => {
            TokenStorage.clearTokens();
            queryClient.removeQueries({ queryKey: authKeys.all });
            queryClient.setQueryData(authKeys.user(), null);
        },
        onError: (error: AuthError) => {
            console.error('Logout error:', error.message);
            TokenStorage.clearTokens();
            queryClient.removeQueries({ queryKey: authKeys.all });
            queryClient.setQueryData(authKeys.user(), null);
        },
    });
};

export const useRefreshToken = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (refreshTokenValue: string): Promise<AuthResponse> => {
            return refreshToken(refreshTokenValue);
        },
        onSuccess: (data: AuthResponse) => {
            TokenStorage.setToken(data.token);
            if (data.refreshToken) {
                TokenStorage.setRefreshToken(data.refreshToken);
            }

            queryClient.setQueryData(authKeys.user(), data.user);
        },
        onError: (error: AuthError) => {
            console.error('Token refresh failed:', error.message);
            TokenStorage.clearTokens();
            queryClient.removeQueries({ queryKey: authKeys.all });
            queryClient.setQueryData(authKeys.user(), null);
        },
    });
};

export const useIsAuthenticated = () => {
    const { data: user, isLoading, error } = useUser();

    return {
        isAuthenticated: !!user && !error,
        isLoading,
        user,
        error,
    };
};

export const useAuth = () => {
    // const { isAuthenticated, isLoading, user, error } = useIsAuthenticated();
    const isAuthenticated = TokenStorage.getToken() !== null;
    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const logoutMutation = useLogout();
    const refreshTokenMutation = useRefreshToken();

    return {
        isAuthenticated,
        // isLoading,
        // user,
        // error,

        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
        refreshToken: refreshTokenMutation.mutate,

        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        isRefreshing: refreshTokenMutation.isPending,

        loginError: loginMutation.error as AuthError | null,
        registerError: registerMutation.error as AuthError | null,
        logoutError: logoutMutation.error as AuthError | null,
        refreshError: refreshTokenMutation.error as AuthError | null,

        loginAsync: loginMutation.mutateAsync,
        registerAsync: registerMutation.mutateAsync,
        logoutAsync: logoutMutation.mutateAsync,
        refreshTokenAsync: refreshTokenMutation.mutateAsync,
    };
};
