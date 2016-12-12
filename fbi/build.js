const webpack = require('webpack')
const rm = require('rimraf')

// get env match config
ctx.isProd = true
require('./helpers/getEnv.js')(ctx, 'prod')
const webpackConfig = require('./config/webpack.config.js')

// remove dst folder
rm.sync(ctx.options.server.root)
ctx.log(`${ctx.options.server.root} was removed`)

// run webpack
webpack(webpackConfig, (err, stats) => {
  if (err) {
    ctx.log(err, 0)
  }

  console.log(`
${stats.toString({
      chunks: false,
      colors: true
    })}
    `)
})
