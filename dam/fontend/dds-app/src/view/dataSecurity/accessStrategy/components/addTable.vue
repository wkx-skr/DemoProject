<template>
  <datablau-dialog
    custom-class="assets-dialog-page"
    :title="title"
    :visible="visible"
    :before-close="closeDialog"
    width="1160px"
    :height="height"
    :table="true"
    ref="tableDialog"
  >
    <div class="add-table-page">
      <div class="tree-box">
        <datablau-input
          :placeholder="$t('securityModule.search')"
          v-model="treeKey"
          clearable
          :iconfont-state="true"
        ></datablau-input>
        <datablau-tree
          class="grey-tree data-asset-tree"
          ref="tree"
          :default-expand-all="false"
          auto-expand-parent
          v-loading="treeLoading"
          @node-click="nodeClick"
          node-key="id"
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          :props="defaultProps"
          :default-expanded-keys="expandedKeys"
          :data-icon-function="dataIconFunction"
          :data="treeData"
          :showOverflowTooltip="true"
        ></datablau-tree>
      </div>
      <div class="assets-box">
        <div style="width: 100%; height: 40px">
          <template>
            <datablau-input
              style="width: 200px; display: inline-block"
              clearable
              :iconfont-state="true"
              :placeholder="$t('securityModule.searchKeywords')"
              v-model="assetsKeyword"
              @keyup.native.enter="handleSearch"
            ></datablau-input>
            <!-- v-selectLazyLoad="modelloading" -->
            <datablau-select
              v-if="assetType === 'TABLE'"
              style="width: 200px; display: inline-block; margin-left: 10px"
              v-model="curModel"
              filterable
              clearable
              :placeholder="$t('securityModule.sourceName')"
              @change="handleModel"
            >
              <el-option
                v-for="item in nowFromreList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
            <div class="security-box">
              <span class="lable">
                {{ $t('securityModule.securityLevel') }}
              </span>
              <datablau-select
                style="width: 120px; display: inline-block"
                v-model="levelId"
                filterable
                clearable
                :placeholder="$t('securityModule.all')"
              >
                <el-option
                  v-for="item in levelList"
                  :key="item.tagId"
                  :label="item.name"
                  :value="item.tagId"
                ></el-option>
              </datablau-select>
            </div>
            <datablau-button
              type="normal"
              style="margin-left: 10px; vertical-align: top"
              @click="qureyAssets"
            >
              {{ $t('securityModule.search') }}
            </datablau-button>
            <template v-if="assetType === 'TABLE'">
              <el-checkbox
                @change="changeTable"
                v-model="isTable"
                style="margin-left: 16px"
              >
                {{ $t('securityModule.table') }}
              </el-checkbox>
              <el-checkbox @change="changeView" v-model="isView">
                {{ $t('securityModule.shitu') }}
              </el-checkbox>
            </template>
          </template>
        </div>
        <div class="table-box">
          <datablau-table
            @selection-change="selectAsset"
            :data="assetsData"
            v-loading="tableLoading"
            :loading="tableLoading"
            ref="assetsTable"
            class="datablau-table table"
            height="100%"
            :single-select="true"
            show-overflow-tooltip
            :show-column-selection="false"
            :header-cell-style="{
              color: '#494850',
              'font-size': '12px',
              'font-weight': 'bold',
            }"
            :row-key="getAssetRowKeys"
          >
            <el-table-column width="28">
              <template slot-scope="scope">
                <datablau-icon
                  :data-type="scope.row.type"
                  :size="20"
                  style="position: relative; top: 3px"
                ></datablau-icon>
              </template>
            </el-table-column>
            <template v-for="c in columns">
              <el-table-column
                :key="c.prop"
                :prop="c.prop"
                :label="c.label"
                :min-width="c.minWidth"
                show-overflow-tooltip
              ></el-table-column>
            </template>
          </datablau-table>
        </div>
      </div>
    </div>
    <div
      slot="footer"
      style="width: 100%; display: flex; justify-content: space-between"
    >
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="assetPagination.currentPage"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="assetPagination.pageSize"
        layout="total, sizes, prev, pager, next"
        :pager-count="5"
        class="page"
        :total="assetPagination.total"
      ></datablau-pagination>
      <div>
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="canSubmit()"
          @click="submitAssets"
        >
          {{ $t('securityModule.add') }}
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
import {
  getAttrList,
  getStrategyExistList,
} from '@/view/dataSecurity/util/util'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    clickTable: {
      type: Function,
    },
    assetType: {
      type: String,
      default: '',
    },
    assetId: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      title: '',
      isView: true,
      isTable: true,
      height: 530,
      treeKey: '',
      treeLoading: false,
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      expandedKeys: [],
      treeData: [],
      assetPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20,
      },
      assetsData: [],
      assetsKeyword: '',
      modelId: null,
      schema: '',
      fromreList: [],
      allFromreList: [],
      nowFromreList: [],
      columns: [],
      tableLoading: false,
      modelPage: 1,
      modelLoading: false,
      modelTotal: 0,
      selectedAssets: {},
      levelList: [],
      levelId: '',
      curModel: null,
    }
  },
  watch: {
    treeKey(val) {
      this.$refs.tree.filter(val)
    },
    assetsKeyword(val) {
      if (!val) {
        this.handleSearch()
      }
    },
  },
  mounted() {
    this.title = this.$t('securityModule.selectTableView')
    if (this.assetType === 'TABLE') {
      this.title = this.$t('securityModule.selectTableView')
      this.columns = [
        {
          prop: 'tableName',
          label: this.$t('accessStrategy.name'),
          minWidth: '150px',
        },
        {
          prop: 'system',
          label: this.$t('securityModule.busSystem'),
          minWidth: '120px',
        },
        {
          prop: 'schema',
          label: 'Schema',
          minWidth: '120px',
        },
        {
          prop: 'department',
          label: this.$t('securityModule.techDepartment'),
          minWidth: '120px',
        },
        {
          prop: 'securityName',
          label: this.$t('securityModule.securityLevel'),
          minWidth: '120px',
        },
        // {
        //   prop: 'time',
        //   label: '发布时间',
        //   minWidth: '150px',
        // },
      ]
    } else {
      this.title = this.$t('securityModule.selectColumn')
      this.columns = [
        {
          prop: 'tableName',
          label: this.$t('accessStrategy.name'),
          minWidth: '120px',
        },
        {
          prop: 'system',
          label: this.$t('securityModule.busSystem'),
          minWidth: '100px',
        },
        {
          prop: 'schema',
          label: 'Schema',
          minWidth: '100px',
        },
        {
          prop: 'parentPhysicalName',
          label: this.$t('securityModule.inTableView'),
          minWidth: '120px',
        },
        {
          prop: 'department',
          label: this.$t('securityModule.techDepartment'),
          minWidth: '100px',
        },
        {
          prop: 'securityName',
          label: this.$t('securityModule.securityLevel'),
          minWidth: '120px',
        },
        // {
        //   prop: 'time',
        //   label: '发布时间',
        //   minWidth: '150px',
        // },
      ]
    }
    this.getTree()
    this.getList()
    this.getModel()
    this.getSecurity()
  },
  methods: {
    handleSearch() {
      this.assetPagination.currentPage = 1
      this.getList()
    },
    handleModel(val) {
      this.curModel = val
    },
    getSecurity() {
      getAttrList(API).then(data => {
        this.levelList = data
      })
    },
    canSubmit() {
      if (this.selectedAssets && this.selectedAssets.id) {
        return false
      } else {
        return true
      }
    },
    changeTable(bool) {
      this.isTable = bool
      this.assetPagination.currentPage = 1
      this.getList()
    },
    changeView(bool) {
      this.isView = bool
      this.assetPagination.currentPage = 1
      this.getList()
    },
    closeDialog() {
      this.clickTable('close')
    },
    nodeClick(data) {
      let name = ''
      this.curModel = null
      this.assetPagination.currentPage = 1
      if (data.type === 'MODEL') {
        this.modelId = data.modelIds
        this.nowFromreList = this.allFromreList.filter(
          item => data.modelIds.indexOf(item.modelId) !== -1
        )
        this.schema = null
        name = data.name
        this.getList()
      } else if (data.type === 'SCHEMA' || data.type === 'MODEL_SCHEMA') {
        this.nowFromreList = this.allFromreList
        this.schema = data.name
        this.modelId = data.modelIds
        name = data.id.split('_%_')[1]
        this.getList()
      } else {
        this.nowFromreList = this.allFromreList
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    dataIconFunction(data, node) {
      if (data.type === 'IT_DEPART') {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.type === 'MODEL') {
        return 'iconfont icon-shujuyuan'
      } else if (data.type === 'SCHEMA' || data.type === 'MODEL_SCHEMA') {
        return 'iconfont icon-schema'
      } else if (data.type === 'MODEL_CATEGORY') {
        return 'iconfont icon-xitong'
      } else {
        // console.error(data)
      }
    },
    getTree() {
      // 数据集
      API.modelTreeAPI()
        .then(res => {
          this.treeLoading = false
          if (res.data.subNodes) {
            const modelTree = _.cloneDeep(res.data.subNodes)
            modelTree.forEach(dep => {
              if (dep.subNodes) {
                dep.subNodes.forEach(cat => {
                  if (cat.subNodes) {
                    cat.subNodes.forEach(model => {
                      delete model.subNodes
                    })
                  }
                })
              }
            })
            this.treeData = this.treeSort(res.data)
          }
        })
        .catch(err => {
          this.treeLoading = false
          this.$showFailure(err)
        })
    },
    getList() {
      // 清空已选资产
      this.$nextTick(() => {
        this.selectedAssets = {}
        this.$refs.assetsTable.clearSingleSelect()
      })
      this.tableLoading = true
      let params = {
        modelIds: this.curModel ? [this.curModel] : this.modelId,
        schema: this.schema,
        currentPage: this.assetPagination.currentPage,
        pageSize: this.assetPagination.pageSize,
        keyword: this.assetsKeyword,
        tagIds: this.levelId ? [this.levelId] : null,
        sortByCreateTime: null,
        sortByName: null,
      }
      params.typeIds = []
      if (this.assetType === 'TABLE') {
        if (this.isTable) {
          params.typeIds.push(80000004)
        }
        if (this.isView) {
          params.typeIds.push(80500008)
        }
      } else if (this.assetType === 'COLUMN') {
        params.typeIds.push(80000005)
      }
      API.searchMetadataApi(params)
        .then(async res => {
          this.tableLoading = false
          const data = res.data
          const ids = data.content.map(m => m.objectId)
          const existIds = await getStrategyExistList(API, this.type, ids, this)
          this.assetPagination.total = data.totalItems
          data.content.map(item => {
            const hasAsset = existIds.some(
              m => parseFloat(m) === parseFloat(item.objectId)
            )
            if (hasAsset) {
              item.disabled = true
            }
            item.tableName =
              item.physicalName +
              (item.logicalName ? '(' + item.logicalName + ')' : '')
            item.system = !this.$modelCategoriesDetailsMap[item.modelCategoryId]
              ? '--'
              : this.$modelCategoriesDetailsMap[item.modelCategoryId]
                  .displayName
            item.department = !this.$modelCategoriesDetailsMap[
              item.modelCategoryId
            ]
              ? '--'
              : this.$modelCategoriesDetailsMap[item.modelCategoryId]
                  .itDepartment
            item.time = this.$timeFormatter(item.creationTime)
          })
          this.assetsData = data.content || []
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    sortByName(node) {
      const departments = node.subNodes
      this.$utils.sort.sortConsiderChineseNumber(departments)
    },
    // 表树排序
    treeSort(root) {
      const t = root.subNodes
      if (t != null) {
        this.sortByName(root)
        t.forEach(item => {
          this.sortByName(item)
          item.subNodes &&
            item.subNodes.forEach(c => {
              if (c.type === 'MODEL_CATEGORY') {
                c.id = 'c' + c.id
              }
              if (c.subNodes) {
                this.sortByName(c)
                c.subNodes.forEach(m => {
                  if (m.subNodes) {
                    this.sortByName(m)
                    m.subNodes.forEach(s => {
                      s.id += '_%_' + m.name + '_%_' + s.name
                    })
                  }
                })
              }
            })
        })
      }
      const index = t.findIndex(item => {
        return item.id === 'others'
      })
      if (index !== -1) {
        const others = t.splice(index, 1)
        t.push(others[0])
      }
      return t
    },
    getAssetRowKeys(row) {
      return row.id
    },
    modelloading() {
      if (this.modelPage * 20 >= this.modelTotal) return
      this.modelPage++
      this.getModel()
    },
    getModel() {
      this.modelLoading = true
      const params = {
        categoryId: '',
        currentPage: this.modelPage,
        modelName: '',
        pageSize: 1500,
        filterModelTypes: ['DATADICTIONARY_LOGICAL', 'DATADICTIONARY'],
      }
      API.getFromre(params)
        .then(res => {
          this.modelLoading = false
          this.fromreList = res.data.content
          this.allFromreList = this.fromreList
          this.nowFromreList = this.fromreList
        })
        .catch(e => {
          this.modelLoading = false
          this.$showFailure(e)
        })
    },
    qureyAssets() {
      this.assetPagination.currentPage = 1
      if (!this.curModel) {
        this.$refs.tree.$refs.tree.setCurrentKey(null)
      }
      this.getList()
    },
    handleSizeChange(pageSize) {
      this.assetPagination.currentPage = 1
      this.assetPagination.pageSize = pageSize
      this.getList()
    },
    handleCurrentChange(page) {
      this.assetPagination.currentPage = page
      this.getList()
    },
    selectAsset(list) {
      this.selectedAssets = list
    },
    submitAssets() {
      let dataSource = ''
      if (this.assetType === 'TABLE') {
        dataSource =
          this.allFromreList.find(
            item => item.modelId === this.selectedAssets.parentId
          ).definition || ''
      } else {
        dataSource = this.selectedAssets.definition
      }
      const assetInfo = {
        assetId: this.selectedAssets.objectId,
      }
      this.clickTable('sureTable', { data: assetInfo })
    },
  },
}
</script>

<style scoped lang="scss">
.add-table-page {
  height: 395px;
  overflow: hidden;
  &:after {
    content: '';
    display: block;
    clear: both;
  }
  .tree-box {
    width: 190px;
    float: left;
    height: 100%;
    padding: 10px 0;
    border: 1px solid #ddd;
    /deep/ .datablau-input {
      margin: 0 10px;
    }
    .grey-tree {
      height: 340px;
      overflow-y: auto;
    }
  }
  .assets-box {
    height: 100%;
    padding: 0 10px;
    width: 930px;
    float: left;
    overflow: hidden;
    position: relative;
    .security-box {
      display: inline-block;
      .lable {
        margin-left: 16px;
        margin-right: 8px;
      }
    }
    .table-box {
      position: absolute;
      top: 40px;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
