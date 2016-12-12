// http://eslint.org/docs/user-guide/configuring
module.exports = {
  // https://github.com/airbnb/javascript
  // https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base
  extends: ctx.options.NODE_MODULES_PATH + '/eslint-config-airbnb-base',
  parser: ctx.options.NODE_MODULES_PATH + '/babel-eslint',
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    allowImportExportEverywhere: false
  },
  rules: {
    semi: [2, 'never'], // 行尾不要使用分号
    'comma-dangle': [2, 'never'], // 对象最后一项 不使用逗号
    'no-console': [0], // 可以使用console
    'no-param-reassign': [0], // https://github.com/airbnb/javascript#functions--mutate-params
  }
}