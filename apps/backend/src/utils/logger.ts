import type { FastifyInstance, FastifyRequest } from 'fastify'

export class LoggerHelper {
  static logRequest(fastify: FastifyInstance, request: FastifyRequest, message: string): void {
    fastify.log.info({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      timestamp: new Date().toISOString()
    }, message)
  }

  static logError(fastify: FastifyInstance, error: Error, context?: any): void {
    fastify.log.error({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString()
    }, 'Error occurred')
  }

  static logInfo(fastify: FastifyInstance, message: string, data?: any): void {
    fastify.log.info({
      data,
      timestamp: new Date().toISOString()
    }, message)
  }
}
