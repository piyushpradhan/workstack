import fp from 'fastify-plugin';

import AuthController from './auth.controller.js';
import UserController from './user.controller.js';
import ProjectsController from './projects.controller.js';
import TasksController from './tasks.controller.js';

declare module 'fastify' {
  interface FastifyInstance {
    controllers: {
      auth: AuthController;
      users: UserController;
      projects: ProjectsController;
      tasks: TasksController;
    };
  }
}

export default fp(async (fastify) => {
  const { user, session, token, projects, tasks } = fastify.services;

  fastify.decorate('controllers', {
    auth: new AuthController(user, token, session),
    projects: new ProjectsController(projects),
    tasks: new TasksController(tasks),
    users: new UserController(user, projects, tasks),
  });
});
