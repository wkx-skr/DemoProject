module.exports = {
  compact: false,
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'import',
      { libraryName: 'ant-design-vue', libraryDirectory: 'es', style: 'css' },
    ],
  ],
}
