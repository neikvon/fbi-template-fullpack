# fbi-template-fullpack

## 简介
本模板涵盖了前端项目的大部分特性，可用于大、中、小型项目，单页项目和多页项目。

本模板支持的技术和特性(除必选项以外都是可选)：
- (必选) 代码检查( js: ESlint; css: Stylelint )
- 支持 ES2015 和 ES2016( 浏览器端项目目前不建议使用 async, await)
- 支持模板引擎(Handlebars)
- 支持PostCss、SASS
- 支持font-icon 和自定义字体
- 支持简单的ajax数据模拟
- 支持js和css内嵌到html
- 支持环境变量
- 支持热更新

### 使用的类库
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

## 基础约定

### 模块
被入口文件引入的代码块

- html模块
  > 使用handlebars模版引擎, 模块统一放在 `src/tmpl/partials`内
- css模块
  > 支持PostCss和SASS, 模块可在 `src/css` 内按需放置
- js模块
  > 支持ES6模块规范，模块可在 `src/js` 内新建子目录放置

### 入口文件
引入页面所需模块的最终输出

- html入口：`src`根目录内的`.html`或`.hbs`文件
  > 即url可直接访问到的页面
- js入口：`src/js`根目录内的与html文件同名的`.js`文件
  > html文件对应的js文件, 会自动嵌入html内，无需手动引入
- css入口：被js文件引入的css文件
  > 统一由入口js文件`require`或`import`引入，html无需手动链接css文件

### 模板相关
支持Handlebars模板引擎，文件名后缀`.html``.hbs`都行（可以这样以做区分：入口文件用`.html`, 部件模块用`.hbs`）。
- 部件模块目录：`src/tmpl/partials`
- `Helpers`目录：`src/tmpl/helpers`

## 两条命令
```bash
$ fbi s       # 启动开发服务器 （使用文件流，不生成本地文件）
```
```bash
$ fbi b       # 编译代码 （生成本地文件）
```

## N套环境
```bash
$ fbi s               # 启动开发服务器, 默认使用dev环境数据
$ fbi s -p            # 在dst目录启动web服务器（dst目录是生成后的代码，不可指定环境数据）
$ fbi s -test         # 启动开发服务器, 并使用test环境数据

$ fbi b               # 编译代码，默认使用prod环境数据
$ fbi b -demo         # 编译代码, 并使用demo环境数据

$ fbi s -9000 -prod   # 在9000端口启动服务器，并使用prod环境数据
$ fbi b s             # 编译代码，并启动开发服务器
$ fbi b -test s -9000 # 编译代码（使用test环境数据），并启动开发服务器（使用9000端口, dev环境数据）
```

### 环境变量的使用

```js
// 在js里
const version = VERSION
```
```handlebars
<!-- 在html里 -->
{{ htmlWebpackPlugin.options.data.VERSION }}
```

### 环境变量的配置
```js
// fbi/config.js => webpack.data
{
  webpack: {
    cdn: '', // CDN路径前缀（用于生产环境）改变量用于webpack处理的静态文件
    tmpl: 'handlebars', // 模板引擎
    hot: true, // 热更新
    hash: true, // 是否非覆盖式发布
    inline: false, // css、js是否内联
    commons: true,  // 是否生成公共文件
    // js css文件头部文案
    banner: `
      Project name - [description]

      Author: [name]
      Built: ${new Date().toLocaleString()} via fbi

      Copyright 2016 [organization]`,
    // 模板数据(编译时数据)
    data: {
      // 所有环境
      all: {
        CDN: './',
        VERSION: 'v1.0.1',
        COPYRIGHT: '@2016'
      },
      // 开发环境
      dev: {
        CGI_ROOT: 'http://cgi.dev'
      },
      // 测试环境
      test: {
        CGI_ROOT: 'http://cgi.test'
      },
      // 生产环境
      prod: {
        CGI_ROOT: 'http://cgi.prod'
      }
    },
    // 定义外部依赖
    externals: [],
    // 用别名做重定向
    alias: {}
  }
}
```
> webpack.data（环境变量）配置说明
>
> 1. `all`, `dev`, `test`, `prod` 是环境名称，定义了fbi编译时指明的环境对应的数据，可按需增删改
> 1. `webpack.data.all` 配置是所有环境固定不变的数据，除非你不想使用其他任何环境数据，否则，请不要使用 `fbi s -all`


## js热更新

添加如下代码到js入口文件
```js
if (module.hot) {
  module.hot.accept()
}
```

## Change Logs

**2016.11.29**
- 增加sass支持
- end部件增加多js文件传参(以逗号分割)，如：`{{ end scripts="lib/a.js,lib/b.js"}}`
- 支持任意环境数据定义


**2016.11.22**
- 公共文件仅保留一个`common.js`, `src/js/common`里的文件也会打包到`common.js`
- 修复sourceMap问题：开发环境devtool改用`source-map`
- 默认禁用`es7`配置项。因generater运行时体积较大，所以前端项目目前不推荐使用`async`。（node项目可放心用）
