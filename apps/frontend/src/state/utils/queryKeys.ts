import type { ProjectFilters } from "@/state/projects/state";
import type { TaskFilters } from "@/state/tasks/state";

export const stateKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => ["auth", "user"] as const,
    token: () => ["auth", "token"] as const,
    session: () => ["auth", "session"] as const,
  },
  ui: {
    all: ["ui"] as const,
    sidebarOpen: () => ["ui", "sidebarOpen"] as const,
    currentModal: () => ["ui", "currentModal"] as const,
    theme: () => ["ui", "theme"] as const,
    notifications: () => ["ui", "notifications"] as const,
    commandPaletteOpen: () => ["ui", "commandPaletteOpen"] as const,
  },
  app: {
    all: ["app"] as const,
    settings: () => ["app", "settings"] as const,
    notifications: () => ["app", "notifications"] as const,
    cache: () => ["app", "cache"] as const,
  },
  persistent: {
    all: ["persistent"] as const,
    theme: () => ["persistent", "theme"] as const,
    language: () => ["persistent", "language"] as const,
    preferences: () => ["persistent", "preferences"] as const,
  },
  projects: {
    all: ["projects"] as const,
    lists: () => ["projects", "list"] as const,
    list: (filters: ProjectFilters) => ["projects", "list", filters] as const,
    details: () => ["projects", "detail"] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    byStatus: (status: string) => ["projects", "status", status] as const,
    byUser: (userId: string) => ["projects", "user", userId] as const,
    myProjects: () => ["projects", "my"] as const,
    recent: () => ["projects", "recent"] as const,
    stats: () => ["projects", "stats"] as const,
  } as const,
  tasks: {
    all: ["tasks"] as const,
    lists: () => ["tasks", "list"] as const,
    list: (filters: TaskFilters) => ["tasks", "list", filters] as const,
    details: () => ["tasks", "detail"] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
    byProject: (projectId: string) => ["tasks", "project", projectId] as const,
    byStatus: (status: string) => ["tasks", "status", status] as const,
    byPriority: (priority: string) => ["tasks", "priority", priority] as const,
    byUser: (userId: string) => ["tasks", "user", userId] as const,
    myTasks: () => ["tasks", "my"] as const,
    overdue: () => ["tasks", "overdue"] as const,
    dueToday: () => ["tasks", "due-today"] as const,
    dueThisWeek: () => ["tasks", "due-this-week"] as const,
    completed: () => ["tasks", "completed"] as const,
    recent: () => ["tasks", "recent"] as const,
    dependencies: (taskId: string) =>
      ["tasks", "dependencies", taskId] as const,
    dependents: (taskId: string) => ["tasks", "dependents", taskId] as const,
    stats: () => ["tasks", "stats"] as const,
    search: (query: string) => ["tasks", "search", query] as const,
  } as const,
  users: {
    all: ["users"] as const,
    details: () => ["users", "detail"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    byProject: (projectId: string) => ["users", "project", projectId] as const,
    byStatus: (status: string) => ["users", "status", status] as const,
  } as const,
} as const;

export type StateKey = typeof stateKeys;
