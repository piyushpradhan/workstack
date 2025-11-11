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
            const tasks = await this.tasksService.getAllUsersTasks({ userId });

            return ResponseHelper.success(reply, tasks, "Tasks retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching user tasks");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch tasks");
        }
    };

    listOwned: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const tasks = await this.tasksService.getAllOwnedTasks({ userId });

            return ResponseHelper.success(reply, tasks, "Owned tasks retrieved successfully");
        } catch (error) {
            request.log.error(error, "Error fetching owned tasks");
            return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch owned tasks");
        }
    };

    listByProject: RouteHandler = async (request, reply) => {
        try {
            const userId = request.user.sub;
            const { projectId } = request.params as { projectId: string };

            const tasks = await this.tasksService.getTasksByProject({ projectId, userId });

            return ResponseHelper.success(reply, tasks, "Project tasks retrieved successfully");
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
            };

            // Convert dueDate string to Date if provided
            const updateData: {
                title?: string;
                description?: string;
                status?: string;
                priority?: string;
                dueDate?: Date;
            } = {
                title: bodyData.title,
                description: bodyData.description,
                status: bodyData.status,
                priority: bodyData.priority,
                dueDate: bodyData.dueDate ? new Date(bodyData.dueDate) : undefined
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
