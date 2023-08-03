require('dotenv').config()

const { test } = require('tap')

const fs = require('fs')
const path = require('path')
const formAutoContent = require('form-auto-content')

const Fastify = require('../src')
const { log } = require('console')

let token
let downloadFilename

test(`reset database`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .post('/api/reset-database')

  t.equal(resp.statusCode, 200, 'returns a status code of 200')
})

test(`check server status`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .get('/api/status')

  t.equal(resp.statusCode, 200, 'returns a status code of 200')
})

test(`register a new user`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .post('/api/register')
    .payload({ username: 'test', password: 'test' })

  t.equal(resp.statusCode, 200, 'returns a status code of 200')
})

test(`register a new user with same username should failed`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .post('/api/register')
    .payload({ username: 'test', password: 'test' })

  t.equal(resp.statusCode, 500, 'returns a status code of 500')
})

test(`login with non-exist user`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .post('/api/login')
    .payload({ username: 'test1', password: 'test' })

  t.equal(resp.statusCode, 500, 'returns a status code of 500')
})

test(`login with wrong password`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .post('/api/login')
    .payload({ username: 'test', password: 'test123' })

  t.equal(resp.statusCode, 500, 'returns a status code of 500')
})

test(`login with that user`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .post('/api/login')
    .payload({ username: 'test', password: 'test' })

  token = resp.json().result

  t.type(token, 'string', 'returns a string of token')
})

test(`create new data`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .post('/api/data')
    .headers({
      authorization: 'Bearer ' + token
    })
    .payload({ text: 'fastify test' })

  t.equal(resp.statusCode, 200, 'returns a status code of 200')
})

test(`list all data`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .get('/api/data')
    .headers({
      authorization: 'Bearer ' + token
    })

  t.equal(resp.json().result.length, 1, 'data count equal to 1')
})

test(`list all data with wrong jwt token`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .get('/api/data')
    .headers({
      authorization: 'Bearer test'
    })

  t.equal(resp.statusCode, 401, 'this should cover onRequest jwt hook')
})

test(`upload file`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const form = formAutoContent({
    upload: fs.createReadStream(path.resolve(process.cwd(), 'dummy.txt'))
  })

  form.headers.authorization = 'Bearer ' + token

  const resp = await fastify.inject({
    method: 'post',
    url: '/api/upload',
    ...form,
  })

  const result = resp.json().result

  downloadFilename = result.filepath

  t.type(result, Object, 'upload file and returns filename')
})

test(`download file`, async (t) => {
  const fastify = Fastify()

  t.teardown(() => fastify.close())

  const resp = await fastify.inject()
    .post(`/api/download/${downloadFilename}`)
    .headers({
      authorization: 'Bearer ' + token,
    })

  t.equal(resp.body, 'upload me', 'upload me')
})
