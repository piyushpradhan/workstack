import { FastifyReply } from 'fastify'
import { ApiResponse } from '../types/api.js'

export class ResponseHelper {
  static success<T>(reply: FastifyReply, data: T, message?: string, statusCode = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    }
    reply.code(statusCode).send(response)
  }

  static error(reply: FastifyReply, message: string, statusCode = 500, error?: string): void {
    const response: ApiResponse = {
      success: false,
      message,
      error
    }
    reply.code(statusCode).send(response)
  }

  static paginated<T>(
    reply: FastifyReply,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): void {
    const totalPages = Math.ceil(total / limit)
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    }
    reply.code(200).send(response)
  }
}
