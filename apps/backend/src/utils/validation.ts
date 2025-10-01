import { FastifyRequest } from 'fastify'

export class ValidationHelper {
  static validateQuery<T>(request: FastifyRequest): T {
    return request.query as T
  }

  static validateBody<T>(request: FastifyRequest): T {
    return request.body as T
  }

  static validateParams<T>(request: FastifyRequest): T {
    return request.params as T
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
}
