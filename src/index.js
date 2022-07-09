const fs = require('fs')
const path = require('path')

const Fastify = require('fastify')

const whitelist = require('./whitelist')

module.exports = function buildFastify (options = {}) {
  const ROUTES_FOLDER = path.resolve(process.cwd(), 'src', 'routes')

  const routes = fs.readdirSync(ROUTES_FOLDER)

  const fastify = Fastify(options)

  fastify.register(require('@fastify/jwt'), {
    secret: process.env.SECRET
  })

  fastify.register(require('@fastify/mongodb'), {
    forceClose: true,
    url: process.env.MONGO_URL
  })

  for (const routeName of routes) {
    const router = require(path.resolve(ROUTES_FOLDER, routeName))
    fastify.register(router, { prefix: '/api' })
  }

  fastify.addHook('onRequest', async function (req, res) {
    if (whitelist[req.url]) {
      return
    }

    try {
      await req.jwtVerify()
    } catch (err) {
      res.send(err)
    }
  })

  return fastify
}
