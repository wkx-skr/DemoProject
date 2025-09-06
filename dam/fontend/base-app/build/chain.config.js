module.exports = config => {
  config.plugin('define').tap(args => {
    // 添加全局变量
    // args[0]['process.env'].VUE_APP_DATA='"DATA"';
    args[0].RUN_ENV =
      process.env.NODE_ENV !== 'production' ? '"dev"' : '"build"'

    // 打包时间:
    args[0].BUILD_TIME = new Date().getTime()
    return args
  })

  // 关闭 Vue 组件的 __file 注入，防止绝对路径泄漏
  config.module
    .rule('vue')
    .use('vue-loader')
    .tap(options => {
      options.exposeFilename = false
      return options
    })

  // 生产环境额外优化，确保不暴露调试信息
  if (process.env.NODE_ENV === 'production') {
    // 确保 webpack 模式为 production
    config.mode('production')
    
    // 移除 console.log 等调试代码
    config.optimization.minimizer('terser').tap(args => {
      args[0].terserOptions = {
        ...args[0].terserOptions,
        compress: {
          ...args[0].terserOptions?.compress,
          drop_console: true,
          drop_debugger: true
        }
      }
      return args
    })
  }

  /**
   * 取消H5预加载
   */
  config.plugins.delete('preload')
  config.plugins.delete('prefetch')
}
// transpileDependencies: ['element-ui']
