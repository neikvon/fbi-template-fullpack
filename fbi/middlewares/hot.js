const webpackMiddleware = require('webpack-hot-middleware')
const PassThrough = require('stream').PassThrough

module.exports = function dev(compiler, opts) {
  opts = opts || {}
  const middleware = webpackMiddleware(compiler, opts)

  return function (ctx, next) {
    return next().then(() => {
      const stream = new PassThrough()
      ctx.body = stream
      // middleware(req, res, next)
      middleware(ctx.req, {
        write: stream.write.bind(stream),
        writeHead: (state, headers) => {
          ctx.state = state
          ctx.set(headers)
        }
      }, next)
    })
  }
}