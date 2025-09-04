<template>
  <div>
    <div style="height:400px; overflow:auto;margin-bottom:10px;border:1px solid #F0F0F0;">
      <el-tree
        class="grey-tree"
        :data="treeData"
        :render-content="renderContent"
        ref="tree"
        show-checkbox
        node-key="id"
        :default-expanded-keys="defaultCheckedKeys"
        :default-checked-keys="defaultCheckedKeys"
        @check="handleCheckChange"
      ></el-tree>
    </div>
    <el-button type="primary" size="small" @click="submit">{{$version.button.ok}}</el-button>
    <el-button size="small" @click="close">{{$version.button.close}}</el-button>
  </div>
</template>
<script>
import $version from '@/resource/version.json'
export default {
  props: {
    defaultOption: {
      type: Object
    }
  },
  data () {
    return {
      treeData: null,
      defaultCheckedKeys: null
    }
  },
  created () {
    this.$version = $version
  },
  mounted () {
    this.forEachData(this.defaultOption.children)
    this.treeData = this.defaultOption.children
    // console.log(this.treeData)
  },
  methods: {
    forEachData (array) {
      const checkMap = new Set()
      const forEach = array => {
        array.forEach(item => {
          if (item.children && item.children.length > 0) {
            forEach(item.children)
          } else {
            if (item.selected) {
              checkMap.add(item.id)
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
      const pair = (id) => {
        if (id % 2 === 0) {
          return id - 1
        } else {
          return id + 1
        }
      }
      const child = id => {
        return node.id * 2 - 800000921
      }
      if (node.id >= 800000931 && node.id <= 800000933) {
        if (!checked) {
          this.$refs.tree.setChecked(child(node.id), true)
          this.$refs.tree.setChecked(child(node.id) + 1, false)
        } else {
          this.$refs.tree.setChecked(child(node.id), false)
          this.$refs.tree.setChecked(child(node.id) + 1, false)
        }
      }
      if (checked) {
        if ((node.id >= 800000941) && (node.id <= 800000946)) {
          checkedNodes.forEach(item => {
            if (item.id === pair(node.id)) {
              this.$refs.tree.setChecked(item, false)
            }
          })
        }
      }
    },
    renderContent (h, { node, data, store }) {
      let className = 'tree-icon '
      switch (data.id) {
        case 80000004:
          className += 'table'
          break
        case 80000005:
          className += 'attribute'
          break
        case 80000093:
          className += 'keygroup'
          break
        case 80500008:
          className += 'view big'
          break
        // case 80300035:
        //   className += 'keygroup'
        //   break
        // case 80000027:
        //   className += 'keygroup'
        //   break
        default:
          className = ''
          break
      }
      if (className) {
        return (
          <span style="flex: 1; display: flex;align-items: center;" data-code={data.code}>
            <span style="text-align:center;width:24px;">
              <span class={className} ></span>
            </span>
            <span>{data.name}</span>
          </span>)
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;" data-code={data.code}>
            <span>{data.name}</span>
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

</style>
