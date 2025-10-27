export interface UIState {
    sidebarOpen: boolean;
    currentModal: string | null;
    theme: 'light' | 'dark' | 'system';
    notifications: Notification[];
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    actions?: NotificationAction[];
}

export interface NotificationAction {
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

export interface UIActions {
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setCurrentModal: (modal: string | null) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    getIsCommandPaletteOpen: () => boolean;
    setIsCommandPaletteOpen: (open: boolean) => void;
    toggleCommandPalette: () => void;
}

export interface UIHookReturn extends UIState, UIActions { }
