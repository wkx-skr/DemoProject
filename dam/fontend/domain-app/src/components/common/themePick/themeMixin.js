const mixin = {
  data() {
    return {
      themeName: '',
    }
  },
  mounted() {
    this.themeName = this.$globalData.$theme.themeName
    this.$bus.$on('changeGlobalTheme', this.triggerThemeChangeHandler)
  },
  methods: {
    triggerThemeChangeHandler(theme) {
      this.themeName = theme
      if (this.handleThemeChange) {
        this.handleThemeChange(theme)
      }
    },
  },
  beforeDestroy() {
    this.$bus.$off('changeGlobalTheme', this.triggerThemeChangeHandler)
  },
}

export default mixin
