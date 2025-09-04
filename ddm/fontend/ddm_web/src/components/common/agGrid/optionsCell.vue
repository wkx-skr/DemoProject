<template>
  <div class="filter-options">
    <span
      v-for="option in options"
      class="btn-outer"
      :key="option.name"
    >
      <el-button
        v-if="showBtn(option)"
        type="text"
        size="small"
        :disabled="disabledBtn(option)"
        @click="(e) => {editItem(option.method, e)}"
      >{{option.text}}</el-button>
    </span>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tabComponent: null,
      options: []
    }
  },
  components: {

  },
  computed: {

  },
  mounted () {
    this.tabComponent = this.params.tabComponent
    let options = this.params.options
    if (options) {
      this.options = options
    }
  },
  methods: {
    editItem (method, e) {
      // console.log(this.params, 'this.params')
      let tabComponent = this.tabComponent
      if (tabComponent && tabComponent[method]) {
        let para = {
          data: this.params.data,
          api: this.params.api,
          e
        }
        tabComponent[method](para)
      }
      // console.log(arguments, 'argu')
    },
    showBtn (option) {
      if (option.ifBtnShow) {
        return option.ifBtnShow(this.params.data)
      } else {
        return true
      }
    },
    disabledBtn (option) {
      if (option.ifBtnDisabled) {
        return option.ifBtnDisabled(this.params.data)
      } else {
        return false
      }
    }
  },
  watch: {

  }
}
</script>

<style lang="scss" scpoed>
.btn-outer {
  margin-right: 10px;
}

</style>
