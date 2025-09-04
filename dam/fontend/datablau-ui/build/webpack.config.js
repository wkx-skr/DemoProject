const path = require('path')
const StylelintPlugin = require('stylelint-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    app: './src/main.ts',
  },
  plugins: [new StylelintPlugin({})],
  resolve: {
    alias: {
      '@': resolve('src'),
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
}
