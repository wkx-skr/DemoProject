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
  module: {
    rules: [
      {
        test: /\.js$/, // 匹配所有 .js 文件
        exclude: /node_modules/, // 通常排除 node_modules 目录，因为这里的库应已转译
        use: {
          loader: 'babel-loader',
          options: {
            // 这里可以内联配置，但通常更推荐使用外部的 babel.config.js
            cacheDirectory: true // 启用缓存，提升构建性能:cite[3]
          }
        }
      }
      // 其他规则，例如处理 CSS、图片等:cite[3]:cite[5]:cite[7]...
    ]
  }
}
