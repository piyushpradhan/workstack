import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import fp from 'fastify-plugin'

export default fp(async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Register middleware
  await fastify.register(import('./middleware/error-handler.js'))
  await fastify.register(import('./middleware/request-logger.js'))

  // Register plugins
  await fastify.register(import('./plugins/cors.js'))
  await fastify.register(import('./plugins/helmet.js'))
  await fastify.register(import('./plugins/rate-limit.js'))
  await fastify.register(import('./plugins/swagger.js'))

  // Register routes
  await fastify.register(import('./routes/index.js'))
})
