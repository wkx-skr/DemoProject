<template>
  <div>
    <div :style="`height:${height}px; overflow:auto;`">
      <datablau-tree
          check-strictly
          class="grey-tree ddl-setting"
          :data="treeData"
          :render-content="renderContent"
          ref="tree"
          show-checkbox
          node-key="id"
          :default-expanded-keys="defaultCheckedKeys"
          :default-checked-keys="defaultCheckedKeys"
          @check="handleCheckChange"
          :props="treeProps"
          :themeBlack="typeDataWareHouse"
      ></datablau-tree>
    </div>
    <!-- <el-button type="primary" size="small" @click="submit">{{$store.state.$v.dataEntity.ok}}</el-button>
    <el-button size="small" @click="close">{{$store.state.$v.dataEntity.cancel}}</el-button> -->
  </div>
</template>
<script>
import $version from '@/resource/version.json'
export default {
  props: {
    defaultOption: {
      type: Object
    },
    height: {
      type: String,
      default: '504'
    },
    typeDataWareHouse: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      treeData: null,
      defaultCheckedKeys: null,
      checkedMap: {}, // 记录点击 check 之前的选中状态, true 代表被选中
      parentMap: {}, // 通过 id 找到 父节点
      treeProps: {
        disabled: function (data, node) {
          return data.enable === false
        }
      }
    }
  },
  created () {
    this.$version = $version
  },
  mounted () {
    this.forEachData(this.defaultOption.children)
    this.treeData = this.defaultOption.children
  },
  methods: {
    forEachData (array) {
      const checkMap = new Set()
      const forEach = (array, parent) => {
        array.forEach(item => {
          if (item.selected) {
            checkMap.add(item.id)
            this.checkedMap[item.id] = true
          }
          if (parent) {
            this.parentMap[item.id] = parent
          }
          if (item.children && item.children.length > 0) {
            forEach(item.children, item)
          } else {
            if (item.selected) {
              checkMap.add(item.id)
              this.checkedMap[item.id] = true
            }
          }
        })
      }
      forEach(array)
      this.defaultCheckedKeys = [...checkMap]
    },
    handleCheckChange (node, { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys }) {
      const checked = checkedNodes.concat(halfCheckedNodes).some(item => {
        return node.id === item.id
      })

      const radioCheck = (sub) => {
        if ([800000934, 800000933].includes(sub.id)) {
          // 默认选中第二项
          sub.children.forEach((item, index) => {
            if (index !== 1) {
              this.$refs.tree.setChecked(item, false)
            } else {
              this.$refs.tree.setChecked(item, true)
            }
          })
        } else if ([800000931, 800000932].includes(sub.id)) {
          // 默认选中第一项
          sub.children.forEach((item, index) => {
            if (index !== 0) {
              this.$refs.tree.setChecked(item, false)
            } else {
              this.$refs.tree.setChecked(item, true)
            }
          })
        }
      }
      const deepCheck = (node, value) => {
        this.$refs.tree.setChecked(node, value)
        node.children?.forEach(sub => {
          this.$refs.tree.setChecked(sub, value)
          deepCheck(sub, value)
        })
      }
      const deepParentCheck = (node, value) => {
        let parent = this.parentMap[node.id]
        while (parent) {
          this.$refs.tree.setChecked(parent, value)
          parent = this.parentMap[parent.id]
        }
      }
      if (checked) {
        let parent = this.parentMap[node.id]
        let radioArr = [800000931, 800000932, 800000934, 800000933] // 这些节点的子元素只能单选
        // key/index 全选时, 每一项只能选一个
        if (node.id === 80000093) {
          if (!this.checkedMap[node.id]) {
            node.children.forEach(sub => {
              this.$refs.tree.setChecked(sub, true)
              radioCheck(sub)
            })
          } else {
            this.$refs.tree.setChecked(node, false, true)
          }
        } else if (radioArr.includes(node.id)) {
          if (!this.checkedMap[node.id]) {
            radioCheck(node)
            deepParentCheck(node, true) // 当前节点的所有父节点选中
          } else {
            this.$refs.tree.setChecked(node, false, true)
          }
        } else if (radioArr.includes(parent?.id)) {
          parent.children.forEach(item => {
            if (item.id !== node.id) {
              this.$refs.tree.setChecked(item, false, true)
            } else {
              deepParentCheck(node, true) // 当前节点的所有父节点选中
            }
          })
        } else {
          deepCheck(node, true) // 当前节点下的所有子节点选中
          deepParentCheck(node, true) // 当前节点的所有父节点选中
        }
      } else {
        deepCheck(node, false)
      }
      this.$nextTick(() => {
        const keys = this.$refs.tree.getCheckedKeys()
        const halfKeys = this.$refs.tree.getHalfCheckedKeys()
        let checkedMap = {}
        keys.concat(halfKeys).forEach(item => {
          checkedMap[item] = true
        })
        this.checkedMap = checkedMap
      })
    },
    renderContent (h, { node, data, store }) {
      // let className = 'tree-icon '
      let icon = ''
      switch (data.id) {
        case 80000004:
          icon = 'table'
          break
        case 80000005:
          icon = 'column'
          break
        case 80000093:
          icon = 'key'
          break
        case 80500008:
          icon = 'view'
          break
        // case 80300035:
        //   className += 'keygroup'
        //   break
        // case 80000027:
        //   className += 'keygroup'
        //   break
        default:
          icon = ''
          break
      }
      // if (className) {
      //   return (
      //     <span style="flex: 1; display: flex;align-items: center;" data-code={data.code}>
      //       <span style="text-align:center;width:24px;">
      //         <span class={className} ></span>
      //       </span>
      //       <span>{data.name}</span><span class='item-disc'title={data.description}>{data.description}</span>
      //     </span>)
      // }
      if (icon) {
        return (
          <span style="flex: 1; display: flex;align-items: center;" data-code={data.code}>
            <span style="text-align:center;width:24px;">
              <datablau-icon data-type={icon} icon-type="svg" size={14} ></datablau-icon>
            </span>
            <span>{data.name}</span><span class='item-disc'title={data.description}>{data.description}</span>
          </span>)
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;" data-code={data.code}>
            <span>{data.name}</span><span class='item-disc' title={data.description}>{data.description}</span>
          </span>)
      }
    },
    close () {
      this.$emit('close')
    },
    submit () {
      const keys = this.$refs.tree.getCheckedKeys()
      const halfKeys = this.$refs.tree.getHalfCheckedKeys()
      this.$emit('submit', _.concat(keys, halfKeys))
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
.ddl-setting {
  /deep/ .el-tree-node {
    position: relative;
  }
  /deep/ .item-disc {
    position: absolute;
    left: 30%;
    max-width: 584px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /deep/ .el-tree-node__content {
      border-bottom: unset;
    }
}
</style>
