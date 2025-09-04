import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
import LDMTypes from '@constant/LDMTypes'
import DatabaseType from '@/components/common/DatabaseType.vue'

export default {
  data () {
    return {
      isEN: window.lang === 'English',
      keyword: '',
      severityArr: [{
        name: 'INFO',
        label: 'INFO'
      }, {
        name: 'WARN',
        label: 'WARN'
      }, {
        name: 'ERROR',
        label: 'ERROR'
      }],
      dataBaseArr: [],
      stateArr: [{
        name: true,
        label: this.$v.RuleChecking.Enable // '启用'
      }, {
        name: false,
        label: this.$v.RuleChecking.Disable // '禁用'
      }],
      searchArr: {
        severityValue: '',
        dataBaseValue: '',
        stateValue: ''
      },
      tableData: null,
      loadingTableData: false,
      typeIdArr: {
        '80000004': this.$v.RuleChecking.table, // '表',
        '80500008': this.$v.RuleChecking.view, // '视图',
        '80000005': this.$v.RuleChecking.column, // '字段',
        '80000093': this.$v.RuleChecking.keyValue, // '键值'
        [LDMTypes.ModelSource]: '模型', // '模型'
        [LDMTypes.BusinessObject]: '业务对象', // '业务对象'
        [LDMTypes.Diagram]: '主题域' // '主题域'
      },
      pageSize: 20,
      total: 0,
      currentPage: 1,
      editionDialogVisible: false,
      editionArr: {
        editionCode: '',
        message: ''
      },
      editionRules: {
        editionCode: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.PleaseWriteVersionNumber // '请填写版本号'
        },
        message: {
          required: true,
          trigger: 'blur',
          message: this.$v.RuleChecking.pleaseFillInVersionDescription // '请填写版本描述'
        }
      },
      versionArr: []
    }
  },
  components: {
    DatabaseType
  },
  mounted () {
    this.getEntriesSearch()
    this.getVersion()
    this.getDbTypes()
  },
  props: {
    databaseTypeListPromise: {
      type: Promise
    },
    databaseTypeMap: {
      type: Object
    }
  },
  inject: ['refresh'],
  methods: {
    // 获取数据库类型
    getDbTypes () {
      this.databaseTypeListPromise && this.databaseTypeListPromise.then(res => {
        this.dataBaseArr = res.data.subTree
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    getVersion () {
      this.$http.get(this.$url + '/service/rules/entries/version/').then(res => {
        this.versionArr = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    getEntriesSearch () {
      this.loadingTableData = true
      let requestBody = {
        size: this.pageSize,
        page: this.currentPage,
        keyword: this.keyword
      }
      if (this.searchArr.severityValue) {
        requestBody.severity = this.searchArr.severityValue
      }
      if (this.searchArr.dataBaseValue) {
        requestBody.dbTypes = this.searchArr.dataBaseValue
      }
      if (this.searchArr.stateValue === true || this.searchArr.stateValue === false) {
        requestBody.enable = this.searchArr.stateValue
      }
      HTTP.getEntriesSearch({
        requestBody: requestBody,
        successCallback: (data) => {
          if (this.currentPage !== 1 && this.currentPage > data.totalPages) {
            setTimeout(() => {
              this.handleCurrentChange(data.totalPages)
            })
          }
          this.tableData = data.content
          this.total = data.totalElements
          this.loadingTableData = false
        },
        finallyCallback: (e) => {
          // this.$showFailure(e)
          this.loadingTableData = false
        }
      })
    },
    // 状态
    enableState (data) {
      let state = data.enable
      let stateVale = state === false ? this.$v.RuleChecking.disabled : this.$v.RuleChecking.Enabled
      let requestBody = data
      requestBody.enable = state
      HTTP.addRules({
        requestBody: requestBody,
        successCallback: (data) => {
          this.$datablauMessage.success(stateVale)
          this.getEntriesSearch()
        },
        finallyCallback: (e) => {
          // this.$showFailure(e)
        }
      })
    },
    // 删除
    deleteRules (data) {
      this.$DatablauCofirm(`编码 "${data.code}"，确认要删除?`, 'warning')
        .then(() => {
          let requestBody = data
          requestBody.deleted = true
          HTTP.addRules({
            requestBody: requestBody,
            successCallback: (data) => {
              this.$message({
                message: this.$v.RuleChecking.Deleted, // '已删除',
                type: 'success'
              })
              this.getEntriesSearch()
            },
            finallyCallback: () => {
              // this.$showFailure(e)
            }
          })
        })
        .catch(e => {
          console.log('cancel')
        })
    },
    // 查看
    seeRules (data, type) {
      this.$emit('addModel', data, type)
    },
    // 创建规则
    addModelRules () {
      this.$emit('addModel')
    },
    // 发布版本
    releaseVersion () {
      this.editionDialogVisible = true
      this.editionArr.editionCode = ''
      this.editionArr.message = ''

      this.$refs.releaseVersion && this.$refs.releaseVersion.clearValidate()
    },
    saveEdition () {
      let requestBody = {
        curVer: this.editionArr.editionCode,
        message: this.editionArr.message
      }
      this.$http.post(this.$url + '/service/rules/publish/model', requestBody).then(res => {
        this.$message({
          message: this.$v.RuleChecking.publishedSuccessfully, // '发布成功',
          type: 'success'
        })
        this.editionDialogVisible = false
        this.getEntriesSearch()
        this.getVersion()
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    closeEditionDialog () {
      this.editionDialogVisible = false
    },
    handleSizeChange (size) {
      this.currentPage = 1
      this.pageSize = size
      this.getEntriesSearch()
    },
    handleCurrentChange () {
      this.getEntriesSearch()
    },
    closeEditDialog () {
      this.editDialogVisible = false
    },
    sortNameMethod (a, b) {
      return a.id - b.id
    }
  },
  watch: {
    keyword (value) {
      this.getEntriesSearch()
    },
    searchArr: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.getEntriesSearch()
      }
    }
  },
  computed: {
    canSave () {
      return !!_.trim(this.editionArr.editionCode && this.editionArr.message)
    }
  }
}
