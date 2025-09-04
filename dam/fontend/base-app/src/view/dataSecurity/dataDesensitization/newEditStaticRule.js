import HTTP from '@/http/main.js'
import tableSelector from './tableSelector.vue'
import colSelector from './colSelector.vue'
import bg from '@/assets/images/security-no-result-bg.png'

export default {
  data() {
    return {
      nodeData: [],
      bg,
      activeName: '1',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      rightCurrentPage: 1,
      rightPageSize: 20,
      rightTotal: 0,
      curCols: [],
      // currentPage2:1,
      // pageSize2:20,
      // total2:0,
      currentDsOpts: [],
      currentRules: [],
      loading: false,
      topLoading: false,
      colsLoading: false,

      form: {
        name: '',
        originId: '',
        tragetId: '',
      },

      originTables: [],
      cols: [],
      rules: {
        name: [
          {
            required: true,
            message: '请输入任务名称',
            trigger: 'blur',
          },
        ],
        originId: [
          {
            required: true,
            message: '请选择脱敏数据源',
            trigger: 'blur',
          },
        ],
        tragetId: [
          {
            required: true,
            message: '请选择目标数据源',
            trigger: 'blur',
          },
        ],
      },

      currentTableId: '',
      currentTableName: '',
      currentColRules: [],

      showTableSelector: false,
      showColSelector: false,

      cron: '',
      schedule: 'cron:0 50 22 * * ?',
      cb1: true,
      cb2: false,
      cb3: false,

      // 排除以下数据源
      filters: [
        'EXCEL',
        'CSV',
        'DATADICTIONARY',
        'TABLEAU',
        'SMBSHAREFILE',
        'HBASE',
        'INCEPTOR',
        'FUSIONINSIGHT',
        'IMPALA',
        'MONGODB',
        'ES',
        'CUSTOMIZED',
      ],

      dialogVisible: false,
      isDisabled: true,
      targetDs: [],
      secondStep: false,
    }
  },
  props: ['currentId', 'editMode', 'details'],
  components: {
    tableSelector,
    colSelector,
  },
  mounted() {
    this.getAllDataSource()
    this.getDataMaskingRules()
    if (this.editMode) {
      this.getDatamaskingModelDetail(this.currentId)
      this.form = {
        name: this.details.name,
        originId: this.details.originalModelObjectId,
        tragetId: this.details.targetModelObjectId,
      }
    }
    this.getScheduleTime(this.schedule)
    this.getNode()
  },
  methods: {
    getNode() {
      this.nodeData = [
        {
          name: '数据脱敏任务',
          level: 1,
        },
        {
          name: this.editMode ? this.form.name + '编辑' : '新建数据脱敏任务',
          level: 2,
        },
      ]
    },
    getDataMaskingRules() {
      HTTP.getDataMaskingRules().then(res => {
        const data = res.data
        const newArr = []
        data.forEach(v => {
          const id = parseInt(v.id.split('-')[0])
          // 只要自定义规则
          if (id !== 0) {
            v.id = id
            newArr.push(v)
          }
        })
        this.currentRules = newArr
      })
    },
    getAllDataSource() {
      this.topLoading = true
      HTTP.getAllDataSource()
        .then(res => {
          let data = res.data
          data = data.filter(v => {
            return (
              this.filters.indexOf(v.type) === -1 &&
              (v.type.toUpperCase() === 'MYSQL' ||
                v.type.toUpperCase() === 'ORACLE' ||
                v.type.toUpperCase() === 'HIVE' ||
                v.type.toUpperCase() === 'SQLSERVER')
            )
          })
          this.currentDsOpts = data
          this.targetDs = data
          if (data.every(v => this.form.originId !== v.modelId)) {
            this.form.originId = ''
          }
          if (data.every(v => this.form.tragetId !== v.modelId)) {
            this.form.tragetId = ''
          }
          this.topLoading = false
        })
        .catch(err => {
          this.topLoading = false
          this.$showFailure(err)
        })
    },
    updateMaskingCols(ruleId, id) {
      HTTP.updateMaskingCols(id, ruleId.toString()).then(res => {})
    },
    getDatamaskingModel(id) {
      HTTP.getDatamaskingModel(id).then(res => {})
    },
    getDatamaskingTables() {
      this.loading = true
      HTTP.getDatamaskingTables({
        id: this.currentId,
        keyword: '',
        page: this.currentPage,
        size: this.pageSize,
      })
        .then(res => {
          this.loading = false
          this.originTables = res.data.content
          this.total = res.data.totalItems
          this.secondStep = true
        })
        .catch(err => {
          this.$showFailure(err)
          this.loading = false
        })
    },
    getDatamaskingCols(id) {
      this.colsLoading = true
      HTTP.getDatamaskingCols({
        id,
        keyword: '',
        page: this.rightCurrentPage,
        size: this.rightPageSize,
      })
        .then(res => {
          this.colsLoading = false
          const cols = _.cloneDeep(res.data.columns)
          cols.forEach(v => {
            if (!v.rules[0]) {
              v.rules = [
                {
                  ruleId: '',
                },
              ]
            }
            // id不存在就清空
            if (
              this.currentRules.every(item => item.id !== v.rules[0].ruleId)
            ) {
              v.rules[0].ruleId = ''
            }
          })
          this.curCols = cols
          // this.cols = cols
          this.rightTotal = cols.length
          this.limitCols()
        })
        .catch(err => {
          this.colsLoading = false
          this.$showFailure(err)
        })
    },
    limitCols() {
      this.cols = this.curCols.slice(
        (this.rightCurrentPage - 1) * this.rightPageSize,
        this.rightCurrentPage * this.rightPageSize
      )
    },
    handleOdsChange(val) {
      this.currentTableId = ''
      this.currentTableName = ''
      let currentDs = {}
      this.currentDsOpts.forEach(v => {
        if (v.modelId === val) {
          currentDs = v
        }
      })
      // 目标数据源选项过滤，只要和源数据源的数据库类型一致的选项
      this.targetDs = this.currentDsOpts.filter(v => v.type === currentDs.type)
      this.isDisabled = false
      this.form.tragetId = ''
    },
    handleRowClick(row) {
      this.currentTableName = row.originalTable.physicalName
      this.currentTableId = row.id
      this.getDatamaskingCols(row.id)
    },
    handleShowTableSelector() {
      this.showTableSelector = true
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getDatamaskingTables()
    },
    handleCurrentChange() {
      this.getDatamaskingTables()
    },
    rightHandleSizeChange(val) {
      this.rightPageSize = val
      this.rightCurrentPage = 1
      this.limitCols()
    },
    rightHandleCurrentChange() {
      this.limitCols()
    },
    errorMessage() {
      console.log(arguments[0])
    },
    createMasking() {
      const that = this
      this.loading = true
      const obj = {
        originalModelId: this.form.originId,
        targetModelId: this.form.tragetId,
        name: encodeURI(this.form.name),
        schedule: this.schedule || this.cron,
        optCreateTable: this.cb1,
        optCleanData: this.cb2,
        optCopyIndexes: this.cb3,
        isGenerate: !this.editMode,
      }
      HTTP.getDatamaskingStaticModel(obj)
        .then(res => {
          this.currentId = res.data.id
          this.getDatamaskingTables()
        })
        .catch(err => {
          if (this.editMode) {
            this.deleteOption()
          } else {
            function errorMessage() {
              that
                .$DatablauCofirm(
                  arguments[0].response.data.errorMessage,
                  '提示',
                  {
                    confirmButtonText: that.$t('common.button.ok'),
                    cancelButtonText: that.$t('common.button.cancel'),
                    type: 'warning',
                  }
                )
                .then(() => {
                  that.form.name = ''
                  // that.closeEdit()
                })
                .catch(() => {
                  // that.closeEdit()
                })
            }
            errorMessage(err)
          }

          // this.$showFailure(err)
          this.loading = false
        })
    },
    deleteOption() {
      this.$DatablauCofirm('数据源无权限或已被移除, 是否删除此任务？', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      }).then(() => {
        HTTP.deleteDataMaskingRule([this.currentId])
          .then(res => {
            this.$message.success('删除成功')
            this.closeEdit()
          })
          .catch(err => {
            console.error(err)
            this.$showFailure(err)
          })
      })
    },
    updateDatamaskingTableStatus(bool, id) {
      HTTP.updateDatamaskingTableStatus(id, bool ? 'enable' : 'disable')
    },
    closeEdit() {
      this.$emit('close')
    },
    addTables(data) {
      this.originTables = data
    },
    addCols(data) {
      this.cols = data
    },
    getCronString(cronString, type) {
      this.cron = cronString
      this.schedule = 'cron:' + cronString
    },
    beforeSave() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.createMasking()
        } else {
          return false
        }
      })
    },
    getDatamaskingModelDetail() {
      HTTP.getDatamaskingModelDetail(this.currentId)
        .then(res => {
          const data = res.data
          this.cron = data.schedule ? data.schedule.split(':')[1] : ''
          this.cb1 = data.optCreateTable
          this.cb2 = data.optCleanData
          this.cb3 = data.optCopyIndexes
          this.createMasking()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    setDatamaskingOptions() {
      HTTP.setDatamaskingOptions(this.currentId, {
        schedule: this.schedule || '',
        optCreateTable: this.cb1,
        optCleanData: this.cb2,
        optCopyIndexes: this.cb3,
      })
        .then(res => {
          this.$message({
            duration: 1500,
            message: this.secondStep ? '新建保存成功' : '配置保存成功',
            type: 'success',
          })
          setTimeout(() => {
            this.$emit('close')
          }, 1500)
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    saveOption() {
      this.setDatamaskingOptions()
    },
    getoriginalTableName(key, obj) {
      if (obj && obj.originalTable) {
        return obj.originalTable[key] || ''
      }
      return ''
    },
    getScheduleTime(scheduleInCron) {
      //   //cron string sample: 0 50 15 * * ?
      const scheduleString = scheduleInCron.split(':')
      let cron = null
      cron = scheduleString[1]
      this.cron = cron
      return cron
    },
  },
}
