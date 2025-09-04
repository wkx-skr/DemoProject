<template>
  <div class="pick-outer">
    <el-color-picker
      v-model="theme"
      :predefine="predefineColors"
      class="theme-picker"
      popper-class="theme-picker-dropdown"
    ></el-color-picker>
  </div>
</template>

<script>
// 主题 css 文件 作为文本 放到 js 中
import themeColor from '@/assets/styles/theme/themeColorMap.js'

import HTTP from '@/http/main'

// 原始切换主题功能, 不能直接设置具体颜色, 只能根据主题色自动生成相关颜色
const version = require('element-ui/package.json').version // 版本号
const ORIGINAL_THEME = '#409EFF'
function isIE() {
  // ie?
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    return true
  } else {
    return false
  }
}

export default {
  name: 'colorPicker',
  components: {},
  data() {
    return {
      chalk: '',
      theme: ORIGINAL_THEME,
      isIE: isIE(),
      predefineColors: [
        '#409EFF',
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577',
      ],
    }
  },
  mounted() {
    const themeName =
      localStorage.getItem(`${this.$user.username}_choose_theme`) || 'default'
    this.handleChangeTheme(themeName)

    this.$bus.$on('changeGlobalTheme', this.handleChangeTheme)

    // 废弃
    return
    const theme = localStorage.getItem('colorPicker')
    if (theme && this.CheckIsColor(theme)) {
      this.theme = localStorage.getItem('colorPicker')
    }
  },
  watch: {
    theme(val, oldVal) {
      return
      if (typeof val !== 'string') return
      localStorage.setItem('colorPicker', val)
      if (val === '') {
        // 清空主题色

        return
      }
      const themeCluster = this.getThemeCluster(val.replace('#', ''))
      const originalCluster = this.getThemeCluster(oldVal.replace('#', ''))
      const getHandler = (variable, id) => {
        return () => {
          const originalCluster = this.getThemeCluster(
            ORIGINAL_THEME.replace('#', '')
          )
          console.log(originalCluster, 'originalCluster')
          const newStyle = this.updateStyle(
            this[variable],
            originalCluster,
            themeCluster
          )

          let styleTag = document.getElementById(id)
          if (!styleTag) {
            styleTag = document.createElement('style')
            styleTag.setAttribute('id', id)
            const firstStyle = document.head.querySelector('link')
            firstStyle.insertBefore(styleTag)
          }
          styleTag.innerText = newStyle
        }
      }

      const chalkHandler = getHandler('chalk', 'chalk-style')

      if (false && !this.chalk) {
        // 没有 自定义主题, 从 远程 拉取 , 废弃
        const url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`
        this.getCSSString(url, chalkHandler, 'chalk')
      } else {
        chalkHandler()
      }

      const styles = [].slice
        .call(document.querySelectorAll('style'))
        .filter(style => {
          const text = style.innerText
          return (
            new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text)
          )
        })
      styles.forEach(style => {
        const { innerText } = style
        if (typeof innerText !== 'string') return
        style.innerText = this.updateStyle(
          innerText,
          originalCluster,
          themeCluster
        )
      })
    },
  },
  beforeDestroy() {
    this.$bus.$off('changeGlobalTheme', this.handleChangeTheme)
  },

  methods: {
    /**
     * 切换主题回调函数
     */
    handleChangeTheme(themeName) {
      if (this.isIE) return
      localStorage.setItem(
        `${this.$user.username}_choose_theme`,
        themeName || 'default'
      )
      this.changeTheme({ theme: themeName })

      window.document.documentElement.setAttribute('data-theme', themeName)
    },

    /**
     * 切换主题
     * @param para
     */
    changeTheme(para) {
      const theme = para.theme || 'default'

      this.setStyleTag(theme)
      this.setThemeColor(theme)
    },
    /**
     * 设置 主题标签, 在 header 增加一个style 标签,内容是
     * elemem-ui 线上生成的 css 文件
     * @param themeName
     */
    setStyleTag(themeName = 'default') {
      const id = 'chalk-style'
      let styleTag = document.getElementById(id)
      if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.setAttribute('id', id)
        // document.head.appendChild(styleTag);
        const firstStyle = document.head.querySelector('link')
        document.head.insertBefore(styleTag, firstStyle)
      }
      // 获取 css 文件
      // this.setTheme()
      if (/* themeName === 'default' || */ themeName === 'light') {
        // // default 或者 light, 清空 添加的样式
        // styleTag.innerText = '';
        // return ;
        themeName = 'default'
      }
      HTTP.getStyleThemeText({ themeName: themeName })
        .then(res => {
          const cssStr = res.data || ''
          const fontPlace = 'fonts/element-icons.ttf'

          // 替换 font 地址
          let newStyle = cssStr.replace(
            fontPlace,
            `/static/css/theme/custom-theme-${themeName}/theme/fonts/element-icons.ttf`
          )
          newStyle = cssStr.replace(
            'fonts/element-icons.woff',
            `./static/css/theme/custom-theme-${themeName}/theme/fonts/element-icons.woff`
          )
          // console.log(newStyle, 'newStyle')
          // 获取 样式标签
          const id = 'chalk-style'
          let styleTag = document.getElementById(id)
          if (!styleTag) {
            styleTag = document.createElement('style')
            styleTag.setAttribute('id', id)
            // document.head.appendChild(styleTag);
            const firstStyle = document.head.querySelector('link')
            firstStyle.insertBefore(styleTag)
          }
          styleTag.innerText = newStyle
        })
        .catch(e => {
          this.$showFailure(e)
        })

      // 将标签 旧样式清空, 将 新样式 赋值给 标签
      // return;
      // const footer = document.querySelector('html');
      // if (themeName === 'dark') {
      //   footer.style.setProperty('--main-color', 'dark');
      // } else if (themeName === 'red') {
      //   footer.style.setProperty('--main-color', 'red');
      // } else {
      //   footer.style.setProperty('--main-color', 'blue');
      // }
      //
      // return;

      // // let url = `@/assets/styles/theme/${themeName}-theme.scss`;
      // // import(url);
      // if (themeName === 'dark') {
      //   import('@/assets/styles/theme/dark-theme.scss');
      // } else if (themeName === 'red') {
      //   import('@/assets/styles/theme/red-theme.scss');
      // } else {
      //   // defaultTheme 默认主题
      //   import('@/assets/styles/theme/default-theme.scss');
      // }
      // 设置 颜色主题
      // window.document.documentElement.setAttribute("style-theme","dark");
    },

    /**
     * 切换 页面 颜色( 使用了非 element-ui 默认颜色的部分)
     * @param themeName
     */
    setThemeColor(themeName = 'default') {
      const colorMap = themeColor[`${themeName}Theme`] || {}
      const rootElement = document.querySelector('html')
      for (const key in colorMap) {
        rootElement.style.setProperty(key, colorMap[key])
      }

      this.$globalData.$theme.color.navBgc = colorMap['--main-content-bgc']
    },

    // old
    CheckIsColor(bgVal) {
      let type = '^#[0-9a-fA-F]{6}$'
      let re = new RegExp(type)
      if (bgVal.match(re) == null) {
        type =
          '^[rR][gG][Bb][\(]([\\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){2}[\\s]*(2[0-4]\\d|25[0-5]|[01]?\\d\\d?)[\\s]*[\)]{1}$'
        re = new RegExp(type)
        if (bgVal.match(re) == null) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
    updateStyle(style, oldCluster, newCluster) {
      let newStyle = style
      oldCluster.forEach((color, index) => {
        newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
      })
      return newStyle
    },

    getCSSString(url, callback, variable) {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
          callback()
        }
      }
      xhr.open('GET', url)
      xhr.send()
    },

    getThemeCluster(theme) {
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        if (tint === 0) {
          // when primary color is in its rgb space
          return [red, green, blue].join(',')
        } else {
          red += Math.round(tint * (255 - red))
          green += Math.round(tint * (255 - green))
          blue += Math.round(tint * (255 - blue))

          red = red.toString(16)
          green = green.toString(16)
          blue = blue.toString(16)

          return `#${red}${green}${blue}`
        }
      }

      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        red = Math.round((1 - shade) * red)
        green = Math.round((1 - shade) * green)
        blue = Math.round((1 - shade) * blue)

        red = red.toString(16)
        green = green.toString(16)
        blue = blue.toString(16)

        return `#${red}${green}${blue}`
      }

      const clusters = [theme]
      for (let i = 0; i <= 9; i++) {
        clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
      }
      clusters.push(shadeColor(theme, 0.1))
      return clusters
    },
  },
}
</script>

<style lang="scss">
.pick-outer {
  display: inline-block;
  .theme-picker .el-color-picker__trigger {
    vertical-align: middle;
  }

  .theme-picker-dropdown .el-color-dropdown__link-btn {
    /*display: none;*/
  }
}
</style>
