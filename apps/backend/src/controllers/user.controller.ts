import { type RouteHandler } from "fastify";
import type UserService from "../services/user.service.js";
import { ResponseHelper } from "../utils/response.js";
import type ProjectsService from "../services/projects.service.js";
import type TasksService from "../services/tasks.service.js";

class UserController {
    constructor(
        private userService: UserService,
        private projectsService: ProjectsService,
        private tasksService: TasksService
    ) { }

    get: RouteHandler = async (request, reply) => {
        try {
            const { uid, email } = request.body as { uid?: string, email?: string };

            if (uid) {
                const user = await this.userService.getUserByUid({ uid });
                return ResponseHelper.success(reply, user, "User retrieved successfully");
            } else if (email) {
                const user = await this.userService.getUserByEmail({ email });
                return ResponseHelper.success(reply, user, "User retrieved successfully");
            }

            return ResponseHelper.error(reply, "Invalid request", 400, "InvalidRequest");
        } catch (error) {
            request.log.error(error, "Error fetching user");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch user");
        }
    }

    getCurrentUser: RouteHandler = async (request, reply) => {
        try {
            const uid = request.user.sub;
            const user = await this.userService.getUserByUid({ uid });
            return ResponseHelper.success(reply, user, "Current user retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching current user");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch current user");
        }
    }

    getUserById: RouteHandler = async (request, reply) => {
        try {
            const id = (request.params as { id: string }).id;
            const user = await this.userService.getUserByUid({ uid: id });
            return ResponseHelper.success(reply, user, "User retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching user by ID");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch user");
        }
    }

    getUsersByProjects: RouteHandler = async (request, reply) => {
        try {
            const projectIds = (request.params as { projectIds: string }).projectIds.split(",");
            const { limit, cursor } = request.query as { limit?: number; cursor?: string };
            const defaultLimit = 10;
            const actualLimit = limit && limit > 0 ? Math.min(limit, 100) : defaultLimit;

            const { users, cursor: nextCursor, hasNextPage } = await this.userService.getUsersByProjectIds({
                projectIds,
                limit: actualLimit,
                cursor
            });

            return ResponseHelper.cursorPaginated(reply, users, nextCursor, hasNextPage, "Users retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching users by projects");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch users");
        }
    }

    updateCurrentUser: RouteHandler = async (request, reply) => {
        try {
            const uid = request.user.sub;
            const { name, email } = request.body as { name?: string; email?: string };

            if (!name && !email) {
                return ResponseHelper.error(reply, "No update fields provided", 400, "InvalidRequest");
            }

            const updated = await this.userService.updateUserByUid({ uid, data: { name, email } });
            return ResponseHelper.success(reply, updated, "User updated successfully");
        } catch (error) {
            request.log.error(error, "Error updating current user");
            if ((error as any)?.statusCode) {
                return ResponseHelper.error(reply, (error as any).message, (error as any).statusCode, "UpdateFailed");
            }
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to update user");
        }
    }

    getUserStats: RouteHandler = async (request, reply) => {
        try {
            const uid = request.user.sub;
            const projectStats = await this.projectsService.getActiveProjectsCount({ uid });
            const taskStats = await this.tasksService.getUserTaskStats({ uid });

            const stats = {
                ...taskStats,
                ...projectStats
            }

            return ResponseHelper.success(reply, stats, "User stats retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching user stats");
            if ((error as any)?.statusCode) {
                return ResponseHelper.error(reply, (error as any).message, (error as any).statusCode, "Failed to fetch user stats");
            }
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch user stats");
        }
    }
}

export default UserController;
