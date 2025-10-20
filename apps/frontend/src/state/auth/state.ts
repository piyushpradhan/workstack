import { useQueryClient } from '@tanstack/react-query';
import { stateKeys } from '../utils';
import type { User } from './types';
import type { AuthState, AuthHookReturn } from './types';

export class AuthStateManager {
    constructor(private queryClient: ReturnType<typeof useQueryClient>) { }

    getUser(): User | null {
        return this.queryClient.getQueryData<User | null>(stateKeys.auth.user()) ?? null;
    }

    setUser(user: User | null): void {
        this.queryClient.setQueryData(stateKeys.auth.user(), user);
    }

    clearUser(): void {
        this.queryClient.setQueryData(stateKeys.auth.user(), null);
    }

    isLoading(): boolean {
        return this.queryClient.isFetching({ queryKey: stateKeys.auth.user() }) > 0;
    }

    getError(): Error | null {
        return this.queryClient.getQueryState(stateKeys.auth.user())?.error as Error | null ?? null;
    }

    invalidateUser(): void {
        this.queryClient.invalidateQueries({ queryKey: stateKeys.auth.user() });
    }

    clearAll(): void {
        this.queryClient.removeQueries({ queryKey: stateKeys.auth.all });
    }

    getAuthState(): AuthState {
        const user = this.getUser();
        return {
            user,
            isAuthenticated: Boolean(user),
            isLoading: this.isLoading(),
            error: this.getError(),
        };
    }
}

export const useAuthStateManager = () => {
    const queryClient = useQueryClient();
    return new AuthStateManager(queryClient);
};

export const useAuthState = (): AuthHookReturn => {
    const authManager = useAuthStateManager();
    const authState = authManager.getAuthState();

    const setUser = (user: User | null) => {
        authManager.setUser(user);
    };

    const clearUser = () => {
        authManager.clearUser();
    };

    const setLoading = (_loading: boolean) => {
        console.warn('setLoading is not directly supported - use query loading state');
    };

    const setError = (_error: Error | null) => {
        console.warn('setError is not directly supported - use query error state');
    };

    const refetchUser = () => {
        authManager.invalidateUser();
    };

    return {
        ...authState,
        setUser,
        clearUser,
        setLoading,
        setError,
        refetchUser,
    };
};
