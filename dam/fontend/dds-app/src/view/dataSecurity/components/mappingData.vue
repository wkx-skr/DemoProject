<template>
  <div class="mapping-data-page" v-resize="domResize">
    <div class="mapping-search-box" ref="searchBox">
      <datablau-list-search :noMinWidth="true">
        <el-form ref="form" class="form-search">
          <el-form-item label="">
            <datablau-input
              style="width: 240px"
              iconfont-state
              clearable
              type="text"
              v-model="form.nameLike"
              @keyup.native.enter="handleSearch"
              :placeholder="$t('accessControl.searchName')"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('securityModule.busSystem')">
            <datablau-select
              style="width: 160px"
              v-model="form.systemId"
              filterable
              clearable
              @change="handleSystemChange"
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in systemList"
                :key="item.categoryId"
                :label="item.categoryName"
                :value="item.categoryId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('securityModule.collectName')">
            <datablau-select
              style="width: 160px"
              clearable
              v-model="form.datasourceId"
              filterable
              @change="handleGatherChange"
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in gatherList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('securityModule.datasource')">
            <datablau-select
              style="width: 160px"
              clearable
              v-model="form.modelId"
              filterable
              @change="handleDatasourceChange"
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in datasourceList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="'schema'">
            <datablau-select
              clearable
              style="width: 160px"
              v-model="form.schemaId"
              filterable
              :placeholder="$t('securityModule.placeSelect')"
            >
              <el-option
                v-for="item in schemaList"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item class="btn">
            <datablau-button type="normal" @click="formSearch('form')">
              {{ $t('securityModule.search') }}
            </datablau-button>
            <datablau-button type="secondary" @click="resetForm('form')">
              {{ $t('securityModule.reset') }}
            </datablau-button>
          </el-form-item>
        </el-form>
        <template slot="buttons">
          <datablau-button
            v-if="$auth.DATA_SECURITY_ASSET_MANAGE && !isView"
            type="important"
            @click="handlerTool"
          >
            {{ $t('accessControl.coordinationClassification') }}
          </datablau-button>
        </template>
      </datablau-list-search>
    </div>
    <div class="table-box" :style="{ top: top + 'px' }">
      <datablau-form-submit>
        <datablau-table
          v-loading="loading"
          :loading="loading"
          :data-selectable="$auth.DATA_SECURITY_CATALOG_RE_COMB && !isView"
          :show-column-selection="false"
          height="100%"
          :default-sort="{ prop: 'dataAssetName', order: form.sort }"
          ref="ruleTable"
          @selection-change="handleChange"
          @sort-change="sortChange"
          :data="tableList"
          :reserve-selection="true"
          :row-key="'id'"
          row-class-name="row-can-click"
          @row-click="toDetail"
        >
          <el-table-column width="28">
            <template slot-scope="scope">
              <datablau-icon
                :data-type="'logicaltable'"
                v-if="scope.row.logical && scope.row.typeId === 80000004"
                :size="20"
              ></datablau-icon>
              <datablau-icon
                :data-type="'logicalcolumn'"
                v-else-if="scope.row.logical && scope.row.typeId === 80000005"
                :size="20"
              ></datablau-icon>
              <datablau-icon
                v-else
                :data-type="getIcon(scope.row.typeId)"
                :size="20"
                style="position: relative; top: 3px"
              ></datablau-icon>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('securityModule.dataAssetsName')"
            sortable="custom"
            prop="dataAssetName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ getName(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('accessControl.infoName')"
            prop="authItemFrom"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.authItemFrom || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('securityModule.authoritySource')"
            prop="dataSource"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ getDataSource(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('securityModule.inSecurityClassify')"
            prop="catalogPathName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('securityModule.securityLevel')"
            prop="authLevelName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('securityModule.reach')"
            prop="scopeName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.scopeName || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('securityModule.impactLevel')"
            prop="impactName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.impactName || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('securityModule.affectedObjects')"
            prop="influenceObjectName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ scope.row.influenceObjectName || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('securityModule.operate')"
            :width="100"
            align="center"
            fixed="right"
            prop="operation"
          >
            <template slot-scope="scope">
              <datablau-button
                v-if="$auth.DATA_SECURITY_CATALOG_RE_COMB && !isView"
                type="icon"
                :tooltip-content="$t('accessControl.addComb')"
                class="iconfont icon-chehui"
                @click="addOnlyCarding(scope.row)"
              ></datablau-button>
              <datablau-button
                type="icon"
                :tooltip-content="$t('securityModule.view')"
                class="iconfont icon-see"
                @click="toDetail(scope.row)"
              ></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="left-btn" v-if="selections.length > 0">
            <div style="display: inline-block">
              <btn-tip :num="selections.length"></btn-tip>
              <datablau-button
                class="iconfont icon-chehui"
                type="secondary"
                size="mini"
                @click="addCarding"
              >
                {{ $t('accessControl.addComb') }}
              </datablau-button>
            </div>
          </div>
          <div class="bottom">
            <datablau-pagination
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
              :current-page.sync="form.currentPage"
              :page-sizes="[20, 50, 100, 200]"
              :page-size="form.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              class="page"
            ></datablau-pagination>
          </div>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import API from '../util/api'
import { dumpMetaDetail } from '@/view/dataSecurity/util/util'
import {
  AttrsTypeEnum,
  assetsTypeEnum,
} from '@/view/dataSecurity/util/attrEnum'
export default {
  props: {
    hasManageAuth: Boolean,
    isView: {
      type: Boolean,
      default: false,
    },
    minScreen: {
      type: Boolean,
      default: false,
    },
    heightCatalog: {
      type: Object,
      default() {
        return {}
      },
    },
    highId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      top: 44,
      form: {
        currentPage: 1,
        pageSize: 20,
        nameLike: '',
        systemId: '',
        datasourceId: '',
        modelId: '',
        schemaId: '',
        sort: '',
      },
      systemList: [],
      gatherList: [],
      datasourceList: [],
      schemaList: [],
      selections: [],
      tableList: [],
      total: 0,
    }
  },
  watch: {
    heightCatalog: {
      handler(val) {
        if (this.highId) {
          this.clearTableList()
          this.getList()
        }
      },
      immediate: true,
    },
    'form.nameLike'(val) {
      if (!val) {
        this.handleSearch()
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initData()
    })
  },
  methods: {
    handleSearch() {
      this.form.currentPage = 1
      this.getList()
    },
    addCarding() {
      const ids = this.selections.map(item => item.id)
      this.handleAssetsData(ids)
    },
    addOnlyCarding(row) {
      this.handleAssetsData([row.id])
    },
    handleAssetsData(ids) {
      API.reorganizeAssets(this.highId, ids)
        .then(res => {
          this.$refs.ruleTable.clearSelection()
          this.form.currentPage = 1
          this.getList()
        })
        .catch(e => {
          this.$refs.ruleTable.clearSelection()
          this.$showFailure(e)
        })
    },
    getName(row) {
      const result = row.dataAssetName + (row.alias ? `(${row.alias})` : '')
      return result
    },
    initData() {
      // 获取业务系统
      API.getBusinessSystemList().then(res => {
        this.systemList = res.data.data || []
      })
    },
    getInventoryModel(type, num = '') {
      let result = ''
      let style = ''
      switch (type) {
        case 'MANUAL_INVENTORY': // 人工盘点
          result = this.$t('accessControl.manualInventory')
          style = 'color: #409EFF;background: rgba(64,158,255,0.1)'
          break
        case 'DATA_IDENTIFICATION': // 数据识别
          result = this.$t('accessControl.dataRecognition')
          style = 'color: #8C5DFE;background: rgba(140,93,254,0.1)'
          break
        case 'BATCH_IMPORT': // 批量导入
          result = this.$t('securityModule.batchImport')
          style = 'color: #43C1CA;background: rgba(67,193,202,0.1)'
          break
        default:
          break
      }
      if (num === 1) {
        return style
      } else {
        return result
      }
    },
    getIcon(type) {
      let result = ''
      switch (type) {
        case 80000005: // 数据项
          result = 'column'
          break
        case 80000004: // 表
          result = 'table'
          break
        case 80500008: // 视图
          result = 'view'
          break
        default:
          break
      }
      return result
    },
    handleSystemChange(id) {
      this.gatherList = []
      this.form.datasourceId = ''
      this.datasourceList = []
      this.form.modelId = ''
      this.schemaList = []
      this.form.schemaId = ''
      if (id) {
        this.getGatherList(id)
      }
    },
    // 查询采集源
    getGatherList(id) {
      API.realAataSourceListApi(id)
        .then(res => {
          this.gatherList = res.data.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleGatherChange(id) {
      this.datasourceList = []
      this.form.modelId = ''
      this.schemaList = []
      this.form.schemaId = ''
      if (id) {
        this.getDatasourceList(id)
      }
    },
    // 获取数据源
    getDatasourceList(id) {
      API.virDataSourceListApi(id)
        .then(res => {
          this.datasourceList = res.data.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleDatasourceChange(id) {
      this.schemaList = []
      this.form.schemaId = ''
      this.datasourceList.map(item => {
        if (parseFloat(item.modelId) === parseFloat(id)) {
          if (item.type === 'DATADICTIONARY_LOGICAL') {
            this.form.schemaId = item.reverseOptions.DatabaseName.split(',')[0]
            this.schemaList = item.reverseOptions.DatabaseName.split(',')
          } else {
            this.form.schemaId = item.schema || item.database
            this.schemaList = [item.schema || item.database]
          }
        }
      })
    },
    getDataSource(row) {
      let result = ''
      switch (row.typeId) {
        case 80000005: // 数据项
          result = `${row.categoryName}/${row.dataSource}/${row.modelName}/${row.tableName}`
          break
        case 80000004: // 表
        case 80500008: // 视图
          result = `${row.categoryName}/${row.dataSource}/${row.modelName}`
          break
        default:
          break
      }
      return result
    },
    // 获取schema
    getSchemaList(id) {
      API.getSchemaList(id)
        .then(res => {
          this.form.schemaId = ''
          this.schemaList = res.data.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getList() {
      this.loading = true
      let params = {
        currentPage: this.form.currentPage,
        pageSize: this.form.pageSize,
        nameLike: this.form.nameLike,
        categoryId: this.form.systemId,
        dataSourceId: this.form.datasourceId,
        modelId: this.form.modelId,
        schema: this.form.schemaId,
        orderBy: 'dataAssetName',
        seq: this.form.sort === 'descending' ? 'DESC' : 'ASC',
      }
      API.getInfoItemList(this.highId, params)
        .then(res => {
          this.loading = false
          let logicalInfoArr = []
          res.data.content.forEach(item => {
            if (item.typeId === 80000004 || item.typeId === 80000005) {
              logicalInfoArr.push(item.objectId)
            }
          })
          this.getLogicalInfo(logicalInfoArr)
          this.tableList = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.loading = false
          this.total = 0
          this.tableList = []
          this.$showFailure(e)
        })
    },
    getLogicalInfo(logicalInfoArr) {
      this.$http
        .post('/metadata/entities/getLogicalInfo', logicalInfoArr)
        .then(res => {
          this.tableList.forEach(element => {
            this.$set(element, 'logical', res.data[Number(element.objectId)])
          })
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    domResize() {
      this.$nextTick(() => {
        const searchBox = this.$refs.searchBox
        this.top = $(searchBox).height() + 10
      })
    },
    handlerTool() {
      if (
        this.$auth.DATA_SECURITY_ASSET_IMPORT ||
        this.$auth.DATA_SECURITY_ASSET_EXPORT ||
        this.$auth.DATA_SECURITY_CATALOG_ELEMENT_MANAGE
      ) {
        this.$router.push({
          name: 'coordinationClassification',
        })
      } else {
        this.$datablauMessage.warning(this.$t('accessControl.notPower'))
      }
    },
    formSearch(name) {
      this.form.currentPage = 1
      this.getList()
    },
    resetForm() {
      this.form = {
        pageSize: this.form.pageSize,
        currentPage: 1,
        nameLike: '',
        systemId: '',
        datasourceId: '',
        modelId: '',
        schemaId: '',
        sort: '',
      }
      this.datasourceList = []
      this.schemaList = []
      this.getList()
    },
    handleChange(selection) {
      this.selections = selection
    },
    clearTableList() {
      this.$nextTick(() => {
        this.$refs.ruleTable.clearSelection()
      })
    },
    sortChange(data) {
      this.form.sort = data.order
      this.form.currentPage = 1
      this.getList()
    },
    toDetail(row) {
      let params = {}
      switch (row.typeId) {
        case 80000005: // 数据项
          params = {
            name: 'dataCatalogForDDC',
            query: {
              objectId: row.objectId,
              blank: true,
              isAssets: true,
            },
          }
          break
        case 80000004: // 表
          params = {
            name: 'dataCatalogForDDC',
            query: {
              objectId: row.objectId,
              type: 'TABLE',
              blank: true,
              isAssets: true,
            },
          }
          break
        case 80500008: // 视图
          params = {
            name: 'dataCatalogForDDC',
            query: {
              objectId: row.objectId,
              type: 'VIEW',
              blank: true,
              isAssets: true,
            },
          }
          break
        default:
          break
      }
      dumpMetaDetail(this, params)
    },
    handlePageChange(val) {
      this.form.currentPage = val
      this.getList()
    },
    handleSizeChange(val) {
      this.form.pageSize = val
      this.form.currentPage = 1
      this.getList()
    },
  },
}
</script>

<style scoped lang="scss">
.left-btn {
  position: absolute;
  left: 0;
  height: 100%;
  width: 600px;
  padding-left: 20px;
}
.mapping-data-page {
  .table-box {
    position: absolute;
    top: 54px;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
