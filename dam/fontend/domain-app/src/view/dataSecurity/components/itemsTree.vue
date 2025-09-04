<template>
  <div class="classify-page" :class="{ 'rule-classify-page': isRule }">
    <div class="tree-box">
      <datablau-tree-header>
        <template slot="search">
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
            v-model="catalogueKey"
            remote
            reserve-keyword
            placeholder="搜索"
            :remote-method="getCatalogName"
            @focus="focusSelect"
            @clear="clear"
            @change="selectCatalogName(catalogueKey)"
            @visible-change="visibleChange"
            :isIcon="'icon-search'"
          >
            <el-option
              v-for="item in nameList"
              :key="item.id"
              :label="item.catalogPathName"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </template>
      </datablau-tree-header>
      <template v-if="isRule">
        <div
          class="tree-title"
          :class="{ 'tree-title-active': !sensitiveId }"
          @click="handleAllTree"
        >
          <i class="iconfont icon-file"></i>
          <span>全部目录</span>
        </div>
        <div class="tree-line"></div>
      </template>
      <div class="tree-content">
        <datablau-tree
          lazy
          :load="loadCallback"
          class="grey-tree data-asset-tree"
          ref="tree"
          :default-expand-all="false"
          show-overflow-tooltip
          auto-expand-parent
          v-loading="treeLoading"
          @node-click="queryCatalog"
          node-key="id"
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          :props="defaultProps"
          :data-icon-function="dataIconFunction"
          :data="treeData"
        ></datablau-tree>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
export default {
  props: {
    clickChild: {
      type: Function,
    },
    isRule: {
      // 是否从智能分类分级-机器学习规则过来的
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
      catalogueKey: '',
      treeLoading: false,
      treeData: [],
      sensitiveId: '',
      defaultProps: {
        children: 'nodes',
        label: 'name',
        isLeaf: 'leaf',
      },
    }
  },
  mounted() {},
  methods: {
    handleAllTree() {
      this.$refs.tree.$refs.tree.setCurrentKey(null)
      this.sensitiveId = ''
      const options = {
        data: null,
      }
      this.clickChild('itemsTree', options)
    },
    queryCatalog(data = null) {
      if (data) {
        this.sensitiveId = data.catalogTypeId
      } else {
        this.sensitiveId = ''
      }
      this.clickChild('itemsTree', { data })
    },
    focusSelect() {
      if (!this.catalogueKey && !this.showClose) {
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
      this.queryCatalog()
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
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    getCatalogName(key) {
      if (key) {
        this.showClose = true
        API.searchItemCatalog(key)
          .then(res => {
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
        this.$refs.tree.$refs.tree.$data.store.lazy = false
        const itemMap = this.nameList.filter(
          item => item.id === parseFloat(keyId)
        )[0]
        const idList = itemMap.catalogPath.split('/').filter(m => m !== '')
        await this.getTreeList(idList)
        this.$refs.tree.$refs.tree.setCurrentKey(keyId)
        this.queryCatalog(itemMap)
      } else {
        this.$refs.tree.$refs.tree.$data.store.lazy = true
        this.getTree(0, this.resolve)
      }
    },
    async getTreeList(idList) {
      this.treeLoading = true
      for (let i = 0; i < idList.length; i++) {
        const { data } = await API.getItemCatalog(idList[i])
        data.catalogVos.map(async item => {
          this.allTreeList.push(item)
        })
      }
      this.treeData = this.getTreeStructure(this.allTreeList)
      const itemMap = this.allTreeList.find(
        item => item.id === parseFloat(this.catalogueKey)
      )
      setTimeout(() => {
        this.$refs.tree.expandTopLevel()
        this.$refs.tree.filter(itemMap.name)
        // this.$refs.tree.setCurrentKey(itemMap.id)
        this.treeLoading = false
      }, 100)
    },
    getTreeStructure(treeList) {
      let newArray = []
      treeList.map(item => {
        if (item.parentId === 0) {
          newArray.push(item)
        }
      })
      arrToTree(treeList, newArray)
      function arrToTree(list, arr) {
        arr.forEach(res => {
          list.forEach((ret, index) => {
            if (res.id === ret.parentId) {
              if (!res.hasOwnProperty('nodes')) {
                res.nodes = []
              }
              res.nodes.push(ret)
            }
          })
          if (res.hasOwnProperty('nodes')) {
            arrToTree(list, res.nodes)
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

    getTree(id, resolve, isLazy = true) {
      API.getItemCatalog(id)
        .then(res => {
          const treeList = res.data.catalogVos || []
          if (id === 0 && treeList.length > 0) {
            this.treeData = treeList
            this.$nextTick(() => {
              // this.$refs.tree.setCurrentKey(treeList[0].id)
            })
          }
          this.treeLoading = false
          if (isLazy) {
            this.$utils.sort.sortConsiderChineseNumber(treeList, 'name')
            return resolve(treeList)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.classify-page {
  &.rule-classify-page {
    /deep/ .tree-search-box {
      .filter-input {
        left: 10px;
        right: 10px;
      }
    }
    .tree-box {
      left: 0;
      right: 0;
      .tree-content {
        top: 90px;
        /deep/ .el-loading-mask {
          top: 30px;
        }
      }
    }
  }
  .tree-box {
    position: absolute;
    top: 10px;
    bottom: 0;
    left: 20px;
    right: 20px;
    .tree-title {
      height: 32px;
      line-height: 32px;
      padding: 0 10px;
      margin-top: 8px;
      box-sizing: content-box;
      cursor: pointer;
      &:hover {
        background: rgba(64, 158, 255, 0.1);
        span {
          color: #409eff;
        }
      }
      &.tree-title-active {
        background: rgba(64, 158, 255, 0.1);
        span {
          color: #409eff;
        }
      }
      i {
        color: #409eff;
      }
      span {
        margin-left: 5px;
      }
    }
    .tree-line {
      height: 1px;
      margin: 8px 0;
      background: #efefef;
    }
    .tree-content {
      position: absolute;
      top: 32px;
      bottom: 10px;
      left: 0;
      right: 0;
      overflow: hidden;
      /deep/ .el-tree {
        position: absolute !important;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: auto;
        .el-loading-mask {
          top: 30px;
        }
      }
    }
  }
  /deep/ .tree-search-box {
    position: relative;
    &:hover {
      .show-cursor-close {
        opacity: 1;
        animation: opacity 0.3s;
      }
    }
    .filter-input {
      left: 0;
      right: 0;
    }
    .cursor-close {
      width: 25px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      position: absolute;
      right: 5px;
      font-size: 14px;
      z-index: 9;
      color: #409eff;
      cursor: pointer;
      opacity: 0;
      animation: opacity 0.3s;
    }
  }
}
</style>
