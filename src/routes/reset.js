module.exports = function (router, options, next) {
  router.post('/reset-database', async function (req, res) {
    const collections = await this.mongo.db.listCollections().toArray()

    for (const { name } of collections) {
      if (name.startsWith('system.')) continue
      await this.mongo.db.collection(name).deleteMany({})
    }

    res.send(200)
  })

  next()
}
