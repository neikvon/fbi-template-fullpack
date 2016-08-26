module.exports = (require, ctx) => {

  const path = require('path')
  const glob = require('glob')
  const webpack = require('webpack')
  const ExtractTextPlugin = require('extract-text-webpack-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const CopyWebpackPlugin = require('copy-webpack-plugin')
  const nodeModulesPath = ctx.options.node_modules_path
  // const nodeModulesPath = ctx._.cwd('node_modules') // for local test
  const prod = ctx.isProd
  const noop = function () { }

  function entries() {
    let entries = {}
    const files = glob.sync(`src/js/*.js`)
    files.map(item => {
      entries[path.basename(item, '.js')] = prod
        ? './' + item
        : [
          'eventsource-polyfill',
          'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=false&noInfo=true',
          './' + item
        ]
    })
    return entries
  }


  /** webpack-html-plugin
   * inject assets:
   * js name === html name
   * 只有一个入口文件，或者声明依赖表
   * 可以使用 hbs模板
   */
  function templates(plugins) {
    const files = glob.sync(`src/*.html`)
    files.map(item => {
      const filename = path.basename(item)
      const chunkname = path.basename(item, '.html')
      plugins.push(new HtmlWebpackPlugin({
        filename: filename,
        template: item,
        inject: true,
        chunks: ['common', chunkname]
      }))
    })
  }

  const config = {
    entry: entries(),
    output: {
      filename: prod ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]',
      chunkFilename: prod ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]',
      path: prod ? ctx._.join(__dirname, '../', ctx.options.server.root) : '/',
      publicPath: prod ? './' : '/'
    },
    resolve: {
      modules: [nodeModulesPath] // important !!
    },
    resolveLoader: {
      modules: [nodeModulesPath] // important !!
    },
    devtool: !prod ? 'source-map' : null,
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/,
          query: {
            presets: [
              'babel-preset-es2015',
              'babel-preset-stage-0'
            ].map(item => path.join(nodeModulesPath, item)),
            cacheDirectory: true
          }
        },
        {
          test: /\.html$/,
          loader: 'html'
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style',
            loader: 'css!postcss'
          })
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'url?limit=10&name=' + (prod ? '../img/[name]-[hash:8].[ext]' : 'img/[name].[ext]?[hash:8]')
          ]
        }
      ]
    },
    plugins: [
      prod ? noop : new webpack.HotModuleReplacementPlugin(),
      prod ? noop : new webpack.NoErrorsPlugin(),
      new ExtractTextPlugin({
        filename: prod ? 'css/[name]-[hash:8].css' : 'css/[name].css?[hash:8]',
        disable: false,
        allChunks: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: prod ? 'js/[name]-[hash:8].js' : 'js/[name].js?[hash:8]'
      }),
      new CopyWebpackPlugin([
        { from: 'src/lib', to: 'lib' },
        // { from: 'src/*.html', flatten: true },
        { from: 'src/favicon.ico' }
      ]),
      prod ? new webpack.optimize.UglifyJsPlugin({ // js ugllify
        compress: {
          warnings: false
        }
      }) : noop
    ],
    postcss: [
      require('autoprefixer')({
        browsers: ['last 2 versions']
      }),
      require('precss'),
      prod ? require('cssnano') : noop // css minify
    ]
  }

  templates(config.plugins)

  return config

}