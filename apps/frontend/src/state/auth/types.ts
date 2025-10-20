export type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
};

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
}

export interface AuthActions {
    setUser: (user: User | null) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: Error | null) => void;
    refetchUser: () => void;
}

export interface AuthHookReturn extends AuthState, AuthActions { }
