import { type FastifyPluginAsync } from 'fastify';
import { ResponseHelper } from '../utils/response.js';

const routes: FastifyPluginAsync = async (app): Promise<void> => {
  app.route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Health check endpoint',
      tags: ['Health'],
      summary: 'Get API status',
      response: {
        200: {
          type: 'object',
          description: 'API is running',
        },
      },
    },
    handler: async (request, reply) => {
      return ResponseHelper.success(reply, { status: 'ok', message: 'API is running' }, 'API is running');
    },
  });
};

export default routes;
