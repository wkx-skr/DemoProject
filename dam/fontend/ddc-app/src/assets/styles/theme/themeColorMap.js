// import defaultTheme from './defaultThemeColor';
// import lightTheme from './lightThemeColor';
// import darkTheme from './darkThemeColor';

const defaultTheme = require('./defaultThemeColor')
const lightTheme = require('./lightThemeColor')
const darkTheme = require('./darkThemeColor')

const colorMap = {
  // 默认主题
  defaultTheme,
  // 白色主题
  lightTheme,
  // 黑色主题
  darkTheme,
}

// 这些属性如果没有设置, 使用默认主题色
const defaultMainColorProps = ['--top-border-color']
for (const themeName in colorMap) {
  const theme = colorMap[themeName]
  defaultMainColorProps.forEach(key => {
    if (!theme[key]) {
      theme[key] = theme['--main-color'] || ''
    }
  })
}

export default colorMap
