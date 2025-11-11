import fp from 'fastify-plugin';
import SessionService from './session.service.js';
import TokenService from './token.service.js';
import UserService from './user.service.js';
import ProjectsService from './projects.service.js';
import TasksService from './tasks.service.js';
import { createCacheService } from '../utils/cache.js';

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      session: SessionService;
      token: TokenService;
      user: UserService;
      projects: ProjectsService;
      tasks: TasksService;
    };
    cache: ReturnType<typeof createCacheService>;
  }
}

export default fp(async (fastify) => {
  const cacheService = createCacheService(fastify.redis);
  fastify.decorate('cache', cacheService);

  fastify.decorate('services', {
    session: new SessionService(fastify.prisma.session),
    token: new TokenService(fastify.jwt),
    user: new UserService(fastify.prisma.user),
    projects: new ProjectsService(fastify.prisma.project, cacheService),
    tasks: new TasksService(fastify.prisma.task, cacheService),
  });
});
