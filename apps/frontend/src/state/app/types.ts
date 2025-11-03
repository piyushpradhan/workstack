export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: string;
  profileDisplayName?: string;
  notificationsInApp?: boolean;
  notificationsEmail?: boolean;
  notificationsPush?: boolean;
  notificationsDigest?: "off" | "daily" | "weekly";
}

export interface AppNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actions?: AppNotificationAction[];
}

export interface AppNotificationAction {
  label: string;
  action: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface AppState {
  settings: AppSettings;
  notifications: AppNotification[];
  isOnline: boolean;
  lastActivity: number;
}

export interface AppActions {
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  addNotification: (
    notification: Omit<AppNotification, "id" | "timestamp" | "read">,
  ) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastActivity: () => void;
}

export interface AppHookReturn extends AppState, AppActions {}
