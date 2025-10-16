import { type FastifyPluginAsync } from 'fastify';

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
          type: 'string',
          description: 'API is running',
          example: 'Hello World',
        },
      },
    },
    handler: async (request, reply) => {
      reply.send('Hello World');
    },
  });
};

export default routes;
