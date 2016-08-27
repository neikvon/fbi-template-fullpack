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
    inline: true, // css、js是否内联
    tmpl: 'handlebars'
  }
}