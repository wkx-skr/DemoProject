const path = require('path')
// const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')
const ThemeColorReplacer = require('webpack-theme-color-replacer')
const colorMap = require('./src/resource/theme/colorMap.js')
// const MonacoWebpackPlugin = require('monaco-editor-esm-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  devtool: process.env.NODE_ENV === 'production' ? 'none' : 'eval-source-map', // 开启调试map，正式上线需要注掉
  entry: process.env.NODE_APP && process.env.NODE_APP.toLowerCase() === 'ddd' ? './src/dataWarehouse/main.ts' : {
    app: ['babel-polyfill']
  },
  resolve: {
    alias: {
      '@': resolve('src'),
      '@class': resolve('src/next/class'),
      '@components': resolve('src/next/components'),
      '@constant': resolve('src/next/constant'),
      '@service': resolve('src/next/service'),
      '@er': resolve('public/static/js'),
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.js/,
  //       enforce: 'pre',
  //       include: /node_modules[\\/]monaco-editor[\\/]esm/,
  //       use: MonacoWebpackPlugin.loader
  //     }
  //   ]
  // },
  module: {
    rules: [
      {
        test: /.bpmn$/,
        exclude: /node_modules/,
        loader: 'raw-loader'
      }
    ]
  },
  plugins: [
    // new MonacoWebpackPlugin(),
    // new MonacoEditorPlugin({
    //   // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    //   // Include a subset of languages support
    //   // Some language extensions like typescript are so huge that may impact build performance
    //   // e.g. Build full languages support with webpack 4.0 takes over 80 seconds
    //   // Languages are loaded on demand at runtime
    //   languages: ['java']
    // }),
    new ThemeColorReplacer({
      matchColors: [...Object.keys(colorMap)], // colors array for extracting css file, support rgb and hsl.
      fileName: 'static/css/theme-colors-[contenthash:8].css', // optional. output css file name, suport [contenthash] and [hash].
      // resolveCss(resultCss) { // optional. Resolve result css code as you wish.
      //     return resultCss.replace(/#ccc/g, '#eee')
      // },
      externalCssFiles: ['./node_modules/element-ui/lib/theme-chalk/index.css'], // optional, String or string array. Set external css files (such as cdn css) to extract colors.
      // changeSelector(selector, util) { // optional, Funciton. Changing css selectors, in order to raise css priority, to resolve lazy-loading problems.
      //     return util.changeEach(selector, '.el-button--default')
      // },
      injectCss: false, // optional. Inject css text into js file, no need to download `theme-colors-xxx.css` any more.
      isJsUgly: process.env.NODE_ENV !== 'development' // optional. Set to `true` if your js is uglified. Default is set by process.env.NODE_ENV.
    })
  ]
}
