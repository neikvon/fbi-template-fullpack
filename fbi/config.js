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
    hash: true, // 是否非覆盖式发布
    inline: false, // css、js是否内联
    tmpl: 'handlebars', // 模板引擎
    hot: true, // 热更新
    data: { // 编译时数据
    },
    banner:
`Project name - [description]

Author: [name]
Built: ${new Date().toLocaleString()} via fbi

Copyright 2016 [organization]`
  }
}