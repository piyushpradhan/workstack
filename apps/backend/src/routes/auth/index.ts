import type { FastifyPluginAsync } from 'fastify';
import * as authSchema from '../../validations/auth.js';

const routes: FastifyPluginAsync = async (fastify) => {
  const { auth } = fastify.controllers;

  fastify.route({
    method: 'POST',
    url: '/register',
    schema: {
      ...authSchema.register,
      description: 'Register a new user account',
      tags: ['Authentication'],
      summary: 'User Registration',
      response: {
        201: {
          description: 'User successfully created',
          type: 'null',
        },
        400: {
          description: 'Bad request - validation error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        409: {
          description: 'Conflict - user already exists',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: auth.register,
  });

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: {
      ...authSchema.login,
      description: 'Authenticate user and get access token',
      tags: ['Authentication'],
      summary: 'User Login',
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            sessionId: {
              type: 'string',
              description: 'Session identifier',
              example: 'sess_1234567890abcdef',
            },
          },
        },
        401: {
          description: 'Unauthorized - invalid credentials',
          type: 'string',
          example: 'Email or password is invalid',
        },
        400: {
          description: 'Bad request - validation error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: auth.login,
  });
};

export default routes;
