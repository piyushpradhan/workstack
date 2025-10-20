import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, register, logout, getCurrentUser } from './index';
import type { LoginRequest, RegisterRequest, User } from './types';
import { AuthError } from './errorHandler';
import { stateKeys } from '../../state/utils';

export const authKeys = {
  all: stateKeys.auth.all,
  user: stateKeys.auth.user(),
  token: stateKeys.auth.token(),
  session: stateKeys.auth.session(),
} as const;

export const useUser = () => {
  return useQuery({
    queryKey: stateKeys.auth.user(),
    queryFn: async (): Promise<User | null> => {
      try {
        return await getCurrentUser();
      } catch (error) {
        if (error instanceof AuthError && error.statusCode === 401) {
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
    retryOnMount: true,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: stateKeys.auth.user(),
    mutationFn: async (credentials: LoginRequest): Promise<User | null> => {
      await login(credentials);
      // After successful login, get the current user and cache it
      try {
        const user = await getCurrentUser();
        return user;
      } catch (error) {
        if (error instanceof AuthError && error.statusCode === 401) {
          return null;
        }
        throw error;
      }
    },
    onSuccess: (user) => {
      // Store the user data in the cache immediately
      queryClient.setQueryData(stateKeys.auth.user(), user);
    },
    onError: (error: AuthError) => {
      console.error('Login failed:', error.message);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterRequest): Promise<void> => {
      return register(userData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: stateKeys.auth.user() });
    },
    onError: (error: AuthError) => {
      console.error('Registration failed:', error.message);
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
      queryClient.removeQueries({ queryKey: stateKeys.auth.all });
      queryClient.setQueryData(stateKeys.auth.user(), null);
    },
    onError: (error: AuthError) => {
      console.error('Logout error:', error.message);
      queryClient.removeQueries({ queryKey: stateKeys.auth.all });
      queryClient.setQueryData(stateKeys.auth.user(), null);
    },
  });
};

export const useIsAuthenticated = () => {
  const queryClient = useQueryClient();

  // Get cached data without making an API call
  const user = queryClient.getQueryData<User | null>(authKeys.user) ?? null;
  const isUserQueryLoading = queryClient.isFetching({ queryKey: authKeys.user }) > 0;

  return {
    isAuthenticated: Boolean(user),
    isLoading: isUserQueryLoading,
    user,
    error: null,
    refetchUser: () => queryClient.invalidateQueries({ queryKey: authKeys.user }),
  };
};

export const useAuth = () => {
  const { isAuthenticated, isLoading, user, error } = useIsAuthenticated();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  return {
    isAuthenticated,
    isLoading,
    user,
    error,

    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,

    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    loginError: loginMutation.error as AuthError | null,
    registerError: registerMutation.error as AuthError | null,
    logoutError: logoutMutation.error as AuthError | null,

    loginAsync: loginMutation.mutateAsync,
    registerAsync: registerMutation.mutateAsync,
    logoutAsync: logoutMutation.mutateAsync,
  };
};
