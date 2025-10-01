import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

export default fp(async function (fastify: FastifyInstance) {
  // Health check route
  fastify.get('/health', async (request, reply) => {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    }
  })

  // API info route
  fastify.get('/', async (request, reply) => {
    return {
      success: true,
      data: {
        name: 'Workstack API',
        version: '1.0.0',
        description: 'Workstack Backend API v1',
        documentation: '/docs'
      }
    }
  })
})
