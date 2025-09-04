<template>
  <div id="data-source" class="tab-page tabPageAbs">
    <datablau-filter-row>
      <datablau-input
        :iconfont-state="true"
        :placeholder="$t('meta.DS.allSource.dataSourceName')"
        v-model="filterForm.modelName"
        style="display: inline-block"
        clearable
      ></datablau-input>
      <span class="label-info">
        {{ $t('meta.DS.allSource.businessSystem') }}：
      </span>
      <datablau-select-weak
        style="display: inline-block"
        clearable
        filterable
        @change="handleChange"
        v-model="filterForm.categoryId"
        :optionsData="{
          data: optionsData,
          key: 'categoryId',
          value: 'categoryId',
          label: 'categoryName',
        }"
      >
        <!-- <el-option
          v-for="item in optionsData"
          :key="item.categoryId"
          :label="
            item.categoryId === 0
              ? item.categoryName
              : item.categoryName + '(' + item.categoryAbbreviation + ')'
          "
          :value="item.categoryId"
          :disabled="item.disabled"
        ></el-option> -->
        <el-option :label="123"></el-option>
      </datablau-select-weak>
      <div class="right-btn"></div>
    </datablau-filter-row>
    <div class="table-row">
      <datablau-table
        class="datablau-table-info"
        ref="dsTable"
        :data="displayData"
        :key="dsDataKey"
        height="100%"
        :header-cell-class-name="cellClass"
        highlight-current-row
        @sort-change="handleSortChange"
        :checkDisabledObj="checkDisabledObj"
        :border="option.columnResizable"
      >
        <el-table-column
          :width="$i18n.locale === 'zh' ? '' : 140"
          :label="$t('meta.DS.allSource.dataSourceName')"
          prop="definition"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.DS.allSource.dataBase')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <!-- {{ scope.row.type }} -->
            <database-type
              :key="scope.row.type"
              :value="scope.row.type"
              :size="24"
            ></database-type>
          </template>
        </el-table-column>
        <el-table-column
          prop="categoryName"
          :width="$i18n.locale === 'zh' ? '120' : 140"
          :label="$t('meta.DS.allSource.businessSystem')"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          prop="tableCount"
          :width="$i18n.locale === 'zh' ? 90 : 120"
          :label="$t('meta.DS.allSource.tableCount')"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          prop="columnCount"
          sortable="custom"
          :width="$i18n.locale === 'zh' ? 100 : 130"
          :label="$t('meta.DS.allSource.columnCount')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="monthUpdateCount"
          :width="$i18n.locale === 'zh' ? 160 : 180"
          sortable="custom"
          :label="$t('meta.DS.allSource.monthUpdateCount')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :width="$i18n.locale === 'zh' ? '' : 100"
          prop="businessOrg"
          :label="$t('meta.DS.allSource.buDep')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="itOrg"
          sortable="custom"
          min-width="100"
          :label="$t('meta.DS.allSource.techDep')"
          show-overflow-tooltip
        ></el-table-column>

        <el-table-column
          :label="$t('meta.DS.allSource.operation')"
          width="150"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <div class="tool" v-if="scope.row.modelId !== 'fake'">
              <datablau-button
                low-key
                type="icon"
                title="版本"
                class="btn-in-table-info"
                @click="newOpenModelHistory(scope.row)"
              >
                <i class="iconfont icon-banben"></i>
              </datablau-button>
              <datablau-subscribe
                type-id="80010001"
                :key="scope.row.modelId"
                :object-name="scope.row.definition"
                :object-id="scope.row.modelId"
                class="btn-in-table-info"
                display-type="icon"
              ></datablau-subscribe>
              <el-dropdown @command="commandHandle(...arguments, scope.row)">
                <datablau-button
                  low-key
                  type="icon"
                  :title="$t('common.button.more')"
                  class="btn-in-table-info"
                >
                  <i class="el-icon-more"></i>
                </datablau-button>
                <el-dropdown-menu slot="dropdown" class="drop-menu-info">
                  <!--<el-dropdown-item
                    :command="openModelCompare(scope.row, 'openModelCompare')"
                  >
                    {{ $t('meta.DS.allSource.metaDataDiff') }}
                  </el-dropdown-item>-->
                  <el-dropdown-item
                    v-if="$versionFeature['metadata_ModelCompare']"
                    :command="
                      openModelCompareJob(scope.row, 'openModelCompareJob')
                    "
                  >
                    {{ $t('meta.DS.allSource.modelDiffAndSync') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    :divided="$versionFeature['metadata_ModelCompare']"
                    :command="openModelHistory(scope.row, 'openModelHistory')"
                  >
                    {{ $t('meta.DS.allSource.changeHistory') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    divided
                    :command="updateExport(scope.row, 'export')"
                  >
                    {{ $t('meta.DS.allSource.exportMetadata') }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="update(scope.row, 'update')">
                    {{ $t('meta.DS.allSource.updateMetadata') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <i v-else class="el-icon-loading"></i>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="footer-row">
      <datablau-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import DatabaseType from '@/components/dataSource/DatabaseType.vue'

import HTTP from '@/http/main'
import DatablauSelect from '@/next/components/basic/select/DatablauSelect.vue'
const moment = require('moment')
export default {
  data() {
    this.BASE_URL = this.$url + '/service/'
    this.uploadHost = this.BASE_URL + 'upload'
    const accessModelCompare = this.$ddmConnectable
    return {
      sortMap: {},
      filterForm: {
        modelName: '',
        categoryId: 0,
      },
      vloading: false,
      optionsData: [],
      accessModelCompare: accessModelCompare,
      // 显示table
      selection: [],
      selectCal: 0,
      deltaData: [],
      allData: [],
      total: 0,
      dsData: [], // 过滤后的数组
      dsDataKey: 0,
      testBtnKey: 0,
      displayData: null,
      keyword: '',
      keywordFilterProps: ['definition', 'type', 'categoryName'],
      emptyPara: {
        keyword: '',
        currentPage: 1,
        sortData: {
          prop: '',
          order: 'ascending',
        },
        pageSize: 20,
      },
      sortData: {
        prop: '',
        order: 'ascending',
      },
      loadingDS: true,
      deleteDisabled: true,
      currentRow: null,
      tableHeight: undefined,
      showTable: false,
      currentPage: 1,
      pageSize: 20,

      // 修改,添加 数据源
      schemaSelected: [],
      isEditing: false,
      dsform: {},
      updateDataSource: false,
      autoSetJob: {
        modelId: '',
        modelName: '',
      },
      currentModelId: null,
      expandRowKeys: [],
      mutipleLength: 0,
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      checkDisabledObj: {
        modelId: ['fake'],
      },
    }
  },
  props: {},

  components: { DatabaseType, DatablauSelect },

  computed: {
    isFileData() {
      var self = this
      var ds = self.dsform
      return (
        ds.dbtype == 'CSV' ||
        ds.dbtype == 'EXCEL' ||
        ds.dbtype == 'DATADICTIONARY' ||
        ds.dbtype == 'DATADICTIONARY_LOGICAL' ||
        ds.dbtype == 'TABLEAU'
      )
    },
  },
  beforeMount() {
    this.optionsData = [
      {
        categoryName: this.$t('meta.DS.allSource.allSystem'),
        categoryId: 0,
      },
      ...this.$modelCategories,
    ]
  },
  mounted() {
    this.getTableData()
  },
  beforeDestroy() {},

  methods: {
    cellClass(row) {
      if (row.columnIndex === 0) {
        return 'disableheadselection'
      }
    },
    commandHandle(commandData) {
      let command = commandData.command
      let data = commandData.data
      data.id = commandData.data.modelId
      if (command === 'export') {
        this.export(data)
      } else if (command === 'update') {
        this.newUpdate(data)
      } else if (command === 'openModelCompareJob') {
        this.newOpenModelCompareJob(data)
      } else if (command === 'openModelHistory') {
        this.newOpenModelHistory(data)
      } else if (command === 'openModelCompare') {
        this.newOpenModelCompare(data)
      }
    },
    export(data) {
      let schema =
        data.connectionInfo.schemas?.split(';') ||
        data.connectionInfo.database?.split(';') ||
        []
      let schemaArr = []
      if (schema.length) {
        schema.forEach(s => {
          schemaArr.push({ name: s })
        })
      }
      this.$emit('showModelExport', data.id, schemaArr)
    },
    newUpdate(data) {
      this.$emit('showUpdate', data)
    },
    newOpenModelCompareJob(data) {
      if (!this.$ddmConnectable) {
        this.$message.warning(this.$t('meta.DS.message.notEnabledDDM'))
        return
      }
      if (data.notLoaded) {
        this.$message.warning('尚未抽取元数据')
        return
      }
      if (data.id) {
        this.$emit('showModelCompareJob', data)
      } else {
        let item = this.selection[0]
        item.id = item.modelId
        item.name = item.definition
        this.$emit('showModelCompareJob', item)
      }
    },
    newOpenModelHistory(data) {
      data.id = data.modelId
      data.name = data.definition
      this.$emit('showModelHistory', data)
    },
    newOpenModelCompare(data) {
      if (data.id) {
        this.$emit('showModelCompare', data)
      } else {
        let arr = this.selection.map(item => {
          item.id = item.modelId
          item.name = item.definition
          return item
        })
        if (arr.length == 1) {
          this.$emit('showModelCompare', arr[0])
        } else {
          this.$emit('showModelCompare', arr)
        }
      }
    },
    updateExport(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    update(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    openModelCompareJob(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    openModelHistory(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    handleChange(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    openModelCompare(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    /** 响应事件 */
    // 分页 设置
    handleSizeChange(size) {
      this.pageSize = size
      this.getTableData()
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.getTableData()
    },
    handleSortChange(sortData) {
      if (!sortData.order) {
        this.sortMap = {}
      } else {
        this.sortMap = {}
        this.sortMap[sortData.prop] =
          sortData.order === 'ascending'
            ? 'ASC'
            : sortData.order === 'descending'
            ? 'DESC'
            : ''
      }
      this.getTableData()

      /* this.sortData = sortData
      // sortData = {column, prop, order}
      const obj = {
        sortData: {
          prop: sortData.prop,
          order: sortData.order,
        },
        keyword: this.keyword,
        currentPage: 1,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj) */
    },

    handleSelectionChange(val) {
      if (val.length > 2) {
        let del_row = val.shift()
        this.$refs.dsTable.onlyTwoChange(del_row)
      }
      this.selection = val
      this.mutipleLength = val.length
      this.deleteDisabled = this.selection.length == 0
    },
    callOptionsMenu(row, evt) {
      this.currentModelId = row.modelId
      const x = evt.clientX
      const y = evt.clientY
      const options = []
      // if(this.$featureMap['FE_META']){
      //   options.push({
      //     label:'导出元数据',
      //     callback:()=>{
      //       this.downloadMetadata(row);
      //     }
      //   })
      // }
      // if(this.$featureMap['FE_META']&&!this.isFileItem(row)) {
      //   options.push({
      //     label: '更新元数据',
      //     callback: () => {
      //       let ref = this.$refs.refreshMeta;
      //       ref.$el.click();
      //     }
      //   });
      // }
      // if (this.$featureMap.FE_META && this.$ddmConnectable) {
      //   options.push({
      //     label: '比较任务',
      //     callback: () => {
      //       this.goToJob(row, 2)
      //     },
      //   })
      // }
      // if (this.$featureMap.FE_META) {
      //   options.push({
      //     label: '更新任务',
      //     callback: () => {
      //       this.goToJob(row, 1)
      //     },
      //   })
      // }
      /* options.push({
        label: this.$t('meta.DS.allSource.metaDataDiff'),
        callback: () => {
          this.goToJob(row, 2)
        },
      }) */
      if (this.$versionFeature.metadata_ModelCompare) {
        options.push({
          label: this.$t('meta.DS.allSource.modelDiffAndSync'),
          callback: () => {
            this.goToJob(row, 2)
          },
        })
      }

      options.push({
        label: this.$t('meta.DS.allSource.changeHistory'),
        callback: () => {
          this.goToJob(row, 2)
        },
      })
      options.push({
        label: this.$t('meta.DS.allSource.exportMetadata'),
        callback: () => {
          this.goToJob(row, 2)
        },
      })
      options.push({
        label: this.$t('meta.DS.allSource.updateMetadata'),
        callback: () => {
          this.goToJob(row, 2)
        },
      })
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options,
        isLeft: true,
        placement: 'bottom-left',
      })
    },
    handleCreated() {
      this.dialogCrVdsVisible = false
    },
    downloadMetadata(row) {
      this.$emit('downloadMetadata', row.modelId)
    },
    handleRefresh(index, row) {
      // deprecated
      /* const self = this;
      row.isRefreshing = true;
      this.dsDataKey++;
      self.$http
        .get(self.BASE_URL + "models/" + row.modelId + "/delta")
        .then(res => {
          this.deltaData = res.data;
          row.isRefreshing = false;
          if (!res.data.changedObjects) {
            this.$message.success("模型无变化");
            this.dsDataKey++;
          } else {
            self.innerLoadDataSources();
            this.dialogShowDifferenceVisible = true;
            self.showSuccess("更新数据源成功");
            this.dsDataKey++;
          }
        })
        .catch(e => {
          row.isRefreshing = false;
          this.$showFailure(e);
        }); */
    },
    goToJob(row, jobType) {
      this.$router.push({
        name: 'jobManagement',
        query: { dataSourceId: row.modelId, jobType: jobType },
      })
    },
    showBegain() {
      this.uploading = true
      this.$bus.$emit('showUploadProgress', {
        name: this.$t('meta.DS.allSource.updateMetadata'),
        time: 10,
      })
    },
    handleUpdateMetadataSuccess() {
      this.$bus.$emit('changeUploadProgress', true)
    },
    handleUpdateMetadataError(err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(err)
    },
    handleTest(row, index) {
      this.$http
        .get(this.BASE_URL + 'models/connection/test/' + row.modelId)
        .then(res => {
          row.isError = false
          row.isSuccess = true
          this.testBtnKey++
        })
        .catch(e => {
          row.isSuccess = false
          row.isError = true
          this.testBtnKey++
          this.$showFailure(e)
        })
    },
    getTableData() {
      this.vloading = true
      let requestBody = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        modelName: _.trim(this.filterForm.modelName.toLowerCase()),
        categoryId:
          this.filterForm.categoryId === 0 ? '' : this.filterForm.categoryId,
      }
      if (Object.keys(this.sortMap).length > 0) {
        requestBody.sortMap = this.sortMap
      }
      this.$http
        .post(this.BASE_URL + 'models/fromre/page', requestBody)
        .then(res => {
          this.vloading = false
          this.total = res.data.totalItems
          this.displayData = res.data.content || []
        })
        .catch(e => {
          this.vloading = false
          this.$blauShowFailure(e)
        })
    },

    /** 处理显示的数据 */
    parameterFormat: function (row) {
      return JSON.stringify(row.connectionInfo.parameterMap)
    },
    resizeTable() {
      this.$nextTick(() => {
        this.tableHeight = $('.table-row')[0].offsetHeight || this.tableHeight
        this.dsDataKey++
      })
    },
    changeDSDisplay(para, allData) {
      allData = allData || this.displayData
      const arr = []
      if (!para) {
        para = _.clone(this.emptyPara)
        para.pageSize = this.pageSize
        para.keyword = this.keyword
        this.currentPage = para.currentPage
      }
      para.keyword = para.keyword || this.keyword
      const keyword = para.keyword.trim().toLowerCase()
      allData.forEach(item => {
        let bool = false
        this.keywordFilterProps.forEach(prop => {
          if (item[prop] && item[prop].toLowerCase().indexOf(keyword) !== -1) {
            bool = true
          }
        })
        if (bool) {
          arr.push(item)
        }
      })
      this.total = arr.length
      this.dsData = arr
      if (para.sortData && para.sortData.prop) {
        const order =
          para.sortData.order !== 'descending' ? 'ascending' : 'descending'
        this.$utils.sort.sortConsiderChineseNumber(
          arr,
          para.sortData.prop,
          order
        )
      }
      localStorage.setItem('arr', JSON.stringify(arr))
      const currentPage = para.currentPage || 1 // 任意其它条件改变, currentPage 变为 1
      const pageSize = para.pageSize || this.pageSize
      this.displayData = arr.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )

      this.loadingDS = false
    },

    /** 处理不显示的数据 */
    isOracle() {
      const ds = this.dsform
      return ds.dbtype === 'ORACLE'
    },
    versionFormat: function (row) {
      return row.connectionInfo.versioning
        ? this.$t('meta.common.true')
        : this.$t('meta.common.false')
    },
    // 操作 table 数据
    deleteCurrentRow(row, callback) {
      var self = this
      this.$http
        .delete(self.BASE_URL + 'models/' + row.modelId)
        .then(res => {
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          this.innerLoadDataSources()
          this.loadingDS = false
        })
    },
    showSuccess(msg) {
      this.$message({
        title: 'Success',
        message: msg,
        type: 'success',
      })
    },
    refreshDataSourceList() {
      HTTP.refreshDataSource()
    },

    checkREProgress(jobId) {
      this.innerLoadDataSources()
      const self = this
      if (jobId) {
        this.$dataSource.interval[jobId] = setInterval(() => {
          self.checkREProgressStep(jobId)
        }, 3000)
        window.localStorage.setItem(
          'dataSourcesOf' + this.$user.username,
          JSON.stringify(this.$dataSource)
        )
      } else {
        const local = window.localStorage.getItem(
          'dataSourcesOf' + this.$user.username
        )
        if (local) {
          this.$dataSource = JSON.parse(
            window.localStorage.getItem('dataSourcesOf' + this.$user.username)
          )
        }
        const keys = Object.keys(this.$dataSource.interval)
        keys.forEach(jobId => {
          this.$dataSource.interval[jobId] = setInterval(() => {
            self.checkREProgressStep(jobId)
          }, 1000)
        })
        window.localStorage.setItem(
          'dataSourcesOf' + this.$user.username,
          JSON.stringify(this.$dataSource)
        )
        if (keys.length == 0) {
        }
      }
    },
    checkREProgressStep(jobId) {
      const jobInfo = {
        jobId: jobId,
        type: 'datasource',
      }
      this.$addIntervalArr(jobInfo)
      if (this.$dataSource.fakeData.type) {
        this.$http
          .get(this.BASE_URL + 'models/re/' + jobId + '/progress')
          .then(res => {
            if (res.data.percentage === 100 || !!res.data.exception) {
              this.updateDataSource = false
              clearInterval(this.$dataSource.interval[jobId])
              this.$dataSource.interval = {}
              this.$dataSource.fakeData = {}
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.innerLoadDataSources()
              if (new Date().getTime() - this.lastLoadTimeStamp > 1000) {
                this.lastLoadTimeStamp = new Date().getTime()
              }
              this.$removeIntervalArr(jobInfo)
            } else if (!res.data) {
              this.updateDataSource = false
              clearInterval(this.$dataSource.interval[jobId])
              this.$dataSource.interval = {}
              this.$dataSource.fakeData = {}
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.innerLoadDataSources()
              this.$removeIntervalArr(jobInfo)
            }

            const data = res.data
            this.$saveJobHistory({
              name: '',
              jobStatus:
                data.stopped || data.percentage === 100 || !!data.exception
                  ? 'FINISHED'
                  : 'RUNNING',
              jobId: jobId,
              jobName: '',
              errorMessage: '',
              result: data.message,
              startTime: '',
              endTime: data.timestamp,
              objType: '',
              jobType: 'dataSource',
              progress: data.percentage,
            })
          })
          .catch(e => {
            this.$showFailure(e)
            this.updateDataSource = false
            clearInterval(this.$dataSource.interval[jobId])
            this.$dataSource.interval = {}
            this.$dataSource.fakeData = {}
            window.localStorage.setItem(
              'dataSourcesOf' + this.$user.username,
              JSON.stringify(this.$dataSource)
            )
            this.innerLoadDataSources()
          })
      }
    },
    innerLoadDataSources() {
      var self = this
      self.loadingDS = true
      this.refreshDataSourceList()
      HTTP.getAllDataSource()
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          this.$utils.sort.sortConsiderChineseNumber(
            res.data,
            'creationTime',
            'descending'
          )
          self.allData = res.data
          if (this.$dataSource.fakeData && this.$dataSource.fakeData.type) {
            self.allData.unshift(this.$dataSource.fakeData)
          }
          if (this.keyword === '') {
            self.changeDSDisplay()
          } else {
            this.keyword = ''
          }
          this.openTabByQuery()
        })
        .catch(e => {
          this.loadingDS = false
          this.$showFailure(e)
        })
    },
  },
  watch: {
    filterForm: {
      deep: true,
      handler: function () {
        this.getTableData()
      },
      // const obj = {
      //   keyword: newVal,
      //   currentPage: 1,
      //   sortData: this.sortData,
      //   pageSize: this.pageSize,
      // }
      // this.currentPage = 1
    },
  },
}
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
.tab-page {
  .label-info {
    margin: 0 10px 0 20px;
    font-size: 14px;
  }
  .right-btn {
    display: inline-block;
    float: right;
    margin-right: 20px;
    height: 34px;
    .is-block {
      line-height: 34px;
    }
  }
  .footer-row {
    right: 0;
    left: 0;
    bottom: 0;
    height: 50px;
    padding-top: 8px;
    padding-right: 20px;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    z-index: 3;
  }
}
.table-row {
  margin: 0 20px;
  // border-bottom: 1px solid var(--border-color-lighter);
  .datablau-table-info {
    height: 100%;
  }
  .drop-menu-info {
    margin-top: 2px;
  }
  .btn-in-table-info {
    margin-right: 8px;
  }
  /deep/ .disableheadselection > .cell .el-checkbox__inner {
    display: none;
  }
}
</style>
