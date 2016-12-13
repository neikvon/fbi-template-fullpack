module.exports = {
  template: 'fullpack',
  templateDescription: 'Full front-end project template with multiple entries.',
  server: {
    // 生产文件生成的目标目录
    root: 'dst/',
    host: 'localhost',
    // fbi s 时使用的端口
    port: 8888
  },
  npm: {
    alias: 'npm',
    options: '--registry=https://registry.npm.taobao.org'
  },
  alias: {
    b: 'build',
    s: 'serve'
  },
  webpack: {
    // 模板引擎
    tmpl: 'handlebars',
    // 热更新
    hot: true,
    // 是否生成版本戳(用于非覆盖式发布)
    hash: false,
    // css、js是否内联
    inline: false,
    // 是否生成公共文件
    commons: true,
    // 是否混淆/压缩代码
    compress: false,
    // 模板数据(编译时数据)
    data: {
      // 所有环境
      all: {
        // CDN路径前缀
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
    externals: [
      // {
      //   fetch: true
      // }
    ],
    // 用别名做重定向
    alias: {
      // 'whatwg-fetch': 'whatwg-fetch/fetch.js'
    },
    // js css文件头部文案
    banner: `
Project name - [description]

Author: [name]
Built: ${new Date().toLocaleString()} via fbi

Copyright @2016 [organization]`
  }
}