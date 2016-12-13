const fs = require('fs')
const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlInlineWebpackPlugin = require('../plugins/html-inline-webpack-plugin')
const nodeModulesPath = ctx.options.NODE_MODULES_PATH
const eslintConfig = require('./eslint.config')
const stylelintConfig = require('./stylelint.config')
const webpackOpts = ctx.options.webpack
const prod = ctx.isProd
const hash = webpackOpts.hash
const hot = !prod && webpackOpts.hot
const extractCss = !hot || prod
const cdn = webpackOpts.cdn || './'
const noop = function () {}
const ver = {
  hash: '[hash:6]',
  chunkhash: '[chunkhash:6]',
  contenthash: '[contenthash:6]'
}

// get entries
let entryNames = []

function entries () {
  let entries = {}
  const files = glob.sync(`src/js/*.js`)
  files.map(item => {
    const name = path.basename(item, '.js')
    entryNames.push(name)
    entries[name] = []
    if (webpackOpts.es7) {
      entries[name] = entries[name].concat([nodeModulesPath + '/babel-polyfill'])
    }
    if (hot) {
      entries[name] = entries[name].concat([nodeModulesPath + '/webpack-hot-middleware/client?reload=true'])
    }
    entries[name] = entries[name].concat(['./' + item])
  })
  const commons = glob.sync(`src/js/common/*.js`)
  if (commons.length) {
    entries['common'] = glob.sync(`src/js/common/*.js`).map(item => './' + item)
    entryNames.push('common')
  }
  return entries
}

function templates (plugins) {
  const exts = webpackOpts.tmpl === 'handlebars' ? 'html|hbs|handlebars' : 'html'
  const files = glob.sync(`src/*.@(${exts})`)
  files.map(item => {
    const filename = path.basename(item)
    const chunkname = filename.replace(/.(html|hbs|handlebars)/, '') // path.basename(item, `.html`)
    let hasJs = false
    try {
      fs.accessSync('src/js/' + chunkname + '.js')
      hasJs = true
    } catch (e) {}

    const chunks = hasJs ? ['common', chunkname] : ['common']
    plugins.push(new HtmlWebpackPlugin({
      data: DataForDefinePlugin(),
      filename: chunkname + '.html',
      template: item,
      // cache: !webpackOpts.inline,
      cache: false,
      inject: !webpackOpts.inline,
      chunks: chunks,
      chunksSortMode: (a, b) => {
        let aIndex = chunks.indexOf(a.names[0]),
          bIndex = chunks.indexOf(b.names[0])
        return aIndex - bIndex
      },
      excludeChunks: [],
      minify: (webpackOpts.compress && prod) ? {
        minifyJS: true,
        minifyCSS: true,
        removeComments: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      } : false,
      inline: webpackOpts.inline
    }))
  })

  if (webpackOpts.inline) {
    plugins.push(new HtmlInlineWebpackPlugin({
      env: prod ? 'production' : '',
      len: files.length
    }))
  }
}

function DataForDefinePlugin (parse) {
  const data = Object.assign({},
    webpackOpts.data.all || {},
    webpackOpts.data[ctx.env]
  )

  data.PRODUCTION = prod ? true : false
  if (parse) {
    const copy = JSON.parse(JSON.stringify(data))
    Object.keys(copy).map(item => {
      switch (typeof item) {
        case 'string':
          copy[item] = JSON.stringify(copy[item])
          break
      }
    })
    return copy
  } else {
    return data
  }
}

const config = {
  entry: entries(),
  output: {
    filename: hash ?
      (prod ? `js/[name]-${ver.chunkhash}.js` : `js/[name].js?${ver.hash}`) : 'js/[name].js',
    // path: prod ? ctx._.cwd(ctx.options.server.root) : '/',
    path: prod ? path.join(process.cwd(), ctx.options.server.root) : '/',
    publicPath: prod ? webpackOpts.data.all.__CDN__ : '/'
  },
  cache: true,
  externals: webpackOpts.externals,
  resolve: {
    modules: [
      path.join(process.cwd(), 'node_modules'),
    // nodeModulesPath
    ],
    extensions: ['*', '.js', '.css', '.json'],
    unsafeCache: true,
    alias: webpackOpts.alias
  },
  resolveLoader: {
    modules: [
      path.join(process.cwd(), 'node_modules'),
    // nodeModulesPath
    ]
  },
  devtool: !prod ? 'source-map' : false,
  module: {
    rules: [{
      test: new RegExp('\.js$'),
      enforce: 'pre', // enforce: 'pre', enforce: 'post',
      loader: 'eslint-loader',
      exclude: new RegExp(/node_modules/),
      query: eslintConfig
    },

      {
        test: new RegExp('\.js$'),
        include: path.join(process.cwd(), './src'),
        exclude: new RegExp(/node_modules/),
        use: [{
          loader: 'babel-loader',
          query: {
            // presets: [
            //   'babel-preset-es2015',
            //   'babel-preset-stage-0'
            // ], // .map(item => path.join(nodeModulesPath, item)),
            presets: [
              'es2015',
              'stage-0'
            ], // .m
            plugins: [
              'babel-plugin-transform-async-to-generator'
            ], // .map(item => path.join(nodeModulesPath, item)),
            cacheDirectory: true
          }
        }]
      },
      (webpackOpts.tmpl === 'handlebars') ? {
        test: new RegExp('\.(html|hbs)$'),
        loaders: [{
          loader: 'handlebars-loader',
          options: {
            extensions: ['.hbs', '.html'],
            inlineRequires: new RegExp('\/img\/'),
            partialDirs: [path.join(process.cwd(), 'src/tmpl/partials')],
            helperDirs: [path.join(process.cwd(), 'src/tmpl/helpers')],
            debug: false
          }
        }]
      } : {
        test: new RegExp('\.html$'),
        loaders: [{
          loader: 'html-loader'
        }]
      },
      {
        test: new RegExp('\.css$'),
        loader: extractCss ?
          ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader!postcss-loader',
            publicPath: webpackOpts.inline ? (prod ? webpackOpts.data.all.__CDN__ : './') : '../'
          }) : 'style-loader!css-loader!postcss-loader'
      },
      {
        test: new RegExp('\.scss$/'),
        loader: extractCss ?
          ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader!sass-loader',
            publicPath: webpackOpts.inline ? (prod ? webpackOpts.data.all.__CDN__ : './') : '../'
          }) : 'style-loader!css-loader!sass-loader'
      },
      {
        test: new RegExp('\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)?$'),
        loaders: [{
          loader: 'url-loader',
          options: {
            limit: '10000',
            name: 'img/' + ((hash && prod) ? `[name]-${ver.hash}.[ext]` : '[name].[ext]')
          }
        }]
      },
      {
        test: new RegExp('\.json$'),
        loaders: ['json-loader']
      }
    ]
  },
  plugins: [
    // Webpack 2.1.0-beta23 之后的config里不能直接包含自定义配置项
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          require('stylelint')(stylelintConfig), // css lint
          require('postcss-reporter'),
          require('autoprefixer')({
            // http://browserl.ist/
            // https://github.com/ai/browserslist
            browsers: ['last 2 versions', 'IE >= 8']
          }),
          require('precss'),
          (webpackOpts.compress && prod) ? require('cssnano') : noop // css minify
        ]
      }
    }),
    new webpack.DefinePlugin(DataForDefinePlugin(true)),
    prod ? new webpack.BannerPlugin(webpackOpts.banner) : noop,
    hot ? new webpack.HotModuleReplacementPlugin() : noop,
    prod ? noop : new webpack.NoErrorsPlugin(),
    extractCss ?
      new ExtractTextPlugin({
        filename: hash ?
          (prod ? `css/[name]-${ver.contenthash}.css` : `css/[name].css?${ver.contenthash}`) : 'css/[name].css',
        disable: false,
        allChunks: false
      }) :
      noop,
    webpackOpts.commons ?
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: hash ?
          (prod ? `js/[name]-${ver.chunkhash}.js` : `js/[name].js?${ver.hash}`) : 'js/[name].js',
        chunks: entryNames,
        minChunks: Infinity
      }) :
      noop,
    new CopyWebpackPlugin([{
      from: 'src/lib',
      to: 'lib'
    }, {
      from: 'src/favicon.ico'
    }]),
    (webpackOpts.compress && prod) ? new webpack.optimize.UglifyJsPlugin({ // js ugllify
      sourceMap: true,
      compress: {
        warnings: false
      }
    }) : noop
  ]
}

templates(config.plugins)

module.exports = config
