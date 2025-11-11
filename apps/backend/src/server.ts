import closeWithGrace from "close-with-grace";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { config } from "./config/index.js";
import build from "./app.js";

function getLoggerOptions() {
  if (process.stdout.isTTY) {
    return {
      level: config.LOG_LEVEL,
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    };
  }

  return { level: config.LOG_LEVEL };
}

const app = build({
  trustProxy: true,
  logger: getLoggerOptions(),
  ajv: {
    customOptions: {
      coerceTypes: "array",
      removeAdditional: false,
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

async function init() {
  closeWithGrace({ delay: 500 }, async ({ err }) => {
    if (err !== null) {
      app.log.error(err);
    }
    await app.close();
  });

  await app.ready();

  try {
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info(`Server listening on http://${config.HOST}:${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

init();
