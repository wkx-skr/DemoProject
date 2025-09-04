<template>
  <div class="add-entity-wrapper">
    <div class="left-panel">
      <datablau-input
        style="display: block"
        v-model="keyword"
        :placeholder="$store.state.$v.common.placeholder"
        size="small"
        prefix-icon="el-icon-search"
      ></datablau-input>
      <div class="tree-box">
        <datablau-tree
          :key="1"
          class="grey-tree"
          ref="modelTree"
          :data="treeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
          :default-expand-all="false"
          :default-expanded-keys="defaultkey"
          :expand-on-click-node="false"
          :highlight-current="true"
          node-key="id"
          :data-icon-function="dataIconFunction"
        ></datablau-tree>
      </div>
    </div>
    <div class="right-panel" v-loading="loading">
      <datablau-input
        style="display: block"
        v-model="keyword2"
        :placeholder="'搜索表'"
        size="small"
        prefix-icon="el-icon-search"
      ></datablau-input>
      <datablau-tree
        :key="treeKey"
        class="grey-tree"
        ref="detailTree"
        :data="models"
        :props="defaultPropsDetail"
        :load="loadNode"
        :default-expanded-keys="expandedKeys"
        lazy
        show-checkbox
        :expand-on-click-node="true"
        :highlight-current="true"
        node-key="id"
        :data-icon-function="dataIconFunctionDetail"
        @check="handleCheck"
        :emptyText="'暂无数据'"
      ></datablau-tree>
    </div>
    <div slot="footer" style="text-align: right">
      <datablau-button type="cancel" @click="cancelChecked"></datablau-button>
      <datablau-button  type="primary" @click="confirmChecked">
        确定
      </datablau-button>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import string from '@/resource/utils/string'

export default {
  data () {
    return {
      loading: false,
      defaultProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      defaultPropsDetail: {
        label: 'name',
        children: 'children',
        id: 'id',
        isLeaf: 'leaf'
      },
      defaultkey: [1],
      treeData: [],
      keyword: '',
      models: [],
      modelsBak: [],
      keyword2: '',
      modelTreeData: [],
      dirId: null,
      expandedKeys: [],
      treeKey: 0
    }
  },
  mounted () {
    this.getTreeData()
  },
  beforeDestroy () {

  },
  methods: {
    searchModels (query) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.loading = true
        this.$http.get(this.$url + `/models/searchTree?search=${query}&id=${this.dirId}`).then(res => {
          this.models = res.data
          this.expandedKeys = this.models.map(i => i.id)
          this.treeKey++
        }).catch(err => {
          this.$showFailure(err)
        }).finally(() => {
          this.loading = false
        })
      }, 500)
    },
    cancelChecked () {
      this.$emit('close')
    },
    confirmChecked () {
      this.$emit('checkedTreeData', this.modelTreeData)
      this.$emit('close')
    },
    async handleCheck (nodeData, { checkedNodes, halfCheckedNodes }) {
      let modelTreeData = []
      let treeMap = {}
      halfCheckedNodes.forEach(item => {
        let itemCopy = _.cloneDeep(item)
        delete itemCopy.children
        itemCopy.half = true
        treeMap[item.id] = itemCopy
        modelTreeData.push(itemCopy)
      })
      try {
        for (let i = 0; i < checkedNodes.length; i++) {
          let item = checkedNodes[i]
          treeMap[item.id] = item
          if (item.parentId) {
            let parentData = treeMap[item.parentId]
            if (!parentData.children) {
              parentData.children = []
            }
            item.leaf = false
            if (parentData.half) {
              parentData.children.push(item)
            }
          } else {
            item.half = false
            if (!this.keyword2 && !item.children) { // 全选但没有展开表，需获取表的数据
              let res = await this.$http(this.$url + `/models/${item.id}/direct/content/json`)
              let parentId = item.id
              let schemaList = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.Schema')
              let result = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.EntityComposite').map(item => {
                let mapItem = {
                  tableName: item.properties.Name,
                  name: item.properties.Name,
                  id: item.properties.Id,
                  schemaRef: item.properties.SchemaRef,
                  parentId: parentId,
                  leaf: false
                }
                if (item.properties.SchemaRef) {
                  let schema = schemaList.find(schema => schema.properties.Id === item.properties.SchemaRef)
                  mapItem.name = schema.properties.Name + '.' + item.properties.Name
                }
                return mapItem
              }) || []
              item.children = result
            }
            treeMap[item.id] = item
            modelTreeData.push(item)
          }
        }
        this.modelTreeData = modelTreeData
      } catch (e) {
        this.$showFailure(e)
      }
    },
    loadNode (node, resolve) {
      if (node.level === 0) {
        resolve(this.models)
      } else if (node.level === 1) { // 获取表数据
        if (node.data.children) {
          resolve(node.data.children)
        } else {
          this.$http(this.$url + `/models/${node.data.id}/direct/content/json`).then(res => {
            let schemaList = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.Schema')
            let result = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.EntityComposite').map(item => {
              let mapItem = {
                tableName: item.properties.Name,
                name: item.properties.Name,
                id: item.properties.Id,
                schemaRef: item.properties.SchemaRef,
                parentId: node.data.id,
                leaf: true
              }
              if (item.properties.SchemaRef) {
                let schema = schemaList.find(schema => schema.properties.Id === item.properties.SchemaRef)
                mapItem.name = schema.properties.Name + '.' + item.properties.Name
              }
              return mapItem
            }) || []
            resolve(result)
            node.data.children = result
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      }
      // else if (node.level === 2) { // 获取字段数据
      //   this.$http(this.$url + `/models/${node.parent.data.id}/elements/${node.data.id}/content/json`).then(res => {
      //     let result = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.EntityAttribute').map(item => ({
      //       name: item.properties.Name,
      //       id: item.properties.Id,
      //       leaf: true
      //     })) || []
      //     resolve(result)
      //   }).catch(err => {
      //     this.$showFailure(err)
      //   })
      // }
    },
    clearFilterData () {
      this.keyword2 = ''
    },
    getTableData (data) {
      // data 为当前目录下所有模型的数据
      // 重置过滤条件, 过滤全部数据
      this.clearFilterData()
      this.gatherAllModel(data)
    },
    gatherAllModel (data) {
      // this.wholeLoading = true
      const models = []
      const forEach = (node) => {
        if (!node) return
        if (node.models) {
          node.models.forEach((item) => {
            models.push(item)
          })
        }
        if (
          node.children &&
          (!this.showCurrentCat || !this.currentCategory.parentId)
        ) {
          node.children.forEach((item) => {
            forEach(item)
          })
        }
      }

      forEach(data)
      // this.models = models.filter(item => item.dwModel).map(item => ({
      //   ...item,
      //   leaf: false
      // }))
      this.models = models.map(item => ({
        ...item,
        leaf: false
      }))
      this.modelsBak = _.cloneDeep(this.models)
    },
    handleNodeClick (data, node) {
      this.dirId = data.id
      // 左侧树的数据更新完成,开始更新右侧 table 数据
      this.getTableData(data)
    },
    dataIconFunctionDetail (data, node) {
      if (node.level === 1) {
        if (node.data.dwModel) {
          return 'tree-icon warehouse'
        } else {
          return 'tree-icon model'
        }
      } else if (node.level === 2) {
        return 'tree-icon table'
      } else if (node.level === 3) {
        return 'tree-icon column'
      } else {
        return ''
      }
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
    getTreeData () {
      HTTP.getModels()
        .then(result => {
          this.treeData = [result]
          this.$nextTick(() => {
            let lastCategoryId = result.id
            let node =
              this.$refs.modelTree.getNode(lastCategoryId) || {}
            this.defaultkey = [lastCategoryId]
            this.$refs.modelTree.setCurrentKey(lastCategoryId)
            this.handleNodeClick(node.data, node)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  watch: {
    keyword (value) {
      this.$refs.modelTree.filter(value)
    },
    keyword2 (val) {
      if (val) {
        this.searchModels(val)
      } else {
        this.models = _.cloneDeep(this.modelsBak)
        this.expandedKeys = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.grey-tree {
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 20px;
  overflow: auto;
  /deep/ .el-checkbox {
    top: 0!important;
  }
}
.add-entity-wrapper /deep/ .tree-icon {
  width: 24px!important;
  height: 24px;
}
.add-entity-wrapper {
  position: absolute;
  top: 8px;
  left: 20px;
  right: 20px;
  bottom: 0;
  .left-panel {
    display: inline-block;
    padding: 8px 10px;
    border: 1px solid #ddd;
    width: 200px;
    vertical-align: top;
    height: 400px;
    overflow: auto;
    position: relative;
  }
  .right-panel {
    display: inline-block;
    padding: 8px 10px;
    border: 1px solid #ddd;
    width: 632px;
    border-left: none;
    height: 400px;
    overflow: auto;
    position: relative;
  }
}
</style>
