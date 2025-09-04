import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
import moment from 'moment'

export default {
  data () {
    let contentValidate = (rule, value, callback) => {
      value = _.trim(this.tagName)
      if (!value) {
        callback(new Error(this.$v.OperationLog.nomenclature))
      } else {
        callback()
      }
    }
    return {
      keyword: '',
      allData: null,
      filteredData: null,
      tableData: null,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      dialogTitle: '',
      dialogVisible: false,
      dialogBody: null,
      currentRow: null,
      currentData: null,
      editDialogVisible: false,
      editDialogTitle: '',
      tagName: '',
      tagDef: '',
      dataSource: '',
      userName: '',
      asc: 0,
      dataSourceArr: [{ name: 'DDMWeb', label: this.$v.OperationLog.web, desc: this.$v.OperationLog.webModeling }, { name: 'DDMClient', label: this.$v.OperationLog.client, desc: this.$v.OperationLog.clientModeling }],
      rules: {
        name: {
          required: true,
          validator: contentValidate,
          trigger: 'change'
        }
      },
      date: [
        moment(new Date() - 259200000).format('YYYY-MM-DD'),
        moment(new Date()).format('YYYY-MM-DD')
      ],
      start: '',
      end: '',
      modelId: '',
      modelName: '',
      models: [],
      pickerOptions: {
        shortcuts: [{
          text: this.$v.OperationLog.lastWeek,
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$v.OperationLog.lastMonth,
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: this.$v.OperationLog.lastThreeMonths,
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      multipleSelection: [],
      OperationLog: this.$v.OperationLog
    }
  },
  mounted () {
    // this.getDataChannel()
    this.getLogs()
    this.getModels()
  },
  inject: ['refresh'],
  methods: {
    getDataChannel () {
      this.$http.get(this.$url + '/service/auditLog/allModelEditAuditOptions').then(res => {
        this.dataSourceArr = res.data.allCallFromTypes
      }).catch(e => {
        this.$message.error(e)
      })
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    getModels () {
      const handler = data => {
        this.models = data
      }
      if (this.$store.state.modelsList) {
        handler(this.$store.state.modelsList)
      } else {
        HTTP.getModelsList({
          successCallback: handler
        })
      }
    },
    getLogs () {
      let startTime = moment(this.date[0]).unix() * 1000
      let endTime = moment(this.date[1]).unix() * 1000 + 86400000
      // if (Array.isArray(this.date) && moment(this.date[0]).unix() * 1000 === moment(this.date[1]).unix() * 1000) {
      //   endTime = startTime + 86400000
      // }
      HTTP.getLogs({
        cft: this.dataSource,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        start: Array.isArray(this.date) ? startTime : '',
        end: Array.isArray(this.date) ? endTime : '',
        name: this.modelName,
        user: this.userName,
        orderBy: 'timestamp',
        asc: this.asc,
        successCallback: data => {
          this.tableData = data.items
          this.total = data.totalItems
        }
      })
    },
    deleteLog (log) {
      this.$confirm(this.OperationLog.deleteHistory, '', {
        type: 'warning'
      }).then(() => {
        const logId = log.id
        HTTP.deleteLog({
          logId: logId,
          successCallback: data => {
            this.getLogs()
          }
        })
      }).catch(() => {
        this.$message.info(this.OperationLog.operationCancelled)
      })
    },
    deleteLogs () {
      let msg = this.$isEng ? `Are you sure you want to delete the selected ${this.multipleSelection.length} historic records?` : `確定要刪除选中的${this.multipleSelection.length}条历史记录吗？`
      this.$confirm(msg, '', {
        type: 'warning'
      }).then(() => {
        HTTP.deleteLogs({
          logIds: this.multipleSelection.map(log => log.id),
          successCallback: () => {
            this.getLogs()
          }
        })
      }).catch(() => {
        this.$message.info(this.OperationLog.operationCancelled)
      })
    },
    downloadLog (log) {
      HTTP.exportLog({
        idList: [log.id],
        http: this.$http
      })
    },
    formatterResult (val) {
      switch (val.type) {
        case 'LOGIN_MODEL_STORE':
          return '登录模型库'
        case 'LOGOUT_MODEL_STORE':
          return '登出模型库'
        case 'DELETE_MODEL':
          return '删除模型'
        case 'GET_MODEL_CONTENT':
          return `${this.OperationLog.getModelContent}`
        case 'CREATE_MODEL':
          return `${this.OperationLog.createModel}`
        case 'UPDATE_MODEL':
          return `${this.OperationLog.updateModel}`
        case 'LOCK_MODEL':
          return `${this.OperationLog.lockTheModel}`
        case 'UNLOCK_MODEL':
          return `${this.OperationLog.unlockModel}`
        case 'CREATE_VERSION':
          return `${this.OperationLog.checkIn}`
        case 'FREEZE_BASELINE':
          return `${this.OperationLog.lock}`
        case 'UNFREEZE_BASELINE':
          return `${this.OperationLog.unlock}`
        case 'RESTORE_MODEL':
          return `${this.OperationLog.recovery}`
        case 'UPDATE_MODEL_PERMISSION':
          return `${this.OperationLog.updateModelPermissions}`
        case 'COMPRESS_MODEL_HIGH_COMPRESSION':
          return `${this.OperationLog.highCompression}`
        case 'COMPRESS_MODEL_NORMAL_COMPRESSION':
          return `${this.OperationLog.normalCompression}`
        case 'RESTORE_BASELINE':
          return `${this.OperationLog.restoreModel}`
        case 'UPDATE_VERSION':
          return `${this.OperationLog.updateModelVersion}`
        case 'DELETE_VERSION':
          return `${this.OperationLog.deleteModelVersion}`
        case 'CREATE_BASELINE':
          return this.OperationLog.createBaselineBersion
        case 'DELETE_BASELINE':
          return this.OperationLog.deleteBaselineVersion
        case 'WEB_UPDATE_TABLE':
          return this.OperationLog.updateTable
        case 'WEB_ADD_TABLE':
          return this.OperationLog.addTable
        case 'WEB_DELETE_TABLE':
          return this.OperationLog.deleteTable
        case 'WEB_EDIT_TABLE_CONFLICT':
          return this.OperationLog.conflict
        case 'UPDATE_CATEGORY_PERMISSION':
          return '更新目录权限'
        default:
          return val.type
      }
    },
    formatterResultTooltip (val) {
      if (!val || !val.details) {
        return []
      }
      let result = []
      if (val.type === 'UPDATE_CATEGORY_PERMISSION' || val.type === 'UPDATE_MODEL_PERMISSION') {
        let details = ''
        try {
          details = JSON.parse(val?.details)
        } catch (e) {
          console.log(e)
        }
        if (details.ra?.length > 0) {
          result.push({
            label: '删除管理员',
            value: details.ra
          })
        }
        if (details.re?.length > 0) {
          result.push({
            label: '删除读写用户',
            value: details.re
          })
        }
        if (details.rv?.length > 0) {
          result.push({
            label: '删除只读用户',
            value: details.rv
          })
        }
        if (details.aa?.length > 0) {
          result.push({
            label: '添加管理员',
            value: details.aa
          })
        }
        if (details.ae?.length > 0) {
          result.push({
            label: '添加读写用户',
            value: details.ae
          })
        }
        if (details.av?.length > 0) {
          result.push({
            label: '添加只读用户',
            value: details.av
          })
        }
      }
      return result
    },
    downloadLogs () {
      let startTime = moment(this.date[0]).unix() * 1000
      let endTime = moment(this.date[1]).unix() * 1000 + 86400000
      // if (Array.isArray(this.date) && moment(this.date[0]).unix() * 1000 === moment(this.date[1]).unix() * 1000) {
      //   endTime = startTime + 86400000
      // }
      let requestBody = {
        cft: this.dataSource,
        start: Array.isArray(this.date) ? startTime : '',
        end: Array.isArray(this.date) ? endTime : '',
        modelName: this.modelName,
        user: this.userName,
        orderBy: 'timestamp',
        asc: this.asc
      }
      HTTP.exportLog({
        requestBody: requestBody,
        http: this.$http
      })
    },
    handleSortChange (sortData) {
      if (sortData.order === 'descending') {
        this.asc = false
      } else if (sortData.order === 'ascending') {
        this.asc = true
      } else {
        this.asc = ''
      }
      this.currentPage = 1
      this.getLogs()
    },
    handleClickTab (row) {
      this.$skip2({
        type: 'model',
        modelId: row.modelId
      })
      // let pathname = location.pathname || '/'
      // window.open(`${pathname}#/main/list?id=${row.modelId}`, '_blank')
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getLogs()
    },
    handleCurrentChange () {
      this.getLogs()
    },
    search () {
      this.currentPage = 1
      this.getLogs()
    },
    reset () {
      this.date = [moment(new Date() - 259200000).format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')]
      this.userName = ''
      this.dataSource = ''
      this.modelName = ''
    },
    handleDownload (o) {
      if (o === 'operation') {
        this.downloadLogs()
      } else {
        // 下载后台日志
        HTTP.exportBackendLog()
      }
    }
  },
  watch: {
    // date (newDate) {
    //   if (newDate) {
    //     this.start = newDate[0].getTime()
    //     this.end = newDate[1].getTime()
    //   } else {
    //     this.start = ''
    //     this.end = ''
    //   }
    //   this.getLogs()
    // },
    // modelId () {
    //   this.getLogs()
    // },
    // op () {
    //   this.getLogs()
    // },
    // userName () {
    //   this.getLogs()
    // },
    // dataSourceMapping () {
    //   this.getLogs()
    // }
  },
  computed: {
    hasSelection () {
      return this.multipleSelection.length > 0
    }
  }
}
