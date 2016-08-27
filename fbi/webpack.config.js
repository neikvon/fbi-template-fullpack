module.exports = (require, ctx) => {
  const fs = require('fs')
  const path = require('path')
  const glob = require('glob')
  const webpack = require('webpack')
  const ExtractTextPlugin = require('extract-text-webpack-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const HtmlInlineWebpackPlugin = require('./plugins/html-inline-webpack-plugin')
  const CopyWebpackPlugin = require('copy-webpack-plugin')
  const nodeModulesPath = ctx.nodeModulesPath = ctx.options.node_modules_path
  // const nodeModulesPath = ctx.nodeModulesPath = ctx._.cwd('node_modules') // for local test
  const eslintConfig = require('./eslint.config')(require, ctx)
  const stylelintConfig = require('./stylelint.config')(require, ctx)
  const prod = ctx.isProd
  const hash = ctx.options.webpack.hash
  const hot = !prod && ctx.options.webpack.hot
  const noop = function () { }
  const ver = {
    hash: '[hash:6]',
    chunkhash: '[chunkhash:6]',
    contenthash: '[contenthash:6]'
  }

  // get entries
  function entries() {
    let entries = {}
    const files = glob.sync(`src/js/*.js`)
    files.map(item => {
      entries[path.basename(item, '.js')] = hot
        ? [
          nodeModulesPath + '/webpack-hot-middleware/client',
          './' + item
        ]
        : './' + item
    })
    return entries
  }

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
        minify: prod ? {
          collapseWhitespace: true,
          preserveLineBreaks: false,
          removeComments: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          removeScriptTypeAttributes: true,
          useShortDoctype: true
        } : false,
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

  const config = {
    entry: entries(),
    output: {
      filename: hash ?
        (prod ? `js/[name]-${ver.chunkhash}.js` : `js/[name].js?${ver.hash}`) :
        'js/[name].js',
      path: prod ? ctx._.join(__dirname, '../', ctx.options.server.root) : '/',
      publicPath: prod ? './' : '/'
    },
    resolve: {
      modules: [
        'node_modules',
        nodeModulesPath
      ]
    },
    resolveLoader: {
      modules: [nodeModulesPath] // important !!
    },
    devtool: !prod ? 'cheap-module-eval-source-map' : null,
    module: {
      preLoaders: [
        // js lint
        {
          test: /\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          query: eslintConfig
        }
      ],
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
        (ctx.options.webpack.tmpl === 'handlebars')
          ? {
            test: /\.(html|hbs)$/i, loader: 'handlebars',
            query: {
              extensions: ['.hbs', '.html'],
              inlineRequires: '\/img\/',
              partialDirs: [path.join(process.cwd(), 'src/hbs/partials')],
              helperDirs: [path.join(process.cwd(), 'src/hbs/helpers')],
              debug: false
            }
          }
          : {
            test: /\.html$/,
            loader: 'html'
          },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style',
            loader: 'css!postcss',
            publicPath: ctx.options.webpack.inline ? './' : '../'  // assets path prefix in css
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
      prod ? new webpack.BannerPlugin(ctx.options.webpack.banner) : noop,
      hot ? new webpack.HotModuleReplacementPlugin() : noop,
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
      }) : noop,
      new webpack.DefinePlugin(ctx.options.webpack.data || {})
    ],
    postcss: [
      require('stylelint')(stylelintConfig), // css lint
      require('postcss-reporter'),
      require('autoprefixer'),
      require('precss'),
      prod ? require('cssnano') : noop // css minify
    ]
  }

  templates(config.plugins)

  return config
}