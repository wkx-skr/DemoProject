<template>
  <div class="archy-up-tree-wrapper">
    <datablau-input
      style="display: block"
      v-model="keyword"
      :placeholder="$store.state.$v.common.placeholder"
      size="small"
      prefix-icon="el-icon-search"
      clearable
      :iconfont-state="true"
    ></datablau-input>
    <div class="tree-box">
      <db-tree
        class="grey-tree has-cnt"
        ref="categoryTree"
        :data="treeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        :default-expand-all="false"
        :default-expanded-keys="defaultKey"
        :expand-on-click-node="false"
        :highlight-current="true"
        node-key="id"
        :dataOptionsFunctionIsAsync="true"
        :data-icon-function="dataIconFunction"
        :label-formatter="treeLabelFormatter"
        :dataSupervise="true"
      ></db-tree>
    </div>
  </div>
</template>
<script>
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import string from '@/resource/utils/string'
import HTTP from '@/resource/http'

export default {
  name: 'leftTree',
  data () {
    return {
      categoryMap: {},
      treeData: [],
      defaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      defaultKey: null,
      keyword: '',
      currentCategory: null,
      currentNode: null,
      displayPath: [],
      chosenCategoryId: '',
      rootCategoryId: ''
    }
  },
  components: {
    dbTree
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit (para = {}, callback) {
      HTTP.getBusinessObjCategoryTree()
        .then(data => {
          this.treeData = data
          this.formatCategoryData(data)
          this.loading = false
          let root = data[0]?.id
          // root 肯定存在且不能被删除
          if (root) {
            this.rootCategoryId = root
            let currentItem = this.categoryMap[this.defaultKey]
            if (!this.defaultKey || !this.categoryMap[this.defaultKey]) {
              this.defaultKey = [root]
              currentItem = data
            } else {
              currentItem = [currentItem]
            }
            // this.$nextTick(() => {
            //   if (this.$route.query && this.$route.query.treeId) {
            //     this.$refs.categoryTree.setCurrentKey(Number(this.$route.query.treeId))
            //     let defaultNode = this.$refs.categoryTree.getNode(Number(this.$route.query.treeId))
            //     this.handleNodeClick(this.categoryMap[Number(this.$route.query.treeId)], defaultNode)
            //   } else {
            //     this.$refs.categoryTree.setCurrentKey(this.defaultKey[0])
            //     let defaultNode = this.$refs.categoryTree.getNode(this.defaultKey[0])
            //     this.handleNodeClick(currentItem[0], defaultNode)
            //   }
            // })
          }

          callback && callback() // 用于设置选中节点等
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    formatCategoryData (root) {
      let categoryMap = {}
      let handle = (node) => {
        categoryMap[node.id] = node
        let children = node.children || []
        children.forEach(child => {
          handle(child)
        })
      }
      handle(root[0])
      this.categoryMap = categoryMap
      this.$emit('setCategoryData', categoryMap)
    },
    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      let current = node
      if (string.matchKeyword(node.data, value, 'name', 'alias')) {
        hasValue = true
      }
      return hasValue
    },
    handleNodeClick (data, node) {
      this.defaultKey = [data.id]
      this.currentCategory = data
      this.currentNode = node

      // 左侧树的数据更新完成,开始更新右侧 table 数据
      this.$emit('chooseCategory', { data, node })
    },
    // 右键菜单
    async getModelCategoryOption (data, node) {
      // 获取当前目录 路径层级
      let result = []
      let current = node
      while (current.data && current.data.name) {
        result.push(current.data.name)
        current = current.parent
      }
      result = result.reverse()
      this.displayPath = result

      this.chosenCategoryId = data.id
      let chosenCategoryId = data.id
      let resultArr = []
      if (node.level === 1) {
        // 根目录只能增加子目录
        resultArr = [
          {
            label: '新建主题域分组',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.isCreateCategory = true
              this.themeCreate({ data, node })
            }
          }
        ]
      } else if (node.level === 2) {
        resultArr = [
          {
            label: '新建主题域',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.isCreateCategory = true
              this.themeCreate({ data, node })
              // this.categoryCreate({ data, node })
            }
          },
          {
            label: '编辑',
            icon: 'iconfont icon-revise',
            callback: () => {
              this.isCreateCategory = false
              this.categoryEdit({ data, node })
            }
          },
          {
            label: '删除',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.categoryDelete({ data, node })
            }
          }
        ]
      } else if (node.level === 3) {
        resultArr = [
          {
            label: '编辑',
            icon: 'iconfont icon-revise',
            callback: () => {
              this.isCreateCategory = false
              this.categoryEdit({ data, node })
            }
          },
          {
            label: '删除',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.categoryDelete({ data, node })
            }
          }
        ]
      }
      return resultArr
    },
    dataIconFunction (data, node) {
      if (node.level === 2) {
        return 'tree-icon business-area'
      } else if (node.level === 3) {
        return 'tree-icon theme-area'
      } else if (node.data.damModelCategoryId) {
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
    treeLabelFormatter (node) {
      let modelCount = 0
      const ForEach = (node) => {
        if (!node) return
        if (node.childNodes) {
          node.childNodes.forEach((item) => {
            ForEach(item)
          })
        }
      }
      ForEach(node)
      node.modelCount = modelCount
      let alias = node.data.alias && node.level !== 1 ? `(${node.data.alias})` : ''
      // ${node.data.damModelCategoryId ? '*' : ''}
      return `${node.label}${alias}`
    },
    themeCreate ({ data, node }) {
      this.$emit('themeCreate', { data, node })
    },
    categoryEdit ({ data, node }) {
      this.$emit('editTheme', { category: data, node })
    },
    categoryDelete ({ data, node }) {
      let id = data.id
      let type = '主题域分组'
      if (node.level === 3) {
        type = '主题域'
      }
      this.$DatablauCofirm(`确定删除${type}？`)
        .then(res => {
          this.loading = true
          // 判断目录没有子目录
          let category = this.categoryMap[id]
          if (category.children.length !== 0) {
            this.$datablauMessage.error('主题域分组有主题域内容不允许删除')
            return
          }
          // // 目录下如果有业务对象，不能删除 => 后台判断
          // HTTP.getBusinessObjList({ pageSize: 1, currentPage: 1, subjectId: id })
          //   .then(res => {
          //     if (res.numberOfElements !== 0) {
          //
          //     } else {
          //       return HTTP.deleteThemeDetail(id)
          //     }
          //   })
          HTTP.deleteThemeDetail(id)
            .then(res => {
              this.$blauShowSuccess(`${type}删除成功`)
              this.refreshData()
            })
            .catch(e => {
              this.loading = false
              console.error(e)
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.info('cancel')
        })
    },
    refreshData (para = {}, callback) {
      if (para.defaultKey) {
        this.defaultKey = para.defaultKey
      }
      this.dataInit(para, callback)
    }
  },
  watch: {
    keyword (value) {
      this.$refs.categoryTree.filter(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.archy-up-tree-wrapper {
  position:absolute;
  top:0px;
  bottom:0;
  left:0;
  right:0;
  padding: 8px;
  background: #fff;

  .tree-box {
    //border: 1px solid red;
    position: absolute;
    left: 0;
    right: 0;
    top: 44px;
    bottom: 0;
    overflow: auto;
  }
}
</style>
