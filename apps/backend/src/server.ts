import Fastify from 'fastify'
import closeWithGrace from 'close-with-grace'
import { config } from './config/index.js'
import serviceApp from './app.js'

function getLoggerOptions () {
  if (process.stdout.isTTY) {
    return {
      level: config.LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    }
  }

  return { level: config.LOG_LEVEL }
}

const app = Fastify({
  logger: getLoggerOptions(),
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: 'all'
    }
  }
})

async function init () {
  // Register the main application
  await app.register(serviceApp)

  closeWithGrace(
    { delay: 500 },
    async ({ err }) => {
      if (err !== null) {
        app.log.error(err)
      }
      await app.close()
    }
  )

  await app.ready()

  try {
    await app.listen({ 
      port: config.PORT, 
      host: config.HOST 
    })
    app.log.info(`Server listening on http://${config.HOST}:${config.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

init()
