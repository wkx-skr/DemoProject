<template>
  <div class="theme-choose">
    <el-popover placement="left" width="150" trigger="hover">
      <div class="theme-list choose-theme-popover">
        <el-radio v-model="themeSelect" label="default">默认主题</el-radio>
        <br />
        <el-radio v-model="themeSelect" label="dark">黑色主题</el-radio>
        <br />
        <el-radio v-model="themeSelect" label="light">白色主题</el-radio>
        <br />
        <el-radio v-model="themeSelect" label="green" v-if="false">
          绿色主题
        </el-radio>
      </div>
      <div slot="reference" v-if="!isIE">
        <span v-if="showIcon">
          <i class="el-icon-view"></i>
          选择主题
        </span>
        <span v-else>主题</span>
      </div>
    </el-popover>
    <color-picker v-show="false"></color-picker>
  </div>
</template>

<script>
import colorPicker from './colorPicker'

function isIE() {
  // ie?
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    return true
  } else {
    return false
  }
}
export default {
  name: 'chooseTheme',
  data() {
    return {
      themeSelect: 'light',
      isIE: isIE(),
    }
  },
  props: {
    showIcon: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    colorPicker,
  },
  mounted() {
    // this.themeSelect = localStorage.getItem(`${this.$user.username}_choose_theme`) || 'default';
    setTimeout(() => {
      this.handleThemeChange(this.themeSelect)
    }, 500)
  },
  methods: {
    handleThemeChange(newTheme) {
      if (this.isIE) return
      this.$globalData.$theme.color.navBgc = '--main-content-bgc'
      this.$globalData.$theme.themeName = newTheme
      this.$bus.$emit('changeGlobalTheme', newTheme)
    },
  },
  watch: {
    themeSelect(newTheme) {
      this.handleThemeChange(newTheme)
    },
  },
}
</script>

<style lang="scss">
.theme-list.choose-theme-popover {
  label {
    margin: 6px;
  }
}
</style>
