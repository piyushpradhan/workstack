import type { FastifyPluginAsync } from 'fastify';
import * as authSchema from '../../validations/auth.js';

const routes: FastifyPluginAsync = async (fastify) => {
  const { auth } = fastify.controllers;

  fastify.route({
    method: 'POST',
    url: '/register',
    schema: authSchema.register,
    handler: auth.register,
  });

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: authSchema.login,
    handler: auth.login,
  });
};

export default routes;
