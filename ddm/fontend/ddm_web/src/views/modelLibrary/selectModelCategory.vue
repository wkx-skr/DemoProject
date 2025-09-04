<template>
  <div>
    <datablau-dialog
        title="选择目录"
        :visible.sync="showModeCategory"
        size="l"
        append-to-body
        custom-class="select-model-category-dialog"
        :blackTheme="$route.path.indexOf('sql_editor') !== -1 ? true: false"
    >
      <div class="tree-container">
        <div class="filter-line">
          <datablau-input
              v-model="keyword"
              :iconfont-state="true"
              placeholder="请输入"
              clearable
              :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
          ></datablau-input>
        </div>
        <div class="tree-outer">
          <db-tree
            node-key="id"
            class="category-tree"
            :props="moveTreeDefaultProps"
            :data="treeData"
            :data-supervise="true"
            :data-icon-function="dataIconFunction"
            ref="tree"
            :default-expand-all="false"
            :default-expanded-keys="defaultkey"
            :filter-node-method="filterNode"
            :expand-on-click-node="true"
            @node-click="handleNodeClick"
            @locked-node-click="chooseLockedMoveCategoryNode"
            :showLockedMessage="false"
            v-if="showModeCategory"
            :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
          ></db-tree>
        </div>
      </div>
      <div slot="footer">
        <datablau-button :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false" type="secondary" @click="showModeCategory = false">
          取消
        </datablau-button>
        <datablau-button
            type="primary"
            :disabled="!chosenMoveCategoryId"
            @click="chooseConfirm"
            :themeBlack="$route.path.indexOf('sql_editor') !== -1 ? true: false"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import sort from '@/resource/utils/sort'
import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
export default {
  name: 'selectModelCategory',
  data () {
    return {
      showModeCategory: false,
      moveTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      defaultkey: [1],
      chosenMoveCategoryId: '',
      treeData: null,
      chooseData: null,
      keyword: ''
    }
  },
  components: {
    dbTree
  },
  computed: {
  },
  mounted () {
    // this.dataInit()
  },
  methods: {
    dataInit () {
      this.getModelsTree()
      this.showModeCategory = true
    },
    handleNodeClick (data, node) {
      this.$emit('chooseModelCategory', { data, node })
      this.chooseData = { data, node }
      this.chooseMoveCategoryNode(data, node)
    },
    hideDialog () {
      this.showModeCategory = false
    },
    filterNode (value, data, node) {
      let keyword = _.trim(value)
      if (!keyword) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      do {
        if (this.$MatchKeyword(node.data, keyword, 'name')) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    dataIconFunction (data, node) {
      if (node.level === 1) {
        return 'tree-icon model'
      }
      if (node.data.damModelCategoryId) {
        if (node.expanded) {
          return 'iconfont icon-openfilebinding'
        } else {
          return 'iconfont icon-filebinding'
        }
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    getModelsTree (callback) {
      let categoryMap = {}
      const sortModelLib = (result, bindDam = false) => {
        // 递归 增加判断 是否已经绑定 dam 系统
        // childrenBindDam: 自身 或者 子目录 绑定了 dam 系统
        result.childrenBindDam = false
        categoryMap[result.id] = result
        if (result.damModelCategoryId) {
          result.childrenBindDam = true
        }
        result.parentBindDam = !!bindDam
        if (result.children) {
          sort.sortConsiderChineseNumber(result.children, 'name')
          result.children.forEach(item => {
            // 排序 并 返回 是否绑定 dam 系统
            if (sortModelLib(item, !!item.damModelCategoryId || result.parentBindDam)) {
              result.childrenBindDam = true
            }
          })
        }

        return !!result.childrenBindDam
      }
      const handler = (result) => {
        this.modelCategoryMap = new Map()
        this.rootModelId = result.id
        sortModelLib(result)
        this.pushModels(result)
        this.treeData = [result]
        // this.treeDataLoaded = true
        this.categoryMap = categoryMap
        setTimeout(() => {
          callback && callback()
        })
      }
      if (this.$store.state.modelsTree) {
        handler(this.$store.state.modelsTree)
      } else {
        HTTP.getModels({
          successCallback: handler
        })
      }
    },
    pushModels (treeData) {
      const forEach = node => {
        if (!node) return
        if (this.modelCategoryMap.has(node.id)) {
          node.models = this.modelCategoryMap.get(node.id)
        }
        if (node.children) {
          node.children.forEach(item => {
            forEach(item)
          })
        }
      }
      forEach(treeData)
    },
    setPathStr (node, ary) {
      ary.unshift(node.data.name)
      if (node.parent.data.parentId !== 0) {
        this.setPathStr(node.parent, ary)
      } else {
        ary.unshift(node.parent.data.name)
      }
      this.cateGoryData.path = '/' + ary.join('/')
    },
    chooseConfirm () {
      this.$emit('chooseConfirm', this.chooseData)
      this.showModeCategory = false
    },
    chooseMoveCategoryNode (data, node) {
      if (node.parent) {
        this.chosenMoveCategoryId = data.id
      } else {
        this.chosenMoveCategoryId = ''
      }
    },
    chooseLockedMoveCategoryNode () {
      this.chosenMoveCategoryId = ''
    }
  },
  watch: {
    keyword (val) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
.select-model-category-dialog {
  .tree-container {
    position: relative;
    height: 100%;
    min-height: 400px;
    //overflow: auto;
    //border: 1px solid red;
    width: 100%;

    .filter-line {
      .datablau-input {
        width: 100%;
      }
    }
    .tree-outer {
      position: absolute;
      left: 0;
      right: 0;
      top: 50px;
      bottom: 0;
      overflow: auto;
    }
  }

}
</style>
