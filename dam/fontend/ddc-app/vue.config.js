/* eslint-disable */
const path = require('path')
const aliasConfig = require('./build/webpack.config')
const chainConfig = require('./build/chain.config')
let proxy = null
let port = 8075
try {
    proxy = require('./test.js').proxy
} catch (e) {}
try {
    // port = require('./test').port
} catch (e) {}
module.exports = {
    configureWebpack: config => {
        // config.entry.app = ['babel-polyfill', './src/main.js']
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
        proxy: proxy || {
            '/mock/': {
                target: 'http://localhost:8080',
                pathRewrite: {
                    '^/mock/': '/test/'
                }
            },
            '/gateway': {
                // target: 'http://192.168.4.122:18082', // 李少辉
                target: 'http://192.168.1.150:58080'
            },
            '/dam/': {
                // target: 'http://192.168.7.46:18140'
                // target: 'http://192.168.1.191:8888'
                // target: 'http://192.168.1.151:42810'
                target: 'http://192.168.1.150:58080'

            },
          '/user/': {
            // target: 'http://192.168.7.46:18140'
            // target: 'http://192.168.1.191:8888'
            // target: 'http://192.168.1.151:42810'
            target: 'http://192.168.1.150:58080'

          },
            '/ddm/': {
                // target: 'http://192.168.1.150:58081' // master
                // target: 'http://localhost:8081',
                target: 'http://192.168.1.150:58081', // weikai
                // target: 'http://192.168.1.151:42810', // 5.8
            },
            '/workflow/': {
                target: 'http://192.168.1.150:18085'
            },
            '/domain/': {
              target: 'http://192.168.1.150:58081', // master
            },
          '/metric': {
            target: 'http://192.168.1.191:8889',
            pathRewrite: {
              '^/metric': '/domain'
            }
          },
        },
      compress: true,
      disableHostCheck: true
    },
  transpileDependencies: [/[/\\]node_modules[/\\](.+?)?element-ui(.*)[/\\]src/],
  chainWebpack: chainConfig
}
