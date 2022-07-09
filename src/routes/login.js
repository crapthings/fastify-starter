const S = require('fluent-json-schema')

const { comparePassword } = require('../utils/hash')

module.exports = function (router, options, next) {
  router.post('/login', {
    schema: {
      body: S.object()
        .prop('username', S.string().required())
        .prop('password', S.string().required())
    }
  },async function (req, res) {
    const { username, password } = req.body

    const user = await this.mongo.db.collection('users').findOne({ username })

    if (!user) {
      throw new Error('user doesn\'t exist')
    }

    const passwordMatched = await comparePassword(password, user.password)

    if (!passwordMatched) {
      throw new Error('wrong password')
    }

    const token = this.jwt.sign({ username })

    this.mongo.db.collection('token').insertOne({ userId: user._id, token })

    res.send({
      result: token
    })
  })

  next()
}
