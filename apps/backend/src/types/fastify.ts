import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { User } from './database.js'

export interface AuthenticatedRequest extends FastifyRequest {
  user?: User
}

export interface FastifyInstanceWithAuth extends FastifyInstance {
  authenticate?: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
}

export interface RouteHandler {
  (request: FastifyRequest, reply: FastifyReply): Promise<any>
}

export interface AuthenticatedRouteHandler {
  (request: AuthenticatedRequest, reply: FastifyReply): Promise<any>
}
