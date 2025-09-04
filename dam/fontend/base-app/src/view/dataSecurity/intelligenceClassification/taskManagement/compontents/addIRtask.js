import HTTP from '@/http/main.js'
import API from '@/view/dataSecurity/util/api'
import ruleSelector from './ruleSelector.vue'
export default {
  data() {
    let validateName = async (rule, value, callback) => {
      if (this.timeType === 'custom') {
        if (value) {
          const params = {
            cron: value,
          }
          try {
            await API.checkCron(params)
            callback()
          } catch (e) {
            callback(e.response.data.errorMessage)
          }
        } else {
          callback('请输入cron语句')
        }
        callback()
      } else {
        callback()
      }
    }
    return {
      scan: 'no',
      taskDetail: {},
      dateTemplates: [],
      canExecuteDateTemplates: [],
      nodeData: [],
      val: '',
      loading: false,
      showRS: false,
      formLoading: false,
      generalList: [],
      enable: false,
      form: {
        name: '',
        elementObjectId: '',
        ruleContent: {},
        time: '',
      },
      timeTemplate: [],
      // 添加规则时使用，仅保存添加的规则
      backup: {},
      schedule: '',
      cron: null,
      showCron: false,
      currentRule: null,
      methodName: '',
      rules: {
        name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
        elementObjectId: [
          { required: true, message: '请选择数据源', trigger: 'change' },
        ],
        time: [
          {
            required: false,
            validator: validateName,
            trigger: ['blur', 'change'],
          },
        ],
      },
      discernRulePriority: 1,
      timeType: 'select',
      filters: [
        'EXCEL',
        'YONGHONG',
        'FINE',
        'FINE_REPORT',
        'DAVINCI',
        'SMARTBI',
        'COGNOS',
        'DATADICTIONARY',
        'SMBSHAREFILE',
        'MONGODB',
        'ES',
      ], // 血缘识别过滤出这些数据源
    }
  },
  components: {
    ruleSelector,
  },
  props: {
    editMode: {
      type: Boolean,
      default: false,
    },
    id: {
      type: [String, Number],
      default: '',
    },
  },

  mounted() {
    this.getDateTemplate()
    this.getAllDataSource()
    if (this.editMode) {
      this.getDetail()
    } else {
      this.currentRule = []
    }
    this.showCron = true
    this.getNode()
  },
  methods: {
    initForm() {
      // 编辑模式则请求该规则详情数据
      this.form = {
        name: this.taskDetail.taskName,
        elementObjectId: this.taskDetail.modelId,
        time: this.schedule ? this.schedule : '',
      }
      this.currentRule = this.taskDetail.rules || []
    },
    getDetail() {
      API.getTaskDetail(this.id)
        .then(async res => {
          this.taskDetail = res.data.data
          this.scan = this.taskDetail.updateData ? 'yes' : 'no'
          const content = JSON.parse(this.taskDetail.content)
          if (content && content.canExecuteDateTemplates) {
            this.timeTemplate = content.canExecuteDateTemplates
          }
          if (!this.taskDetail.runType || this.taskDetail.runType === 0) {
            this.timeType = 'select'
            if (
              this.taskDetail.schedule.indexOf('1970') > -1 ||
              !this.taskDetail.schedule
            ) {
              this.schedule = null
            } else {
              const len = this.taskDetail.schedule.split(':').length
              this.schedule =
                len > 1
                  ? this.taskDetail.schedule.split(':')[1]
                  : this.taskDetail.schedule
            }
          } else {
            this.timeType = 'custom'
            this.schedule = this.taskDetail.schedule.split(':')[1]
          }
          this.initForm()
          this.enable = this.taskDetail.enabled
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDateTemplate() {
      this.$http
        .post(this.$url + `/service/dateTemplate/list`)
        .then(res => {
          this.dateTemplates = res.data.filter(i => i.state === 1)
          this.canExecuteDateTemplates = this.canExecuteDateTemplates.filter(
            item => this.dateTemplates.map(i => i.id).includes(item)
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeEnable(e) {
      console.log(e)
    },
    getNode() {
      this.nodeData = [
        {
          name: '识别任务管理',
          level: 1,
        },
        {
          name: this.editMode ? '编辑识别任务' : '新增识别任务',
          level: 2,
        },
      ]
    },
    getDate(time) {
      return moment(time).format('YYYY-MM-DD HH:mm')
    },
    getAllRules() {
      this.tableLoading = true
      HTTP.getDIscernRules({
        keyword: '',
        page: this.currentPage,
        size: this.pageSize,
      })
        .then(res => {
          this.tableLoading = false
          const data = res.data
          this.tableData = data.content
          this.total = data.totalItems
          this.$refs.table.doLayout()
        })
        .catch(err => {
          this.tableLoading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    getAllDataSource() {
      this.formLoading = true
      HTTP.getAllDataSource()
        .then(res => {
          let data = res.data
          this.generalList = data.filter(v => {
            return (
              v.type.toUpperCase() === 'MYSQL' ||
              v.type.toUpperCase() === 'ORACLE' ||
              v.type.toUpperCase() === 'VERTICA' ||
              v.type.toUpperCase() === 'SQLSERVER' ||
              v.type.toUpperCase() === 'HIVE'
            )
          })
          // 检查是否存在数据源
          if (this.editMode) {
            if (data.every(v => this.form.elementObjectId !== v.modelId)) {
              this.form.elementObjectId = ''
            }
          }
          this.formLoading = false
        })
        .catch(err => {
          this.$showFailure(err)
          this.formLoading = false
        })
    },
    addRules(arr) {
      if (this.currentRule.length === 0) {
        this.currentRule = arr
        return
      }
      // 去重
      arr.forEach(v => {
        if (this.currentRule.every(item => item.ruleId !== v.ruleId)) {
          this.currentRule.push(v)
        }
      })
    },
    deleteRule(idx) {
      this.$DatablauCofirm('是否确认删除?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.currentRule.splice(idx, 1)
        })
        .catch(e => {
          console.log(e)
        })
    },
    showRules() {
      this.showRS = true
    },
    closeEdit() {
      this.$emit('close')
    },

    save() {
      const form = this.form
      if (this.currentRule.length === 0) {
        this.$showFailure('请至少添加一个识别规则')
        return
      }
      const ids = this.currentRule.map(v => {
        return v.ruleId
      })
      let schedule
      if (this.timeType === 'select') {
        schedule = 'cron:' + this.schedule
      } else {
        schedule = 'cron:' + this.form.time
      }
      const obj = {
        runType: this.timeType === 'select' ? 0 : 1, // 0：选择 1：自定义
        taskId: this.editMode ? this.id : '',
        taskName: form.name,
        schedule,
        modelId: form.elementObjectId,
        ruleIds: ids,
        enabled: this.enable,
        templateIds: this.timeTemplate,
        // updateData: this.scan === 'yes',
      }
      if (this.editMode) {
        this.updateTask({ ...obj })
      } else {
        this.createTask({ ...obj })
      }
    },
    createTask(obj) {
      API.newTask(obj)
        .then(res => {
          this.closeEdit()
          this.$message.success('识别任务添加成功')
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    updateTask(obj) {
      API.modifyTask(obj)
        .then(res => {
          this.closeEdit()
          this.$message.success('识别任务修改成功')
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    async checkForm() {
      let result = false
      try {
        await this.$refs.form.validate()
        result = true
      } catch (e) {
        result = false
      }
      return result
    },
    async beforeSave() {
      const flag = await this.checkForm()
      if (flag) {
        this.save()
      }
    },
    getCronString(cron, type) {
      this.schedule = cron
    },
    timeFormatter() {
      if (typeof arguments[0] === 'number') {
        return moment(arguments[0]).format('YYYY-MM-DD HH:mm')
      } else if (arguments[0] == undefined) {
        return ''
      } else if (typeof arguments[0] === 'string') {
        return arguments[0]
      }
      if (arguments[0][arguments[1].property]) {
        return moment(arguments[0][arguments[1].property]).format(
          'YYYY-MM-DD HH:mm'
        )
      } else {
        return '-'
      }
    },
  },
  watch: {
    timeType(val) {
      this.$nextTick(() => {
        if (val === 'select') {
          this.$refs.form.validate()
        }
      })
    },
  },
}
