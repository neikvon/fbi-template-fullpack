const webpack = require('webpack')

ctx.isProd = true

const webpackConfig = require('./webpack.config.js')(require, ctx)

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
