const http = require('http')
const Koa = require('koa')
const koaStatic = require('koa-static')
const convert = require('koa-convert')
const webpack = require('webpack')
const devMiddleware = require('koa-webpack-dev-middleware')
const hotMiddleware = require('koa-webpack-hot-middleware')
const bs = require('browser-sync').create()
const webpackConfig = require('./webpack.config.js')(require, ctx)
const prod = ctx.taskParams && ctx.taskParams[0] === 'p' // fbi s -p
const compile = webpack(webpackConfig)

// auto selected a valid port & start server
function autoPortServer(start, app, cb) {
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
    autoPortServer(start, app, cb)
  })
}

function server() {
  const app = new Koa()
  const fbi = ctx
  let start = (ctx.taskParams && !isNaN(ctx.taskParams[0]))
    ? ctx.taskParams[0] * 1
    : ctx.options.server.port

  // logger
  app.use((ctx, next) => {
    const start = new Date()
    return next().then(() => {
      const ms = new Date() - start
      fbi.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
    })
  })

  if (prod) {
    // static
    app.use(koaStatic('./dst'))

    // listen
    autoPortServer(start, app, port => {
      ctx.log(`Prod server runing at http://${ctx.options.server.host}:${port}`, 1)
    })
  } else {
    // dev
    const devMiddlewareInstance = devMiddleware(compile, {
      publicPath: webpackConfig.output.publicPath,
      headers: { 'Access-Control-Allow-Origin': '*' },
      stats: {
        colors: true,
        chunks: false,
        modules: false,
        children: false
      }
    })

    app.use(convert(devMiddlewareInstance))

    // static
    app.use(koaStatic('./src'))

    // hot
    if (ctx.options.webpack.hot) {
      app.use(convert(hotMiddleware(compile)))
    }

    // listen
    const bsPort = start
    start = start + 1
    autoPortServer(start, app, port => {
      bs.init({
        open: true,
        ui: false,
        notify: false,
        proxy: `${ctx.options.server.host || 'localhost'}:${port}`,
        files: ['./src/*.html', './src/hbs/**'],
        port: bsPort,
      })
    })

    // watch config
    // const Watchpack = require('watchpack')
    // const wp = new Watchpack({
    //   ignored: /node_modules/
    // })
    // wp.watch(['*'], ['./fbi/'], Date.now() - 10000)
    // wp.on('change', () => {
    //   // recompile
    //   devMiddlewareInstance.invalidate()
    //   bs.reload()
    // })
  }
}

server()