<template>
  <div>
    <datablau-dialog
      title="选择目录"
      :visible.sync="$store.state.showModelCategorySelector"
      size="l"
      append-to-body
      custom-class="new-model-select-model-category-dialog"
      :scrollDom="'.category-scroll-container.tree-outer'"
    >
      <div class="tree-container">
        <div class="filter-line">
          <datablau-input
            v-model="keyword"
            :iconfont-state="true"
            :placeholder="$store.state.$v.common.placeholder"
            clearable
          ></datablau-input>
        </div>
        <div class="category-scroll-container tree-outer">
          <db-tree
            node-key="id"
            class="category-tree"
            :props="moveTreeDefaultProps"
            :data="treeData"
            :data-supervise="true"
            :data-icon-function="dataIconFunction"
            ref="modelCategoryTree"
            :default-expand-all="false"
            :default-expanded-keys="defaultkey"
            :filter-node-method="filterNode"
            :expand-on-click-node="true"
            @node-click="nodeClick"
            :showLockedMessage="false"
            v-if="$store.state.showModelCategorySelector"
          ></db-tree>
        </div>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="cancelChooseDialog">
          取消
        </datablau-button>
        <datablau-button
          type="primary"
          @click="handleChooseCategory"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import sort from '@/resource/utils/sort'
import HTTP from '@/resource/http'
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'

export default {
  name: 'ModelCategorySelector',
  data() {
    return {
      // showModeCategory: false,
      keyword: '',
      moveTreeDefaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      modelCategoryMap: new Map(),
      treeData: [],
      defaultkey: [1],
      // rootModelId: null,
      treeDataLoaded: false,
      categoryChoosePath: [],
      categoryMap: {}
    }
  },
  components: {
    dbTree
  },
  computed: {
    // showModeCategory() {
    //   return this.$store.state.showModelCategorySelector
    // }
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      // console.log('dataInit')
    },
    dataIconFunction(data, node) {
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
    filterNode(value, data, node) {
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
    nodeClick(data, node) {
      // console.log(node, 'node')
      // if (data.id === 1) {
      //   this.$datablauMessage({
      //     message: '不能选择根目录',
      //     type: 'error',
      //     showClose: true
      //   })
      //   return
      // }
      this.cateGoryData = data
      let path = []
      this.getPath(node, path)
      this.categoryChoosePath = path
    },
    getPath(node, path) {
      path.unshift(node.data)
      if (node.parent.data.parentId !== 0) {
        this.getPath(node.parent, path)
      } else {
        path.unshift(node.parent.data)
      }
    },
    // handleMoveCategory() {
    //   this.addModelForm.path = this.cateGoryData.name
    //   this.treePathKey++
    //   this.addModelForm.pathId = this.cateGoryData.id
    //   this.showModeCategory = false
    // },
    getModelsTree(callback) {
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
        // this.rootModelId = result.id
        sortModelLib(result)
        this.pushModels(result)
        this.treeData = [result]
        this.treeDataLoaded = true
        this.categoryMap = categoryMap
        setTimeout(() => {
          callback && callback()
        })
      }
      if (this.$store.state.modelsTree && false) {
        handler(this.$store.state.modelsTree)
      } else {
        if (this.$store.state.modelCategorySelectedParams.getModels) {
          HTTP.getModels({
            successCallback: handler
          })
        } else {
          HTTP.getDDMCategories(
            {
              successCallback: handler
            }
          )
        }
      }
    },
    pushModels(treeData) {
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
    cancelChooseDialog() {
      this.$store.state.showModelCategorySelector = false
    },
    handleChooseCategory() {
      // let path = this.$refs.modelCategoryTree.get this.cateGoryData
      let callback = this.$store.state.modelCategorySelectedParams.callback
      callback && callback(this.categoryChoosePath)
      this.$store.state.showModelCategorySelector = false
    }
  },
  watch: {
    '$store.state.showModelCategorySelector'(newVal) {
      this.keyword = ''
      if (newVal) {
        this.getModelsTree()
      }
    },
    keyword(val) {
      this.$refs.modelCategoryTree.filter(val)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
