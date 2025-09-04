const aliasConfig = require('./webpack.config')
let proxy = null
let port = null
try {
  proxy = require('./test').proxy
  port = require('./test').port
} catch (e) {
}
const baseUrl = 'http://192.168.1.150:58080'
module.exports = {
  configureWebpack: config => {
    // config.entry.app = ['babel-polyfill', './src/main.js']
    return aliasConfig
  },
  // configureWebpack: {
  //   plugins: [
  //     new MonacoEditorPlugin({
  //       // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
  //       // Include a subset of languages support
  //       // Some language extensions like typescript are so huge that may impact build performance
  //       // e.g. Build full languages support with webpack 4.0 takes over 80 seconds
  //       // Languages are loaded on demand at runtime
  //       languages: ['java']
  //     })
  //   ]
  // },
  publicPath: process.env.NODE_ENV === 'production'
    ? './'
    : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  indexPath: 'index.html',
  filenameHashing: true,
  pages: undefined,
  productionSourceMap: false,
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: proxy || {
      '/mock': {
        target: 'http://localhost:8081',
        pathRewrite: {
          '^/mock/': '/test/'
        }
      },
      '/ddm': {
        // target: 'http://192.168.1.186:18081'
        // target: 'http://192.168.1.222:18081'
        // target: 'http://office.datablau.cn:58081'
        // target: 'http://localhost:18081'
        // target: 'http://one.datablau.cn:18081'
        // target: 'http://office.datablau.cn:58081' // 外网映射 master
        // target: 'http://172.16.11.42:19888'
        // target: 'http://192.168.0.23:19888'
        // target: 'http://192.168.0.47:8081'
        // target: 'http://192.168.3.39:18081'
        // target: 'http://192.168.1.101:18081'
        target: baseUrl
        // target: 'http://192.168.4.122:18082' // 李少辉
        // target: 'http://192.168.1.151:42811'
      },
      '/gateway': {
        target: baseUrl
      },
      '/dam': {
        target: baseUrl
      },
      '/workflow': {
        target: baseUrl
      },
      '/user': {
        target: baseUrl
      },
      '/dolphinscheduler': {
        target: baseUrl
      }
    },
    port: port || 8080,
    before: require('./mock/mock-server.js')
    // proxy: {
    //   '/ddm': {
    //     target: 'http://demo.datablau.cn:18080'
    //   }
    // }
  },
  // transpileDependencies: ['monaco-editor', /[/\\]node_modules[/\\](.+?)?element-ui(.*)[/\\]src/],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        directories: {
          output: 'dist_electron'
        },
        nsis: {
          allowToChangeInstallationDirectory: true,
          oneClick: false,
          perMachine: true,
          installerIcon: 'public/Datablau.ico', // 安装logo
          installerHeaderIcon: 'public/Datablau.ico', // 安装logo,
          include: 'public/electron/installer.nsh'
        },
        electronDownload: {
          mirror: 'https://npmmirror.com/mirrors/electron/' // 镜像设置
        },
        linux: {
          target: [
            'rpm',
            // 'AppImage',
            'zip'
          ],
          category: 'Datablau',
          icon: 'public/linux.icns',
          executableName: 'desiredName'
          // artifactName: 'DDM-6.5.2.deb'
        },
        win: {
          // icon: 'public/Datablau.ico' // 打包windows版本的logo,
        },
        mac: {
          category: 'public.app-category.lifestyle',
          icon: 'public/linux.icns',
          target: ['dmg'],
          hardenedRuntime: true
          // bundleVersion: 2,
          // bundleShortVersion: 1.0.0
        },
        productName: 'DDMOnline' // 应用的名称
      }
    }
  },
  chainWebpack: config => {
    // config.module
    //   .rule('js')
    //   .include
    //   .add('/src/views/list')// 这里根据你文件夹名称自定义，每个人不一样
    //   .end()
    //   .use('babel')
    //   .loader('babel-loader')
    //   .tap(options => {
    //     // 修改它的选项...
    //     return options
    //   })
    if (process.env.COMMON_LIB === 'ER') {
      config.externals({
        lodash: 'lodash',
        'monaco-editor': 'monaco-editor',
        'monaco-editor/esm/vs/editor/editor.api': 'monaco-editor',
        vue: 'vue',
        vuex: 'vuex',
        'vue-router': 'vue-router',
        'element-ui': 'element-ui',
        echarts: 'echarts',
        moment: 'moment',
        xlsx: 'xlsx',
        jquery: 'jquery',
        'axios': 'axios'
      })
    }
    config.plugin('define').tap(args => {
      // 添加全局变量
      // args[0]['process.env'].VUE_APP_DATA='"DATA"';
      args[0]['RUN_ENV'] = process.env.NODE_ENV !== 'production' ? '"dev"' : '"build"'

      // 打包时间:
      args[0]['BUILD_TIME'] = new Date().getTime()
      return args
    })
  }
}
