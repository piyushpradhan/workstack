import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify'
import fp from 'fastify-plugin'
import type { ErrorResponse } from '../types/api.js'

export default fp(async function(fastify: FastifyInstance) {
  fastify.setErrorHandler((err: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.error({
      err,
      request: {
        method: request.method,
        url: request.url,
        query: request.query,
        params: request.params,
        headers: request.headers
      }
    }, 'Unhandled error occurred')

    const statusCode = err.statusCode ?? 500
    const message = err.message ?? 'Internal Server Error'

    const errorResponse: ErrorResponse = {
      success: false,
      error: err.name ?? 'InternalServerError',
      message: statusCode < 500 ? message : 'Internal Server Error',
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url
    }

    reply.code(statusCode).send(errorResponse)
  })
})
