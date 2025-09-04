<template>
  <div>
    <span v-for="option in options" class="btn-outer" :key="option.name">
      <el-button
        v-if="showBtn(option)"
        type="text"
        size="small"
        :disabled="disabledBtn(option)"
        :icon="option.icon"
        @click="
          e => {
            editItem(option, e)
          }
        "
      >
        {{ option.text }}
      </el-button>
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabComponent: null,
      options: [],
      // option 单个属性: icon 图标, text 文本 method 调用的方法
      // preventDefault 阻止默认事件 stopPropagation 阻止冒泡
      // ifBtnShow 是否显示 ifBtnDisabled 是否禁用
    }
  },
  components: {},
  computed: {},
  mounted() {
    this.tabComponent = this.params.tabComponent
    const options = this.params.options
    if (options) {
      this.options = options
    }
  },
  methods: {
    editItem(options, e) {
      const method = options.method
      // 阻止默认事件
      if (options.preventDefault !== false) {
        e.preventDefault()
      }
      // 阻止冒泡
      if (options.stopPropagation !== false) {
        e.stopPropagation()
      }
      // console.log(this.params, 'this.params')
      const tabComponent = this.tabComponent
      if (tabComponent && tabComponent[method]) {
        const para = {
          data: this.params.data,
          api: this.params.api,
          e,
        }
        tabComponent[method](para)
      }
      // console.log(arguments, 'argu')
    },
    showBtn(option) {
      if (option.ifBtnShow) {
        return option.ifBtnShow(this.params.data)
      } else {
        return true
      }
    },
    disabledBtn(option) {
      if (option.ifBtnDisabled) {
        return option.ifBtnDisabled(this.params.data)
      } else {
        return false
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.btn-outer {
  margin-right: 10px;
}
</style>
