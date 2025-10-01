import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

export default fp(async function (fastify: FastifyInstance) {
  // Register API v1 routes
  await fastify.register(import('./v1/index.js'), { prefix: '/api/v1' })
  await fastify.register(import('./v1/users.js'), { prefix: '/api/v1' })

  // Root route
  fastify.get('/', async (request, reply) => {
    return {
      success: true,
      data: {
        name: 'Workstack API',
        version: '1.0.0',
        description: 'Workstack Backend API',
        documentation: '/docs',
        health: '/api/v1/health'
      }
    }
  })
})
