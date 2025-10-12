import fp from 'fastify-plugin';

import AuthController from './auth.controller.js';

declare module 'fastify' {
  interface FastifyInstance {
    controllers: {
      auth: AuthController;
    };
  }
}

export default fp(async (fastify) => {
  const { user, session, token } = fastify.services;

  fastify.decorate('controllers', {
    auth: new AuthController(user, token, session),
  });
});
