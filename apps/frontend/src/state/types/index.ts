// State management types
export interface StateKeys {
    auth: {
        user: () => readonly ['auth', 'user'];
        token: () => readonly ['auth', 'token'];
        session: () => readonly ['auth', 'session'];
        all: () => readonly ['auth'];
    };
    ui: {
        sidebarOpen: () => readonly ['ui', 'sidebarOpen'];
        currentModal: () => readonly ['ui', 'currentModal'];
        theme: () => readonly ['ui', 'theme'];
        all: () => readonly ['ui'];
    };
    forms: {
        login: () => readonly ['forms', 'login'];
        register: () => readonly ['forms', 'register'];
        profile: () => readonly ['forms', 'profile'];
        all: () => readonly ['forms'];
    };
    app: {
        settings: () => readonly ['app', 'settings'];
        notifications: () => readonly ['app', 'notifications'];
        all: () => readonly ['app'];
    };
}

// Generic state hook return type
export interface StateHookReturn<T> {
    data: T;
    setData: (data: T | ((prev: T) => T)) => void;
    clearData: () => void;
    isLoading: boolean;
}


// Persistent state hook return type
export interface PersistentStateHookReturn<T> {
    data: T;
    setData: (data: T) => void;
    clearData: () => void;
    isLoading: boolean;
}
