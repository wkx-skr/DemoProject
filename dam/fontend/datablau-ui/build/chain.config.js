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
  config.module
    .rule('js')
    .use('babel-loader')
    .tap(options => {
        if (!options.plugins) {
            options.plugins = [];
        }
        options.plugins.push('@babel/plugin-proposal-optional-chaining');
        return options;
    });
  /**
   * 取消H5预加载
   */
  config.plugins.delete('preload')
  config.plugins.delete('prefetch')
}
// transpileDependencies: ['element-ui']
