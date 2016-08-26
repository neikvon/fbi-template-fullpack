const webpackMiddleware = require('webpack-dev-middleware')

module.exports = function dev(compiler, opts) {
  opts = opts || {}
  const middleware = webpackMiddleware(compiler, opts)

  return function (ctx, next) {
    return next().then(() => {
      // middleware(req, res, next)
      middleware(ctx.req, {
        end: (content) => {
          ctx.body = content
        },
        setHeader: ctx.set.bind(ctx)
      }, next)
    })
  }
}