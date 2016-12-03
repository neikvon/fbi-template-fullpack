/**
 * Demo, 演示子目录下的helper使用方法
 * Usage: {{[transformers/embiggen] 'test embiggen'}}
 *
 * @param {any} html
 * @returns
 */
module.exports = function (html) {
  return '***' + html + '***'
}