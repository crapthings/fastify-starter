require('dotenv').config()

const fastify = require('./src')({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
})

fastify.listen({
  port: process.env.PORT
}, onFastifyListen)

function onFastifyListen () {
  console.info('\n', fastify.printRoutes())
  console.info('\n', 'fastify is running at', process.env.PORT)
  require('./src/cron')({ fastify })
}
