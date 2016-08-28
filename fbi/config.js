module.exports = {
  template: 'webpack-multiple-entries',
  templateDescription: 'Project template with multiple entries.',
  server: {
    root: 'dst/',
    host: 'localhost',
    port: 8888
  },
  npm: {
    alias: 'npm',
    options: ''
    // options: '--registry=https://registry.npm.taobao.org'
  },
  alias: {
    b: 'build',
    s: 'serve'
  },
  webpack: {
    cdn: '', // CDN路径前缀（用于生产环境）
    es7: true, // 是否使用ES2016(async, await)
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
    // 编译时数据
    data: {},
    // 定义外部依赖
    externals: [
      {
        fetch: true
      }
    ],
    // 用别名做重定向
    alias: {
      // 'whatwg-fetch': 'whatwg-fetch/fetch.js'
    },
    // 忽略某些模块的解析
    noParse: []
  }
}