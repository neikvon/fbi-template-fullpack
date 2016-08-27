const http = require('http')
const Koa = require('koa')
const koaStatic = require('koa-static')
const convert = require('koa-convert')
const webpack = require('webpack')
const devMiddleware = require('koa-webpack-dev-middleware')
const hotMiddleware = require('koa-webpack-hot-middleware')
const webpackConfig = require('./webpack.config.js')(require, ctx)
const compile = webpack(webpackConfig)
let start = ctx.taskParams
  ? ctx.taskParams[0] * 1
  : ctx.options.server.port

// auto selected a valid port & start server
function autoPortServer(app, cb) {
  let port = start
  start += 1
  const server = http.createServer(app.callback())

  server.listen(port, err => {
    server.once('close', () => {
      server.listen(port, err => {
        if (err) {
          ctx.log(err)
          return
        }
        cb(port)
      })
    })
    server.close()
  })

  server.on('error', err => {
    autoPortServer(app, cb)
  })
}

function server() {
  const app = new Koa()
  const fbi = ctx

  // logger
  app.use((ctx, next) => {
    const start = new Date()
    return next().then(() => {
      const ms = new Date() - start
      fbi.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
    })
  })

  // dev
  app.use(convert(devMiddleware(compile, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
      chunks: false,
      modules: false,
      children: false
    }
  })))

  // static
  app.use(koaStatic('./src'))

  // hot
  if (ctx.options.webpack.hot) {
    app.use(convert(hotMiddleware(compile)))
  }

  // listen
  autoPortServer(app, port => {
    ctx.log(`Dev server runing at http://${ctx.options.server.host}:${port}`, 1)
  })
}

server()