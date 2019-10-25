// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential', 
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // 强行加分号
    semi: ["error", "always"],
    // 缩进
    indent: 0,
    // 引号
    quotes: 0,
    'eol-last': 0,
    'no-multi-spaces': 0,
    'space-infix-ops': 0,
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'promise/param-names': 0,
    'no-undef': 1,
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
