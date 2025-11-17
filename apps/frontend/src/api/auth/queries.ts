import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/api/queryClient";
import {
  login,
  register,
  logout,
  getCurrentUser,
  updateCurrentUser,
} from "./index";
import type { LoginRequest, RegisterRequest } from "./types";
import type { User } from "@/api/users/types";
import { AuthError } from "@/api/auth/errorHandler";
import { stateKeys } from "@/state/utils";

export const authKeys = {
  all: stateKeys.auth.all,
  user: stateKeys.auth.user,
  token: stateKeys.auth.token,
  session: stateKeys.auth.session,
} as const;

export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
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
      if (
        error instanceof AuthError &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryOnMount: true,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationKey: authKeys.user(),
    mutationFn: async (credentials: LoginRequest): Promise<User | null> => {
      await login(credentials);
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
    onSuccess: async (user) => {
      queryClient.setQueryData(authKeys.user(), user);
    },
    onError: (error: AuthError) => {
      throw error;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterRequest): Promise<void> => {
      return register(userData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error: AuthError) => {
      console.error("Registration failed:", error.message);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await logout();
      } catch (error) {
        console.warn("Server logout failed, clearing local state:", error);
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
    },
    onError: (error: AuthError) => {
      console.error("Logout error:", error.message);
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
    },
  });
};

export const useIsAuthenticated = () => {
  const user = queryClient.getQueryData<User | null>(authKeys.user()) ?? null;
  const isUserQueryLoading =
    queryClient.isFetching({ queryKey: authKeys.user() }) > 0;

  return {
    isAuthenticated: Boolean(user),
    isLoading: isUserQueryLoading,
    user,
    error: null,
    refetchUser: () =>
      queryClient.invalidateQueries({ queryKey: authKeys.user() }),
  };
};

export const useAuth = () => {
  const { isAuthenticated, isLoading, user, error } = useIsAuthenticated();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const updateUserMutation = useUpdateCurrentUser();

  return {
    isAuthenticated,
    isLoading,
    user,
    error,

    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    updateUser: updateUserMutation.mutate,

    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,

    loginError: loginMutation.error as AuthError | null,
    registerError: registerMutation.error as AuthError | null,
    logoutError: logoutMutation.error as AuthError | null,
    updateUserError: updateUserMutation.error as AuthError | null,

    loginAsync: loginMutation.mutateAsync,
    registerAsync: registerMutation.mutateAsync,
    logoutAsync: logoutMutation.mutateAsync,
    updateUserAsync: updateUserMutation.mutateAsync,
  };
};

export const useUpdateCurrentUser = () => {
  return useMutation({
    mutationKey: authKeys.user(),
    mutationFn: async (
      payload: Partial<Pick<User, "name" | "email">>,
    ): Promise<User | null> => {
      const user = await updateCurrentUser(payload);
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user(), user);
    },
  });
};
