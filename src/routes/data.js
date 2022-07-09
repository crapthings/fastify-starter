const S = require('fluent-json-schema')

const { comparePassword } = require('../utils/hash')

module.exports = function (router, options, next) {
  router.post('/data', async function (req, res) {
    const { text } = req.body

    await this.mongo.db.collection('data').insertOne({ text })

    res.send(200)
  })

  router.get('/data', async function (req, res) {
    const result = await this.mongo.db.collection('data').find().toArray()

    res.send({
      result
    })
  })

  next()
}
