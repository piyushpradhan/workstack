import fp from 'fastify-plugin';

import AuthController from './auth.controller.js';
import ProjectsController from './projects.controller.js';

declare module 'fastify' {
  interface FastifyInstance {
    controllers: {
      auth: AuthController;
      projects: ProjectsController;
    };
  }
}

export default fp(async (fastify) => {
  const { user, session, token, projects } = fastify.services;

  fastify.decorate('controllers', {
    auth: new AuthController(user, token, session),
    projects: new ProjectsController(projects),
  });
});
