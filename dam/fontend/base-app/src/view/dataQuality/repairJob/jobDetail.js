import HTTP from '@/http/main'
import chooseQualityRules from '../../../components/quality/qualityJob/chooseQualityRules.vue'
// import SelectUsers from '@/components/user/SelectUsers.vue'
import sectionLabel from '../components/sectionLabel.vue'
import Status from './Status.vue'
import ProcessState from './ProcessState'
import Documents from './documents.vue'
import DataProblem from './DataProblem.vue'
import History from './History.vue'
import Solution from './Solution.vue'
// import UserSelect from './userSelect.vue'
export default {
  components: {
    chooseQualityRules,
    sectionLabel,
    Status,
    ProcessState,
    // SelectUsers,
    Documents,
    DataProblem,
    History,
    Solution,
  },
  props: {
    details: {},
    isMonitor: {
      type: Boolean,
      required: false,
      default: false,
    },
    isCheck: {
      type: Boolean,
      required: false,
      default: false,
    },
    canSave: Boolean,
  },
  data() {
    const validateCandidates = (rule, value, callback) => {
      if (this.assignee.length > 0) {
        callback()
      } else {
        callback(new Error())
      }
    }
    const validateRuleFrom = (rule, value, callback) => {
      if (this.jobDetails.ruleId) {
        callback()
      } else {
        callback(new Error())
      }
    }
    return {
      allUsers: [],
      rules: [],
      writable: this.details ? this.details.directEdit : true,
      jobDetails: {
        writable: true,
        ruleId: null,
        owner: '',
        name: '',
        description: '',
        createManually: 1,
        status: 'NOT_START', // 'CONFIRM, FIXED, NOT_START, ACCEPT, CLOSED, VERIFIED'
      },
      ruless: '',
      chooseRulesDialogVisible: false,
      directOpen: false,
      documentKey: 0,
      assignee: [],
      knowledge: [],
      validateRules: {
        name: [
          {
            required: true,
            message: this.$t(
              'quality.page.dataQualityRepairJob.validateRules.name'
            ),
            trigger: 'blur',
          },
          {
            max: 500,
            message: this.$t(
              'quality.page.dataQualityRepairJob.validateRules.name2'
            ),
            trigger: 'change',
          },
        ],
        modelCategoryId: [
          {
            required: true,
            message: this.$t(
              'quality.page.dataQualityRepairJob.validateRules.modelCategoryId'
            ),
            trigger: 'change',
          },
        ],
        owner: [
          // {required:true,message: '请选择负责人', trigger:'change'}
        ],
        fixedNum: [
          {
            type: 'number',
            message: this.$t(
              'quality.page.dataQualityRepairJob.validateRules.fixedNum'
            ),
          },
        ],
        ruleId: [
          {
            required: true,
            message: this.$t(
              'quality.page.dataQualityRepairJob.validateRules.ruleId'
            ),
            validator: validateRuleFrom,
          },
        ],
        candidates: [
          {
            message: this.$t(
              'quality.page.dataQualityRepairJob.validateRules.candidates'
            ),
            required: true,
            trigger: 'blur',
            validator: validateCandidates,
          },
        ],
      },
      test: {
        date: null,
      },
      closeComment: '',
      closeTaskDialogVisible: false,
      selectUser: {
        visible: false,
        assignee: [],
        title: this.$t('quality.page.dataQualityRepairJob.selectUser'),
        ok: () => {
          this.$bus.$emit('user-selected', this.selectUser.assignee)
        },
      },
      solutions: [],
      usersLabel: '',
      jobDetailsKey: 0,
      nameMapping: {},
      assigneeString: '',
      assigneeNames: '',
      showProblemStatistic: true,
      deleteArr: [
        'rules',
        'jobDetails',
        'validateRules',
        'nameMapping',
        'solutions',
      ],
      ruleArr: [],
      modelIdName: '',
      tableName: '',
      tableNameId: null,
      taskStatus: {
        NOT_START: this.$t(
          'quality.page.dataQualityRepairJob.taskStatus.NOT_START'
        ),
        ACCEPT: this.$t('quality.page.dataQualityRepairJob.taskStatus.ACCEPT'),
        CONFIRM: this.$t(
          'quality.page.dataQualityRepairJob.taskStatus.CONFIRM'
        ),
        FIXED: this.$t('quality.page.dataQualityRepairJob.taskStatus.FIXED'),
        // VERIFIED: '已验证',
        CLOSED: this.$t('quality.page.dataQualityRepairJob.taskStatus.CLOSED'),
      },
      domainInfo: {},
      levelOneName: '',
      levelTwoName: '',
      taskDataObj: {},
    }
  },
  computed: {
    isCreate() {
      return !this.details
    },
  },
  mounted() {
    if (this.details) {
      if (this.details.createManually === undefined) {
        this.getProblemDetail()
      } else {
        this.jobDetails = _.cloneDeep(this.details)
        this.levelOneName = this.details.levelOneName
        this.levelTwoName = this.details.levelTwoName
        this.ruless = this.jobDetails.ruleName
        if (`${this.details.createManually}` !== '2') {
          this.getRule(this.jobDetails.ruleId)
        }
      }
      let arr2 = []
      if (this.jobDetails.candidates) {
        let list = []
        if (typeof this.jobDetails.candidates === 'string') {
          list = this.jobDetails.candidates.includes(',')
            ? this.jobDetails.candidates.split(',')
            : [this.jobDetails.candidates]
        } else {
          list = this.jobDetails.candidates
        }
        arr2.push(...list)
      }
      if (this.jobDetails.owner) {
        let list2 = []
        if (typeof this.jobDetails.owner === 'string') {
          list2 = this.jobDetails.owner.includes(',')
            ? this.jobDetails.owner.split(',')
            : [this.jobDetails.owner]
        } else {
          list2 = this.jobDetails.owner
        }
        arr2.push(...list2)
      }
      arr2 = [...new Set(arr2)]
      // this.getUserByIds(arr2)
      this.documentKey++
      if (this.jobDetails.ruleId) {
        this.getKnowledge(this.jobDetails.ruleId)
        // 获取标准信息
        // this.getDomainInfo(this.jobDetails.ruleId)
      }
      if (`${this.jobDetails.createManually}` === '2') {
        this.getByTaskData()
      }
    }
    if (this.jobDetails.modelCategoryId) {
      this.loadRules()
    }
    if (!this.isCreate) {
      this.getSolutions()
    }
    this.$bus.$on('refreshProblemDetail', () => {
      this.getProblemDetail()
      this.showProblemStatistic = false
      setTimeout(() => {
        this.showProblemStatistic = true
      })
    })
  },
  beforeDestroy() {
    this.$bus.$off('refreshProblemDetail')
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    getByTaskData() {
      // this.details.id
      this.$http
        .post(
          this.$quality_url +
            `/quality/dataRule/getByTaskId?taskId=${this.details.id}`
        )
        .then(res => {
          this.taskDataObj = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取标准信息
    getDomainInfo(id) {
      HTTP.getDomainByDomainRuleId(id).then(res => {
        this.domainInfo = {
          domainId: res.data.domainId,
          domainCode: res.data.domainCode,
          chineseName: res.data.chineseName || '',
          theme: (res.data.path && res.data.path[1]) || '',
        }
      })
    },
    getRule(id) {
      this.$http
        .get(`${this.$quality_url}/quality/rule/tech/${id}`)
        .then(res => {
          if (res.data.modelId !== null) {
            this.getDataSource(res.data.modelId)
          }
          if (res.data.tableId !== null) {
            this.getTableList(res.data.tableId)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDataSource(modelId) {
      if (`${this.jobDetails.createManually}` === '2') return
      this.$http
        .get(`${this.$meta_url}/service/models/${modelId}/plain`)
        .then(res => {
          this.modelIdName = res.data.definition
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTableList(tableId) {
      if (`${this.jobDetails.createManually}` === '2') return
      this.$http
        .get(`${this.$meta_url}/service/entities/${tableId}/summary`)
        .then(res => {
          this.tableName = res.data.physicalName
          this.tableNameId = res.data.tableId
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    jumpTotechRuleName(row) {
      let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
        id: row.ruleId,
        blank: true,
      })
      window.open(pageUrl)
    },
    jumpToDomain(row) {
      this.$skip2Domain(row)
    },
    jumpToDomainCode(row) {
      let query = {
        name: 'code',
        query: {
          code: row,
          blank: true,
        },
      }
      this.$skip2(query)
    },
    jumpToMeta(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/meta?objectId=${row}`)
    },
    async getProblemDetail() {
      await this.$http
        .get(`${this.$quality_url}/quality/rule/task/${this.details.id} `)
        .then(res => {
          this.jobDetails = res.data
        })
        .catch(e => {
          this.$message.error(
            this.$t('quality.page.dataQualityRepairJob.queryFail')
          )
        })
    },

    closeDialog() {
      this.chooseRulesDialogVisible = false
    },
    getUserByIds(idList) {
      if (!idList.length) {
        return
      }
      if (Array.isArray(idList[0])) {
        idList = idList[0]
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj
            this.$emit('saveNameMapping', this.nameMapping)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    qualityRulesSelected(data) {
      this.jobDetails.ruleId = data[0].id
      this.levelOneName = data[0].levelOneName
      this.levelTwoName = data[0].levelTwoName
      this.ruless = data[0].name
    },
    getPeopleName(list) {
      if (!list) {
        return
      }
      const list2 = list.includes(',') ? list.split(',') : [list]
      return list2
        .map(e => (this.nameMapping[e] ? this.nameMapping[e] : e))
        .toString()
    },
    getKnowledge(ruleId) {
      if (`${this.jobDetails.createManually}` === '2') return
      this.$http
        .get(this.$quality_url + '/quality/rule/tech/' + ruleId + '/knowledge')
        .then(res => {
          this.knowledge = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    downloadJobResult() {
      const url =
        this.$url +
        '/service/quality/rule/task/' +
        this.details.id +
        '/resultfile'
      this.$downloadFile(url)
    },
    showJobResult() {
      this.$bus.$emit('showTaskResult', this.details.id)
    },
    loadRules() {
      this.$http
        .get(
          this.$quality_url +
            '/quality/rules/tech/report/' +
            this.jobDetails.modelCategoryId
        )
        .then(res => {
          this.rules = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    modelCategoryIdChange(value) {
      if (value) {
        this.loadRules()
      } else {
        this.rules = []
      }
      this.ruless = ''
      this.jobDetails.ruleId = null
    },
    // getAllUsers(){
    //   this.$http.get(this.$url + '/service/main/users').then(res=>{
    //     this.allUsers = res.data;
    //   }).catch(e=>{
    //     this.$showFailure(e);
    //   });
    // },
    selectProblemUser() {
      this.$utils.staffSelect.open().then(res => {
        const arr1 = []
        const arr2 = []
        res.forEach(e => {
          arr1.push(e.username)
          arr2.push(e.fullname)
        })
        this.selectUser.assignee = arr1
        this.assigneeString = arr2.toString()
      })
    },
    removeTab() {
      this.$bus.$emit('tabRemoved', this.details ? this.details.name : 'add')
      // this.$bus.$emit('refreshList', false)
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        } else {
          const requestBody = this.jobDetails
          if (this.details) {
            this.$http
              .put(
                this.$quality_url + '/quality/rule/task/' + requestBody.id,
                requestBody
              )
              .then(res => {
                this.$message.success(
                  this.$t(
                    'quality.page.dataQualityRepairJob.successfullyModified'
                  )
                )
                this.jobDetails = res.data
                this.jobDetailsKey++
                this.removeTab()
                // this.writable = false
                // this.$bus.$emit('updateOneTask',res.data);
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            if (this.$isShort) {
              requestBody.owner = this.assignee[0]
            }
            this.$http
              .post(
                this.$quality_url +
                  `/quality/rule/task?assignee=${this.assignee.join(',')}`,
                requestBody
              )
              .then(res => {
                this.$message.success(
                  this.$t('quality.page.dataQualityRepairJob.successfullyAdded')
                )
                this.$bus.$emit('reloadRepairJob')
                this.removeTab()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    acceptTask() {
      this.$http
        .post(
          this.$quality_url + `/quality/rules/tasks/${this.details.id}/accept`
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRepairJob.questionReceived')
          )
          this.jobDetails = res.data
          const arr2 = [...new Set(res.data.owner.split(','))]
          // this.getUserByIds(arr2)
          this.$bus.$emit('refreshProblemDetail')
          // this.$bus.$emit('updateOneTask',res.data);
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCloseTask() {
      this.closeComment = ''
      this.closeTaskDialogVisible = true
    },
    closeTask() {
      this.$plainRequest
        .post(
          this.$quality_url + `/quality/rules/tasks/${this.details.id}/close`,
          this.closeComment
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRepairJob.problemClosed')
          )
          this.jobDetails = res.data
          // this.$bus.$emit('updateOneTask',res.data);
          this.$bus.$emit('refreshProblemDetail')
          this.closeTaskDialogVisible = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    confirmTask() {
      this.$http
        .post(
          this.$quality_url + `/quality/rules/tasks/${this.details.id}/confirm`
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRepairJob.problemConfirmed')
          )
          this.jobDetails = res.data
          this.$bus.$emit('refreshProblemDetail')
          // this.$bus.$emit('updateOneTask',res.data);
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    fixTask() {
      this.$http
        .post(this.$quality_url + `/quality/rules/tasks/${this.details.id}/fix`)
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRepairJob.markedFixed')
          )
          this.jobDetails = res.data
          // this.$bus.$emit('updateOneTask',res.data);
          this.$bus.$emit('refreshProblemDetail')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    createSolutions() {
      // TODO POST/quality/rules/solutions
    },
    handleReassignTask() {
      this.selectUser.assignee = []
      // this.selectUser.visible = true
      // this.$bus.$once('user-selected', () => {
      //   this.reassignTask()
      // })
      this.$utils.staffSelect.open([], true, 2, this.details.id).then(res => {
        this.selectUser.assignee = res.map(item => item.username)
        this.reassignTask()
      })
    },
    handleDispatch(rowPks) {
      this.selectUser.assignee = []
      // this.selectUser.visible = true
      this.$utils.staffSelect.open([], true).then(res => {
        this.selectUser.assignee = res.map(item => item.username)
        this.$http
          .post(
            this.$quality_url +
              `/quality/rules/tasks/${this.details.id}/data/dispatch?assignee=${this.selectUser.assignee}`,
            rowPks
          )
          .then(res => {
            this.$message.success(
              this.$t('quality.page.dataQualityRepairJob.issueDistributed')
            )
            this.$bus.$emit('after-dispatch')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleDispatchByOrg({ pks, orgColumn }) {
      this.$http
        .put(
          this.$quality_url +
            `/quality/rules/tasks/${
              this.details.id
            }/dispatch-org?colname=${encodeURI(orgColumn)}`,
          pks ? encodeURI(pks) : null
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRepairJob.distributeMechanism')
          )
          this.$bus.$emit('after-dispatch')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleDispatchByUserId({ pks, orgColumn }) {
      this.$http
        .put(
          this.$quality_url +
            `/quality/rules/tasks/${
              this.details.id
            }/dispatch-user?colname=${encodeURI(orgColumn)}`,
          pks ? encodeURI(pks) : null
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRepairJob.distributeNum')
          )
          this.$bus.$emit('after-dispatch')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    reassignTask() {
      this.$http
        .post(
          this.$quality_url +
            `/quality/rules/tasks/${this.details.id}/reassign?assignee=${this.selectUser.assignee}`
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRepairJob.questionForwarded')
          )
          this.jobDetails = res.data
          // this.$bus.$emit('updateOneTask', res.data)
          // this.$bus.$emit('refreshProblemDetail')
          this.selectUser.visible = false
          // this.$bus.$emit('refreshList')
          this.removeTab()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    goPreview(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + 'main/knowledge?kdId=' + row.kdId, '_blank')
      //      this.$router.push({name:'knowledge',query:{kdId:row.kdId}})
    },
    // selectUsers () {
    //   this.$utils.staffSelect.open().then(res => {
    //     this.assignee = res.map(item => item.tuAcct)
    //     this.assigneeNames = res.map(item => item.tuCname).toString()
    //   })
    // },
    createSolution() {
      // this.jobDetails.ruleName = this.rules.filter(e => e.id === this.jobDetails.ruleId)[0].name
      let row = ''
      if (this.solutions[0]) {
        row = this.solutions[0]
      }
      this.$refs.solution.show(
        row,
        this.jobDetails.owner.includes(this.$user.username)
      )
    },
    updateSolution(row) {
      this.$refs.solution.show(
        row,
        this.jobDetails.owner.includes(this.$user.username)
      )
    },
    getSolutions() {
      this.$http
        .get(
          this.$quality_url +
            `/quality/rules/tasks/${this.details.id}/solutions`
        )
        .then(res => {
          this.solutions = res.data
          // if(type === true) {
          //   this.jobDetails.status = 'SALVE';
          // }
          if (Array.isArray(res.data) && res.data[0]) {
            this.jobDetails.solutionId = res.data[0].id
          } else {
            this.jobDetails.solutionId = null
          }
        })
        .catch(e => {
          this.showFailure(e)
        })
    },
    valueChange(val) {
      this.assignee = val
    },
  },
  watch: {
    // jobDetails () {
    //   if (!this.isCreate) {
    //     this.$refs.history.getData()
    //   }
    // },
    assigneeString(val) {
      if (!val) {
        this.selectUser.assignee = null
      }
    },
    // assigneeNames (val) {
    //   if (!val) {
    //     this.assignee = ''
    //   }
    // }
  },
}
