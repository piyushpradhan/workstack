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
}

export default UserController;
