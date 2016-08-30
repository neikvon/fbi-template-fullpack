# fbi-template-fullpack

### Using
- [Webpack](https://github.com/webpack/webpack)
- [Babel](https://babeljs.io/)
- [ESlint](http://eslint.org/)
- [Stylelint](http://stylelint.io/)
- [Koa.js](https://github.com/koajs/koa/tree/v2.x)
- [Browsersync](https://www.browsersync.io/)
- [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware)
- [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware)
- [PostCss](http://postcss.org/)
- [Precss](https://github.com/jonathantneal/precss)
- [Autoprefixer](https://github.com/postcss/autoprefixer)
- [Handlebars.js](http://handlebarsjs.com/)

### Template Data

for `js` and `handlebars` file
```bash
# definition
config.js: webpack.data.VERSION

# usage:
js:   VERSION
html: webpackConfig.data.VERSION
```

### Hot Module Replacement for js

Add the code below to the entry js file.
```js
if (module.hot) {
  module.hot.accept()
}
```

### Development
```bash
$ fbi s     # Dev Server (serve webpack complied files & './src' folder)
```

### Production
```bash
$ fbi b     # Complie for production
```

### Serve production files
```bash
$ fbi s -p  # Serve './dst' folder
```