import fp from "fastify-plugin";
import Prisma from "@prisma/client";

import type { FastifyPluginAsync } from "fastify";
import type { PrismaClient as PrismaClientType } from "@prisma/client";

const { PrismaClient } = Prisma;

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClientType;
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (app) => {
  const prisma = new PrismaClient();

  await prisma.$connect();

  app.decorate("prisma", prisma);
  app.addHook("onClose", async (self) => {
    await self.prisma.$disconnect();
  });
});

export default prismaPlugin;
