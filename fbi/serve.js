const fs = require('fs')
const path = require('path')
const http = require('http')
const convert = require('koa-convert')
const webpack = require('webpack')

const fbi = ctx
const devMiddleware = require('./middlewares/dev')
const hotMiddleware = require('./middlewares/hot')
const webpackConfig = require('./webpack.config.js')(require, fbi)
const compile = webpack(webpackConfig)

let start = fbi.taskParams
  ? fbi.taskParams[0] * 1
  : fbi.options.server.port

// auto selected a valid port & start server
function autoPortServer(app, cb) {
  let port = start
  start += 1
  const server = http.createServer(app.callback())

  server.listen(port, err => {
    server.once('close', () => {
      app.listen(port, err => {
        if (err) {
          fbi.log(err)
          return
        }
        cb(port)
      })
    })
    server.close()
  })
  server.on('error', err => {
    autoPortServer(cb)
  })
}

function server() {
  const Koa = require('koa')
  const serve = require('koa-static')
  const app = new Koa()

  app.use((ctx, next) => {
    const start = new Date()
    return next().then(() => {
      const ms = new Date() - start
      fbi.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
    })
  })

  app.use(devMiddleware(compile, {
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    },
    publicPath: '/',
    stats: {
      colors: true,
      chunks: false,
      modules: false,
      children: false
    }
  }))

  // serve static
  app.use(serve('./src'))

  app.use(hotMiddleware(compile))

  // listen
  autoPortServer(app, port => {
    ctx.log(`Dev server runing at http://${ctx.options.server.host}:${port}`, 1)
  })
}

server()