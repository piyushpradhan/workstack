import { type RouteHandler } from "fastify";
import type TasksService from "../services/tasks.service.js";
import type { FastifyRequest } from "fastify";
import { TokenTypes } from "../config/index.js";

interface AuthenticatedRequest extends FastifyRequest {
    user: {
        sub: string;
        jti: string;
        type: TokenTypes;
        iat: number;
        exp: number;
    };
}

class TasksController {
    constructor(
        private tasksService: TasksService
    ) { }

    list: RouteHandler = async (request: AuthenticatedRequest, reply) => {
        try {
            const userId = request.user.sub;
            const tasks = await this.tasksService.getAllUsersTasks({ userId });

            return reply.code(200).send(tasks);
        } catch (error) {
            request.log.error(error, "Error fetching user tasks");
            return reply.code(500).send({ error: "Internal server error" });
        }
    };

    listOwned: RouteHandler = async (request: AuthenticatedRequest, reply) => {
        try {
            const userId = request.user.sub;
            const tasks = await this.tasksService.getAllOwnedTasks({ userId });

            return reply.code(200).send(tasks);
        } catch (error) {
            request.log.error(error, "Error fetching owned tasks");
            return reply.code(500).send({ error: "Internal server error" });
        }
    };

    listByProject: RouteHandler = async (request: AuthenticatedRequest, reply) => {
        try {
            const userId = request.user.sub;
            const { projectId } = request.params as { projectId: string };

            const tasks = await this.tasksService.getTasksByProject({ projectId, userId });

            return reply.code(200).send(tasks);
        } catch (error) {
            request.log.error(error, "Error fetching project tasks");
            return reply.code(500).send({ error: "Internal server error" });
        }
    };

    create: RouteHandler = async (request: AuthenticatedRequest, reply) => {
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

            return reply.code(201).send(task);
        } catch (error) {
            request.log.error(error, "Error creating task");
            return reply.code(500).send({ error: "Internal server error" });
        }
    };

    get: RouteHandler = async (request: AuthenticatedRequest, reply) => {
        try {
            const userId = request.user.sub;
            const { id } = request.params as { id: string };

            const task = await this.tasksService.getTaskById({ taskId: id, userId });

            if (!task) {
                return reply.code(404).send({ error: "Task not found" });
            }

            return reply.code(200).send(task);
        } catch (error) {
            request.log.error(error, "Error fetching task");
            return reply.code(500).send({ error: "Internal server error" });
        }
    };

    update: RouteHandler = async (request: AuthenticatedRequest, reply) => {
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
                return reply.code(404).send({ error: "Task not found" });
            }

            return reply.code(200).send(task);
        } catch (error) {
            request.log.error(error, "Error updating task");
            return reply.code(500).send({ error: "Internal server error" });
        }
    };

    delete: RouteHandler = async (request: AuthenticatedRequest, reply) => {
        try {
            const userId = request.user.sub;
            const { id } = request.params as { id: string };

            const deleted = await this.tasksService.deleteTask({
                taskId: id,
                userId
            });

            if (!deleted) {
                return reply.code(404).send({ error: "Task not found" });
            }

            return reply.code(204).send();
        } catch (error) {
            request.log.error(error, "Error deleting task");
            return reply.code(500).send({ error: "Internal server error" });
        }
    };
}

export default TasksController;
