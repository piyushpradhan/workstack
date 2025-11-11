import type { FastifyReply } from 'fastify';
import type { ApiResponse } from '../types/api.js';

export class ResponseHelper {
  static success<T>(
    reply: FastifyReply,
    data: T,
    message?: string,
    statusCode = 200,
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    reply.code(statusCode).send(response);
  }

  static error(
    reply: FastifyReply,
    message: string,
    statusCode = 500,
    error?: string,
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: error || message,
    };
    reply.code(statusCode).send(response);
  }

  static cursorPaginated<T>(
    reply: FastifyReply,
    data: T[],
    cursor?: string,
    hasNextPage = false,
    message?: string,
  ): void {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      cursor,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
      },
    };
    reply.code(200).send(response);
  }

  static noContent(reply: FastifyReply): void {
    reply.code(204).send();
  }
}
