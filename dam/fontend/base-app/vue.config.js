/* eslint-disable */
const path = require('path')
const aliasConfig = require('./build/webpack.config')
const chainConfig = require('./build/chain.config')
let proxy = null
let port = 8071
/**
 * proxy和port使用public-app提供的
 */
try {
  proxy = require('./test').proxy
} catch (e) {
  console.log('catch')
}
module.exports = {
    configureWebpack: config => {
        return aliasConfig
    },
    publicPath: process.env.NODE_ENV === 'production' ?
        './' :
        '/',
    outputDir: 'dist',
    assetsDir: 'static',
    indexPath: 'index.html',
    filenameHashing: true,
    pages: undefined,
    productionSourceMap: false,
    lintOnSave: true,
    css: {
        extract: false
    },
    devServer: {
        host: '0.0.0.0',
        hot:true,
        port: port,
        proxy: proxy,
        compress: true,
        disableHostCheck: true
    },
  transpileDependencies: [/[/\\]node_modules[/\\](.+?)?element-ui(.*)[/\\]src/],
  chainWebpack: chainConfig
}
