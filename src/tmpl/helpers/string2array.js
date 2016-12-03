/**
 * string转数组(以逗号分割)
 * Usage: {{string2array 'x,y'}}
 *
 * @param {string} str
 * @returns
 */
module.exports = function (str) {
  return str.split(',')
}