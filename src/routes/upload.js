const fs = require('fs')
const util = require('util')
const path = require('path')
const { pipeline } = require('stream')

const pump = util.promisify(pipeline)

module.exports = function (router, options, next) {
  const Uploads = router.mongo.db.collection('uploads')

  router.post('/upload', async function (req, res) {
    const data = await req.file()

    const nanoid = (await import('nanoid')).nanoid

    const randomId = nanoid()

    const filename = path.resolve(process.cwd(), 'uploads', randomId)

    await pump(data.file, fs.createWriteStream(filename))

    const result = {
      filename: data.filename,
      filepath: randomId,
      encoding: data.encoding,
      mimetype: data.mimetype,
    }

    await Uploads.insertOne(result)

    res.send({
      result
    })
  })

  router.post('/download/:filename', async function (req, res) {
    const { filename } = req.params
    const stream = fs.createReadStream(path.resolve(process.cwd(), 'uploads', filename), 'utf8')

    res.header('Content-Disposition', `attachment; filename=${filename}`)
      .type('application/octet-stream')
      .send(stream)
  })

  next()
}
