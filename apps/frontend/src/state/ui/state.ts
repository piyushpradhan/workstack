import { queryClient } from "@/api/queryClient";
import { stateKeys } from "@/state/utils/queryKeys";
import type { UIState, UIHookReturn, Notification } from "./types";

export class UIStateManager {
  constructor() {}

  getSidebarOpen(): boolean {
    return (
      queryClient.getQueryData<boolean>(stateKeys.ui.sidebarOpen()) ?? true
    );
  }

  setSidebarOpen(open: boolean): void {
    queryClient.setQueryData(stateKeys.ui.sidebarOpen(), open);
  }

  toggleSidebar(): void {
    this.setSidebarOpen(!this.getSidebarOpen());
  }

  getCurrentModal(): string | null {
    return (
      queryClient.getQueryData<string | null>(stateKeys.ui.currentModal()) ??
      null
    );
  }

  setCurrentModal(modal: string | null): void {
    queryClient.setQueryData(stateKeys.ui.currentModal(), modal);
  }

  getTheme(): "light" | "dark" | "system" {
    return (
      queryClient.getQueryData<"light" | "dark" | "system">(
        stateKeys.ui.theme(),
      ) ?? "system"
    );
  }

  setTheme(theme: "light" | "dark" | "system"): void {
    queryClient.setQueryData(stateKeys.ui.theme(), theme);
  }

  getNotifications(): Notification[] {
    return (
      queryClient.getQueryData<Notification[]>(stateKeys.ui.notifications()) ??
      []
    );
  }

  addNotification(notification: Omit<Notification, "id">): void {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    queryClient.setQueryData(stateKeys.ui.notifications(), [
      ...notifications,
      newNotification,
    ]);
  }

  removeNotification(id: string): void {
    const notifications = this.getNotifications();
    queryClient.setQueryData(
      stateKeys.ui.notifications(),
      notifications.filter((n) => n.id !== id),
    );
  }

  clearNotifications(): void {
    queryClient.setQueryData(stateKeys.ui.notifications(), []);
  }

  getUIState(): UIState {
    return {
      sidebarOpen: this.getSidebarOpen(),
      currentModal: this.getCurrentModal(),
      theme: this.getTheme(),
      notifications: this.getNotifications(),
    };
  }

  getIsCommandPaletteOpen(): boolean {
    return (
      queryClient.getQueryData<boolean>(stateKeys.ui.commandPaletteOpen()) ??
      false
    );
  }

  setIsCommandPaletteOpen(open: boolean): void {
    queryClient.setQueryData(stateKeys.ui.commandPaletteOpen(), open);
  }

  toggleCommandPalette(): void {
    this.setIsCommandPaletteOpen(!this.getIsCommandPaletteOpen());
  }
}

const uiStateManager = new UIStateManager();

export const useUIState = (): UIHookReturn => {
  const uiState = uiStateManager.getUIState();

  const setSidebarOpen = (open: boolean) => {
    uiStateManager.setSidebarOpen(open);
  };

  const toggleSidebar = () => {
    uiStateManager.toggleSidebar();
  };

  const setCurrentModal = (modal: string | null) => {
    uiStateManager.setCurrentModal(modal);
  };

  const setTheme = (theme: "light" | "dark" | "system") => {
    uiStateManager.setTheme(theme);
  };

  const addNotification = (notification: Omit<Notification, "id">) => {
    uiStateManager.addNotification(notification);
  };

  const removeNotification = (id: string) => {
    uiStateManager.removeNotification(id);
  };

  const clearNotifications = () => {
    uiStateManager.clearNotifications();
  };

  const getIsCommandPaletteOpen = () => {
    return uiStateManager.getIsCommandPaletteOpen();
  };

  const setIsCommandPaletteOpen = (open: boolean) => {
    uiStateManager.setIsCommandPaletteOpen(open);
  };

  const toggleCommandPalette = () => {
    uiStateManager.toggleCommandPalette();
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
    getIsCommandPaletteOpen,
    setIsCommandPaletteOpen,
    toggleCommandPalette,
  };
};
