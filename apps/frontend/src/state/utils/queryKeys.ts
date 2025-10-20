export const stateKeys = {
    auth: {
        all: ['auth'] as const,
        user: () => ['auth', 'user'] as const,
        token: () => ['auth', 'token'] as const,
        session: () => ['auth', 'session'] as const,
    },
    ui: {
        all: ['ui'] as const,
        sidebarOpen: () => ['ui', 'sidebarOpen'] as const,
        currentModal: () => ['ui', 'currentModal'] as const,
        theme: () => ['ui', 'theme'] as const,
        notifications: () => ['ui', 'notifications'] as const,
    },
    app: {
        all: ['app'] as const,
        settings: () => ['app', 'settings'] as const,
        notifications: () => ['app', 'notifications'] as const,
        cache: () => ['app', 'cache'] as const,
    },
    persistent: {
        all: ['persistent'] as const,
        theme: () => ['persistent', 'theme'] as const,
        language: () => ['persistent', 'language'] as const,
        preferences: () => ['persistent', 'preferences'] as const,
    },
} as const;

export type StateKey = typeof stateKeys;
