/**
 * global vars:
 * ctx => fbi
 * require => requireResolve
 */
// const kwm = require('koa-webpack-middleware')
const fs = require('fs')
const path = require('path')
const devMiddleware = require('koa-webpack-dev-middleware')
const convert = require('koa-convert')
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js')(require, ctx)
const compile = webpack(webpackConfig)

// auto selected a valid port & start server
const http = require('http')
let start = ctx.taskParams
  ? ctx.taskParams[0] * 1
  : ctx.options.server.port
function autoPortServer(app, cb) {
  let port = start
  start += 1
  const server = http.createServer(app.callback())

  server.listen(port, err => {
    server.once('close', () => {
      app.listen(port, err => {
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
    autoPortServer(cb)
  })
}

function watch() {

  compiler.watch({
    aggregateTimeout: 300,
    poll: true
  }, function (err, stats) {
    if (err) {
      ctx.log(err, 0)
    }

    ctx.log(stats.toString({
      chunks: false,
      colors: true
    }))
  })
}

function server() {
  const Koa = require('koa')
  const serve = require('koa-static')
  const app = new Koa()

  app.use(convert(devMiddleware(compile, {
    noInfo: false,
    // quiet: false,
    // lazy: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    },
    publicPath: './',
    headers: { 'X-Custom-Header': 'yes' },
    stats: {
      colors: true
    }
  })))
  // app.use(hotMiddleware(compile, {
  //   // log: console.log,
  //   // path: '/__webpack_hmr',
  //   // heartbeat: 10 * 1000
  // }))

  // serve static
  // app.use(serve('./'))


  // app.use((ctx, next) => {
  //   console.log(ctx.url)
  //   let filename = ''
  //   if (ctx.url === '/') {
  //     filename = 'index.html'
  //   } else if (path.basename(ctx.url) === '.html') {
  //     filename = ctx.url
  //   }
  //   if (filename) {
  //     // ctx.body = ctx.webpack.fileSystem.readFileSync('index.html')
  //     ctx.body = ctx.webpack.fileSystem.data['index.html'].toString()
  //   }
  //   next()
  // })

  // listen
  autoPortServer(app, port => {
    ctx.log(`Server runing at http://${ctx.options.server.host}:${port}`, 1)
    // ctx.log(`Server root: ${ctx.options.server.root}`)
  })
}

// watch()
server()