import { type RouteHandler } from "fastify";
import type TasksService from "../services/tasks.service.js";
import { ResponseHelper } from "../utils/response.js";

class TasksController {
    constructor(
        private tasksService: TasksService
    ) { }

    list: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const query = request.query as {
                limit?: number;
                cursor?: string;
                search?: string;
                projectIds?: string | string[];
                statuses?: string | string[];
                priorities?: string | string[];
                assigneeIds?: string | string[];
                sort?: string;
            };

            const defaultLimit = 10;
            const actualLimit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : defaultLimit;

            const projectIds = Array.isArray(query.projectIds)
                ? query.projectIds
                : query.projectIds
                    ? [query.projectIds]
                    : undefined;
            const statuses = Array.isArray(query.statuses)
                ? query.statuses
                : query.statuses
                    ? [query.statuses]
                    : undefined;
            const priorities = Array.isArray(query.priorities)
                ? query.priorities
                : query.priorities
                    ? [query.priorities]
                    : undefined;
            const assigneeIds = Array.isArray(query.assigneeIds)
                ? query.assigneeIds
                : query.assigneeIds
                    ? [query.assigneeIds]
                    : undefined;

            const appliedSort: Record<string, string> = {};
            if (query.sort) {
                query.sort.split(',').forEach((sort: string) => {
                    const [sortName, sortValue] = sort.split(':');
                    appliedSort[sortName] = sortValue;
                });
            }

            const { tasks, cursor: nextCursor, hasNextPage } = await this.tasksService.getAllUsersTasks({
                userId,
                limit: actualLimit,
                cursor: query.cursor,
                search: query.search,
                projectIds,
                statuses,
                priorities,
                assigneeIds,
                sort: appliedSort
            });

            return ResponseHelper.cursorPaginated(reply, tasks, nextCursor, hasNextPage, "Tasks retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching user tasks");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch tasks");
        }
    };

    listOwned: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const query = request.query as {
                limit?: number;
                cursor?: string;
                search?: string;
                projectIds?: string | string[];
                statuses?: string | string[];
                priorities?: string | string[];
                sort?: string;
            };

            const defaultLimit = 10;
            const actualLimit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : defaultLimit;

            const projectIds = Array.isArray(query.projectIds)
                ? query.projectIds
                : query.projectIds
                    ? [query.projectIds]
                    : undefined;
            const statuses = Array.isArray(query.statuses)
                ? query.statuses
                : query.statuses
                    ? [query.statuses]
                    : undefined;
            const priorities = Array.isArray(query.priorities)
                ? query.priorities
                : query.priorities
                    ? [query.priorities]
                    : undefined;

            const appliedSort: Record<string, string> = {};
            if (query.sort) {
                query.sort.split(',').forEach((sort: string) => {
                    const [sortName, sortValue] = sort.split(':');
                    appliedSort[sortName] = sortValue;
                });
            }

            const { tasks, cursor: nextCursor, hasNextPage } = await this.tasksService.getAllOwnedTasks({
                userId,
                limit: actualLimit,
                cursor: query.cursor,
                search: query.search,
                projectIds,
                statuses,
                priorities,
                sort: appliedSort
            });

            return ResponseHelper.cursorPaginated(reply, tasks, nextCursor, hasNextPage, "Owned tasks retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching owned tasks");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch owned tasks");
        }
    };

    listByProject: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const { projectId } = request.params as { projectId: string };
            const query = request.query as {
                limit?: number;
                cursor?: string;
                search?: string;
                statuses?: string | string[];
                priorities?: string | string[];
                assigneeIds?: string | string[];
                sort?: string;
            };

            const defaultLimit = 10;
            const actualLimit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : defaultLimit;

            const statuses = Array.isArray(query.statuses)
                ? query.statuses
                : query.statuses
                    ? [query.statuses]
                    : undefined;
            const priorities = Array.isArray(query.priorities)
                ? query.priorities
                : query.priorities
                    ? [query.priorities]
                    : undefined;
            const assigneeIds = Array.isArray(query.assigneeIds)
                ? query.assigneeIds
                : query.assigneeIds
                    ? [query.assigneeIds]
                    : undefined;

            const appliedSort: Record<string, string> = {};
            if (query.sort) {
                query.sort.split(',').forEach((sort: string) => {
                    const [sortName, sortValue] = sort.split(':');
                    appliedSort[sortName] = sortValue;
                });
            }

            const { tasks, cursor: nextCursor, hasNextPage } = await this.tasksService.getTasksByProject({
                projectId,
                userId,
                limit: actualLimit,
                cursor: query.cursor,
                search: query.search,
                statuses,
                priorities,
                assigneeIds,
                sort: appliedSort
            });

            return ResponseHelper.cursorPaginated(reply, tasks, nextCursor, hasNextPage, "Project tasks retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching project tasks");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch project tasks");
        }
    };

    create: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const { title, description, priority, dueDate, projectId } = request.body as {
                title: string;
                description?: string;
                priority?: string;
                dueDate?: string;
                projectId: string;
            };

            const task = await this.tasksService.createTask({
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                projectId,
                ownerId: userId
            });

            return ResponseHelper.success(reply, task, "Task created successfully", 201);
        } catch (error) {
            request.log.error(error, "Error creating task");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to create task");
        }
    };

    get: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const { id } = request.params as { id: string };

            const task = await this.tasksService.getTaskById({ taskId: id, userId });

            if (!task) {
                return ResponseHelper.error(reply, "Task not found", 404, "TaskNotFound");
            }

            return ResponseHelper.success(reply, task, "Task retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching task");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch task");
        }
    };

    update: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const { id } = request.params as { id: string };
            const bodyData = request.body as {
                title?: string;
                description?: string;
                status?: string;
                priority?: string;
                dueDate?: string;
                ownerIds?: string[];
                memberIds?: string[];
            };

            const updateData: {
                title?: string;
                description?: string;
                status?: string;
                priority?: string;
                dueDate?: Date;
                ownerIds?: string[];
                memberIds?: string[];
            } = {
                title: bodyData.title,
                description: bodyData.description,
                status: bodyData.status,
                priority: bodyData.priority,
                dueDate: bodyData.dueDate ? new Date(bodyData.dueDate) : undefined,
                ownerIds: bodyData.ownerIds,
                memberIds: bodyData.memberIds,
            };

            const task = await this.tasksService.updateTask({
                taskId: id,
                userId,
                updateData
            });

            if (!task) {
                return ResponseHelper.error(reply, "Task not found", 404, "TaskNotFound");
            }

            return ResponseHelper.success(reply, task, "Task updated successfully");
        } catch (error) {
            request.log.error(error, "Error updating task");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to update task");
        }
    };

    delete: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const { id } = request.params as { id: string };

            const deleted = await this.tasksService.deleteTask({
                taskId: id,
                userId
            });

            if (!deleted) {
                return ResponseHelper.error(reply, "Task not found", 404, "TaskNotFound");
            }

            return ResponseHelper.noContent(reply);
        } catch (error) {
            request.log.error(error, "Error deleting task");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to delete task");
        }
    };
}

export default TasksController;
