<template>
  <datablau-dialog
    :table="dialogType === 'item' ? true : false"
    custom-class="security-catalog-tree-page"
    :width="dialogType === 'item' ? '1100px' : '800px'"
    :height="dialogType === 'item' ? 560 : 420"
    :title="
      dialogType === 'item'
        ? $t('intelligence.addInfoItem')
        : $t('intelligence.addSecClass')
    "
    :before-close="cancelDialog"
    :visible.sync="show"
    v-if="show"
    :close-on-click-modal="false"
  >
    <template v-if="dialogType === 'security'">
      <div class="content-box">
        <div class="tree-box">
          <datablau-select
            filterable
            clearable
            class="filter-input"
            v-model="catalogueKey"
            remote
            reserve-keyword
            :placeholder="$t('securityModule.searchName')"
            :remote-method="getCatalogName"
            @focus="focusSelect"
            @change="selectCatalogName(catalogueKey)"
            :isIcon="'icon-search'"
          >
            <el-option
              v-for="item in nameList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
          <datablau-easy-tree
            class="catalog-tree-box"
            :showCheckbox="true"
            :checkStrictly="true"
            v-loading="treeLoading"
            lazy
            :load="loadCallback"
            ref="tree"
            :default-expand-all="false"
            auto-expand-parent
            @node-click="handleNodeClick"
            @check="beforeChange"
            @node-expand="nodeExpand"
            node-key="id"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            :props="defaultProps"
            :data-img-function="dataIconFunction"
            :data="treeData"
          ></datablau-easy-tree>
        </div>
        <div class="select-box" ref="selectBox">
          <span>
            {{
              selectData.length > 0
                ? $t('intelligence.selectClassifyNum', {
                    num: selectData.length,
                  })
                : $t('intelligence.notSelect')
            }}
          </span>
          <div style="margin-top: 5px">
            <el-tag
              v-for="tag in selectData"
              :key="tag.id"
              @close="closeTag(tag)"
              closable
            >
              {{ tag.name }}
            </el-tag>
          </div>
        </div>
      </div>
    </template>
    <template v-if="dialogType === 'item'">
      <div class="item-tree-box">
        <items-tree :clickChild="clickItemTree" :isRule="true"></items-tree>
      </div>
      <div class="item-table">
        <div class="select-box" ref="selectBox" v-if="selectData.length > 0">
          {{ $t('intelligence.hasSelectClassify') }}
          <el-tag
            style="margin-right: 4px; margin-bottom: 8px"
            v-for="tag in selectData"
            :key="tag.itemId"
            @close="closeTag(tag)"
            closable
          >
            {{ tag.name }}
          </el-tag>
        </div>
        <div :style="{ height: 440 - searchBoxH + 'px' }">
          <datablau-table
            v-loading="tableLoading"
            :data-selectable="false"
            :show-column-selection="false"
            height="100%"
            :default-sort="{
              children: 'nodes',
              label: 'name',
              isLeaf: 'leaf',
            }"
            ref="itemTable"
            row-key="itemId"
            @selection-change="handleItemSelectChange"
            @sort-change="sortChange"
            :data="tableData"
            :reserve-selection="true"
          >
            <el-table-column
              type="selection"
              width="20"
              reserve-selection
            ></el-table-column>
            <el-table-column width="30px">
              <datablau-icon
                style="margin-top: 5px"
                data-type="infoitems"
                :isIcon="true"
                :size="18"
              ></datablau-icon>
            </el-table-column>
            <el-table-column
              min-width="120px"
              :label="$t('intelligence.infoItemName')"
              prop="name"
              sortable="name"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              min-width="110px"
              sortable="stdCode"
              :label="$t('intelligence.infoItemCode')"
              prop="stdCode"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              min-width="120px"
              :label="$t('securityModule.enName')"
              prop="englishName"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              min-width="120px"
              :label="$t('securityModule.businessDefinition')"
              prop="businessDepartment"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              min-width="120px"
              :label="$t('securityModule.creator')"
              prop="creator"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('securityModule.creationTime')"
              width="140"
              column-key="last"
              prop="createTime"
              sortable="createTime"
              show-overflow-tooltip
            ></el-table-column>
          </datablau-table>
        </div>
      </div>
    </template>
    <div slot="footer">
      <datablau-pagination
        style="float: left"
        v-if="dialogType === 'item'"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :current-page.sync="itemPagination.currentPage"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="itemPagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="itemPagination.total"
        class="page"
      ></datablau-pagination>
      <div>
        <datablau-button type="secondary" @click="cancelDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          :disabled="!canSure"
          type="important"
          @click="sureCatalog"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
import itemsTree from '@/view/dataSecurity/components/itemsTree.vue'
import folder from '../../../../../assets/images/search/folder.svg'
export default {
  components: {
    itemsTree,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    clickChild: {
      type: Function,
    },
    targetData: {
      type: Array,
      default() {
        return []
      },
    },
    dialogType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      searchBoxH: 0,
      canSure: false,
      catalogueKey: '',
      nameList: [],
      structureVos: [],
      treeLoading: false,
      tableLoading: false,
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf',
      },
      treeData: [],
      selectData: [], // 当前所有已选择的数据分类目录（只有父目录，不包含子目录）
      realIds: [], // 真正选中的安全目录id集合
      selectBox: 10,
      isResolve: false, // 懒加载是否完成
      allTrees: [],
      expandId: 0, // 树节点展开时的当前id
      allTreeList: [], // 每次检索出的所有目录
      searchTreeList: [], // 多次检索出的目录（去重）
      tableData: [],
      itemPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      itemSearchFormData: {
        itemName: '',
        orderBy: '',
        seq: '',
      },
      currentItemCatalog: {},
      rowSelectFlag: false,
      total: 0,
    }
  },
  mounted() {
    this.$nextTick(() => {
      // 初始化数据分类目录
      if (this.dialogType !== 'item') {
        this.realIds = this.targetData.map(item => item.id)
        this.setCheckedTree()
        this.getNowData(this.realIds)
      } else {
        this.realIds = this.targetData.map(item => item.id)
        this.selectData = this.targetData.map(item => ({
          ...item,
          itemId: item.id,
        }))
        this.getCanSure()
        this.getItemTableData()
      }
    })
    window.onresize = () => {
      this.getBoxH()
    }
  },
  methods: {
    // 数组去重
    removalDuplicate(dataList, byName) {
      let result = []
      let tem = {}
      dataList.map(item => {
        if (!tem[item[byName]]) {
          result.push(item)
          tem[item[byName]] = 1
        }
      })
      return result
    },
    setCheckedTree() {
      this.$refs.tree.setCheckedKeys(this.realIds)
    },
    nodeExpand(data, node) {
      this.allTrees.map(async item => {
        if (item.id === data.id) {
          // 树是否已经展开过
          if (item.isExpand) {
            this.expandId = 0
            // 如果是懒加载，需要页面加载完成后，再执行后续操作（监听）
            this.isResolve = true
          } else {
            this.expandId = data.id
            item.isExpand = true
          }
        }
      })
    },
    getBoxH() {
      this.$nextTick(() => {
        if (this.selectData.length > 0) {
          this.selectBox = $(this.$refs.selectBox).height() + 20
        } else {
          this.selectBox = 10
        }
      })
    },
    closeTag(data) {
      if (this.dialogType === 'item') {
        this.realIds = this.realIds.filter(item => item !== data.itemId)
        this.selectData = this.selectData.filter(
          item => item.itemId !== data.itemId
        )
        this.toggleTableSelection()
        this.getCanSure()
      } else {
        this.realIds = this.realIds.filter(item => item !== data.id)
        this.getNowData(this.realIds)
      }
    },
    cancelDialog() {
      this.clickChild('catalogTree', {
        type: 'close',
      })
    },
    sureCatalog() {
      if (this.dialogType === 'item') {
        // 信息项的itemId转成id，统一管理
        this.selectData.map(item => (item.id = item.itemId))
      }
      this.clickChild('catalogTree', {
        type: 'sure',
        data: {
          catalogIds: this.realIds.join(','),
          targetData: this.selectData,
        },
      })
    },
    dataIconFunction(data, node) {
      return data.icon
        ? window.setting.iconApiPathName +
            '/datasecurity/datasecurity/structure/icon/' +
            data.icon
        : folder
    },
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.nodeName)
      return false
    },
    focusSelect() {
      if (!this.catalogueKey) {
        this.nameList = []
      }
    },
    getCatalogName(key) {
      if (key) {
        const searchRes =
          this.dialogType === 'item'
            ? API.searchItemCatalog
            : API.classifySearch
        searchRes(key)
          .then(res => {
            res.data.map(item => {
              item.name = item.catalogPathName + item.name
            })
            this.nameList = res.data || []
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    async selectCatalogName(keyId) {
      if (keyId) {
        this.allTreeList = []
        this.$refs.tree.$data.store.lazy = false
        const itemMap = this.nameList.filter(
          item => item.id === parseFloat(keyId)
        )[0]
        const nameList = itemMap.name.split('/')
        const idList = itemMap.catalogPath
          .split('/')
          .filter(item => item !== '')
        await this.getTreeList(idList, nameList)
      } else {
        this.$refs.tree.$data.store.lazy = true
        this.getTree(0, this.resolve)
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
    // 父节点选中状态，去除子节点的选中状态（非懒加载）
    handleData(data) {
      const that = this
      function delId(newList) {
        newList.map(item => {
          that.realIds = that.realIds.filter(m => m !== item.id)
          item.children &&
            item.children.map(o => {
              if (item.children) {
                delId(item.children)
              }
            })
        })
      }
      function arrMap(data) {
        data.map(item => {
          if (that.realIds.includes(item.id)) {
            if (item.children) {
              delId(item.children)
            }
          } else {
            if (item.children) {
              arrMap(item.children)
            }
          }
        })
      }
      arrMap(data)
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
          item.icon = newList[0].icon
          this.allTreeList.push(item)
        })
        this.searchTreeList = this.searchTreeList.concat(this.allTreeList)
      }
      this.treeData = this.getTreeStructure(this.allTreeList, this.structureVos)
      await this.handleData(this.treeData)
      const itemList = this.allTreeList.filter(
        item => item.id === parseFloat(this.catalogueKey)
      )
      setTimeout(async () => {
        this.$refs.tree.expandTopLevel()
        this.$refs.tree.filter(itemList[0].name)
        this.treeLoading = false
        this.setChildren(this.realIds)
        this.getNowData(this.realIds)
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
    async getTree(id, resolve, isLazy = true) {
      this.isResolve = false
      const treeRes =
        this.dialogType === 'item' ? API.getItemCatalog : API.getClassifyTree
      const { data } = await treeRes(id)
      this.structureVos =
        data.detailVos || data.DataSecurityStructureVo.detailVos
      let treeList = data.DataSecurityStructureVo.catalogVos || []
      if (treeList.length > 0) {
        treeList.map(async item => {
          const newList = this.structureVos.filter(
            o => o.level === item.level && o.structureId === item.structureId
          )
          item.icon = newList[0].icon
        })
      }
      if (id === 0) {
        this.treeData = treeList
      }
      this.treeLoading = false
      if (isLazy) {
        // return resolve(treeList)
        treeList.map(item => {
          if (this.allTrees.some(m => m.id === item.id)) {
          } else {
            this.allTrees.push(item)
          }
        })
        resolve(treeList)
        this.$nextTick(() => {
          this.isResolve = true
        })
      }
    },
    setHalfSelect(ids) {
      ids.map(item => {
        const node = this.$refs.tree.getNode(item)
        if (node) {
          setHalf(node.parent)
        }
      })
      function setHalf(data) {
        if (!data.indeterminate) {
          data.indeterminate = true
          data.checked = false
        }
        if (data.parent) {
          setHalf(data.parent)
        }
      }
    },
    setChildren(ids, select = true) {
      ids.map(item => {
        const node = this.$refs.tree.getNode(item)
        if (node) {
          setSelected(node)
        }
      })
      function setSelected(data) {
        if (data.childNodes.length > 0) {
          data.childNodes.map(item => {
            if (select) {
              item.checked = true
            } else {
              item.checked = false
            }
            item.indeterminate = false
            if (item.childNodes.length > 0) {
              setSelected(item)
            }
          })
        }
      }
    },
    delChildren(id) {
      const that = this
      const node = this.$refs.tree.getNode(id)
      setSelected(node)
      function setSelected(data) {
        if (data.childNodes.length > 0) {
          data.childNodes.map(item => {
            that.realIds = that.realIds.filter(m => m !== item.data.id)
            if (item.childNodes.length > 0) {
              setSelected(item)
            }
          })
        }
      }
    },
    handleNodeClick(data) {
      this.currentItemCatalog = data
    },
    clickItemTree(name, options) {
      switch (name) {
        case 'itemsTree':
          if (options.data) {
            this.currentItemCatalog = options.data
          } else {
            this.currentItemCatalog = {}
            this.itemPagination.currentPage = 1
            this.itemPagination.pageSize = 20
            this.getItemTableData()
          }
          break
        default:
          break
      }
    },
    // 获取信息项列表数据
    async getItemTableData() {
      this.tableLoading = true
      const param = {
        catalogId: this.currentItemCatalog.id || 0,
        data: {
          nameLike: this.itemSearchFormData.itemName,
          currentPage: this.itemPagination.currentPage,
          pageSize: this.itemPagination.pageSize,
          orderBy: this.itemSearchFormData.orderBy || 'createTime',
          seq: this.itemSearchFormData.seq
            ? this.itemSearchFormData.seq === 'ascending'
              ? 'asc'
              : 'desc'
            : 'desc',
        },
      }
      try {
        const queryRes = await API.getItemData(param)
        if (
          queryRes.status === 200 &&
          queryRes.data &&
          param.catalogId === (this.currentItemCatalog.id || 0)
        ) {
          this.tableData = queryRes.data.content || []
          this.itemPagination = {
            currentPage: param.data.currentPage,
            pageSize: param.data.pageSize,
            total: queryRes.data.totalItems,
          }
          setTimeout(() => {
            this.toggleTableSelection()
          }, 0)
        } else {
          this.$datablauMessage.error(queryRes.data)
        }
        this.tableLoading = false
      } catch (error) {
        this.$showFailure(error)
        this.tableLoading = false
      }
    },
    toggleTableSelection() {
      this.rowSelectFlag = true
      this.tableData.forEach(item => {
        this.$refs.itemTable.$refs.table.toggleRowSelection(
          item,
          this.realIds.indexOf(item.itemId) !== -1
        )
      })
      this.rowSelectFlag = false
    },
    sortChange(data) {
      this.itemPagination.sort = data.order
      this.itemPagination.currentPage = 1
      this.getItemTableData()
    },
    handlePageChange(page) {
      this.itemPagination.currentPage = page
      this.getItemTableData()
    },
    handleSizeChange(size) {
      this.itemPagination.currentPage = 1
      this.itemPagination.pageSize = size
      this.getItemTableData()
    },
    handleItemSelectChange(list) {
      if (!this.rowSelectFlag) {
        this.selectData = list
        this.realIds = list.map(item => item.itemId)
        this.getCanSure()
      }
    },
    async beforeChange(data) {
      const node = this.$refs.tree.getNode(data.id)
      if (node.parent.checked) {
        this.$refs.tree.setChecked(data.id, true)
        this.$datablauMessage({
          message: this.$t('intelligence.notOpear'),
          type: 'warning',
        })
        return
      } else {
        if (this.realIds.includes(data.id)) {
          this.realIds = this.realIds.filter(item => item !== data.id)
          this.getNowData(this.realIds)
        } else {
          this.realIds.push(data.id)
          await this.delChildren(data.id)
          this.getNowData(this.realIds)
        }
      }
    },
    async getNowData(ids) {
      const allTree = await this.removalDuplicate(this.searchTreeList, 'id')
      let newList = []
      ids.map(item => {
        let nowMap1 = [] // 搜索非懒加载
        let nowMap2 = [] // 懒加载过滤
        let nowMap3 = [] // 父组件传来的已选目录
        nowMap1 = allTree.filter(o => item === o.id)
        nowMap2 = this.allTrees.filter(o => item === o.id)
        nowMap3 = this.targetData.filter(o => item === o.id)
        newList = newList.concat(nowMap1, nowMap2, nowMap3)
      })
      this.selectData = []
      let curList = []
      newList.map(item => {
        if (curList.length === 0) {
          curList.push(item)
        } else {
          if (curList.some(m => m.id === item.id)) {
          } else {
            curList.push(item)
          }
        }
      })
      this.selectData = curList
      this.getBoxH()
      this.getCanSure()
    },
    getCanSure() {
      if (this.realIds.length > 0) {
        this.canSure = true
      } else {
        this.canSure = false
      }
    },
    initMethods() {},
  },
  watch: {
    realIds(val) {
      this.$nextTick(() => {
        if (this.dialogType !== 'item') {
          this.setCheckedTree()
          this.setHalfSelect(this.realIds)
          this.setChildren(this.realIds)
        }
      })
    },
    selectData: {
      handler(val) {
        this.$nextTick(() => {
          this.searchBoxH = $(this.$refs.selectBox).height() || 0
        })
      },
      deep: true,
      immediate: true,
    },
    isResolve(val) {
      if (val && this.dialogType !== 'item') {
        this.$nextTick(async () => {
          if (this.expandId) {
            // 点击树没展开时，父级节点点击勾选了，子节点展示后，过滤掉子节点id
            const node = this.$refs.tree.getNode(this.expandId)
            if (node.checked) {
              await this.delChildren(this.expandId)
              this.getNowData(this.realIds)
            }
          }
          this.isResolve = false
          this.setHalfSelect(this.realIds)
          this.setChildren(this.realIds)
        })
      }
    },
    currentItemCatalog: {
      handler(node) {
        if (node.id) {
          this.itemPagination.currentPage = 1
          this.itemPagination.pageSize = 20
          this.getItemTableData()
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style scoped lang="scss">
.content-box {
  position: absolute;
  top: 10px;
  bottom: 0;
  left: 20px;
  right: 20px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  .tree-box {
    width: 400px;
    border-right: 1px solid #ddd;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    /deep/ .datablau-select {
      margin: 10px;
    }
    .catalog-tree-box {
      position: absolute;
      top: 42px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
    }
  }
  .select-box {
    position: absolute;
    top: 10px;
    left: 420px;
    bottom: 0px;
    right: 0;
    overflow-y: auto;
    .el-tag {
      margin-right: 4px;
      margin-bottom: 8px;
    }
  }
}
.item-tree-box {
  float: left;
  width: 240px;
  height: 440px;
  padding-top: 10px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  position: relative;
}

.item-table {
  float: left;
  width: 800px;
  height: 440px;
  position: relative;
  margin-left: 10px;
  overflow: hidden;
  .select-box {
    max-height: 60px;
    overflow-y: auto;
    .el-tag {
      margin-right: 4px;
      margin-bottom: 8px;
    }
  }
}
</style>
