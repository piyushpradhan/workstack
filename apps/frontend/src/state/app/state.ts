import { useQueryClient } from '@tanstack/react-query';
import { stateKeys } from '../utils';
import type { AppState, AppActions, AppHookReturn, AppSettings, AppNotification } from './types';

// App state management class
export class AppStateManager {
    constructor(private queryClient: ReturnType<typeof useQueryClient>) { }

    // Get settings
    getSettings(): AppSettings {
        return this.queryClient.getQueryData<AppSettings>(stateKeys.app.settings()) ?? {
            apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
            debugMode: process.env.NODE_ENV === 'development',
            autoSave: true,
            cacheTimeout: 300000, // 5 minutes
            theme: 'system',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
    }

    // Update settings
    updateSettings(settings: Partial<AppSettings>): void {
        const currentSettings = this.getSettings();
        this.queryClient.setQueryData(stateKeys.app.settings(), {
            ...currentSettings,
            ...settings,
        });
    }

    // Reset settings
    resetSettings(): void {
        this.queryClient.removeQueries({ queryKey: stateKeys.app.settings() });
    }

    // Get notifications
    getNotifications(): AppNotification[] {
        return this.queryClient.getQueryData<AppNotification[]>(stateKeys.app.notifications()) ?? [];
    }

    // Add notification
    addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
        const notifications = this.getNotifications();
        const newNotification: AppNotification = {
            ...notification,
            id: `app-notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
        };
        this.queryClient.setQueryData(stateKeys.app.notifications(), [...notifications, newNotification]);
    }

    // Mark notification as read
    markNotificationAsRead(id: string): void {
        const notifications = this.getNotifications();
        this.queryClient.setQueryData(
            stateKeys.app.notifications(),
            notifications.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }

    // Remove notification
    removeNotification(id: string): void {
        const notifications = this.getNotifications();
        this.queryClient.setQueryData(
            stateKeys.app.notifications(),
            notifications.filter(n => n.id !== id)
        );
    }

    // Clear all notifications
    clearNotifications(): void {
        this.queryClient.setQueryData(stateKeys.app.notifications(), []);
    }

    // Get online status
    getOnlineStatus(): boolean {
        return this.queryClient.getQueryData<boolean>(['app', 'isOnline']) ?? navigator.onLine;
    }

    // Set online status
    setOnlineStatus(isOnline: boolean): void {
        this.queryClient.setQueryData(['app', 'isOnline'], isOnline);
    }

    // Get last activity
    getLastActivity(): number {
        return this.queryClient.getQueryData<number>(['app', 'lastActivity']) ?? Date.now();
    }

    // Update last activity
    updateLastActivity(): void {
        this.queryClient.setQueryData(['app', 'lastActivity'], Date.now());
    }

    // Get complete app state
    getAppState(): AppState {
        return {
            settings: this.getSettings(),
            notifications: this.getNotifications(),
            isOnline: this.getOnlineStatus(),
            lastActivity: this.getLastActivity(),
        };
    }
}

// Hook to get app state manager
export const useAppStateManager = () => {
    const queryClient = useQueryClient();
    return new AppStateManager(queryClient);
};

// Main app state hook
export const useAppState = (): AppHookReturn => {
    const appManager = useAppStateManager();
    const appState = appManager.getAppState();

    const updateSettings = (settings: Partial<AppSettings>) => {
        appManager.updateSettings(settings);
    };

    const resetSettings = () => {
        appManager.resetSettings();
    };

    const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
        appManager.addNotification(notification);
    };

    const markNotificationAsRead = (id: string) => {
        appManager.markNotificationAsRead(id);
    };

    const removeNotification = (id: string) => {
        appManager.removeNotification(id);
    };

    const clearNotifications = () => {
        appManager.clearNotifications();
    };

    const setOnlineStatus = (isOnline: boolean) => {
        appManager.setOnlineStatus(isOnline);
    };

    const updateLastActivity = () => {
        appManager.updateLastActivity();
    };

    return {
        ...appState,
        updateSettings,
        resetSettings,
        addNotification,
        markNotificationAsRead,
        removeNotification,
        clearNotifications,
        setOnlineStatus,
        updateLastActivity,
    };
};
