import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { config } from '../config/index.js'

export default fp(async function (fastify) {
  await fastify.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
})
