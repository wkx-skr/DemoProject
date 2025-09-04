<template>
  <div
    class="classify-page"
    :class="{ 'classify-spe-page': coordinate, 'has-all-classify': hasAll }"
  >
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
        :placeholder="$t('securityModule.search')"
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
          :label="item.catalogPathName"
          :value="item.id"
        ></el-option>
      </datablau-select>
    </div>
    <div
      class="all-catalog"
      :class="{ active: !curNodeData.id }"
      v-if="hasAll"
      @click="handleAllTree"
    >
      <i class="iconfont icon-file"></i>
      {{ $t('coordination.allDataClass') }}
    </div>
    <div class="tree-inner-box" :id="isDia ? 'tree-box' : ''">
      <datablau-easy-tree
        @check-change="checkChange"
        :show-checkbox="showCheckbox"
        :checkStrictly="checkStrictly"
        :use-default-sort="false"
        lazy
        :load="loadCallback"
        ref="tree"
        :default-expand-all="false"
        show-overflow-tooltip
        auto-expand-parent
        v-loading="treeLoading"
        @node-click="queryCatalog"
        node-key="id"
        :isAdd="isAdd"
        :addAssetsCilick="addAssetsCilick"
        :expand-on-click-node="false"
        :props="defaultProps"
        :data-img-function="dataIconFunction"
        :data="treeData"
        :filter-node-method="filterNode"
        :empty-text="
          !treeLoading && allTreeList.length === 0
            ? $t('securityModule.noCatalogInfo')
            : ''
        "
        :itemSize="34"
        :selectedUncombList="selectedUncombList"
      ></datablau-easy-tree>
      <!-- :filter-node-method="filterNode" -->
    </div>
  </div>
</template>

<script>
import API from '@/view/dataAsset/utils/s_api'
import folder from '../../../../assets/images/search/folder.svg'

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
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    checkStrictly: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: '',
    },
    hasCheckList: {
      type: Array,
      default() {
        return []
      },
    },
    // 协同分类分级，待梳理
    isAdd: {
      type: Boolean,
      defalt: false,
    },
    // 协同分类分级，已选择的待梳理的数据
    selectedUncombList: {
      type: Array,
      default() {
        return []
      },
    },
    // 协同分类分级，待确认，已发布有全部数据分类
    hasAll: {
      type: Boolean,
      defalt: false,
    },
    // 是否为弹窗里面的
    isDia: {
      type: Boolean,
      defalt: false,
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
    checkChange() {
      const newList = this.$refs.tree.getCheckedNodes()
      const options = {
        data: newList,
        type: 'num',
      }
      this.clickChild('classifyTree', options)
    },
    queryCatalog(data) {
      this.curNodeData = data
      this.clickChild('classifyTree', { data })
    },
    handleAllTree() {
      this.curNodeData = {}
      this.$refs.tree.setCurrentKey(null)
      this.clickChild('classifyTree', null)
    },
    addAssetsCilick(data) {
      // 添加到待确认
      this.clickChild('addUnConfirmed', { data })
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
        this.getTree(node.data.id, resolve, node.data.catalogNamePath)
      }
    },
    dataIconFunction(data, node) {
      return data.icon
        ? '/assets/config/icon/' +
            data.icon
        : folder
    },
    getCatalogName(key) {
      if (key) {
        this.showClose = true
        API.classifySearch(key)
          .then(res => {
            res.data.map(item => {
              item.catalogPathName = item.catalogPathName + item.name
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
          // item.catalogNamePath = nameList.slice(0, i + 1).join('/')
          item.catalogNamePath = nameList.join('/')
          item.icon = newList[0].icon
          if (this.showCheckbox) {
            // 新建识别规则时，展示数据分类目录
            const typeList = item.assetsType.split(',')
            switch (this.type) {
              case 'TABLE_VIEW':
                if (typeList.includes('TABLE') || typeList.includes('VIEW')) {
                  if (
                    this.hasCheckList.includes(item.id) ||
                    this.hasCheckList
                      .map(v => parseFloat(v.id))
                      .includes(item.id)
                  ) {
                    item.disabled = true
                    item.tip = ''
                  } else {
                    if (item.canAddAsset) {
                      item.disabled = false
                      item.tip = ''
                    } else {
                      item.disabled = true
                      item.tip = this.$t('intelligence.classifyTip')
                    }
                  }
                } else {
                  item.disabled = true
                  item.tip = this.$t('intelligence.classifyTip1')
                }
                break
              case 'COLUMN':
                if (typeList.includes('DATA_OBJECT')) {
                  if (this.hasCheckList.includes(item.id)) {
                    item.disabled = true
                    item.tip = ''
                  } else {
                    if (item.canAddAsset) {
                      item.disabled = false
                      item.tip = ''
                    } else {
                      item.disabled = true
                      item.tip = this.$t('intelligence.classifyTip')
                    }
                  }
                } else {
                  item.disabled = true
                  item.tip = this.$t('intelligence.classifyTip2')
                }
                break
              default:
                break
            }
          }
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
      this.clickChild('detailVos', { typeList: this.structureVos })
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
          if (this.showCheckbox) {
            // 新建识别规则时，展示数据分类目录
            const typeList = item.assetsType.split(',')
            switch (this.type) {
              case 'TABLE_VIEW':
                if (typeList.includes('TABLE') || typeList.includes('VIEW')) {
                  if (
                    this.hasCheckList.includes(item.id) ||
                    this.hasCheckList
                      .map(v => parseFloat(v.id))
                      .includes(item.id)
                  ) {
                    item.disabled = true
                    item.tip = ''
                  } else {
                    if (item.canAddAsset) {
                      item.disabled = false
                      item.tip = ''
                    } else {
                      item.disabled = true
                      item.tip = this.$t('intelligence.classifyTip')
                    }
                  }
                } else {
                  item.disabled = true
                  item.tip = this.$t('intelligence.classifyTip1')
                }
                break
              case 'COLUMN':
                if (typeList.includes('DATA_OBJECT')) {
                  if (this.hasCheckList.includes(item.id)) {
                    item.disabled = true
                    item.tip = ''
                  } else {
                    if (item.canAddAsset) {
                      item.disabled = false
                      item.tip = ''
                    } else {
                      item.disabled = true
                      item.tip = this.$t('intelligence.classifyTip')
                    }
                  }
                } else {
                  item.disabled = true
                  item.tip = this.$t('intelligence.classifyTip2')
                }
                break
              default:
                break
            }
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
            if (this.hasAll) {
              // 当有全部数据分类时，默认为全部数据分类
              this.handleAllTree()
            } else {
              this.curNodeData = treeList[0]
              if (this.isNeed) {
                this.clickChild('classifyTree', { data: this.curNodeData })
                this.$refs.tree.setCurrentKey(this.curNodeData.id)
              }
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
.has-all-classify {
  .tree-inner-box {
    top: 78px;
  }
}

.tree-inner-box {
  position: absolute;
  top: 46px;
  bottom: 0;
  left: 10px;
  right: 10px;
  overflow-y: auto;
  /deep/ .el-loading-mask {
    top: 42px;
  }
}

.all-catalog {
  margin: 0 10px;
  margin-top: 4px;
  height: 32px;
  line-height: 32px;
  padding: 0 4px;
  padding-bottom: 4px;
  position: relative;
  cursor: pointer;
  &.active {
    background: transparentize($color: #409eff, $amount: 0.9);
    i {
      color: #409eff;
    }
  }
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 1px;
    background: #dddddd;
  }
  i {
    margin-left: 8px;
  }
}
.tree-search-box {
  position: relative;
  height: 32px;
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
