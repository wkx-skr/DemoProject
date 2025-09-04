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
              placeholder="搜索数据资产名称、信息项名称"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="'业务系统'">
            <datablau-select
              style="width: 160px"
              v-model="form.systemId"
              filterable
              clearable
              @change="handleSystemChange"
              placeholder="请选择业务系统"
            >
              <el-option
                v-for="item in systemList"
                :key="item.categoryId"
                :label="item.categoryName"
                :value="item.categoryId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="'数据源'">
            <datablau-select
              style="width: 160px"
              clearable
              v-model="form.datasourceId"
              filterable
              @change="handleDatasourceChange"
              placeholder="请选择数据源"
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
              placeholder="请选择schema"
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
              查询
            </datablau-button>
            <datablau-button type="secondary" @click="resetForm('form')">
              重置
            </datablau-button>
          </el-form-item>
        </el-form>
        <template slot="buttons">
          <datablau-button
            v-if="hasManageAuth"
            class="iconfont icon-xinxi"
            type="important"
            @click="handlerTool"
          >
            敏感数据管理
          </datablau-button>
        </template>
      </datablau-list-search>
    </div>
    <div class="table-box" :style="{ top: top + 'px' }">
      <datablau-form-submit>
        <datablau-table
          v-loading="loading"
          :data-selectable="false"
          :show-column-selection="false"
          height="100%"
          :default-sort="{ prop: 'dataAssetName', order: form.sort }"
          ref="ruleTable"
          @selection-change="handleChange"
          @sort-change="sortChange"
          :data="tableList"
        >
          <el-table-column width="28">
            <template slot-scope="scope">
              <datablau-icon
                :data-type="getIcon(scope.row.typeId)"
                :size="20"
                style="position: relative; top: 3px"
              ></datablau-icon>
            </template>
          </el-table-column>
          <el-table-column
            :label="'数据资产名称'"
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
            :label="'信息项名称'"
            prop="authItemFrom"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'权威来源'"
            prop="dataSource"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ getDataSource(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="'所属安全分类目录'"
            prop="catalogPathName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'安全等级'"
            prop="authLevelName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'影响范围'"
            prop="scopeName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'影响程度'"
            prop="impactName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'影响对象'"
            prop="influenceObjectName"
            :min-width="minScreen ? 80 : 120"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'操作'"
            :width="100"
            align="center"
            fixed="right"
            prop="operation"
          >
            <template slot-scope="scope">
              <datablau-button
                type="icon"
                :tooltip-content="'查看'"
                class="iconfont icon-see"
                @click="toDetail(scope.row)"
              ></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
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
import {
  AttrsTypeEnum,
  assetsTypeEnum,
} from '@/view/dataSecurity/util/attrEnum'
export default {
  props: {
    hasManageAuth: Boolean,
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
        schemaId: '',
        sort: '',
      },
      systemList: [],
      datasourceList: [],
      schemaList: [],
      selections: [],
      tableList: null,
      total: 0,
    }
  },
  watch: {
    heightCatalog: {
      handler(val) {
        this.getList()
      },
      immediate: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initData()
    })
  },
  methods: {
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
          result = '人工盘点'
          style = 'color: #409EFF;background: rgba(64,158,255,0.1)'
          break
        case 'DATA_IDENTIFICATION': // 数据识别
          result = '数据识别'
          style = 'color: #8C5DFE;background: rgba(140,93,254,0.1)'
          break
        case 'BATCH_IMPORT': // 批量导入
          result = '批量导入'
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
        case 80000004: // 数据表
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
      this.schemaList = []
      this.form.datasourceId = ''
      this.form.schemaId = ''
      if (id) {
        this.getDatasourceList(id)
      }
    },
    // 获取数据源
    getDatasourceList(id) {
      API.getDataSourceList(id).then(res => {
        this.datasourceList = res.data.data || []
      })
    },
    handleDatasourceChange(id) {
      this.getSchemaList(id)
    },
    getDataSource(row) {
      let result = ''
      switch (row.typeId) {
        case 80000005: // 数据项
          result = `${row.dataSource}/${row.schema}/${row.tableName}`
          break
        case 80000004: // 数据表
        case 80500008: // 视图
          result = `${row.dataSource}/${row.schema}`
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
        schema: this.form.schemaId,
        orderBy: 'dataAssetName',
        seq: this.form.sort === 'descending' ? 'DESC' : 'ASC',
      }
      API.getInfoItemList(this.heightCatalog.id, params)
        .then(res => {
          this.loading = false
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
    domResize() {
      this.$nextTick(() => {
        const searchBox = this.$refs.searchBox
        this.top = $(searchBox).height() + 10
      })
    },
    handlerTool() {
      this.$router.push({
        name: 'coordinationClassification',
      })
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
    sortChange(data) {
      this.form.sort = data.order
      this.form.currentPage = 1
      this.getList()
    },
    toDetail(row) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      let url = ''
      switch (row.typeId) {
        case 80000005: // 数据项
          url = `main/meta?objectId=${row.objectId}&blank=true&isAssets=true`
          break
        case 80000004: // 数据表
          url = `myItem?objectId=${row.objectId}&type=TABLE&blank=true&isAssets=true`
          break
        case 80500008: // 视图
          url = `myItem?objectId=${row.objectId}&type=VIEW&blank=true&isAssets=true`
          break
        default:
          break
      }
      window.open(baseUrl + url)
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
