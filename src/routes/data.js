const S = require('fluent-json-schema')

const { comparePassword } = require('../utils/hash')

module.exports = function (router, options, next) {
  const ObjectId = router.mongo.ObjectId
  const Data = router.mongo.db.collection('data')

  router.post('/data', {
    schema: {
      body: S.object()
        .prop('text', S.string().required())
    }
  }, async function (req, res) {
    const { text } = req.body

    await Data.insertOne({ userId: ObjectId(req.user._id), text })

    res.send()
  })

  router.get('/data', async function (req, res) {
    const result = await Data.find().toArray()

    res.send({
      result
    })
  })

  next()
}
