module.exports = (require, ctx) => {
  return {
    // https://github.com/stylelint/stylelint-config-standard
    extends: ctx.nodeModulesPath + '/stylelint-config-standard',
    /**
     * 自定义规则
     *
     * 参考:
     * http://stylelint.io/user-guide/rules/
     * http://stylelint.io/user-guide/example-config/
     */
    rules: {}
  }
}