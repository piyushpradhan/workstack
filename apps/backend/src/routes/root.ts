import { FastifyPluginAsync } from 'fastify'

const routes: FastifyPluginAsync = async (app): Promise<void> => {
  console.log('Registering root routes... (again)')
  app.route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      console.log('Root route hit')
      reply.send('Hello World')
    }
  })
}

export default routes
