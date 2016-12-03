/**
 * json字符串化
 * Usage: {{json obj}}
 *
 * @param {object} obj
 * @returns
 */
module.exports = function (obj) {
  return JSON.stringify(obj, null, 2)
}