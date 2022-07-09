module.exports = function (router, options, next) {
  router.get('/status', async function (req, res) {
    res.send(200)
  })

  next()
}
