<template>
  <datablau-dialog
    :title="type === 'Object' ? '选择对象' : '选择属性'"
    :visible.sync="visible"
    height="650px"
    width="450px"
    size="mini"
    :before-close="close"
  >
    <datablau-checkbox
      v-model="checkedBox"
      class="tag-checkbox-group top-filter-checkbox"
      @change="handleDataTypeChange"
    >
      <el-checkbox
        class="tag-checkbox"
        style="display: block; margin-bottom: 6px"
        v-for="s in all"
        :key="s.Label"
        :label="s.TreeKey"
        :disabled="
          s.TreeKey === '90000004' ||
          s.TreeKey === '90000002' ||
          s.TreeKey === '80100005' ||
          s.TreeKey === '90000003'
        "
      >
        <i
          style="color: rgb(64, 158, 255); margin-right: 4px"
          v-if="type === 'Object'"
          class="iconfont icon-ziliao"
        ></i>
        <i
          style="color: rgb(64, 158, 255); margin-right: 4px"
          v-else
          class="iconfont icon-menu-gzcs"
        ></i>
        <span>{{ s.Label }}</span>
      </el-checkbox>
    </datablau-checkbox>
    <!-- <datablau-easy-tree
      :data="all"
      node-key="TreeKey"
      ref="objectTree"
      :props="defaultProps"
      :data-icon-function="dataIconFunction"
      @node-click="handleNodeClick"
      :check-on-click-node="true"
      @check="handleNodeChecked"
      :show-checkbox="true"
      default-expand-all
      show-overflow-tooltip
      aria-disabled=""
      tooltip-placement="top-start"
      :default-checked-keys="defaultCheckedKeys"
      height="100%"
      style="width: 100%; height: 100%"
      :itemSize="34"
    ></datablau-easy-tree> -->
    <div slot="footer">
      <datablau-button type="info" @click="close">取消</datablau-button>
      <datablau-button type="primary" @click="confirm">确定</datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
export default {
  name: 'ObjectSelector',
  props: {
    all: {
      type: Array,
      default() {
        return []
      },
    },
    selected: {
      type: Array,
      default() {
        return []
      },
    },
    parent: {
      type: Object,
      default: null,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'Object',
    },
  },
  data() {
    return {
      defaultProps: {
        label: 'Label',
      },
      treeData: [],
      checkedNodes: [],
      defaultCheckedKeys: [],
      checkedBox: [],
    }
  },
  methods: {
    handleDataTypeChange(val) {
      this.checkedNodes = []
      this.checkedBox = val
      this.all.forEach(element => {
        this.checkedBox.forEach(ele => {
          if (element.TreeKey === ele) {
            this.checkedNodes.push(element)
          }
        })
      })
    },
    dataIconFunction() {
      if (this.type === 'Object') {
        return 'iconfont icon-ziliao'
      } else {
        return 'iconfont icon-menu-gzcs'
      }
    },
    handleNodeChecked(data, { checkedNodes }) {
      this.checkedNodes = checkedNodes
    },
    handleNodeClick() {},
    confirm() {
      this.$emit('handleObjectSelectorConfirm', {
        type: this.type,
        checkedNodes: this.checkedNodes,
        callback() {
          this.checkedNodes = []
        },
      })
    },
    close() {
      this.$emit('close')
    },
  },
  mounted() {
    this.all.forEach(element => {
      if (
        element.Id === '90000004' ||
        element.Id === '90000002' ||
        element.Id === '80100005' ||
        element.Id === '90000003'
      ) {
        this.checkedBox.push(element.TreeKey)
        this.checkedNodes.push(element)
      }
    })
  },
}
</script>

<style lang="scss" scoped></style>
