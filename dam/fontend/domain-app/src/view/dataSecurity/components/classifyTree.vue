<template>
  <div class="classify-page" :class="{ 'classify-spe-page': coordinate }">
    <div class="tree-search-box">
      <!-- <i
        v-show="showClose"
        class="el-icon-circle-close cursor-close"
        :class="{ 'show-cursor-close': showClose }"
        @click="clear"
      ></i> -->
      <datablau-select
        ref="loadSelect"
        filterable
        clearable
        class="filter-input"
        v-model="treeKey"
        remote
        reserve-keyword
        placeholder="搜索"
        :remote-method="getCatalogName"
        @focus="focusSelect"
        @clear="clear"
        @change="selectCatalogName(treeKey)"
        @visible-change="visibleChange"
        :isIcon="'icon-search'"
      >
        <el-option
          v-for="item in nameList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        ></el-option>
      </datablau-select>
    </div>
    <div class="tree-inner-box">
      <datablau-easy-tree
        lazy
        :load="loadCallback"
        ref="tree"
        :default-expand-all="false"
        show-overflow-tooltip
        auto-expand-parent
        v-loading="treeLoading"
        @node-click="queryCatalog"
        node-key="id"
        :expand-on-click-node="false"
        :props="defaultProps"
        :data-img-function="dataIconFunction"
        :data="treeData"
        :filter-node-method="filterNode"
        :empty-text="
          !treeLoading && allTreeList.length === 0 ? '暂无目录信息' : ''
        "
        :itemSize="34"
        height="100%"
        style="height: 100%"
      ></datablau-easy-tree>
      <!-- :filter-node-method="filterNode" -->
    </div>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
import folder from '../../../assets/images/search/folder.svg'
export default {
  props: {
    clickChild: {
      type: Function,
    },
    coordinate: {
      type: Boolean,
      default: false,
    },
    // 必选默认一个目录
    isNeed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resolve: null,
      allTreeList: [],
      nameList: [],
      showClose: false,
      treeKey: '',
      treeLoading: false,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf',
      },
      curNodeData: {},
    }
  },
  mounted() {},
  methods: {
    queryCatalog(data) {
      this.curNodeData = data
      this.clickChild('classifyTree', { data })
    },
    focusSelect() {
      if (!this.treeKey && !this.showClose) {
        this.nameList = []
      }
    },
    visibleChange(val) {
      if (!val) {
        this.showClose = false
      }
    },
    clear() {
      this.showClose = false
      this.$refs.loadSelect.blur()
      if (this.isNeed) {
        this.clickChild('classifyTree', { data: this.curNodeData })
      } else {
        this.clickChild('classifyTree', null)
      }
    },

    async loadCallback(node, resolve) {
      this.resolve = resolve
      if (node.level === 0) {
        this.treeLoading = true
        this.getTree(0, resolve)
      } else {
        this.getTree(node.data.id, resolve)
      }
    },
    dataIconFunction(data, node) {
      return data.icon
        ? window.setting.restApiPathName +
            '/service/ddc/config/icon/' +
            data.icon
        : folder
    },
    getCatalogName(key) {
      if (key) {
        this.showClose = true
        API.classifySearch(key)
          .then(res => {
            res.data.map(item => {
              item.name = item.catalogPathName + item.name
            })
            this.nameList = res.data || []
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.nameList = []
      }
    },
    async selectCatalogName(keyId) {
      if (keyId) {
        this.showClose = false
        this.allTreeList = []
        this.$refs.tree.$data.store.lazy = false
        let itemMap = this.nameList.filter(
          item => item.id === parseFloat(keyId)
        )[0]
        itemMap.assetsType = this.structureVos
          .filter(m => m.level === itemMap.level)[0]
          .assetsTypes.join(',')
        const nameList = itemMap.name.split('/')
        let idList = itemMap.catalogPath.split('/').filter(item => item !== '')
        await this.getTreeList(idList, nameList)
        this.$refs.tree.setCurrentKey(keyId)
        this.curNodeData = itemMap
        this.clickChild('classifyTree', { data: itemMap })
      } else {
        this.$refs.tree.$data.store.lazy = true
        this.treeLoading = true
        this.getTree(0, this.resolve)
      }
    },
    async getTreeList(idList, nameList) {
      this.treeLoading = true
      for (let i = 0; i < idList.length; i++) {
        const { data } = await API.getClassifyTree(idList[i])
        let treeList = data.DataSecurityStructureVo.catalogVos || []
        treeList.map(async item => {
          const newList = this.structureVos.filter(
            o => o.level === item.level && o.structureId === item.structureId
          )
          item.catalogNamePath = nameList.slice(0, i + 1).join('/')
          item.icon = newList[0].icon
          this.allTreeList.push(item)
        })
      }
      this.treeData = this.getTreeStructure(this.allTreeList, this.structureVos)
      const itemList = this.allTreeList.filter(
        item => item.id === parseFloat(this.treeKey)
      )
      setTimeout(() => {
        this.$refs.tree.expandTopLevel()
        this.$refs.tree.filter(itemList[0].name)
        this.treeLoading = false
      }, 100)
    },
    getTreeStructure(treeList, attrList) {
      let newArray = []
      treeList.map(item => {
        const newList = attrList.filter(
          o => o.level === item.level && o.structureId === item.structureId
        )
        item.icon = newList[0].icon
        if (item.parentId === 0) {
          newArray.push(item)
        }
      })
      arrToTree(treeList, newArray)
      function arrToTree(list, arr) {
        arr.forEach(res => {
          list.forEach((ret, index) => {
            if (res.id === ret.parentId) {
              if (!res.hasOwnProperty('children')) {
                res.children = []
              }
              res.children.push(ret)
            }
          })
          if (res.hasOwnProperty('children')) {
            arrToTree(list, res.children)
          }
        })
      }
      this.treeData = newArray
      return newArray
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    async getTree(id, resolve, name, isLazy = true) {
      const { data } = await API.getClassifyTree(id)
      this.structureVos = data.DataSecurityStructureVo.detailVos
      this.statuteList = data.DataSecurityRegulation
      let treeList
      if (id === 0) {
        this.allTreeList = []
      }
      treeList = data.DataSecurityStructureVo.catalogVos || []
      if (treeList.length > 0) {
        treeList.map(async item => {
          const newList = this.structureVos.filter(o => o.level === item.level)
          if (name) {
            item.catalogNamePath = `${name}/${item.name}`
          } else {
            item.catalogNamePath = item.name
          }
          item.icon = newList[0].icon
          const result = this.allTreeList.some(o => o.id === item.id)
          if (result) {
            const index = this.allTreeList.findIndex(o => o.id === item.id)
            this.allTreeList.splice(index, 1, item)
          } else {
            this.allTreeList.push(item)
          }
        })
      }
      this.treeLoading = false
      if (id === 0) {
        this.treeData = treeList
      }
      if (isLazy) {
        this.$nextTick(() => {
          if (!this.curNodeData.id) {
            this.curNodeData = treeList[0]
          }
          if (this.isNeed && id === 0) {
            if (treeList.length > 0) {
              this.curNodeData = treeList[0]
              this.$refs.tree.setCurrentKey(this.curNodeData.id)
              this.clickChild('classifyTree', { data: this.curNodeData })
            } else {
              this.curNodeData = {}
              this.clickChild('classifyTree', null)
            }
          }
        })
        this.$utils.sort.sortConsiderChineseNumber(treeList, 'name')
        return resolve(treeList)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.classify-spe-page {
  // position: absolute;
  /deep/ .tree-search-box {
    .datablau-select {
      position: absolute;
      top: 0px;
      left: 10px;
      right: 10px;
    }
  }
}

.tree-inner-box {
  position: absolute;
  top: 42px;
  bottom: 0;
  left: 20px;
  right: 20px;
  overflow-y: auto;
  /deep/ .el-loading-mask {
    top: 42px;
  }
}
.tree-search-box {
  position: relative;
  &:hover {
    .show-cursor-close {
      opacity: 1;
      animation: opacity 0.3s;
    }
  }
  .cursor-close {
    width: 25px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    position: absolute;
    right: 15px;
    font-size: 14px;
    z-index: 9;
    color: #409eff;
    cursor: pointer;
    opacity: 0;
    animation: opacity 0.3s;
  }
}
</style>
