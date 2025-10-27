// API exports for easy importing
export { useAuth, useUser, useLogin, useRegister, useLogout } from './auth/queries';
export {
    useProjects,
    useAllProjects,
    useProject,
    useCreateProject,
    useUpdateProject,
    useDeleteProject
} from './projects/queries';

// Re-export types for convenience
export type { User } from './auth/types';
export type { Project, CreateProjectRequest, UpdateProjectRequest } from './projects/types';

export const BASE_URL = import.meta.env.VITE_API_URL;