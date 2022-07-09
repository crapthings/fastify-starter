const S = require('fluent-json-schema')

const { hashPassword } = require('../utils/hash')

module.exports = function (router, options, next) {
  router.post('/register', {
    schema: {
      body: S.object()
        .prop('username', S.string().required())
        .prop('password', S.string().required())
    }
  }, async function (req, res) {
    const { username, password } = req.body

    const user = await this.mongo.db.collection('users').findOne({ username })

    if (user) {
      throw new Error('user exists')
    }

    const hashedPassword = await hashPassword(password)

    await this.mongo.db.collection('users').insertOne({ username, password: hashedPassword, createdAt: new Date(), updatedAt: new Date() })

    res.send(200)
  })

  next()
}
