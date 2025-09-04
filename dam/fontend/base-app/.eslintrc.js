const CONDITION = 0
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    '@vue/standard',
    // 'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ["prettier"], // eslint-plugin-prettier
  globals: {
    _: true,
    $: true,
    mxGraph: true,
    mxConstants: true,
    Ps: true,
    NewPs: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-template-curly-in-string': 'off',
    'no-undef': CONDITION,
    'no-irregular-whitespace': 'off',
    'no-unused-vars': CONDITION,
    'no-mixed-spaces-and-tabs': 'off',
    'no-lone-blocks': CONDITION,
    'no-tabs': 'off',
    'no-prototype-builtins': 0,
    'new-cap': 0,
    'eqeqeq': CONDITION,
    'no-useless-escape': 0,
    'vue/no-dupe-keys': CONDITION,
    'no-dupe-keys': CONDITION,
    'vue/no-unused-components': CONDITION,
    'vue/no-unused-vars': 0,
    'vue/no-use-v-if-with-v-for': CONDITION,
    'no-case-declarations': 0,
    'no-unused-expressions': CONDITION,
    'no-unreachable': CONDITION,
    'prefer-promise-reject-errors': CONDITION,
    'camelcase': CONDITION,
    'vue/require-v-for-key': CONDITION,
    'no-labels': 0,
    'handle-callback-err': 0,
    'node/no-deprecated-api': CONDITION,
    'brace-style': 0,
    'vue/valid-v-model': CONDITION,
    'no-self-assign': CONDITION,
    'no-new': 0,
    'vue/valid-template-root': 0,
    'no-redeclare': CONDITION,
    'no-useless-return': 0,
    'vue/no-side-effects-in-computed-properties': CONDITION,
    // error: Promise constructor parameters must be named resolve, reject (promise/param-names)
    'promise/param-names': CONDITION,
    'operator-linebreak': CONDITION,
    'no-mixed-operators': CONDITION,
    'vue/require-component-is': CONDITION,
    'vue/valid-v-for': CONDITION,
    'import/no-duplicates': 0,
    'standard/no-callback-literal': 0,
    'no-constant-condition': 0,
    'vue/return-in-computed-property': 0,
    'no-undef-init': 0,
    'prefer-const': 0,
    'no-inner-declarations': 0,
    'no-empty': 0,
    "prettier/prettier": "error", // 开启规则
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    },
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
    }
  ]
}
