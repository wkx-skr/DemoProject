<template>
  <div class="datablau-table-filter">
    <el-popover
      placement="bottom"
      @show="popoverShow"
      @hide="popoverHide"
      :trigger="trigger"
      ref="popover"
      v-model="showPopover"
    >
      <div class="content-wrapper">
        <datablau-input :icon-font="true" v-model="search" placeholder="搜索"></datablau-input>
        <datablau-tree
          class="filter-tree"
          ref="tree"
          v-bind="$attrs"
          v-on="$listeners"
          :highlightCurrent="highlightCurrent"
          :default-expand-all="defaultExpandAll"
          @node-click="handleNodeClick">
        </datablau-tree>
      </div>
      <datablau-button type="icon" :class="active? 'active': 'not-active'" class="iconfont icon-filter" slot="reference"></datablau-button>
      <div class="operator-buttons">
        <datablau-button type="secondary" @click="reset">重置</datablau-button>
        <datablau-button @click="confirm" type="important">确定</datablau-button>
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  data () {
    return {
      currentSelectData: {},
      preSelectData: {},
      search: '',
      showPopover: false,
      valueBak: ''
    }
  },
  name: 'DatablauTableTreeFilter',
  props: {
    value: {
      type: [String, Number]
    },
    trigger: {
      type: String,
      default: 'click'
    },
    highlightCurrent: {
      type: Boolean,
      default: true
    },
    defaultExpandAll: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    active () {
      return !!this.valueBak
    }
  },
  watch: {
    search(val) {
      this.$refs.tree.filter(val)
    }
  },
  mounted() {
    this.onReady()
  },
  methods: {
    onReady () {
      this.valueBak = this.value
    },
    initFilter () {
      this.search = ''
      let tree = this.$refs.tree
      if (this.valueBak) {
        tree.setCurrentKey(this.valueBak)
        let nodeData = tree.getNode(this.valueBak)
        if (nodeData) {
          let { data } = nodeData
          this.preSelectData = _.cloneDeep(data)
          this.currentSelectData = _.cloneDeep(data)
        }
      }
    },
    handleNodeClick (data, node) {
      this.currentSelectData = data
    },
    popoverShow () {
      this.initFilter()
    },
    popoverHide () {
      if (!this.isConfirm) {
        let prop = this.$attrs['nodeKey'] || 'id'
        this.currentNodeKey = this.preSelectData[prop]
        if (!this.currentNodeKey) {
          this.$refs.tree.setCurrentKey(null)
        }
      }
    },
    resetState () {
      this.reset()
      let prop = this.$attrs['nodeKey'] || 'id'
      this.valueBak = this.currentSelectData[prop]
      this.$emit('input', this.currentSelectData[prop])
    },
    reset() {
      let tree = this.$refs.tree
      this.currentSelectData = {}
      tree.setCurrentKey(null)
    },
    close() {
      this.showPopover = false
    },
    confirm() {
      this.isConfirm = true
      let prop = this.$attrs['nodeKey'] || 'id'
      this.valueBak = this.currentSelectData[prop]
      this.$emit('input', this.currentSelectData[prop])
      this.$emit('confirmSelected', this.currentSelectData)
      this.$refs.popover.doClose()
      this.$nextTick(() => {
        this.isConfirm = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.content-wrapper {
}
.filter-tree {
  min-height: 70px;
  max-height: 400px;
  overflow: auto;
  margin-left: -5px;
  font-size: 12px;
}
.datablau-table-filter .not-active {
  color: #999;
}
.operator-buttons {
  margin-top: 20px;
  text-align: right;
}
.datablau-table-filter {
  display: inline-block;
}
</style>
