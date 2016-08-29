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
  const extractCss = !hot || prod
  const cdn = ctx.options.webpack.cdn || './'
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
      const name = path.basename(item, '.js')
      entries[name] = []
      if (ctx.options.webpack.es7) {
        entries[name] = entries[name].concat([nodeModulesPath + '/babel-polyfill'])
      }
      if (hot) {
        entries[name] = entries[name].concat([nodeModulesPath + '/webpack-hot-middleware/client?reload=true'])
      }
      entries[name] = entries[name].concat(['./' + item])
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
        cache: !ctx.options.webpack.inline,
        inject: !ctx.options.webpack.inline,
        chunks: hasJs ? ['common', chunkname] : [],
        minify: prod ? {
          collapseWhitespace: true,
          preserveLineBreaks: false
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
      publicPath: prod ? cdn : '/'
    },
    cache: true,
    data: ctx.options.webpack.data || {},
    externals: ctx.options.webpack.externals,
    resolve: {
      modules: [
        path.join(process.cwd(), 'node_modules'),
        nodeModulesPath
      ],
      extensions: ['', '.js'],
      unsafeCache: true,
      alias: ctx.options.webpack.alias
    },
    resolveLoader: {
      modules: [nodeModulesPath] // important !!
    },
    devtool: !prod ? 'inline-source-map' : null,
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
          include: [
            path.join(process.cwd(), './src')
          ],
          exclude: function (path) {
            // 路径中含有 node_modules 的就不去解析。
            const isNpmModule = !!path.match(/node_modules/)
            return isNpmModule
          },
          query: {
            presets: [
              'babel-preset-es2015',
              'babel-preset-stage-0'
            ].map(item => path.join(nodeModulesPath, item)),
            plugins: [
              'babel-plugin-transform-async-to-generator'
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
          loader: extractCss ? ExtractTextPlugin.extract({
            fallbackLoader: 'style',
            loader: 'css!postcss',
            publicPath: ctx.options.webpack.inline ? cdn : '../'  // assets path prefix in css
          }) : 'style!css!postcss' // extract-text-webpack-plugin not support css links hot reload
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'url?limit=1000&name=img/' + (hash ? (prod ? `[name]-${ver.hash}.[ext]` : `[name].[ext]?${ver.hash}`) : '[name].[ext]')
          ]
        }
      ],
      noParse: ctx.options.webpack.noParse
    },
    plugins: [
      new webpack.DefinePlugin(ctx.options.webpack.data || {}),
      prod ? new webpack.BannerPlugin(ctx.options.webpack.banner) : noop,
      hot ? new webpack.HotModuleReplacementPlugin() : noop,
      prod ? noop : new webpack.NoErrorsPlugin(),
      extractCss ? new ExtractTextPlugin({
        filename: hash ?
          (prod ? `css/[name]-${ver.contenthash}.css` : `css/[name].css?${ver.contenthash}`) :
          'css/[name].css',
        disable: false,
        allChunks: false
      }) : noop,
      ctx.options.webpack.commons ? new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: hash ?
          (prod ? `js/[name]-${ver.chunkhash}.js` : `js/[name].js?${ver.hash}`) :
          'js/[name].js'
      }) : noop,
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
      require('stylelint')(stylelintConfig), // css lint
      require('postcss-reporter'),
      require('autoprefixer')({
        // http://browserl.ist/
        // https://github.com/ai/browserslist
        browsers: ['last 2 versions', 'IE >= 8']
      }),
      require('precss'),
      prod ? require('cssnano') : noop // css minify
    ]
  }

  templates(config.plugins)

  return config
}