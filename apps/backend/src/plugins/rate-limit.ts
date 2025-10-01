import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'
import { config } from '../config/index.js'

export default fp(async function (fastify) {
  await fastify.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_TIME_WINDOW,
    errorResponseBuilder: (request, context) => ({
      success: false,
      error: 'TooManyRequests',
      message: `Rate limit exceeded, retry in ${Math.round(parseInt(context.after) / 1000)} seconds`,
      statusCode: 429,
      timestamp: new Date().toISOString(),
      path: request.url
    })
  })
})
