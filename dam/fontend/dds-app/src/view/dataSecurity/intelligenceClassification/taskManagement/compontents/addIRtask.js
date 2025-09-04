import API from '@/view/dataSecurity/util/api'
import ruleSelector from './ruleSelector.vue'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'
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
          callback(this.$t('intelligence.inputCron'))
        }
        callback()
      } else {
        callback()
      }
    }
    return {
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      treeData: [],
      treeKey: '',
      selectGra: {},
      showDirectory: false,
      scan: 'no',
      taskDetail: {},
      dateTemplates: [],
      canExecuteDateTemplates: [],
      nodeData: [],
      val: '',
      loading: false,
      showRS: false,
      generalList: [],
      enable: false,
      form: {
        name: '',
        catalogName: '',
        datasourceId: '',
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
        name: [
          {
            required: true,
            message: this.$t('intelligence.inputTaskName'),
            trigger: 'blur',
          },
        ],
        catalogName: [
          {
            required: true,
            message: this.$t('securityModule.placeSelect'),
            trigger: 'change',
          },
        ],
        datasourceId: [
          {
            required: true,
            message: this.$t('securityModule.selCollectName'),
            trigger: 'change',
          },
        ],
        elementObjectId: [
          {
            required: true,
            message: this.$t('securityModule.searchDataSource'),
            trigger: 'change',
          },
        ],
        time: [
          {
            required: false,
            validator: this.validateName,
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
      datasourceList: [],
      logicalModel: true,
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
    jobId: {
      type: [String, Number],
      default: '',
    },
    curCatalog: {
      type: Object,
      default() {
        return {}
      },
    },
  },

  mounted() {
    this.getDateTemplate()
    // this.rules = {

    // }
    if (this.editMode) {
      this.getDetail()
    } else {
      this.currentRule = []
    }
    this.showCron = true
    this.getNode()
    this.getDatasourceList()
  },
  methods: {
    getDatasourceList() {
      API.getAssessFromreTrue()
        .then(res => {
          this.datasourceList = res.data.data
          // res.data.data.filter(v => {
          //   return (
          //     v.type.toUpperCase() === 'MYSQL' ||
          //     v.type.toUpperCase() === 'ORACLE' ||
          //     // v.type.toUpperCase() === 'VERTICA' ||
          //     // v.type.toUpperCase() === 'SQLSERVER' ||
          //     v.type.toUpperCase() === 'HIVE' ||
          //     v.type.toUpperCase() === 'POSTGRESQL' ||
          //     v.type.toUpperCase() === 'IMPALA'
          //   )
          // })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleDatasource(id) {
      if (id) {
        this.datasourceList.forEach(element => {
          console.log
          if (element.modelId === id) {
            if (element.type !== 'DATADICTIONARY_LOGICAL') {
              this.logicalModel = true
            } else {
              this.logicalModel = false
            }
          }
        })
        this.generalList = []
        this.form.elementObjectId = ''
        this.getAllDataSource(id)
      } else {
        this.logicalModel = false
      }
    },

    getAllDataSource(id) {
      API.virDataSourceListApi(id)
        .then(res => {
          this.generalList = res.data.data || []
          // // 检查是否存在数据源
          // if (this.editMode) {
          //   if (data.every(v => this.form.elementObjectId !== v.modelId)) {
          //     this.form.elementObjectId = ''
          //   }
          // }
          this.loading = false
        })
        .catch(err => {
          this.$showFailure(err)
          this.loading = false
        })
    },
    sure() {
      this.showDirectory = false
      this.form.catalogId = this.selectGra.catalogId
      this.form.catalogName = this.selectGra.name
    },
    // 根据关键字过滤策略目录树
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    handleNodeClick(data) {
      this.selectGra = data
    },
    openDirector() {
      this.$refs.selectGra.blur()
      this.treeKey = ''
      this.showDirectory = true
      this.selectGra = {}
      this.getTree()
    },
    getTree() {
      const type = 'DISCERN_TASK'
      API.getStrategyCatalog(type)
        .then(res => {
          this.treeData = res.data.data.subNodes || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initForm() {
      // 编辑模式则请求该规则详情数据
      this.form = {
        name: this.taskDetail.taskName,
        datasourceId: this.taskDetail.datasourceId,
        elementObjectId: this.taskDetail.modelId,
        time: this.schedule ? this.schedule : '',
        catalogId: this.taskDetail.catalogId,
        catalogName: this.taskDetail.catalogName,
      }
      this.currentRule = this.taskDetail.rules || []
    },
    getDetail() {
      this.loading = true
      API.getTaskDetail(this.id)
        .then(async res => {
          this.taskDetail = res.data.data
          await this.handleDatasource(this.taskDetail.datasourceId)
          this.scan = this.taskDetail.updateData ? 'yes' : 'no'
          const content = JSON.parse(this.taskDetail.content)
          if (content && content.canExecuteDateTemplates) {
            this.timeTemplate = content.canExecuteDateTemplates
          }
          if (!this.taskDetail.runType || this.taskDetail.runType === 0) {
            this.timeType = 'select'
            if (
              this.taskDetail.schedule &&
              (this.taskDetail.schedule.indexOf('1970') > -1 ||
                !this.taskDetail.schedule)
            ) {
              this.schedule = null
            } else {
              const len =
                this.taskDetail.schedule &&
                this.taskDetail.schedule.split(':').length
              this.schedule =
                len > 1
                  ? this.taskDetail.schedule &&
                    this.taskDetail.schedule.split(':')[1]
                  : this.taskDetail.schedule
            }
          } else {
            this.timeType = 'custom'
            this.schedule =
              this.taskDetail.schedule && this.taskDetail.schedule.split(':')[1]
          }
          this.initForm()
          this.enable = this.taskDetail.enabled
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDateTemplate() {
      API.dateTemplateApi()
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
          name: this.$t('intelligence.idTaskManage'),
          level: 1,
        },
        {
          name: this.editMode
            ? this.$t('intelligence.editIdentifyTask')
            : this.$t('intelligence.newIdentifyTask'),
          level: 2,
        },
      ]
    },
    getDate(time) {
      return moment(time).format('YYYY-MM-DD HH:mm')
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
    deleteRule(idx, row) {
      const delParams = {
        this: this,
        objName: this.$t('intelligence.idRules'),
        name: row.ruleName,
        type: 'single',
      }
      delObjMethod(delParams)
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
        this.$datablauMessage.error(this.$t('intelligence.addRuleTip'))
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
      let obj = {
        catalogId: this.form.catalogId,
        catalogName: this.form.catalogName,
        runType: this.timeType === 'select' ? 0 : 1, // 0：选择 1：自定义
        taskId: this.editMode ? this.id : '',
        taskName: form.name,
        schedule,
        datasourceId: form.datasourceId,
        modelId: form.elementObjectId
          ? form.elementObjectId
          : form.datasourceId,
        ruleIds: ids,
        enabled: this.enable,
        templateIds: this.timeTemplate,
        // updateData: this.scan === 'yes',
      }
      if (this.logicalModel === false) {
        obj.modelId = form.datasourceId
      }
      if (this.editMode) {
        obj.damJobId = this.jobId // job的id
        this.updateTask({ ...obj })
      } else {
        this.createTask({ ...obj })
      }
    },
    createTask(obj) {
      API.newTask(obj)
        .then(res => {
          this.closeEdit()
          this.$datablauMessage.success(this.$t('securityModule.newSuccess'))
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    updateTask(obj) {
      API.modifyTask(obj)
        .then(res => {
          this.closeEdit()
          this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
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
        return '--'
      }
    },
  },
  watch: {
    treeKey(val) {
      this.$nextTick(() => {
        this.$refs.tree.$refs.tree.filter(val)
      })
    },
    timeType(val) {
      this.$nextTick(() => {
        if (val === 'select') {
          this.$refs.form.validate()
        }
      })
    },
    curCatalog: {
      handler(val) {
        if (val.catalogId) {
          this.form.catalogId = val.catalogId
          this.form.catalogName = val.name
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
