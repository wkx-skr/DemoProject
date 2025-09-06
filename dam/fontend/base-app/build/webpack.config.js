const path = require('path')
const StylelintPlugin = require('stylelint-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    app: ['babel-polyfill'],
  },
  plugins: [new StylelintPlugin({})],
  resolve: {
    alias: {
      '@': resolve('src'),
      '@class': resolve('src/next/class'),
      '@components': resolve('src/next/components'),
      '@constant': resolve('src/next/constant'),
      '@service': resolve('src/next/service'),
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
}
