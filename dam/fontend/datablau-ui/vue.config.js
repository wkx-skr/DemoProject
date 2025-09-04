/* eslint-disable */
const path = require('path')
const aliasConfig = require('./build/webpack.config')
const chainConfig = require('./build/chain.config')
let proxy = null
let port = null
try {
    proxy = require('./test').proxy
} catch (e) {}
try {
    port = require('./test').port
} catch (e) {}
module.exports = {
    configureWebpack: config => {
        // config.entry.app = ['babel-polyfill', './src/main.js']
        return aliasConfig
    },
    publicPath: process.env.NODE_ENV === 'production' ?
        './' :
        '/',
    outputDir: 'libDist',
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
        port: port || 8888,
        proxy: proxy,
        compress: true,
    },
  transpileDependencies: [/[/\\]node_modules[/\\](.+?)?element-ui(.*)[/\\]src/],
  chainWebpack: chainConfig
}
