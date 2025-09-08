module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      '@babel/preset-env',
      {
        targets: {
          // 根据你的项目需要调整目标环境
          browsers: ['> 1%', 'last 2 versions']
          // 或者针对特定 Node.js 版本：
          // node: 'current'
        },
        // 可选：根据是否需要完全转换为 ES5 模块语法设置
        // modules: false // 设置为 false 保留 ES6 模块语法，利于 webpack 进行 tree shaking
      }
    ]
  ],
  plugins: [
    [
      'import',
      { libraryName: 'ant-design-vue', libraryDirectory: 'es', style: 'css' },
    ],
  ],
}
