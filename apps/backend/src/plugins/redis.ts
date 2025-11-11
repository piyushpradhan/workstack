import fp from "fastify-plugin";
import { createClient } from "redis";

import { config } from "../config/index.js";

import type { FastifyPluginAsync } from "fastify";
import type { RedisClientType } from "redis";

declare module "fastify" {
  interface FastifyInstance {
    redis: RedisClientType
  }
}

const redisPlugin: FastifyPluginAsync = fp(async (app) => {
  const client = createClient({
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD,
    socket: {
      host: config.REDIS_URL,
      port: parseInt(config.REDIS_PORT),
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          app.log.error('Redis reconnection failed after 3 retries');
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 100, 3000);
      },
      connectTimeout: 10000,
    },
    pingInterval: 30000,
  });

  client.on("error", (error) => {
    app.log.error({ err: error }, "Redis client error");
  });

  client.on("connect", () => {
    app.log.info("Redis client connected");
  });

  client.on("reconnecting", () => {
    app.log.warn("Redis client reconnecting");
  });

  await client.connect();

  app.decorate("redis", client as RedisClientType);

  // Graceful shutdown
  app.addHook('onClose', async () => {
    await client.quit();
    app.log.info("Redis client disconnected");
  });
});


export default redisPlugin;
