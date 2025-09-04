<template>
  <div
    id="lineage"
    class="tab-page tab-page-ver2"
    :class="{ catalogueScan: catalogueScan }"
  >
    <el-dialog
      :title="$t('meta.lineageManage.taskLog')"
      :visible.sync="showHistory"
      :append-to-body="true"
      width="1000px"
      class="edit-synonyms-dia"
    >
      <job-history type="lineage" v-if="showHistory"></job-history>
    </el-dialog>
    <div class="filter-row">
      <datablau-input
        style="display: inline-block; margin-left: 20px"
        :placeholder="$t('meta.lineageManage.searchPlaceholder1')"
        v-model="keyword"
        :iconfont-state="true"
        :clearable="true"
      ></datablau-input>
      <div class="row-inner" v-if="!lineageFilter">
        <div class="rightButton">
          <datablau-button
            v-if="catalogueScan"
            @click="refreshList"
            type="secondary"
          >
            <i class="el-icon-refresh"></i>
            {{ $t('meta.lineageManage.reload') }}
          </datablau-button>
          <datablau-button v-if="folderId" @click="scanCategoryLineage">
            {{ $t('meta.lineageManage.scanCategoryLineage') }}
          </datablau-button>
          <datablau-button
            class="fa fa-history"
            v-if="hasHistory || $showSimpleJobHistory.lineage"
            size="small"
            @click="showHistory = true"
          >
            {{ $t('meta.lineageManage.taskLog') }}
          </datablau-button>
          <el-tooltip
            :content="$t('meta.lineageManage.historyTips')"
            placement="bottom"
            v-if="hasHistory || $showSimpleJobHistory.lineage"
            effect="light"
          >
            <i class="el-icon-info" style="margin: 10px 10px 0 0"></i>
          </el-tooltip>
          <datablau-button
            type="secondary"
            class="iconfont icon-upload"
            style="margin-right: 6px"
            @click="uploadFile"
            v-if="hasAccess"
          >
            {{ $t('meta.lineageManage.importLineageFile') }}
          </datablau-button>
          <el-dropdown v-if="hasAccess">
            <datablau-button
              type="secondary"
              class="iconfont icon-download"
              style="font-size: 12px"
            >
              {{ $t('meta.lineageManage.downloadLineageTemp') }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="checkSources" style="font-size: 12px">
                  {{ $t('meta.lineageManage.excelLineageTemp') }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div
                  @click="downloadGeneralSqlTemplate"
                  style="font-size: 12px"
                >
                  {{ $t('meta.lineageManage.sqlTemp') }}
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
    <datablau-form-submit style="margin-top: 40px">
      <datablau-table
        :data="tableData"
        class="datablau-table"
        height="100%"
        :checkDisabledObj="checkDisabledObj"
        show-overflow-tooltip
        @selection-change="handleSelectionChange"
        @filter-change="filterHandler"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
      >
        <!-- <el-table-column
          type="selection"
          width="55"
          v-if="hasAccess"
          :selectable="isCreater"
        ></el-table-column> -->
        <!-- <el-table-column width="20" v-else></el-table-column> -->
        <el-table-column width="28">
          <datablau-icon
            :data-type="'lineagefile'"
            :size="18"
            style="margin-top: 8px; margin-left: 5px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          :label="$t('meta.lineageManage.OriginalFileName')"
          prop="filename"
          :min-width="200"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :min-width="150"
          :label="$t('meta.lineageManage.desc')"
          prop="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.lineageManage.uploadTime')"
          :default-sort="{ prop: 'date', order: 'descending' }"
          prop="timestamp"
          :min-width="180"
          :formatter="$timeFormatter"
        >
          <!-- <template slot-scope="scope">
            {{new Date(scope.row.timestamp).toLocaleString()}}
          </template> -->
        </el-table-column>
        <el-table-column
          :min-width="200"
          :label="$t('meta.lineageManage.type')"
          :filters="typeFilterArr"
          prop="typeName"
          column-key="fileTypeFilter"
          show-overflow-tooltip
        ></el-table-column>
        <!-- :filter-method="fileTypeFilterHandler"  -->
        <el-table-column
          :min-width="180"
          :label="$t('meta.lineageManage.uploader')"
          :filters="[
            { text: $t('meta.lineageManage.onlySelf'), value: 'self' },
          ]"
          prop="creator"
          column-key="creatorFilter"
          show-overflow-tooltip
        ></el-table-column>
        <!-- :filter-method="creatorFilterHandler"  -->
        <el-table-column
          :label="$t('meta.lineageManage.operation')"
          ref="check"
          header-align="center"
          align="right"
          fixed="right"
          :min-width="$i18n.locale === 'zh' ? 330 : 280"
        >
          <template slot-scope="scope">
            <i v-if="scope.row.id === 'fake'" class="el-icon-loading"></i>
            <span v-else-if="scope.row.id !== 'fake'">
              <span v-if="scope.row.status === 1">
                <datablau-button
                  class="operation-text-btn"
                  type="text"
                  @click="browse(scope.row)"
                  size="small"
                >
                  {{ $t('common.button.scan') }}
                </datablau-button>
                <datablau-button
                  class="operation-text-btn"
                  type="text"
                  @click="browseWithEdit(scope.row)"
                  :disabled="!hasAccess || !scope.row.objectLineageId"
                  size="small"
                >
                  {{ $t('common.button.edit') }}
                </datablau-button>
              </span>
              <span v-else style="margin-right: 20px">
                <datablau-tooltip
                  :content="
                    $versionFeature['metadata_ScriptManagement']
                      ? '解析失败，下载原始文件和预处理脚本将有助于找到失败原因。'
                      : '解析失败，下载原始文件将有助于找到失败原因。'
                  "
                  placement="right"
                >
                  <i class="iconfont icon-tips"></i>
                </datablau-tooltip>
                解析失败
              </span>
              <datablau-button
                class="operation-text-btn"
                type="text"
                @click="downloadLineageFile(scope.row)"
                :disabled="!hasAccess || !scope.row.fileFieldId"
                size="small"
              >
                {{ $t('meta.lineageManage.downloadSourceFile') }}
              </datablau-button>
              <datablau-button
                v-if="$versionFeature['metadata_ScriptManagement']"
                class="operation-text-btn"
                type="text"
                @click="downloadPreprocessedFile(scope.row)"
                :disabled="!hasAccess || !scope.row.preprocessedFileId"
                size="small"
              >
                {{ $t('meta.lineageManage.downloadPreprocessedFile') }}
              </datablau-button>
              <datablau-button
                class="operation-text-btn"
                type="text"
                @click="updataLineage(scope.row)"
                :title-todo="
                  isSqlType(scope.row)
                    ? $t('meta.lineageManage.noUpdateTips')
                    : ''
                "
                :disabled="
                  !hasAccess || !isCreater(scope.row) || isSqlType(scope.row)
                "
                size="small"
              >
                {{ $t('meta.lineageManage.update') }}
              </datablau-button>
            </span>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button" v-show="mutipleLength">
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{
              this.$t('meta.DS.metaTable.exportTips', {
                exportNum: mutipleLength,
              })
            }}
          </span>
          <datablau-button
            class="el-icon-delete"
            v-show="mutipleLength"
            :disabled="!hasAccess"
            type="danger"
            size="small"
            @click="deleteRow"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalShow"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <div class="footer-row"></div>
  </div>
</template>

<script>
import sourceSelect from '../../components/dataCatalog/sourceSelect.vue'
import jobHistory from '@/components/common/simpleJobHistory.vue'

export default {
  components: { sourceSelect, jobHistory },
  props: ['src', 'dst', 'folderId', 'folderName', 'catalogueScan'],
  data() {
    let lineageUrl = this.$meta_url + '/lineage/imported'
    return {
      checkedSources: [],
      data: {
        sourceData: [],
      },
      hasAccess: this.$auth.BLODD_FILE,
      interval: null,
      lineageDialog: {
        visible: false,
        title: '',
        data: [],
        loading: false,
        checkList: [],
      },
      keyword: '',
      pageSize: 20,
      currentPage: 1,
      tableData: null,
      tableHeight: undefined,
      deleteDisabled: true,
      onUpload: false,
      fakeData: {},
      deleteId: null,
      fileTypeFilter: [],
      creatorFilter: '',
      total: 0,
      totalShow: 0,
      showSystemSetting: false,
      lineageUrl: lineageUrl,
      showHistory: false,
      hasHistory: false,
      lastDataLength: undefined,
      timer: 'first', // 控制从后台调取table数据,设置成 first 直接调用
      selection: [],
      types: [],
      typeFilterArr: [],
      lineageTypesMap: {},
      jobStartTimeMap: new Map(),
      mutipleLength: 0,
      option: {
        selectable: !this.catalogueScan ? this.$auth.BLODD_FILE : false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      checkDisabledObj: {
        creator: [this.$user.username],
        process_inverse: true,
      },
    }
  },
  beforeMount() {
    let lineageUrl = this.$meta_url + '/lineage/imported'
    if (this.src && this.dst) {
      const para = this.$route.query
      let type = para.type || 'cat'
      let typeFormatter = ''
      switch (type) {
        case 'cat':
          typeFormatter = 'Cat'
          break
        case 'table':
          typeFormatter = 'Table'
          break
        case 'ddm':
          typeFormatter = 'Ddm'
          break
        case 'model':
          typeFormatter = 'Mmodel'
          break
        default:
          typeFormatter = 'Cat'
      }
      lineageUrl = `${lineageUrl}?src${typeFormatter}Id=${this.src}&dst${typeFormatter}Id=${this.dst}`
    }
    this.lineageUrl = lineageUrl
  },
  mounted() {
    if (this.$user && this.$user.username === 'admin') {
      this.showSystemSetting = this.$isAdmin
    }
    this.getLineageType().then(_ => {
      this.tableDatInit()
    })
    this.$bus.$on('onUploadSuccess', (response, para) => {
      this.uploadSuccess(response, para)
    })
    this.$bus.$on('lineageTabOntop', () => {
      this.$nextTick(() => {
        this.getTableData()
      })
    })
    this.$bus.$on('deletLineage', id => {
      this.deleteId = id
    })
    this.$bus.$on('updateLineageJobStatus', ({ jobId, timer }) => {
      if (timer) {
        clearTimeout(timer)
      }
      this.getJobStatus(jobId)
    })
  },
  beforeDestroy() {
    this.$bus.$off('onUploadSuccess')
    this.$bus.$off('lineageTabOntop')
    this.$bus.$off('deletLineage')
    this.$bus.$off('updateLineageJobStatus')
  },
  methods: {
    arrToMap(arr, key) {
      return new Map(arr.map(item => [item[key], item]))
    },
    async getLineageType() {
      await this.$http
        .post(`${this.$meta_url}/lineage/getLineageTypeInfos`)
        .then(res => {
          this.types = res.data
          this.typeFilterArr = res.data.map(d => {
            return {
              text: d.displayName,
              value: d.type,
            }
          })
          if (res.data.length) {
            this.lineageTypesMap = this.arrToMap(res.data, 'type')
          }
        })
        .catch(err => {
          this.typeFilterArr = []
        })
    },
    refreshList() {
      this.getTableData()
    },
    scanCategoryLineage() {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl +
          'lineageDemo?folderId=' +
          this.folderId +
          '&filename=' +
          encodeURIComponent(this.folderName) +
          '&name=' +
          encodeURIComponent(this.folderName) +
          '&writable=false&blank=true',
        '_blank'
      )
    },
    isCreater(row, index) {
      return row.creator === this.$user.username
    },
    isSqlType(row) {
      return row && row.type && row.type === 'SQL'
    },
    updataLineage(lineage) {
      if (this.catalogueScan) {
        this.$emit('openUploadTab', lineage)
      } else {
        this.$emit('uploadFile', lineage)
      }
    },
    tableDatInit() {
      const para = {}
      para.currentPage = 0
      para.pageSize = this.pageSize
      this.getTableData(para)

      const history = this.$getSimpleHistory('lineage')
      if (history && Array.isArray(history) && history.length > 0) {
        this.hasHistory = true
      }
    },
    downloadGeneralSqlTemplate() {
      const url = this.$meta_url + '/lineage/downloadGeneralSqlTemplate'
      this.$downloadFile(url)
    },
    getTableData(para, callback) {
      if (this.timer === 'first') {
        this.getTableDataInner(para, callback)
        this.timer = null
        return
      }
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.getTableDataInner(para, callback)
        this.timer = null
      }, 500)
    },
    getTableDataInner(para, callback) {
      const self = this
      para = para || {}
      para.types = this.fileTypeFilter || []
      para.user = this.creatorFilter || ''
      para.currentPage = para.currentPage || 0
      para.keyword = para.keyword || this.keyword || ''
      para.pageSize = para.pageSize || this.pageSize
      para.folderId = this.folderId
      this.$http
        .post(this.lineageUrl, para)
        .then(res => {
          let tempData = res.data.content || []
          tempData.forEach(temp => {
            temp.typeName =
              this.lineageTypesMap.get(temp.type)?.displayName || ''
          })
          this.tableData = tempData
          this.lastDataLength = this.total + ''
          this.total = res.data.totalItems
          this.totalShow = res.data.totalItems
          if (this.lastDataLength && this.lastDataLength != this.total) {
            this.onUpload = false
          }
          if (this.onUpload) {
            const index = this.tableData.findIndex(item => {
              return self.deleteId === item.id
            })
            if (index >= 0) {
              this.tableData.splice(index, 1)
            }
            this.fakeData.id === 'fake' && this.tableData.unshift(this.fakeData)
            this.totalShow++
          }
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    browse(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl +
          'lineageDemo?id=' +
          row.id +
          '&filename=' +
          encodeURIComponent(row.filename) +
          '&name=' +
          encodeURIComponent(row.name) +
          '&writable=false&blank=true',
        '_blank'
      )
    },
    browseWithEdit(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl +
          'lineageDemo?id=' +
          row.objectLineageId +
          '&filename=' +
          encodeURIComponent(row.filename) +
          '&name=' +
          encodeURIComponent(row.name) +
          (row.creator === this.$user.username ? '&writable=true' : '') +
          '&blank=true',
        '_blank'
      )
    },
    filterHandler(obj) {
      let key = ''
      for (key in obj) {
        if (key === 'fileTypeFilter') {
          this.fileTypeFilterHandler(obj[key])
        } else if (key === 'creatorFilter') {
          this.creatorFilterHandler(obj[key])
        }
      }
      this.getTableData()
    },
    fileTypeFilterHandler(value) {
      this.fileTypeFilter = []
      this.fileTypeFilter = value
      const para = {}
      para.types = this.fileTypeFilter
      this.getTableData(para)
    },
    creatorFilterHandler(value) {
      this.creatorFilter = ''
      const userName = this.$user.username
      if (value[0] === 'self') {
        this.creatorFilter = this.$user.username
      }
      const para = {}
      para.user = this.creatorFilter
      this.getTableData(para)
      // return row.creator === value;
    },
    checkSources() {
      this.download([])
    },
    getSourceData() {
      const self = this
      this.$http
        .get(this.$meta_url + '/service/entities/models')
        .then(res => {
          var resultType = []
          var result = []
          res.data.forEach(item => {
            switch (item.type) {
              case 'ORACLE':
                item.type = 'Oracle'
                break
              case 'MYSQL':
                item.type = 'MySQL'
                break
              case 'SQLSERVER':
                item.type = 'SQL Server'
                break
              case 'POSTGRESQL':
                item.type = 'PostgreSQL'
                break
              case 'MART':
                item.type = 'Mart'
                break
              case 'HIVE':
                item.type = 'Hive'
                break
              case 'MONGODB':
                item.type = 'MongoDB'
                break
              case 'JSON':
                item.type = 'Json'
                break
              case 'CSV':
                item.type = 'CSV'
                break
              case 'EXCEL':
                item.type = 'Excel'
                break
              case 'ERWIN':
                item.type = 'Erwin'
                break
              case 'POWERDESIGNER':
                item.type = 'Power Designer'
                break
              case 'DB2':
                item.type = 'DB2'
                break
              case 'DATADICTIONARY':
                item.type = '数据字典'
                break
            }
          })
          res.data.forEach(item => {
            var i = resultType.indexOf(item.type)
            if (i == -1) {
              resultType.push(item.type)
              i = resultType.length - 1
              result[i] = []
            }
            result[i].push({
              label: item.definition,
              id: item.modelId,
              type: 'model',
            })
          })
          result.forEach((item, index) => {
            self.data.sourceData.push({
              label: resultType[index],
              id: resultType[index],
              children: item,
            })
          })
          self.data.sourceData.unshift({
            label: self.$version.dataCatalog.allSources,
            id: null,
          })
        })
        .catch(e => {
          this.$showFailure(e)
          // self.$message.error({
          //   message: "错误，读取数据源列表失败"
          // });
        })
    },
    handleUploadSuccess() {
      this.lineageDialog2.visible = false
      this.$message.closeAll()
      this.$message.success(this.$t('meta.DS.message.uploadSucceed'))
    },
    download(list) {
      this.lineageDialog.visible = false
      const url =
        this.$meta_url + '/lineage/downloadTemplate?modelIds=' + list.join(',')
      this.$downloadFile(url)
    },
    getJobStatus(jobId, isbacth) {
      const jobInfo = {
        type: 'lineage',
        jobId: jobId,
      }
      this.$addIntervalArr(jobInfo)
      this.$http
        .post(this.$meta_url + '/simplejobs/status?jobId=' + jobId)
        .then(res => {
          const data = res.data
          const result = res.data.result
          let historyResult = result
          if (res.data.jobStatus !== 'RUNNING') {
            this.$removeIntervalArr(jobInfo)
            this.onUpload = false
            this.getTableData()
            // clearInterval(this.interval);
            if (res.data.jobStatus === 'FINISHED') {
              historyResult = []
              if (res.data.jobName === 'LineageBatchImport') {
                let resultCount = this.$t(
                  'meta.lineageManage.lineageBatchImportMsg',
                  {
                    num1: result.totalFilesCount,
                    num2: result.failedFilesCount,
                  }
                )
                historyResult.push(resultCount)
                resultCount = `<p>${resultCount}</p>`
                const failedFiles = data.result.failedFiles
                let wrong = resultCount
                let msgType = 'success'
                if (
                  failedFiles &&
                  Array.isArray(failedFiles) &&
                  failedFiles.length > 0
                ) {
                  failedFiles.forEach(item => {
                    let strItem = `${item.first}: ${item.second}`
                    historyResult.push(strItem)
                    strItem = `<p>${strItem}</p>`
                    wrong += strItem
                  })
                  msgType = 'info'
                }
                this.$message.closeAll()
                this.$message({
                  type: msgType,
                  message: wrong,
                  dangerouslyUseHTMLString: true,
                })
              } else if (res.data.result) {
                if (typeof result === 'number') {
                  const str = this.$t('meta.lineageManage.numberMsg', {
                    numberMsg: res.data.result,
                  })
                  this.$message.closeAll()
                  this.$message.success(str)
                  historyResult.push(str)
                } else if (Array.isArray(result)) {
                  let msg = ''
                  result.forEach(item => {
                    historyResult.push(item)
                    msg += item + '<br>'
                  })
                  // const str = msg ? '未匹配信息如下：<br>' + msg : '导入成功'
                  const str = msg
                    ? this.$t('meta.lineageManage.notMatchMsg') + msg
                    : this.$t('meta.DS.message.importSucceed')
                  this.$showSuccess(str)
                } else if (typeof result === 'object') {
                  let msg = ''
                  for (const k in result) {
                    msg += '<b>' + k + ' : </b>' + result[k] + '<br>'
                    historyResult.push(`${k}: ${result[k]}`)
                  }
                  const str = msg
                    ? this.$t('meta.lineageManage.succeedAndNotMatchMsg') + msg
                    : this.$t('meta.DS.message.importSucceed')
                  this.$showSuccess(str)
                }
              } else {
                this.$message.closeAll()
                this.$message.success(
                  this.$t('meta.lineageManage.importFinish')
                )
              }
              this.deleteId && this.updataCurrentRow(this.deleteId)
            } else if (res.data.jobStatus === 'FAILED') {
              this.$showFailure(res.data.errorMessage)
            }
          } else {
            this.interval = setTimeout(() => {
              this.getJobStatus(jobId)
            }, 500)
          }
          let startTime = ''
          if (!this.jobStartTimeMap.has(jobId)) {
            startTime = data.timestamp
            this.jobStartTimeMap.set(jobId, startTime)
          }
          const simpleJobDetail = {
            name: '',
            jobStatus: data.jobStatus,
            jobId: jobId,
            jobName: data.jobName,
            errorMessage: data.errorMessage,
            result: historyResult,
            startTime: startTime,
            endTime: data.timestamp,
            objType: '',
            jobType: 'lineage',
          }
          this.$saveJobHistory(simpleJobDetail)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // changed
    uploadSuccess(response, para) {
      this.fakeData = para
      this.onUpload = true
      this.timer = 'first'
      this.getTableData()
      if (typeof response === 'object') {
        setTimeout(() => {
          this.getTableData()
        }, 100)
        this.onUpload = false
        return
      }
      this.$message.closeAll()
      this.$message.success({
        message: this.$t('meta.lineageManage.uoloadMsg'),
      })
      this.$showSimpleJobHistory.lineage = true
      this.hasHistory = true
      const simpleJobDetail = {
        name: para.filename,
        jobStatus: '',
        jobId: response,
        jobName: '',
        errorMessage: '',
        result: [],
        startTime: '',
        endTime: '',
        objType: para.type,
        jobType: 'lineage',
      }
      this.$saveJobHistory(simpleJobDetail)
      this.interval = setTimeout(() => {
        this.getJobStatus(response)
      }, 100)
    },

    filterTableData() {
      this.getTableData()
    },
    uploadFile() {
      if (this.catalogueScan) {
        this.$emit('openUploadTab')
      } else {
        this.$emit('uploadFile')
      }
    },
    uploadLineage() {
      this.$emit('upload', 'lineage')
      this.$bus.$emit('uploadLineage')
    },

    // 分页设置
    handleCurrentChange() {
      const para = {}
      para.currentPage = this.currentPage - 1
      this.getTableData(para)
    },
    handleSizeChange(size) {
      const para = {}
      para.pageSize = size
      this.pageSize = size
      this.getTableData(para)
    },
    handleSelectionChange(val) {
      this.selection = val
      this.mutipleLength = val.length
      this.deleteDisabled = this.selection.length == 0
    },

    // table 操作
    setCurrent(row) {
      this.$refs.dsTable.setCurrentRow(row)
    },
    // delete choose lineage
    deleteRow() {
      const self = this
      self
        .$DatablauCofirm(this.$t('meta.lineageManage.delConfirm'))
        .then(() => {
          const handleSuccess = () => {
            this.timer = 'first'
            this.getTableData()
            self.$message.success({
              message: this.$t('meta.DS.message.delSucceed'),
            })
          }
          const deletNext = () => {
            if (this.selection.length > 0) {
              this.deleteCurrentRow(this.selection[0], deletNext)
            } else {
              handleSuccess()
            }
          }
          deletNext()
        })
        .catch(res => {})
    },
    // delete lineage action
    deleteCurrentRow(lineage, callback) {
      const self = this
      self.$http
        .delete(self.$meta_url + '/lineage/' + lineage.id)
        .then(res => {
          this.selection.shift()
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updataCurrentRow(id) {
      const self = this
      self.$http
        .delete(self.$meta_url + '/lineage/' + id)
        .then(res => {
          this.getTableData()
          this.deleteId = null
        })
        .catch(e => {
          const reason =
            e.response.data.rootErrorMessage ||
            this.$t('meta.DS.treeSubOperation.unknow')
          this.$showFailure(e)
          self.$message.error({
            message: this.$t('meta.lineageManage.delFaildReason') + reason,
          })
        })
    },
    downloadLineageFile(row) {
      if (!row.fileFieldId) {
        return
      }
      const url = this.$url + '/files/getFilesInfo?fileIds=' + row.fileFieldId
      this.$http
        .post(url)
        .then(res => {
          if (res && !res.data[0].fileDeleted) {
            const url2 = this.$url + '/files/download?fileId=' + row.fileFieldId
            this.$downloadFilePost(url2)
          } else if (res && res.data.fileDeleted) {
            this.$showFailure(this.$t('meta.lineageManage.deleted'))
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    downloadPreprocessedFile(row) {
      if (!row.preprocessedFileId) {
        return
      }
      const url =
        this.$url + '/files/getFilesInfo?fileIds=' + row.preprocessedFileId
      this.$http
        .post(url)
        .then(res => {
          if (res && !res.data.fileDeleted) {
            const url2 =
              this.$url + '/files/download?fileId=' + row.preprocessedFileId
            this.$downloadFilePost(url2)
          } else if (res && res.data.fileDeleted) {
            this.$showFailure(this.$t('meta.lineageManage.deleted'))
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    searchTable() {
      this.$emit('searchTable')
    },
    setSystemJob() {
      this.$emit('setSystemJob')
    },
  },
  watch: {
    keyword(newVal) {
      const para = {}
      para.keyword = newVal
      this.filterTableData(para)
    },
    folderId(val) {
      this.getTableData()
    },
  },
  computed: {
    // 根据血缘关系, 跳转到 血缘文件列表页时,
    // 对血缘文件进行过滤
    lineageFilter() {
      return !!this.src && !!this.dst
    },
  },
}
</script>
<style lang="scss">
.el-message.el-message--info {
  max-width: calc(100vw - 200px) !important;
  max-height: 200px;
  overflow: auto;
}
</style>
<style lang="scss" scoped>
/deep/ .el-dropdown {
  &:hover {
    .el-icon--right {
      &:before {
        color: #409eff;
      }
    }
  }
  .el-icon--right {
    &:before {
      color: #555;
    }
  }
}
$primary-color: #409eff;
.tab-page {
  &.catalogueScan {
    top: 20px;
    .filter-row {
      .row-inner {
        min-width: 50%;
      }
    }
  }
  .filter-row {
    height: 34px;
    .row-inner {
      width: 60%;
      min-width: 700px;
      right: 0;
      .rightButton {
        float: right;
        margin-right: 20px;
        .margin20 {
          margin-left: 20px;
          padding: 10px 10px;
        }
      }
    }
  }

  .left-button {
    position: absolute;
    top: 50%;
    left: 20px;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    .check-info {
      display: inline-block;
      width: 14px;
      height: 14px;
      margin-right: -13px;
      vertical-align: middle;
      background: $primary-color;
    }
    .footer-row-info {
      height: 50px;
      margin-right: 10px;
      &::before {
        margin-right: 5px;
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        line-height: 13px;
        color: white;
        vertical-align: middle;
        content: '\e6da';
      }
    }
  }
}
.lineage-tree-container {
  height: 300px;
  position: relative;
}
</style>
