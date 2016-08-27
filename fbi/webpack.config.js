module.exports = (require, ctx) => {

  const fs = require('fs')
  const path = require('path')
  const glob = require('glob')
  const webpack = require('webpack')
  const ExtractTextPlugin = require('extract-text-webpack-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const HtmlInlineWebpackPlugin = require('./plugins/html-inline-webpack-plugin')
  const CopyWebpackPlugin = require('copy-webpack-plugin')
  const nodeModulesPath = ctx.options.node_modules_path
  // const nodeModulesPath = ctx._.cwd('node_modules') // for local test
  const prod = ctx.isProd
  const hash = ctx.options.webpack.hash
  const noop = function () { }
  const ver = {
    hash: '[hash:6]',
    chunkhash: '[chunkhash:6]',
    contenthash: '[contenthash:6]'
  }
  const config = {
    entry: entries(),
    output: {
      filename: hash ?
        (prod ? `js/[name]-${ver.chunkhash}.js` : `js/[name].js?${ver.hash}`) :
        'js/[name].js',
      path: prod ? ctx._.join(__dirname, '../', ctx.options.server.root) : '/',
      publicPath: prod ? './' : '/'
    },
    // context: path.join(process.cwd(), 'src'),
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
        // {
        //   test: /\.html$/,
        //   loader: 'html'
        // },
        {
          test: /\.(html|hbs)$/i, loader: `handlebars?partialDirs[]=path.join(process.cwd(), 'src/partials')`,
          // query: {
          //   partialDirs: [
          //     path.join(process.cwd(), 'src/partials')
          //   ]
          // }
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style',
            loader: 'css!postcss',
            publicPath: ctx.options.webpack.inline ? './' : '../'                   // css文件内部资源路径前缀
          })
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'url?limit=10&name=img/' + (hash ? (prod ? `[name]-${ver.hash}.[ext]` : `[name].[ext]?${ver.hash}`) : '[name].[ext]')
          ]
        }
      ]
    },
    plugins: [
      prod ? noop : new webpack.HotModuleReplacementPlugin(),
      prod ? noop : new webpack.NoErrorsPlugin(),
      new ExtractTextPlugin({
        filename: hash ?
          (prod ? `css/[name]-${ver.contenthash}.css` : `css/[name].css?${ver.contenthash}`) :
          'css/[name].css',
        disable: false,
        allChunks: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: hash ?
          (prod ? `js/[name]-${ver.chunkhash}.js` : `js/[name].js?${ver.hash}`) :
          'js/[name].js'
      }),
      new CopyWebpackPlugin([
        { from: 'src/lib', to: 'lib' },
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
  // console.log(JSON.stringify(config.plugins, null, 2))
  return config


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

  /**
   * webpack-html-plugin
   * inject assets:
   * js name === html name
   * 只有一个入口文件，或者声明依赖表
   * 可以使用 hbs模板
   */

  function templates(plugins) {
    const files = glob.sync(`src/*.html`)
    files.map(item => {
      const filename = path.basename(item)
      const chunkname = path.basename(item, `.html`)
      let hasJs = false
      try {
        fs.accessSync('src/js/' + chunkname + '.js')
        hasJs = true
      } catch (e) { }

      plugins.push(new HtmlWebpackPlugin({
        filename: filename,
        template: item,
        inject: !ctx.options.webpack.inline,
        chunks: hasJs ? ['common', chunkname] : [],
        inline: ctx.options.webpack.inline
      }))
    })

    if (ctx.options.webpack.inline) {
      plugins.push(new HtmlInlineWebpackPlugin({
        env: prod ? 'production' : '',
        len: files.length
      }))
    }
  }

}