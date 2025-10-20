import { useQueryClient } from '@tanstack/react-query';
import { stateKeys } from '../utils';
import type { UIState, UIActions, UIHookReturn, Notification } from './types';

// UI state management class
export class UIStateManager {
    constructor(private queryClient: ReturnType<typeof useQueryClient>) { }

    // Get sidebar state
    getSidebarOpen(): boolean {
        return this.queryClient.getQueryData<boolean>(stateKeys.ui.sidebarOpen()) ?? true;
    }

    // Set sidebar state
    setSidebarOpen(open: boolean): void {
        this.queryClient.setQueryData(stateKeys.ui.sidebarOpen(), open);
    }

    // Toggle sidebar
    toggleSidebar(): void {
        this.setSidebarOpen(!this.getSidebarOpen());
    }

    // Get current modal
    getCurrentModal(): string | null {
        return this.queryClient.getQueryData<string | null>(stateKeys.ui.currentModal()) ?? null;
    }

    // Set current modal
    setCurrentModal(modal: string | null): void {
        this.queryClient.setQueryData(stateKeys.ui.currentModal(), modal);
    }

    // Get theme
    getTheme(): 'light' | 'dark' | 'system' {
        return this.queryClient.getQueryData<'light' | 'dark' | 'system'>(stateKeys.ui.theme()) ?? 'system';
    }

    // Set theme
    setTheme(theme: 'light' | 'dark' | 'system'): void {
        this.queryClient.setQueryData(stateKeys.ui.theme(), theme);
    }

    // Get notifications
    getNotifications(): Notification[] {
        return this.queryClient.getQueryData<Notification[]>(stateKeys.ui.notifications()) ?? [];
    }

    // Add notification
    addNotification(notification: Omit<Notification, 'id'>): void {
        const notifications = this.getNotifications();
        const newNotification: Notification = {
            ...notification,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        this.queryClient.setQueryData(stateKeys.ui.notifications(), [...notifications, newNotification]);
    }

    // Remove notification
    removeNotification(id: string): void {
        const notifications = this.getNotifications();
        this.queryClient.setQueryData(
            stateKeys.ui.notifications(),
            notifications.filter(n => n.id !== id)
        );
    }

    // Clear all notifications
    clearNotifications(): void {
        this.queryClient.setQueryData(stateKeys.ui.notifications(), []);
    }

    // Get complete UI state
    getUIState(): UIState {
        return {
            sidebarOpen: this.getSidebarOpen(),
            currentModal: this.getCurrentModal(),
            theme: this.getTheme(),
            notifications: this.getNotifications(),
        };
    }
}

// Hook to get UI state manager
export const useUIStateManager = () => {
    const queryClient = useQueryClient();
    return new UIStateManager(queryClient);
};

// Main UI state hook
export const useUIState = (): UIHookReturn => {
    const uiManager = useUIStateManager();
    const uiState = uiManager.getUIState();

    const setSidebarOpen = (open: boolean) => {
        uiManager.setSidebarOpen(open);
    };

    const toggleSidebar = () => {
        uiManager.toggleSidebar();
    };

    const setCurrentModal = (modal: string | null) => {
        uiManager.setCurrentModal(modal);
    };

    const setTheme = (theme: 'light' | 'dark' | 'system') => {
        uiManager.setTheme(theme);
    };

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        uiManager.addNotification(notification);
    };

    const removeNotification = (id: string) => {
        uiManager.removeNotification(id);
    };

    const clearNotifications = () => {
        uiManager.clearNotifications();
    };

    return {
        ...uiState,
        setSidebarOpen,
        toggleSidebar,
        setCurrentModal,
        setTheme,
        addNotification,
        removeNotification,
        clearNotifications,
    };
};
