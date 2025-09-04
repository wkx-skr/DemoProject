const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    hot: true,
    port: 8888
  },
  outputDir: 'libDist',
  productionSourceMap: false,
  css: {
    extract: true
  },
})
