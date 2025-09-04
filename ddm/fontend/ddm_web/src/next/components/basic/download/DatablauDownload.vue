<template>
  <div class="datablau-down">
    <datablau-button :type="getType" @click="handleClick">
      <i class="iconfont icon-download"></i>
      导出
    </datablau-button>
  </div>
</template>

<script>
export default {
  name: 'DatablauDownload',
  props: {
    type: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    options: {
      type: Object,
      default: () => {
        return {}
      },
    },
    name: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  computed: {
    getType() {
      if (['important', 'secondary'].includes(this.type)) {
        return this.type
      } else {
        return 'important'
      }
    },
  },
  methods: {
    handleClick() {
      this.$datablauDownload(this.url, this.options, this.name)
    },
  },
}
</script>

<style scoped lang="scss">
.datablau-down {
  /deep/ span {
    i {
      font-size: 12px;
      margin-right: 5px;
    }
  }
}
</style>
