import fp from 'fastify-plugin';
import SessionService from './session.service.js';
import TokenService from './token.service.js';
import UserService from './user.service.js';
import ProjectsService from './projects.service.js';

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      session: SessionService;
      token: TokenService;
      user: UserService;
      projects: ProjectsService;
    };
  }
}

export default fp(async (fastify) => {
  fastify.decorate('services', {
    session: new SessionService(fastify.prisma.session),
    token: new TokenService(fastify.jwt),
    user: new UserService(fastify.prisma.user),
    projects: new ProjectsService(fastify.prisma.project),
  });
});
