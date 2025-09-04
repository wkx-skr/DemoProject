<template>
  <datablau-dialog
    v-if="visible"
    custom-class="assets-dialog-page"
    :title="title"
    :visible.sync="visible"
    :before-close="closeDialog"
    width="1200px"
    :height="height"
    ref="tableDialog"
  >
    <div class="add-table-page">
      <div
        class="tag-box"
        ref="tagBox"
        v-if="columnSelectList.length !== 0 && !singleSelect"
      >
        <span style="color: #409eff; margin-left: 10px">
          {{
            $t('securityModule.hasSelect', {
              num: columnSelectList.length,
            })
          }}
        </span>
        <el-tag
          :closable="true"
          ref="selectedField"
          v-for="item in columnSelectList"
          :key="item.objectId"
          @close="tagClose(item)"
        >
          {{ item.physicalName }}
        </el-tag>
      </div>
      <div class="all-content">
        <div class="tree-box">
          <datablau-input
            :placeholder="$t('securityModule.searchKeywords')"
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
            @node-expand="setCurrentExpandTheme"
            :data="treeData"
            :showOverflowTooltip="true"
          ></datablau-tree>
        </div>
        <div class="assets-box">
          <div class="table-box-all">
            <div class="left-box">
              <div class="assets-search-box">
                <template>
                  <datablau-input
                    style="
                      width: 160px;
                      margin-right: 10px;
                      display: inline-block;
                    "
                    clearable
                    :iconfont-state="true"
                    :placeholder="$t('securityModule.searchTableView')"
                    v-model="assetsKeyword"
                    @keyup.native.enter="handleSearch"
                  ></datablau-input>
                  {{ $t('securityModule.securityLevel') }}
                  <datablau-select-weak
                    multiple
                    clearable
                    filterable
                    allow-create
                    style="width: 150px; display: inline-block"
                    @selectAll="flag => selectAll(flag, 'table')"
                    @change="handleChange('table')"
                    v-model="checkTableLevelList"
                    :optionsData="{
                      data: levelList,
                      key: 'tagId',
                      value: 'tagId',
                      label: 'name',
                      showAll: true,
                      all: allTable,
                    }"
                  ></datablau-select-weak>
                  <datablau-button
                    type="normal"
                    style="margin-left: 10px"
                    @click="qureyAssets('TABLE')"
                  >
                    {{ $t('securityModule.search') }}
                  </datablau-button>
                </template>
              </div>
              <div class="table-box">
                <datablau-table
                  @selection-change="selectAsset"
                  :data="tableData"
                  :data-selectable="true"
                  v-loading="tableLoading"
                  :loading="tableLoading"
                  :reserve-selection="true"
                  ref="assetsTable"
                  class="datablau-table table"
                  height="100%"
                  show-overflow-tooltip
                  :show-column-selection="false"
                  row-key="objectId"
                >
                  <el-table-column
                    :label="$t('securityModule.tableView')"
                    prop="name"
                    :min-width="100"
                    show-overflow-tooltip
                  >
                    <template slot-scope="scope">
                      <table-cell
                        :size="20"
                        :mr="12"
                        :icon="getAssetIcon(scope.row.type)"
                        :name="scope.row.name"
                      ></table-cell>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('securityModule.securityLevel')"
                    prop="securityName"
                    :min-width="80"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('securityModule.authoritySource')"
                    prop="source"
                    :min-width="120"
                    show-overflow-tooltip
                  ></el-table-column>
                </datablau-table>
              </div>
              <div class="table-footer-box">
                <datablau-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="tablePagination.currentPage"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size="tablePagination.pageSize"
                  layout="total, sizes, prev, pager, next"
                  :pager-count="5"
                  class="page"
                  :total="tablePagination.total"
                ></datablau-pagination>
              </div>
            </div>
            <div class="right-box">
              <div class="assets-search-box">
                <template>
                  <datablau-input
                    style="
                      width: 120px;
                      margin-right: 10px;
                      display: inline-block;
                    "
                    clearable
                    :noRightPadding="true"
                    :iconfont-state="true"
                    :placeholder="$t('securityModule.searchColumn')"
                    v-model="columnKeyword"
                    @keyup.native.enter="handleColumnSearch"
                  ></datablau-input>
                  {{ $t('securityModule.securityLevel') }}

                  <datablau-select-weak
                    multiple
                    clearable
                    filterable
                    allow-create
                    style="width: 120px; display: inline-block"
                    @selectAll="flag => selectAll(flag, 'column')"
                    @change="handleChange('column')"
                    v-model="checkColumnLevelList"
                    :optionsData="{
                      data: levelList,
                      key: 'tagId',
                      value: 'tagId',
                      label: 'name',
                      showAll: true,
                      all: allColumn,
                    }"
                  ></datablau-select-weak>
                  <!-- <div
                    class="sensitive-box"
                    style="display: inline-block; margin-left: 10px"
                  >
                    是否敏感
                    <datablau-select
                      v-model="isSensitive"
                      filterable
                      style="width: 80px; display: inline-block"
                    >
                      <el-option
                        v-for="item in sensitiveTypeList"
                        :key="item"
                        :label="item"
                        :value="item"
                      ></el-option>
                    </datablau-select>
                  </div> -->
                  <datablau-button
                    type="normal"
                    style="margin-left: 10px"
                    @click="qureyAssets('COLUMN')"
                  >
                    {{ $t('securityModule.search') }}
                  </datablau-button>
                </template>
              </div>
              <div class="table-box">
                <datablau-table
                  @selection-change="selectColumn"
                  :data="columnData"
                  :single-select="singleSelect"
                  v-loading="columnLoading"
                  :loading="columnLoading"
                  ref="columnTable"
                  class="datablau-table table"
                  height="100%"
                  :data-selectable="false"
                  show-overflow-tooltip
                  :show-column-selection="false"
                  row-key="objectId"
                >
                  <el-table-column
                    v-if="!singleSelect"
                    type="selection"
                    width="20"
                    :selectable="row => !row.disabled"
                    :reserve-selection="true"
                  ></el-table-column>
                  <el-table-column
                    :label="$t('securityModule.columnName')"
                    prop="name"
                    :min-width="90"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('securityModule.securityLevel')"
                    prop="securityName"
                    :min-width="70"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('securityModule.inTableView')"
                    prop="parentName"
                    :min-width="100"
                    show-overflow-tooltip
                  ></el-table-column>
                  <!-- <el-table-column
                    label="是否敏感"
                    prop="sensitiveFields"
                    :width="110"
                  >
                    <template slot-scope="scope">
                      <span
                        v-if="scope.row.sensitiveFields"
                        :class="[
                          'sensitive-type',
                          getSensitive(scope.row.sensitiveFields),
                        ]"
                      >
                        <is-show-tooltip
                          :content="scope.row.sensitiveFields"
                          :open-delay="200"
                          placement="top"
                        ></is-show-tooltip>
                      </span>
                    </template>
                  </el-table-column> -->
                </datablau-table>
              </div>
              <div class="table-footer-box">
                <datablau-pagination
                  @size-change="handleColumnSizeChange"
                  @current-change="handleColumnCurrentChange"
                  :current-page="columnPagination.currentPage"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size="columnPagination.pageSize"
                  layout="total, sizes, prev, pager, next"
                  class="page"
                  :pager-count="5"
                  :total="columnPagination.total"
                ></datablau-pagination>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <div>
        <datablau-button @click="closeDialog" type="secondary">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="columnSelectList.length === 0"
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
  getSensitive,
  getAssetIcon,
  getAttrList,
} from '@/view/dataSecurity/util/util'
import { AttrsTypeEnum } from '@/view/dataSecurity/util/attrEnum'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import TableCell from '@/view/dataSecurity/components/tableCell.vue'
import {
  datasourceList,
  getStrategyExistList,
} from '@/view/dataSecurity/util/util.js'
export default {
  components: {
    TableCell,
    isShowTooltip,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    singleSelect: {
      // 字段选择是否为单选
      type: Boolean,
      default: false,
    },
    isAccessScoped: {
      // 是否是访问范围策略的
      type: Boolean,
      default: false,
    },
    rangeSearch: {
      // 是否是访问范围策略过来的
      type: Boolean,
      default: false,
    },
    treeList: {
      // 只有从访问范围策略进来时，可用（左侧树）
      type: Array,
      default: () => {
        return []
      },
    },
    exclude: {
      // 访问范围策略，表选择不包含时
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
    columnIdList: {
      // 访问策略已选择的字段id集合
      type: Array,
      default: () => {
        return []
      },
    },
    schemaList: {
      // 已选择的schema集合
      type: Array,
      default: () => {
        return []
      },
    },
    tableIds: {
      // 表或视图集合
      type: Array,
      default: () => {
        return []
      },
    },
    sourceId: {
      type: [String, Number],
      default: '',
    },
    isMask: {
      // 为true时，是从脱敏规则页面过来，选择字段用于测试
      type: Boolean,
      default: false,
    },
    // 字段脱敏策略传来的字段脱敏类型
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      getAssetIcon: getAssetIcon,
      selectSchemaList: [],
      getSensitive: getSensitive,
      isSensitive: '',
      columnKeyword: '',
      levelList: [],
      checkTableLevelList: [],
      checkColumnLevelList: [],
      title: '',
      height: 530,
      treeKey: '',
      treeLoading: false,
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      expandedKeys: [],
      treeData: [],
      tableData: [],
      tablePagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20,
      },
      tableLoading: false,
      tableSelectList: [],
      columnData: [],
      columnPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 20,
      },
      columnLoading: false,
      columnSelectList: [],
      assetsKeyword: '',
      modelId: '',
      fromreList: [],
      allFromreList: [],
      columns: [],
      modelPage: 1,
      modelLoading: false,
      modelTotal: 0,
      sensitiveTypeList: [],
      allTable: false,
      allColumn: false,
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
    columnKeyword(val) {
      if (!val) {
        this.handleColumnSearch()
      }
    },
  },
  mounted() {
    this.isSensitive = this.$t('securityModule.all')
    this.title = this.$t('securityModule.selectColumn')
    const typeIds = [80000004, 80500008, 80000005]
    this.getAllAttrList()
    this.$nextTick(() => {
      this.getTagH()
      this.selectSchemaList = this.schemaList
      this.getTree()
      if (!this.isMask) {
        this.getTableList('TABLE')
        if (!this.rangeSearch) {
          this.getTableList('COLUMN')
        }
      }
    })
  },
  methods: {
    handleSearch() {
      this.qureyAssets('TABLE')
    },
    handleColumnSearch() {
      this.qureyAssets('COLUMN')
    },
    handleChange(type) {
      switch (type) {
        case 'table':
          this.allTable =
            this.levelList.length === this.checkTableLevelList.length
          break
        case 'column':
          this.allColumn =
            this.levelList.length === this.checkColumnLevelList.length
          break
        default:
          break
      }
    },
    selectAll(flag, type) {
      switch (type) {
        case 'table':
          this.allTable = flag
          if (flag) {
            this.levelList.forEach(item => {
              this.checkTableLevelList.indexOf(item.tagId) === -1 &&
                this.checkTableLevelList.push(item.tagId)
            })
          } else {
            this.checkTableLevelList = []
          }
          break
        case 'column':
          this.allColumn = flag
          if (flag) {
            this.levelList.forEach(item => {
              this.checkColumnLevelList.indexOf(item.tagId) === -1 &&
                this.checkColumnLevelList.push(item.tagId)
            })
          } else {
            this.checkColumnLevelList = []
          }
          break
        default:
          break
      }
    },
    setCurrentExpandTheme(node) {
      return
      if (this.isMask) {
        API.getSchemaList(node.modelId)
          .then(res => {
            this.treeData.map(item => {
              if (item.modelId === node.modelId) {
                if (res.data.data && res.data.data.length > 0) {
                  let newList = []
                  res.data.data.map(m => {
                    let newMap = {}
                    newMap.name = m
                    newMap.id = m
                    newMap.level = 2
                    newMap.type = 'SCHEMA'
                    newList.push(newMap)
                  })
                  item.subNodes = newList
                } else {
                  item.subNodes = []
                }
              }
            })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    initFun() {
      this.getTableList('TABLE')
      if (!this.rangeSearch) {
        this.getTableList('COLUMN')
      }
    },
    getAllAttrList() {
      // 获取安全等级
      getAttrList(API, AttrsTypeEnum.LEVEL).then(data => {
        this.levelList = data || []
        // this.levelList.unshift('全部')
      })
      // 获取敏感数据
      getAttrList(API, AttrsTypeEnum.SENSITIVE).then(data => {
        this.sensitiveTypeList = data || []
        // this.sensitiveTypeList.unshift('全部')
      })
    },
    getTableList(type = 'TABLE', isClear = false) {
      if (type === 'TABLE') {
        // 清空已选资产
        this.$nextTick(() => {
          if (isClear) {
            this.tableSelectList = []
            this.$refs.assetsTable.clearSelection()
          }
        })
        this.tableLoading = true
        // 从访问策略过来且表/视图为不包含
        if (this.rangeSearch && this.exclude) {
          this.getSecurityMetaList()
        } else {
          this.getMetaList('TABLE')
        }
      } else {
        // 从访问策略进来的，必须选择表、视图
        if (this.rangeSearch && this.tableSelectList.length === 0) {
          this.columnData = []
          return
        }
        // 清空已选资产
        this.$nextTick(() => {
          if (isClear) {
            this.columnSelectList = []
            this.$refs.columnTable.clearSelection()
          }
        })
        this.columnLoading = true
        this.getMetaList('COLUMN')
      }
    },
    // 调用元数据的接口  (包含表和字段)
    getMetaList(type, ids = null) {
      let params = {
        sortByCreateTime: null,
        sortByName: null,
      }
      const modelId = this.modelId || this.sourceId
      if (Array.isArray(modelId)) {
        params.modelIds = modelId
      } else {
        params.modelIds = modelId ? [modelId] : null
      }
      if (this.rangeSearch) {
      } else {
        // params.schemaList = this.selectSchemaList
        params.schema = this.selectSchemaList.join(',')
      }
      if (type === 'TABLE') {
        params.typeIds = [80000004, 80500008]
        params.currentPage = this.tablePagination.currentPage
        params.pageSize = this.tablePagination.pageSize
        params.keyword = this.assetsKeyword
        params.tagIds = this.checkTableLevelList
        if (ids) {
          params.objectIds = ids
        } else {
          params.objectIds = this.tableIds.map(item => item.objectId)
        }
      } else {
        const tableIdList =
          this.tableSelectList.map(item => item.objectId) || []
        params.typeIds = [80000005]
        params.currentPage = this.columnPagination.currentPage
        params.pageSize = this.columnPagination.pageSize
        params.keyword = this.columnKeyword
        params.tagIds = this.checkColumnLevelList
        params.parentIds = tableIdList
      }
      API.searchMetadataApi(params)
        .then(async res => {
          const data = res.data
          let existIds = []
          if (this.type === 'ACCESS_DATAMASK_COLUMN' && type === 'COLUMN') {
            const ids = data.content.map(m => m.objectId)
            existIds = await getStrategyExistList(API, this.type, ids, this)
          }
          data.content.map(item => {
            item.name =
              item.physicalName +
              (item.logicalName ? '(' + item.logicalName + ')' : '')
            const len = item.schema.length + 1
            const parentLen = item.modelName.length
            const gatherName = item.modelName.substr(0, parentLen - len)
            item.source = `${
              this.$modelCategoriesMap[item.modelCategoryId]
            }/${gatherName}/${item.modelName}`
            if (type === 'COLUMN') {
              if (this.type === 'ACCESS_DATAMASK_COLUMN') {
                item.disabled = existIds.some(v => v === item.objectId)
              } else {
                item.disabled = this.columnIdList.some(v => v === item.objectId)
              }
              item.source = `${
                this.$modelCategoriesMap[item.modelCategoryId]
              }/${gatherName}/${item.modelName}/${item.parentPhysicalName}`
              item.parentName =
                item.parentPhysicalName +
                (item.parentLogicalName
                  ? '(' + item.parentLogicalName + ')'
                  : '')
            }
          })
          if (type === 'TABLE') {
            this.tableLoading = false
            this.tablePagination.total = data.totalItems
            this.tableData = data.content || []
          } else {
            this.columnLoading = false
            this.columnPagination.total = data.totalItems
            this.columnData = data.content || []
          }
        })
        .catch(e => {
          if (type === 'TABLE') {
            this.tableLoading = false
          } else {
            this.columnLoading = false
          }
          this.$showFailure(e)
        })
    },
    // 只有访问策略过来且表为不包含时调用（字段不会调用该接口，只有表）
    getSecurityMetaList() {
      const params = {
        rangeSearch: this.rangeSearch,
        currentPage: this.tablePagination.currentPage,
        pageSize: this.tablePagination.pageSize,
        keyword: this.assetsKeyword,
        modelId: this.modelId || this.sourceId,
        schemaList: this.selectSchemaList,
        tagIds: this.checkTableLevelList,
        tableIdList: this.tableIds.map(item => item.objectId),
        exclude: this.exclude,
        typeIds: [80000004, 80500008],
        sortByCreateTime: null,
        sortByName: null,
        types: null,
      }
      API.metaIdListApi(params)
        .then(res => {
          // 接口返回表/视图的idList
          const tableIds = res.data.data
          this.getMetaList('TABLE', tableIds)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTree() {
      this.treeLoading = true
      // 数据集
      if (this.isMask) {
        // 脱敏规则管理页面--字段测试
        const params = {
          categoryId: '',
          currentPage: 1,
          modelName: '',
          pageSize: 500,
        }
        // API.getFromre(params)
        this.$http
          .get(
            '/metadata/models/fromre/?includeLogicalEntity=false&dataConnection=true'
          )
          .then(res => {
            this.treeLoading = false
            // let fromreList = res.data.content.filter(m =>
            //   datasourceList().some(v => v.value === m.type)
            // )
            let fromreList = res.data
            fromreList.map(item => {
              item.name = item.definition
              item.id = item.modelId
              item.level = 1
              item.type = 'MODEL'
            })
            this.treeData = fromreList
            this.$nextTick(() => {
              this.modelId = this.treeData[0].id
              this.initFun()
              this.$refs.tree.setCurrentKey(this.treeData[0].id)
            })
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      } else if (this.rangeSearch) {
        this.treeLoading = false
        this.$nextTick(() => {
          this.treeData = this.treeList
          const id = this.treeData[0].id
          setTimeout(() => {
            this.$refs.tree.setCurrentKey(id)
          }, 100)
        })
      } else {
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
      }
    },
    getTagH() {
      if (this.columnSelectList.length > 0) {
        const itemH = this.$refs.tagBox.offsetHeight
        this.height = 530 + itemH + 20
      } else {
        this.height = 530 + 20
      }
    },
    async tagClose(v) {
      this.columnSelectList.forEach(item => {
        if (item.objectId !== v.objectId) {
          this.$refs.columnTable.toggleRowSelection(item, true)
        } else {
          this.$refs.columnTable.toggleRowSelection(item, false)
        }
      })
    },
    closeDialog() {
      this.clickTable('close')
    },
    nodeClick(data) {
      let name = ''
      this.tablePagination.currentPage = 1
      this.columnPagination.currentPage = 1
      if (data.type === 'MODEL') {
        this.modelId = data.modelIds || data.modelId || data.id // 访问策略
        name = data.name
        this.getTableList('TABLE')
        this.getTableList('COLUMN')
      } else if (data.type === 'SCHEMA' || data.type === 'MODEL_SCHEMA') {
        this.modelId = data.modelIds || data.modelId
        this.selectSchemaList = [data.name]
        name = data.id.split('_%_')[1]
        this.getTableList('TABLE')
        this.getTableList('COLUMN')
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
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
      return row.objectId
    },
    qureyAssets(type) {
      switch (type) {
        case 'TABLE':
          this.tablePagination.currentPage = 1
          this.$refs.assetsTable.clearSelection()
          this.tableSelectList = []
          this.getTableList('TABLE')
          break
        case 'COLUMN':
          this.columnPagination.currentPage = 1
          this.getTableList('COLUMN')
          break
        default:
          break
      }
    },
    handleSizeChange(pageSize) {
      this.tablePagination.currentPage = 1
      this.tablePagination.pageSize = pageSize
      this.getTableList('TABLE')
    },
    handleCurrentChange(page) {
      this.tablePagination.currentPage = page
      this.getTableList('TABLE')
    },
    selectAsset(list) {
      this.tableSelectList = list
      this.getTableList('COLUMN')
    },
    handleColumnSizeChange(pageSize) {
      this.columnPagination.currentPage = 1
      this.columnPagination.pageSize = pageSize
      this.getTableList('COLUMN')
    },
    handleColumnCurrentChange(page) {
      this.columnPagination.currentPage = page
      this.getTableList('COLUMN')
    },
    selectColumn(list) {
      if (this.singleSelect) {
        if (list) {
          this.columnSelectList = [list]
        } else {
          this.columnSelectList = []
        }
      } else {
        this.columnSelectList = list
      }
      if (this.isMask && this.columnSelectList.length) {
        this.columnSelectList.map(item => (item.modelId = this.modelId))
      }
      this.$nextTick(() => {
        if (!this.singleSelect) {
          this.getTagH()
        }
      })
    },
    submitAssets() {
      this.clickTable('sureTable', { data: this.columnSelectList })
    },
  },
}
</script>

<style scoped lang="scss">
.sensitive-type {
  vertical-align: middle;
  width: 80px;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
  color: #ff7519;
  background: transparentize($color: #ff7519, $amount: 0.9);
  border-radius: 2px;
  display: inline-block;
  text-align: center;
  &.false-type {
    color: #999;
    background: #f5f5f5;
  }
}
.add-table-page {
  &:after {
    content: '';
    display: block;
    clear: both;
  }
  .all-content {
    height: 410px;
    overflow: hidden;
  }
  .tag-box {
    max-height: 60px;
    overflow-y: scroll;
    padding-bottom: 10px;
    width: 100%;
    .el-tag {
      margin: 3px 6px;
    }
  }
  .tree-box {
    width: 200px;
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
    margin-left: 16px;
    height: 100%;
    width: 944px;
    float: left;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    .table-box-all {
      border: 1px solid #ddd;
      position: absolute;
      top: 0px;
      left: 0;
      right: 0;
      bottom: 0;
      .left-box {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 534px;
        box-sizing: border-box;
        border-right: 1px solid #ddd;
        .assets-search-box {
          padding: 0 8px;
          height: 40px;
          padding-top: 7px;
          box-sizing: border-box;
        }
        .table-box {
          position: absolute;
          top: 40px;
          left: 8px;
          right: 8px;
          bottom: 50px;
        }
        .table-footer-box {
          position: absolute;
          height: 48px;
          left: 8px;
          right: 8px;
          bottom: 0px;
          padding-top: 9px;
          box-sizing: border-box;
          border-top: 1px solid #ddd;
          text-align: right;
        }
      }
      .right-box {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: 410px;
        .assets-search-box {
          padding: 0 8px;
          height: 40px;
          padding-top: 7px;
          box-sizing: border-box;
        }
        .table-box {
          position: absolute;
          top: 40px;
          left: 8px;
          right: 8px;
          bottom: 50px;
        }
        .table-footer-box {
          position: absolute;
          height: 48px;
          left: 8px;
          right: 8px;
          bottom: 0px;
          padding-top: 9px;
          box-sizing: border-box;
          border-top: 1px solid #ddd;
          text-align: right;
        }
      }
    }
  }
}
</style>
