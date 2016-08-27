const webpack = require('webpack')
const rm = require('rimraf')

ctx.isProd = true

const webpackConfig = require('./webpack.config.js')(require, ctx)

rm.sync(ctx.options.server.root)

webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.log(err, 0)
  }

  console.log(`
${stats.toString({
      chunks: false,
      colors: true
    })}
    `)
})
