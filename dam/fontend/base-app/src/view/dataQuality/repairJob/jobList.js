import Status from './Status.vue'
import chooseQualityRules from '../../../components/quality/qualityJob/chooseQualityRules.vue'
import ComponentCaseName from '@/next/constant/ComponentCaseName'

export default {
  components: {
    Status,
    chooseQualityRules,
  },
  props: {
    total: {},
    jobsDisplay: {},
    defaultPara: {},
    jobData: {},
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
    typeState: {},
  },
  data() {
    const formatter = {
      problemNum: (row, col) => {
        const val = row[col]
        if (typeof val === 'number') {
          return val
        } else {
          return 'NA'
        }
      },
      fixedNum: row => {
        const fixed = row.fixedNum
        if (typeof fixed === 'number') {
          return fixed
        } else {
          return typeof row.problemNum !== 'number' ? 'NA' : '0'
        }
      },
      unFixedNum: row => {
        const total = row.problemNum
        const fixed = row.fixedNum
        if (typeof total === 'number') {
          return fixed ? total - fixed : total
        } else {
          return typeof row.problemNum !== 'number' ? 'NA' : '0'
        }
      },
    }
    const allColumns = [
      {
        prop: 'icon',
        width: this.isMonitor || this.isCheck ? '28' : '18',
        slotName: 'icon',
      },
    ]
    if (this.isMonitor || this.isCheck) {
      allColumns.push({
        prop: 'businessDepartment',
        label: this.$t(
          'quality.page.dataQualityRepairJob.table.businessDepartment'
        ),
        'min-width': this.$i18n.locale === 'zh' ? 100 : 120,
      })
    }
    allColumns.push({
      prop: 'name',
      label: this.$t('quality.page.dataQualityRepairJob.table.name'),
      'min-width': this.$i18n.locale === 'zh' ? 120 : 130,
      'show-overflow-tooltip': true,
      dataRequired: true,
      sortable: 'custom',
    })
    allColumns.push({
      prop: 'modelCategoryId',
      label: this.$t('quality.page.dataQualityRepairJob.table.system'),
      'min-width': this.$i18n.locale === 'zh' ? 120 : 160,
      formatter: this.$mappingCategory,
      sortable: 'custom',
      'show-overflow-tooltip': true,
    })
    allColumns.push({
      prop: 'type',
      label: this.$t('quality.page.dataQualityRepairJob.table.type'),
      'min-width': '120',
      formatter: this.typeFormatter,
      'show-overflow-tooltip': true,
    })
    if (this.isCheck) {
      allColumns.push({
        prop: 'verifyStatus',
        label: this.$t('quality.page.dataQualityRepairJob.table.verifyStatus'),
        width: this.$i18n.locale === 'zh' ? '80' : 160,
        slotName: 'verifyStatus',
        formatter: this.taskCheckStatusFormatter,
      })
    }
    if (!this.isCheck) {
      allColumns.push({
        prop: 'status',
        label: this.$t('quality.page.dataQualityRepairJob.table.status'),
        width: this.$i18n.locale === 'zh' ? '' : 140,
        slotName: 'status',
      })
    }
    if (!this.isMonitor && !this.isCheck) {
      allColumns.push({
        prop: 'problemClassify',
        label: this.$t(
          'quality.page.dataQualityRepairJob.table.problemClassify'
        ),
        width: this.$i18n.locale === 'zh' ? '' : 150,
        slotName: 'problemClassify',
      })
    }
    allColumns.push({
      prop: 'createOn',
      label: this.$t('quality.page.dataQualityRepairJob.table.createOn'),
      width: this.$i18n.locale === 'zh' ? 150 : 160,
      formatter: this.$timeFormatter,
      sortable: 'custom',
    })

    allColumns.push({
      prop: 'problemNum',
      label: this.$t('quality.page.dataQualityRepairJob.table.problemNum'),
      width: this.$i18n.locale === 'zh' ? '' : 130,
      // formatter: formatter.problemNum,
      align: 'center',
      slotName: 'problemNum',
    })
    if (!this.isCheck) {
      allColumns.push({
        prop: 'fixedNum',
        label: this.$t('quality.page.dataQualityRepairJob.table.resolvedNum'),
        width: this.$i18n.locale === 'zh' ? 110 : 200,
        // formatter: formatter.fixedNum,
        align: 'center',
        slotName: 'resolvedNum',
      })
    }
    if (!this.isCheck) {
      allColumns.push({
        prop: 'unFixedNum',
        label: this.$t('quality.page.dataQualityRepairJob.table.unresolvedNum'),
        width: this.$i18n.locale === 'zh' ? 120 : 220,
        // formatter: formatter.unFixedNum,
        align: 'center',
        slotName: 'unresolvedNum',
      })
    }
    if (!this.isMonitor && !this.isCheck) {
      allColumns.push({
        prop: 'owner',
        label: this.$t('quality.page.dataQualityRepairJob.table.owner'),
        'show-overflow-tooltip': true,
        'column-key': 'owner',
        width: 120,
        slotName: 'owner',
        dataRequired: true,
      })
    }
    allColumns.push({
      prop: 'operation',
      label: this.$t('quality.page.dataQualityRepairJob.table.operation'),
      width:
        this.isMonitor && this.$i18n.locale === 'zh'
          ? 100
          : this.isMonitor && this.$i18n.locale === 'en'
          ? 140
          : !this.isMonitor && this.$i18n.locale === 'zh'
          ? 180
          : !this.isMonitor && this.$i18n.locale === 'en'
          ? 280
          : 180,
      fixed: 'right',
      align: 'center',
      slotName: 'operation',
      dataRequired: true,
    })

    return {
      isAdmin: this.$isAdmin || this.$auth.ROLE_FIXUP_QUALITY_ADMIN,
      tableHeight: 100,
      jobs: [],
      isSelf: null,
      rawData: [],
      keyword: '',
      category: '',
      status: '',
      value7: '',
      taskType: '0',
      jobsFiltered: [],
      multipleSelection: [],
      currentPage: 1,
      pageSize: 20,
      deleteJobDisabled: true,
      currentJob: {},
      tablePara: {},
      showList: true,
      formatter: formatter,
      organizations: [],
      currentOrganization: [],
      loading: false,
      organizationsMap: new Map(),
      rootOrganization: null,
      staffsMap: new Map(),
      allBranchList: [],
      nameMapping: {},
      currentOrganizationName: '',
      checkStatus: [
        {
          label: this.$t(
            'quality.page.dataQualityRepairJob.checkStatus.notVerified'
          ),
          value: 'NOT_VERIFIED_YET',
        },
        {
          label: this.$t(
            'quality.page.dataQualityRepairJob.checkStatus.allPass'
          ),
          value: 'VERIFIED_ALL_PASSED',
        },
        {
          label: this.$t(
            'quality.page.dataQualityRepairJob.checkStatus.partiallyPassed'
          ),
          value: 'VERIFIED_PARTIALLY_PASSED',
        },
        {
          label: this.$t('quality.page.dataQualityRepairJob.checkStatus.fail'),
          value: 'VERIFIED_NO_PASSED',
        },
        {
          label: this.$t(
            'quality.page.dataQualityRepairJob.checkStatus.noVerification'
          ),
          value: 'NOT_AVAILABLE',
        },
      ],
      verifyStatus: '',
      deleteArr: [
        'pickerOptions2',
        'jobs',
        'rawData',
        'multipleSelection',
        'currentJob',
        'tablePara',
        'formatter',
        'organizations',
      ],
      option: {
        selectable: !this.isCheck && !this.isMonitor,
        autoHideSelectable: true,
        showColumnSelection: true,
        hasAccess: this.$isAdmin || this.$auth.CUSTOM_COLUMN_MANAGEMENT,
        columnSelection: [],
        columnResizable: false,
      },
      taskStatus: null,
      taskStatusAll: {
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
      taskStatusShort: {
        NOT_START: this.$t(
          'quality.page.dataQualityRepairJob.taskStatus.NOT_START'
        ),
        FIXED: this.$t('quality.page.dataQualityRepairJob.taskStatus.FIXED'),
        CLOSED: this.$t('quality.page.dataQualityRepairJob.taskStatus.CLOSED'),
      },
      taskStatusType: {
        NOT_START: 1,
        ACCEPT: 2,
        CONFIRM: 6,
        FIXED: 4,
        // VERIFIED: '已验证',
        CLOSED: 7,
      },
      verifyStatusType: {
        NOT_VERIFIED_YET: 1,
        VERIFIED_ALL_PASSED: 4,
        VERIFIED_PARTIALLY_PASSED: 3,
        VERIFIED_NO_PASSED: 5,
        NOT_AVAILABLE: 2,
      },
      chooseRulesDialogVisible: false,
      techRules: '',
      showTop: false,
      componentCaseName: this.isCheck
        ? ComponentCaseName.DataQualityCheck
        : ComponentCaseName.RepairJobList,
      allColumns: allColumns,
      bigsmallValue: [],
      bigClassList: [],
      bigClassSelectOption: null,
      smallClassSelectOption: null,
    }
  },
  mounted() {
    if (this.$isShort) {
      this.taskStatus = this.taskStatusShort
    } else {
      this.taskStatus = this.taskStatusAll
    }
    this.$modelCategories.forEach(element => {
      if (!element.displayName) {
        if (element.categoryAbbreviation) {
          element.displayName =
            element.categoryName + '（' + element.categoryAbbreviation + '）'
        } else {
          element.displayName = item.categoryName
        }
      }
    })
    if (this.$route.query.name) {
      this.keyword = this.$route.query.name
      this.taskName = this.keyword
    }
    if (this.$route.query.type) {
      this.taskType = this.$route.query.type
    }
    if (this.$route.query.id && this.typeState !== 'rules') {
      this.$http
        .get(`${this.$quality_url}/quality/rule/task/${this.$route.query.id} `)
        .then(res => {
          this.$nextTick(() => {
            this.handleRowClick(res.data)
          })
        })
        .catch(e => {
          this.$showFailure(e.response.data.rootErrorMessage)
        })
    }
    this.isSelf = !(this.isMonitor
      ? this.$auth.QUALITY_PROBLEM_MONITORING_VIEW_ALL
      : this.isCheck
      ? this.$auth.QUALITY_PROBLEM_CHECK_VIEW_ALL
      : this.$auth.QUALITY_ISSUE_LIST_VIEW_ALL)
    setTimeout(() => {
      this.resize()
    })
    for (const key in this.defaultPara) {
      this.$set(this.tablePara, key, this.defaultPara[key])
    }
    $(window).resize(this.resize)
    this.$bus.$on('repairJobLoaded', jobs => {
      setTimeout(() => {
        // this.rawData = jobs.reverse();
        // this.filterSelf();
      })
    })
    this.$bus.$on('updateOneTask', data => {
      this.jobs.forEach(item => {
        if (item.id === data.id) {
          for (const index in data) {
            item[index] = data[index]
          }
        }
      })
      // this.filterJobByKeyword();
      this.changeDisplay(this.tablePara)
    })
    this.$bus.$on('setLoading', val => {
      this.loading = val
    })
    if (this.isMonitor) {
      // this.initStaffsMap()
      // this.getOrganizations()
      // this.getAllBranchObj()
    }
    this.$bus.$on('reloadRepairJob', () => {
      this.changeDisplay(this.tablePara)
    })
    this.getBigClassListAndBusinessTypeList()
  },
  beforeDestroy() {
    this.$bus.$off('repairJobLoaded')
    this.$bus.$off('updateOneTask')
    $(window).unbind('resize', this.resize)
    this.$bus.$off('reloadRepairJob')
    this.$bus.$off('setLoading')
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
  },
  watch: {
    /* showTop(val) {
      document.getElementById('repairJob').style.marginTop = val
        ? '72px'
        : '36px'
    }, */
    keyword(newVal) {
      this.tablePara.taskName = newVal
      this.tablePara.currentPage = 1
      // this.changeDisplay(this.tablePara)
    },
    isSelf(self) {
      if (self) {
        this.handleFilterChange({
          owner: ['self'],
        })
      } else {
        this.handleFilterChange({
          owner: [],
        })
      }
    },
    currentOrganizationName(value) {
      if (!value) {
        this.currentOrganization = ''
        this.currentOrganizationChange()
      }
    },
  },
  methods: {
    handleActiveClassOptions(val) {
      this.getSmallClassList(val[0])
    },
    handleChangeClassOptions(val) {
      this.bigClassSelectOption = val[0]
      this.smallClassSelectOption = val[1]
    },
    getBigClassListAndBusinessTypeList() {
      // return new Promise(resolve => {
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          const classList = res.data
          classList.forEach(e => {
            const classObj = {
              id: e.id,
              label: e.optionValue,
              value: e.ruleCode,
              children: [],
            }
            this.bigClassList.push(classObj)
          })
          // resolve()
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // })
    },
    getSmallClassList(val) {
      this.smallClassList = []
      const pId = this.bigClassList.filter(e => e.value === val)[0].id
      this.$http
        .post(`${this.$url}/select/option/getByParentId?parentId=${pId}`)
        .then(res => {
          let temp = []
          res.data.forEach(e => {
            const obj = {
              id: e.id,
              label: e.optionValue,
              value: e.ruleCode,
            }
            if (e.parentId === pId) {
              temp.push(obj)
            }
            this.bigClassList.forEach((element, i) => {
              if (element.id === pId) {
                this.$set(this.bigClassList[i], 'children', temp)
              }
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeDialog() {
      this.chooseRulesDialogVisible = false
    },
    qualityRulesSelected(data) {
      this.techRules = data[0].name
      this.tablePara.techRuleId = data[0].id
    },
    clearTechRules() {
      this.tablePara.techRuleId = ''
    },
    getBranchName(id) {
      try {
        return this.$modelCategories.filter(e => e.categoryId === id)[0]
          .businessDepartmentName
      } catch (e) {
        // statements
        return ''
      }
    },
    query() {
      const ruleType = this.bigsmallValue.length
        ? this.bigsmallValue.length === 2
          ? this.bigsmallValue.join(',')
          : this.bigsmallValue[0]
        : ''
      this.$set(this.tablePara, 'option', ruleType)
      this.changeDisplay(this.tablePara)
    },
    reset() {
      this.keyword = ''
      this.currentOrganizationName = ''
      this.status = ''
      this.verifyStatus = ''
      this.category = ''
      this.techRules = ''
      this.bigsmallValue = ''
      this.value7 = ''
      this.tablePara.status = ''
      this.tablePara.modelCategoryId = ''
      this.tablePara.techRuleId = ''
      this.tablePara.beginTime = null
      this.tablePara.endTime = null
    },
    exportTable(isAll) {
      if (!isAll) {
        if (!this.multipleSelection.length) {
          this.$message.info(
            this.$t('quality.page.dataQualityRepairJob.checkExport')
          )
        } else {
          this.$downloadFilePost(
            `${this.$quality_url}/quality/rule/task/export`,
            { taskIds: this.multipleSelection.map(e => e.id) },
            this.$t('common.page.dataQualityRepairJob')
          )
        }
      } else {
        const obj = _.cloneDeep(this.tablePara)
        Object.keys(obj).forEach(e => {
          if (obj[e] === '') {
            obj[e] = null
          }
        })
        obj.taskType = this.taskType
        this.$downloadFilePost(
          `${this.$quality_url}/quality/rule/task/export`,
          obj,
          this.$t('common.page.dataQualityRepairJob')
        )
      }
    },
    getPeopleName(list) {
      const list2 = typeof list === 'string' ? list.split(',') : list
      return list2
        .map(e => (this.nameMapping[e] ? this.nameMapping[e] : e))
        .toString()
    },
    typeFormatter(row) {
      if (row.levelTwoName) {
        return row.levelOneName + '-' + row.levelTwoName
      } else {
        return row.levelOneName
      }
    },
    taskCheckStatusFormatter(row) {
      let st = ''
      switch (row.verifyStatus) {
        case 'NOT_VERIFIED_YET':
          st = this.$t(
            'quality.page.dataQualityRepairJob.checkStatus.notVerified'
          )
          break
        case 'VERIFIED_ALL_PASSED':
          st = this.$t('quality.page.dataQualityRepairJob.checkStatus.allPass')
          break
        case 'VERIFIED_PARTIALLY_PASSED':
          st = this.$t(
            'quality.page.dataQualityRepairJob.checkStatus.partiallyPassed'
          )
          break
        case 'VERIFIED_NO_PASSED':
          st = this.$t('quality.page.dataQualityRepairJob.checkStatus.fail')
          break
        case 'NOT_AVAILABLE':
          st = this.$t(
            'quality.page.dataQualityRepairJob.checkStatus.noVerification'
          )
          break
      }
      return st
    },
    selectBranch() {
      this.$utils.branchSelect.open().then(res => {
        this.currentOrganization = res.bm
        this.currentOrganizationName = res.fullName
        this.currentOrganizationChange()
      })
    },
    initStaffsMap() {
      const requestBody = {
        name: '',
        roleId: 0,
        groupId: 0,
        organizationId: this.rootOrganization,
      }
      const url = this.$url + '/service/staffs/staff/page'
      this.$http
        .post(url, requestBody)
        .then(res => {
          const staffsMap = new Map()
          res.data.content.forEach(item => {
            if (item.username && !this.staffsMap.has(item.username)) {
              this.staffsMap.set(
                item.username,
                this.organizationsMap.get(item.bm)
              )
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getStaffs(organizationId) {
      // let organizationId = ((organizations && organizations.length >= 1) ? organizations[organizations.length - 1]: '')
      const requestBody = {
        name: '',
        roleId: 0,
        groupId: 0,
      }
      if (organizationId) {
        requestBody.organizationId = organizationId
        const url = this.$url + '/service/staffs/staff/page'
        this.$http
          .post(url, requestBody)
          .then(res => {
            this.tablePara.owner = res.data.content
              .filter(item => item.username)
              .map(item => item.username)
            this.changeDisplay(this.tablePara)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.tablePara.owner = null
        this.changeDisplay(this.tablePara)
      }
    },
    getOrganizations() {
      // this.$http.post(this.$url + `/service/organizations/`).then(res => {
      //   this.organizations = res.data
      //   const organizationsMap = new Map()
      //   // TODO 此处是为了应付page无法响应无机构参数的情况
      //   this.rootOrganization = res.data[0].toId
      //   this.rootOrganization = null
      //   this.initStaffsMap()
      //   const ForEach = (node, paths) => {
      //     paths.push(node.toFname)
      //     organizationsMap.set(node.toId, paths)
      //     if (node.nodes) {
      //       node.nodes.forEach(child => {
      //         ForEach(child, _.clone(paths))
      //       })
      //     }
      //   }
      //   res.data.forEach(item => {
      //     ForEach(item, [])
      // })
      //   this.organizationsMap = organizationsMap
      // }).catch(e => {
      //   this.$showFailure(e)
      // })
    },
    getAllBranchObj() {
      // this.$http.get(`${this.$url}/service/organizations/idNameMapping`).then(res => {
      //   let arr = []
      //   for (let item in res.data) {
      //     if (res.data.hasOwnProperty(item)) {
      //       arr.push({
      //         id: item,
      //         name: res.data[item]
      //       })
      //     }
      //   }
      //   this.allBranchList = arr
      // }).catch(e => {
      //   this.$showFailure(e)
      // })
    },
    handleOrganizationChange(organization) {
      this.getStaffs(this.currentOrganization)
    },
    resize() {
      if (!$('.table-row')[0] || $('.table-row')[0].offsetHeight === 0) {
        return
      }
      this.tableHeight = $('.table-row')[0].offsetHeight
    },
    handleRowClick(row) {
      if (this.typeState !== 'rules') {
        this.$http
          .get(`${this.$quality_url}/quality/rule/task/${row.id} `)
          .then(res => {
            this.currentJob = _.cloneDeep(row)
            this.$set(this.currentJob, 'status', res.data.status)
            this.$set(this.currentJob, 'owner', res.data.owner)
            if (row.datasourceType) {
              this.currentJob.datasourceType = row.datasourceType
            }
            if (this.currentJob.owner === this.$user.username || this.isAdmin) {
              this.currentJob.writable = true
            }
            this.currentJob.directEdit = true
            this.$bus.$emit(
              'editJob',
              this.currentJob,
              !!(
                (row.owner && row.owner.includes(this.$user.username)) ||
                (row.candidates &&
                  row.candidates.includes(this.$user.username)) ||
                this.$isRole(
                  this.$t('quality.page.dataQualityRepairJob.dataqualityAdmin')
                )
              )
            )
          })
          .catch(e => {
            this.$showFailure(e.response.data.rootErrorMessage)
          })
      } else {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl + `main/dataQuality/repairJob?id=${row.id}`,
          '_blank'
        )
      }
    },
    handleRowClickDirectOpenData(row) {
      window.sessionStorage.setItem('direct-open-data', 'true')
      setTimeout(() => {
        window.sessionStorage.removeItem('direct-open-data')
      }, 500)
      this.currentJob = _.cloneDeep(row)
      if (this.currentJob.owner === this.$user.username || this.isAdmin) {
        this.currentJob.writable = true
      }
      this.currentJob.directEdit = true
      this.$bus.$emit('showProblemData', this.currentJob.id, this.currentJob)
    },
    editJob($index) {
      this.currentJob = _.cloneDeep(this.jobsDisplay[$index])
      if (this.currentJob.owner === this.$user.username || this.isAdmin) {
        this.currentJob.writable = true
        this.currentJob.directEdit = true
      }
      this.$bus.$emit('editJob', this.currentJob)
    },
    showJobResult($index) {
      this.currentJob = _.cloneDeep(this.jobsDisplay[$index])
      this.$bus.$emit('showTaskResult', this.currentJob.id)
    },
    downloadJobResult($index) {
      this.currentJob = _.cloneDeep(this.jobsDisplay[$index])
      const url =
        this.$quality_url +
        '/quality/rule/task/' +
        this.currentJob.id +
        '/resultfile'
      this.$downloadFile(url)
    },
    addJob() {
      this.$bus.$emit('addJob')
    },
    getJobs(allJobs) {
      this.rawData = allJobs
    },
    handleFilterChange(obj) {
      let bool = false
      if (obj && obj.owner && obj.owner.length > 0) {
        bool = true
      }
      this.isSelf = bool
      this.tablePara.owner = bool ? [this.$user.username] : null
      this.tablePara.currentPage = 1
      this.changeDisplay(this.tablePara)
    },
    handleSortChange(arg) {
      const map = {
        modelCategoryId: 'modelCategory',
        name: 'name',
        status: 'status',
        createOn: 'createOn',
        owner: 'owner',
        problemNum: 'problemNum',
        fixedNum: 'unfixedNum',
      }
      const [propertyName, order] = [arg.prop, arg.order]
      this.tablePara.orderCol = map[propertyName]
      if (propertyName) {
        this.tablePara.orderType = order === 'ascending' ? 'ASC' : 'DESC'
      } else {
        this.tablePara.orderCol = map[this.defaultPara.orderCol]
        this.tablePara.orderType = this.defaultPara.orderType
      }
      this.tablePara.currentPage = 1
      this.changeDisplay(this.tablePara)
    },
    reloadJobs() {
      this.$bus.$emit('reloadRepairJob', this.tablePara)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.deleteJobDisabled = this.multipleSelection.length === 0
    },
    handleStatusChange(status) {
      this.tablePara.status = status
      this.tablePara.currentPage = 1
    },
    handleVerifyStatusChange(status) {
      this.tablePara.verifyStatus = status
      this.tablePara.currentPage = 1
    },
    handleChangeCotegory(catagoryId) {
      this.tablePara.modelCategoryId = catagoryId
      this.tablePara.currentPage = 1
      // this.changeDisplay(this.tablePara);
    },
    handleChangeTime(timeArr) {
      if (timeArr && Array.isArray(timeArr) && timeArr.length > 0) {
        this.tablePara.beginTime = timeArr[0]
        this.tablePara.endTime = timeArr[1]
      } else {
        this.tablePara.beginTime = null
        this.tablePara.endTime = null
      }
      this.tablePara.currentPage = 1
      // this.changeDisplay(this.tablePara);
    },
    preDeleteRows() {
      this.$confirm(
        this.$t('quality.page.dataQualityRepairJob.deletePrompt'),
        this.$t('quality.page.dataQualityRepairJob.deletequestion'),
        {
          type: 'warning',
          closeOnClickModal: false,
        }
      ).then(() => {
        this.deleteRows()
      })
    },
    reOpen(id) {
      this.$DatablauCofirm(
        this.$t('quality.page.dataQualityRepairJob.okReopen'),
        this.$t('el.messagebox.title'),
        {
          type: 'warning',
          closeOnClickModal: false,
        }
      ).then(() => {
        this.$http
          .post(`${this.$quality_url}/quality/rules/tasks/reopen`, [id])
          .then(res => {
            if (res.data) {
              this.$message.success(
                this.$t('quality.page.dataQualityRepairJob.operationSucceed')
              )
              const obj = {
                currentPage: 1,
                pageSize: 20,
                taskName: '',
                modelCategoryId: null,
                status: '',
                beginTime: null,
                endTime: null,
                owner: this.isSelf ? [this.$user.username] : null,
                orderCol: 'createOn',
                orderType: 'DESC',
                verifyStatus: '',
                verify: true,
                techRuleId: '',
                taskType: this.taskType,
              }
              this.$emit('loadQualityJobs', obj)
            } else {
              this.$message.error(
                this.$t('quality.page.dataQualityRepairJob.reopenFailed')
              )
            }
          })
          .catch(() => {
            this.$message.error(
              this.$t('quality.page.dataQualityRepairJob.reopenFailed')
            )
          })
      })
    },
    downloadResults() {
      const self = this
      const rows = self.multipleSelection
      const length = rows.length
      if (length === 0) {
      } else {
        const ids = []
        rows.forEach((row, index) => {
          ids.push(row.id)
        })
        // location.href = `${this.$url}/service/quality/rule/taskbatch/?taskIds=${ids.join(',')}`;
        const url = `${
          this.$quality_url
        }/quality/rule/taskbatch/?taskIds=${ids.join(',')}`
        this.$downloadFile(url)
        this.reloadJobs()
        this.handleSelectionChange([])
      }
    },
    deleteRows() {
      const self = this
      const rows = self.multipleSelection
      const length = rows.length
      if (length === 0) {
      } else {
        const ids = []
        rows.forEach((row, index) => {
          ids.push(row.id)
        })
        this.$http
          .post(this.$quality_url + '/quality/rule/task/delete', ids)
          .then(res => {
            this.$message.success(this.$version.common.operationSucceed)
            this.$bus.$emit('jobsDeleted', this.multipleSelection)
            this.reloadJobs()
            // this.$bus.$emit('reloadRepairJob');
            this.handleSelectionChange([])
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handleSizeChange(pageSize) {
      this.tablePara.pageSize = pageSize
      this.tablePara.currentPage = 1
      this.changeDisplay(this.tablePara)
    },
    handleCurrentChange(current) {
      this.tablePara.currentPage = current
      this.changeDisplay(this.tablePara)
    },
    currentOrganizationChange() {
      this.tablePara.taskName = this.keyword
      this.tablePara.businessDepartmentId = this.currentOrganization
      this.tablePara.currentPage = 1
      // this.changeDisplay(this.tablePara);
    },
    changeDisplay(para) {
      if (para) {
        para = _.clone(para)
      } else {
        para = null
      }
      if (para && para.currentPage) {
        this.currentPage = para.currentPage
      }
      /* if (!this.isCheck) {
        para.taskType = this.taskType
      } */
      para.taskType = this.taskType
      this.$emit('loadQualityJobs', para)
    },
    selectable(row) {
      return this.isAdmin || this.$user.username === row.owner
    },
    resetTableSta(para) {
      if (para) {
        this.showList = false
        this.$nextTick(() => {
          this.showList = true
        })
      }
    },
    showMenu(index, evt) {
      const x = window.innerWidth - 50
      const y = evt.pageY
      const options = []
      options.push({
        label: this.$t('quality.page.dataQualityRepairJob.viewResults'),
        callback: () => {
          this.showJobResult(index)
        },
      })
      options.push({
        label: this.$t('quality.page.dataQualityRepairJob.downloadResults'),
        callback: () => {
          this.downloadJobResult(index)
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
  },
}
