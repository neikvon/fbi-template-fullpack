module.exports = function (left, operator, right, options) {
  if (arguments.length < 3) {
    throw new Error('Handlebars Helper \'when\' needs 3 parameters')
  }

  if (options === undefined) {
    options = right
    right = operator
    operator = '==='
  }

  const operators = {
    '===': (l, r) => l === r,
    '!==': (l, r) => l !== r,
    '<': (l, r) => l * 1 < r * 1,
    '>': (l, r) => l * 1 > r * 1,
    '<=': (l, r) => l * 1 <= r * 1,
    '>=': (l, r) => l * 1 >= r * 1,
    typeof: (l, r) => typeof l === r,
    // l: 字符串 和 数组 均可
    includes: (l, r) => l.includes(r),
    // l: 字符串 和 数组 均可
    startsWith: (l, r) => (Array.isArray(l) ? l[0] === r : l.startsWith(r)),
    // l: 字符串 和 数组 均可
    endWith: (l, r) => (Array.isArray(l) ? l[l.length - 1] === r : l.endsWith(r))
  }

  if (!operators[operator]) {
    throw new Error(`Handlebars Helper 'when' doesn't know the operator '${operator}'`)
  }

  const result = operators[operator](left, right)

  if (result) {
    return options.fn(this)
  }
  return options.inverse(this)
}