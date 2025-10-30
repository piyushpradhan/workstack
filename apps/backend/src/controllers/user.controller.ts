import { type RouteHandler } from "fastify";
import type UserService from "../services/user.service.js";

class UserController {
    constructor(
        private userService: UserService,
    ) { }

    get: RouteHandler = async (request, reply) => {
        try {
            const { uid, email } = request.body as { uid?: string, email?: string };

            if (uid) {
                const user = await this.userService.getUserByUid({ uid });
                return reply.code(200).send(user);
            } else if (email) {
                const user = await this.userService.getUserByEmail({ email });
                return reply.code(200).send(user);
            }

            return reply.code(400).send({ error: "Invalid request" });
        } catch (error) {
            request.log.error(error, "Error fetching user");
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    getCurrentUser: RouteHandler = async (request, reply) => {
        try {
            const uid = request.user.sub;
            const user = await this.userService.getUserByUid({ uid });
            return reply.code(200).send(user);
        } catch (error) {
            request.log.error(error, "Error fetching current user");
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    getUserById: RouteHandler = async (request, reply) => {
        try {
            const id = (request.params as { id: string }).id;
            const user = await this.userService.getUserByUid({ uid: id });
            return reply.code(200).send(user);
        } catch (error) {
            request.log.error(error, "Error fetching user by ID");
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    getUsersByProjects: RouteHandler = async (request, reply) => {
        try {
            const projectIds = (request.params as { projectIds: string }).projectIds.split(",");
            const users = await this.userService.getUsersByProjectIds({ projectIds });
            return reply.code(200).send({
                users,
                total: users.length,
                page: 1,
                limit: users.length
            });
        } catch (error) {
            request.log.error(error, "Error fetching users by projects");
            return reply.code(500).send({ error: "Internal server error" });
        }
    }

    updateCurrentUser: RouteHandler = async (request, reply) => {
        try {
            const uid = request.user.sub;
            const { name, email } = request.body as { name?: string; email?: string };

            if (!name && !email) {
                return reply.code(400).send({ error: "No update fields provided" });
            }

            const updated = await this.userService.updateUserByUid({ uid, data: { name, email } });
            return reply.code(200).send(updated);
        } catch (error) {
            request.log.error(error, "Error updating current user");
            if ((error as any)?.statusCode) {
                return reply.code((error as any).statusCode).send({ error: (error as any).message });
            }
            return reply.code(500).send({ error: "Internal server error" });
        }
    }
}

export default UserController;
