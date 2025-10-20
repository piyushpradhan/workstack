import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyServerOptions, FastifyInstance } from "fastify";
import fastify from "fastify";
import cors from "@fastify/cors";

import autoload from "@fastify/autoload";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import services from "./services/index.js";
import controllers from "./controllers/index.js";
import rootRoutes from "./routes/root.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/user.js";
import taskRoutes from "./routes/tasks.js";
import { config } from "./config/index.js";

const dir = dirname(fileURLToPath(import.meta.url));

const build = (opts: FastifyServerOptions) => {
  const app: FastifyInstance = fastify(opts);

  app.register(helmet);

  app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Workstack API",
        description: "A modern authentication and user management API",
        version: "1.0.0",
        contact: {
          name: "API Support",
          email: "piyushpradhan3.14@gmail.com",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, _request, _reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  app.register(autoload, {
    dir: join(dir, "plugins"),
  });

  app.register(services);
  app.register(controllers);

  // Register routes manually instead of using autoload
  app.register(rootRoutes);
  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/users" });
  app.register(projectRoutes, { prefix: "/projects" });
  app.register(taskRoutes, { prefix: "/tasks" });

  return app;
};

export default build;
