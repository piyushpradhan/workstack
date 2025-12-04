import { type FastifyPluginAsync } from "fastify";
import { ResponseHelper } from "../utils/response.js";

const routes: FastifyPluginAsync = async (app): Promise<void> => {
  app.route({
    method: "GET",
    url: "/",
    schema: {
      description: "Health check endpoint",
      tags: ["Health"],
      summary: "Get API status",
      response: {
        200: {
          type: "object",
          description: "API is running",
        },
      },
    },
    handler: async (request, reply) => {
      return ResponseHelper.success(reply, { status: "ok", message: "API is running" }, "API is running");
    },
  });

  // Unprotected endpoint to keep Supabase active with a lightweight DB call
  app.route({
    method: "GET",
    url: "/ping",
    schema: {
      description: "Database ping endpoint to keep Supabase active",
      tags: ["Health", "DB"],
      summary: "Ping DB with lightweight query",
      response: {
        200: {
          type: "object",
          description: "Database is active",
        },
      },
    },
    handler: async (request, reply) => {
      try {
        await app.prisma.$queryRaw`SELECT 1`;
        return ResponseHelper.success(
          reply,
          { status: "ok", message: "Database is active", timestamp: new Date().toISOString() },
          "Database ping successful"
        );
      } catch (error) {
        return ResponseHelper.error(
          reply,
          "Database connection failed",
          500,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
  });
};

export default routes;
