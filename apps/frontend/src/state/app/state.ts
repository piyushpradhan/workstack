import { queryClient } from '@/api/queryClient';
import { stateKeys } from '../utils';
import type { AppState, AppHookReturn, AppSettings, AppNotification } from './types';

// App state management class
export class AppStateManager {
    constructor() { }

    // Get settings
    getSettings(): AppSettings {
        return queryClient.getQueryData<AppSettings>(stateKeys.app.settings()) ?? {
            theme: 'system',
            language: 'en',
            profileDisplayName: '',
            notificationsInApp: true,
            notificationsEmail: false,
            notificationsPush: false,
            notificationsDigest: 'off',
        };
    }

    // Update settings
    updateSettings(settings: Partial<AppSettings>): void {
        const currentSettings = this.getSettings();
        queryClient.setQueryData(stateKeys.app.settings(), {
            ...currentSettings,
            ...settings,
        });
    }

    // Reset settings
    resetSettings(): void {
        queryClient.removeQueries({ queryKey: stateKeys.app.settings() });
    }

    // Get notifications
    getNotifications(): AppNotification[] {
        return queryClient.getQueryData<AppNotification[]>(stateKeys.app.notifications()) ?? [];
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
        queryClient.setQueryData(stateKeys.app.notifications(), [...notifications, newNotification]);
    }

    // Mark notification as read
    markNotificationAsRead(id: string): void {
        const notifications = this.getNotifications();
        queryClient.setQueryData(
            stateKeys.app.notifications(),
            notifications.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }

    // Remove notification
    removeNotification(id: string): void {
        const notifications = this.getNotifications();
        queryClient.setQueryData(
            stateKeys.app.notifications(),
            notifications.filter(n => n.id !== id)
        );
    }

    // Clear all notifications
    clearNotifications(): void {
        queryClient.setQueryData(stateKeys.app.notifications(), []);
    }

    // Get online status
    getOnlineStatus(): boolean {
        return queryClient.getQueryData<boolean>(['app', 'isOnline']) ?? navigator.onLine;
    }

    // Set online status
    setOnlineStatus(isOnline: boolean): void {
        queryClient.setQueryData(['app', 'isOnline'], isOnline);
    }

    // Get last activity
    getLastActivity(): number {
        return queryClient.getQueryData<number>(['app', 'lastActivity']) ?? Date.now();
    }

    // Update last activity
    updateLastActivity(): void {
        queryClient.setQueryData(['app', 'lastActivity'], Date.now());
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
    return new AppStateManager();
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
