import advancedFiltering from './advancedFiltering.vue'
import { uniqBy } from 'lodash'

export default {
  components: { advancedFiltering },
  props: ['details', 'jobListData'],
  beforeMount() {},
  mixins: [],
  data() {
    return {
      rulesDisplay: this.details ? null : [],
      chooseRulesDialogVisible: false,
      writable: this.details ? this.details.directEdit : true,
      jobDetails: {
        owner: this.$user.username,
        modelId: '',
        selectedTime: new Date(0, 0, 0),
        selectedWeekDays: ['Sun'],
        name: '',
        jobId: '',
        jobContent: '',
        creator: '',
        status: '',
        schedule: '',
        createOn: '',
        startTime: '',
        endTime: '',
        nextRun: '',
        result: '',
        log: '',
        // disable: false,
        // autoDistributeIssue: false,
        // sendMail: false,
      },
      disable: false,
      autoDistributeIssue: true,
      sendMail: false,
      emailReceivers: [],
      scheduleType: 'wait',
      chosen: [],
      loadedDatasources: [],
      dataSources: [],
      firstTime: true,
      modelCategoryId: '',
      autoCreateTask: true,
      allUsers: [],
      mailList: [],
      cronData: '',
      validateRules: {
        name: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.name1'
            ),
            trigger: 'blur',
          },
          {
            max: 128,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.name2'
            ),
            trigger: 'change',
          },
        ],
        selectedWeekDays: [
          {
            type: 'array',
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.selectedWeekDays'
            ),
            trigger: 'change',
          },
        ],
        selectedTime: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.selectedTime'
            ),
            trigger: 'change',
          },
        ],
        modelCategoryId: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.modelCategoryId'
            ),
            trigger: 'change',
          },
        ],
        modelId: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.modelId'
            ),
            trigger: 'change',
          },
        ],
        owner: [
          {
            required: true,
            message: this.$t(
              'quality.page.qualityExamineJob.validateRules.owner'
            ),
            trigger: 'change',
          },
        ],
      },
      showRuleTable: true,
      smallClassList: [],
      searchFormData: {
        ruleName: '',
        smallClassSelectOption: '',
        bigClassSelectOption: '',
        bizTypeSelectOption: '',
      },
      systemList: [],
      smallTableLoading: false,
      oldModelCategoryId: null,
      isUserCron: false,
      parameterIds: null,
      sendMailArr: JSON.stringify([
        {
          value: '01',
          label: '发送邮件通知',
        },
      ]),
      dateTemplates: [],
      canExecuteDateTemplates: [],
      simplePageVisible: false,
      simplePageList: {
        domainAdd: '基于基础标准',
        domainCode: '基于标准代码',
        metaDataAdd: '基于元数据',
      },
      simplePageListKey: {
        domainAdd: 'foldId',
        domainCode: 'nodekey',
        metaDataAdd: 'id',
      },
      simplePage: '',
      treeKeyword: '',
      firstKeyword: '',
      couKeyword: '',
      treeData: [],
      defaultPropsList: {
        domainAdd: {
          children: 'nodes',
          label: 'name',
          id: 'id',
        },
        domainCode: {
          label: 'name',
          id: 'code',
        },
        metaDataAdd: {
          children: 'subNodes',
          label: 'name',
        },
      },
      defaultProps: {
        children: 'nodes',
        label: 'name',
        id: 'id',
      },
      defaultPropsCode: {
        label: 'name',
        id: 'code',
      },
      expandedKeys: [],
      defaultCurrentNode: '',
      treeKey: 0,
      columnList: [],
      tooltiplong: false,
      tableDataLeft: [],
      tableDataLeftData: {},
      currentPageLeft: 1,
      pageSizeLeft: 20,
      totalLeft: 0,
      tableDataRight: [],
      currentPageRight: 1,
      pageSizeRight: 20,
      totalRight: 0,
      allLeftValue: false,
      allRightValue: false,
      dataRuleDataPage: 1,
      dataRuleDataSize: 20,
      dataRuleDataTotal: 0,
      dataRuleData: [],
      dataRuleColumnData: [],
      batchNumber: '',
      allRightValueNum: 0,
      leftListSelection: [],
      dataRuleDataRow: {},
      // 添加数据规则
      ruleDataVisible: false,
      ruleDataTableKeyword: '',
      ruleDataTable: [],
      ruleDataTableCurrentPage: 1,
      ruleDataTablePageSize: 20,
      ruleDataTableTotal: 0,
      ruleClickData: [],
      updateRuleId: null,
      filteringDialog: false,
      dtoMap: {},
      addSql: {},
      selectIdlist: [],
      classOptions: [],
    }
  },
  created() {
    // 获取系统
    this.$getModelCategories()
    this.$bus.$emit('getRuleType')
  },
  mounted() {
    // this.systemList = this.$modelCategories.filter(e => e.canQuery === 1)
    this.systemList = _.cloneDeep(this.$modelCategories)
    if (this.details) {
      this.innerLoadDataSources()
      this.details.selectedWeekDays = []
      this.details.selectedTime = ''
      this.details.owner = ''
      this.details.modelId = ''
      this.jobDetails = _.cloneDeep(this.details)
      this.jobDetails.jobContent = this.details.jobContent

      if (JSON.parse(this.jobDetails.jobContent).schedule) {
        const schedule = JSON.parse(this.jobDetails.jobContent).schedule
        if (schedule.includes('cron')) {
          this.jobDetails.schedule = schedule.slice(5)
        }
      }
      if (JSON.parse(this.jobDetails.jobContent).schedule === null) {
        this.jobDetails.schedule = null
      }
      if (JSON.parse(this.jobDetails.jobContent).runCycle === '自定义') {
        this.isUserCron = true
      }
      this.getDefaultDetail()
      this.getDataRuleData()
    } else {
      // 获取批次号接口
      this.getBatchNumber()
    }
    this.getDateTemplate()
    this.$bus.$on('closeDialog', () => {
      this.chooseRulesDialogVisible = false
    })
    // 数据规则范围列表
  },
  beforeDestroy() {
    this.$bus.$off('closeDialog')
  },
  methods: {
    getBigClassListAndBusinessTypeList() {
      this.classOptions = []
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          this.classOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    searchQuery(id) {
      let name = ''
      this.classOptions.forEach(element => {
        if (element.ruleCode == id) {
          name = element.optionValue
        }
      })
      return name
    },
    closeColumnList() {
      this.columnList = []
      this.$refs.tableDataRightTable.clearSelection() // 清空列表的选中
    },
    ruleDataTableSearch() {
      this.ruleDataTablePageSize = 20
      this.ruleDataTableCurrentPage = 1
      this.getRuleDataTable()
    },
    conditionAdd(row) {
      this.dtoMap = _.cloneDeep(row)
      this.filteringDialog = true
    },
    sqlCompletion(obj) {
      this.getDataRuleData()
    },
    closeFilteringDialog() {
      this.filteringDialog = false
    },
    // 删除表级别规则配置接口
    deleteDataRuleRangeTableId(row) {
      this.$DatablauCofirm('确定删除吗？', '删除提示', {
        confirmButtonText: '删除',
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$http
            .post(
              this.$quality_url +
                `/quality/dataRule/deleteRuleTable?dataRuleRangeTableId=${row.id}`
            )
            .then(res => {
              this.$message.success('删除成功')
              this.dataRuleColumnData = []
              if (this.dataRuleData.length === 1 && this.dataRuleDataPage > 1) {
                this.dataRuleDataCurrentChange(this.dataRuleDataPage - 1)
              } else {
                this.dataRuleDataCurrentChange(this.dataRuleDataPage)
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    // 删除字段规则配置接口
    deleteDataRuleRangeId(row) {
      this.$DatablauCofirm('确定删除吗？', '删除提示', {
        confirmButtonText: '删除',
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$http
            .post(
              this.$quality_url +
                `/quality/dataRule/deleteRule?dataRuleRangeId=${row.id}`
            )
            .then(res => {
              this.$message.success('删除成功')
              this.dataRuleData.forEach(element => {
                if (element === this.dataRuleDataRow) {
                  this.$refs.dataRuleData.setCurrentRow(element)
                  this.dataRuleDataRowClick(element)
                }
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    // 修改字段级别的数据规则的内容
    updateRuleClick(data, id, domainCode) {
      this.getBigClassListAndBusinessTypeList()
      this.ruleDataTable = JSON.parse(JSON.stringify(data))
      this.ruleClickData = JSON.parse(JSON.stringify(data))
      this.updateRuleId = id
      this.ruleDataVisible = true
    },
    // 添加数据规则的列表
    getRuleDataTable(domainCode) {
      let obj = {
        name: this.ruleDataTableKeyword,
        currentPage: this.ruleDataTableCurrentPage,
        pageSize: this.ruleDataTablePageSize,
        domainCode: domainCode,
      }
      this.$http
        .post(this.$domain_url + `/domains/dataRule/getPage`, obj)
        .then(res => {
          this.ruleClickData.forEach(element => {
            res.data.content.forEach(ele => {
              if (element.id === ele.id) {
                ele.check = true
              }
            })
          })
          this.ruleDataTable = res.data.content
          this.ruleDataTableTotal = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeEnableValue(row) {
      if (row.check === false) {
        const index = this.ruleClickData.findIndex(item => item.id === row.id)
        if (index !== -1) {
          this.ruleClickData.splice(index, 1)
        }
      } else {
        this.ruleClickData.push(row)
      }
    },
    updateRuleSave() {
      let obj = {
        id: this.updateRuleId,
        dataRuleStatusList: this.ruleDataTable,
      }
      this.$http
        .post(this.$quality_url + `/quality/dataRule/updateRule`, obj)
        .then(res => {
          this.ruleDataVisible = false
          this.$message.success('添加成功')
          this.dataRuleData.forEach(element => {
            if (element === this.dataRuleDataRow) {
              this.$refs.dataRuleData.setCurrentRow(element)
              this.dataRuleDataRowClick(element)
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateRuleClose() {
      this.ruleDataVisible = false
    },
    ruleDataTableSizeChange(val) {
      this.ruleDataTablePageSize = val
      this.ruleDataTableCurrentPage = 1
      this.getRuleDataTable()
    },
    ruleDataTableCurrentChange(val) {
      this.ruleDataTableCurrentPage = val
      this.getRuleDataTable()
    },
    dataRuleDataRowClick(row) {
      this.dataRuleDataRow = row
      this.$http
        .post(
          this.$quality_url +
            `/quality/dataRule/getColumnList?ruleRangeTableId=${row.id}`
        )
        .then(res => {
          this.dataRuleColumnData = res.data
          if (res.data.length === 0) {
            this.getDataRuleData()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getBatchNumber() {
      this.$http
        .post(this.$quality_url + '/quality/dataRule/getBatchNumber')
        .then(res => {
          this.batchNumber = res.data
          this.getDataRuleData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDataRuleData() {
      let obj = {
        currentPage: this.dataRuleDataPage,
        pageSize: this.dataRuleDataSize,
      }
      if (this.details) {
        obj.jobId = this.jobDetails.jobId
      } else {
        obj.batchNumber = this.batchNumber
      }
      this.$http
        .post(this.$quality_url + '/quality/dataRule/getTablePage', obj)
        .then(res => {
          this.dataRuleData = res.data.content
          this.dataRuleDataTotal = res.data.totalItems
          if (res.data.content.length > 0) {
            this.$refs.dataRuleData.setCurrentRow(res.data.content[0])
            this.dataRuleDataRowClick(res.data.content[0])
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 数据范围规则
    dataRuleDataCurrentChange(val) {
      this.dataRuleDataPage = val
      this.getDataRuleData()
    },
    dataRuleDataSizeChange(val) {
      this.dataRuleDataSize = val
      this.dataRuleDataPage = 1
      this.getDataRuleData()
    },
    getTooltip(event) {
      let self = this
      this.$nextTick(() => {
        let aScroolWidth = $(event.target)[0]
          ? $(event.target)[0].scrollWidth
          : 0
        if (aScroolWidth > 64) {
          self.tooltiplong = false
        } else {
          self.tooltiplong = true
        }
      })
    },
    handleCloseColumn(v, i) {
      this.tableDataRight.forEach(item => {
        if (item.objectId === v.objectId) {
          this.$nextTick(() => {
            this.$refs.tableDataRightTable.toggleRowSelection(item, false) // 只取消选中匹配的项
          })
        }
      })
    },
    changeAllLeftValue() {
      this.$refs.tableDataLeft.clearSelection() // 清空列表的选中
      if (this.allLeftValue === true) {
        this.getSimplePageData(this.selectIdlist, {
          modelIds: this.tableDataLeftData
            ? this.tableDataLeftData.modelIds
            : null,
          schema:
            this.tableDataLeftData &&
            this.tableDataLeftData.type === 'MODEL_SCHEMA'
              ? this.tableDataLeftData.name
              : null,
        })
        this.tableDataRight = []
      } else {
        this.tableDataRight = []
        this.totalRight = 0
      }
    },
    changeAllRightValue() {
      this.allRightValueNum = this.totalRight
      this.columnList = []
      this.$refs.tableDataRightTable.clearSelection() // 清空列表的选中
    },
    handleCommand(type) {
      this.simplePage = type
      this.simplePageVisible = true
      this.tableDataRight = []
      if (this.simplePage === 'domainAdd') {
        this.tableDataLeft = []
        this.getDomainData()
      } else if (this.simplePage === 'domainCode') {
        this.tableDataLeft = []
        this.getDomainCodeData()
      } else {
        this.tableDataLeft = []
        this.getTableData()
      }
    },
    getTableData() {
      this.$http
        .get(this.$meta_url + '/service/models/modeltree?dataConnection=true')
        .then(res => {
          if (res.data.subNodes) {
            const modelTree = _.cloneDeep(res.data.subNodes)
            modelTree.forEach(dep => {
              if (dep.subNodes) {
                dep.subNodes.forEach(cat => {
                  if (cat.subNodes) {
                    cat.subNodes.forEach(model => {
                      delete model.subNodes
                    })
                  }
                })
              }
            })
            // this.getModCatMap(res.data)
            this.treeData = this.treeSort(res.data)
            // this.getTableDataLeft()
            // this.$nextTick(() => {
            //   this.$refs.mainTree.setCurrentKey(this.treeData[0].nodekey)
            //   this.getTableDataLeft(this.treeData[0])
            // })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    sortByName(node) {
      const departments = node.subNodes
      this.$utils.sort.sortConsiderChineseNumber(departments)
    },
    treeSort(root) {
      const t = root.subNodes
      if (t != null) {
        this.sortByName(root)
        t.forEach(item => {
          this.sortByName(item)
          item.subNodes &&
            item.subNodes.forEach(c => {
              if (c.type === 'MODEL_CATEGORY') {
                c.id = 'c' + c.id
              }
              if (c.subNodes) {
                this.sortByName(c)
                c.subNodes.forEach(m => {
                  if (m.subNodes) {
                    this.sortByName(m)
                    m.subNodes.forEach(s => {
                      s.id += '_%_' + m.name + '_%_' + s.name
                    })
                  }
                })
              }
            })
        })
      }
      const index = t.findIndex(item => {
        return item.id === 'others'
      })
      if (index !== -1) {
        const others = t.splice(index, 1)
        t.push(others[0])
      }
      return t
    },
    getDomainData() {
      this.$http
        .post(this.$domain_url + `/domains/tree/getTree`, {
          categoryId: 1, // 原子和衍生指标
          onlyFolder: true,
        })
        .then(res => {
          this.treeData = [res.data]
          this.expandedKeys = [res.data.foldId]
          this.$nextTick(() => {
            this.$refs.mainTree.setCurrentKey(res.data.foldId)
            this.getTableDataLeft(res.data)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDomainCodeData() {
      const result = {
        name: this.$t('domain.code.allCode'),
        code: '',
        type: 'root',
        children: [],
        nodekey: 'root',
      }
      this.$http
        .post(this.$domain_url + `/domains/code/getDatasetname`, {
          categoryId: 1,
        })
        .then(res => {
          res.data.forEach((e, i) => {
            const obj = {
              name: e,
              code: '',
              type: 'catalog',
              nodekey: e,
            }
            result.children.push(obj)
          })
          this.treeData = []
          this.treeData.push(result)
          this.expandedKeys = [this.treeData[0].nodekey]
          this.$nextTick(() => {
            this.$refs.mainTree.setCurrentKey(this.treeData[0].nodekey)
            this.getTableDataLeft(this.treeData[0])
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filterNode(value, data, node) {
      if (this.simplePage === 'metaDataAdd') {
        if (!value) return true
        if (data.type === 'ALL' || data.type === 'ALLFILE') {
          return true
        }
        let current = node
        do {
          if (this.$MatchKeyword(current.data, value, 'name')) {
            if (this.showFilteredNode) {
              if (
                current.data.type === 'MODEL' &&
                current.data.subNodes == null
              ) {
                return false
              } else {
                return true
              }
            } else {
              return true
            }
          }
          current = current.parent
        } while (current && current.data.name)
        return false
      } else {
        if (!value) return true
        return data.name.indexOf(value) !== -1
      }
    },
    dataIconFunction(data, node) {
      if (this.simplePage === 'metaDataAdd') {
        if (data.type === 'IT_DEPART') {
          if (node.expanded) {
            return 'iconfont icon-openfile'
          } else {
            return 'iconfont icon-file'
          }
        } else if (data.type === 'MODEL') {
          return 'iconfont icon-shujuyuan'
        } else if (data.type === 'SCHEMA' || data.type === 'MODEL_SCHEMA') {
          return 'iconfont icon-schema'
        } else if (data.type === 'MODEL_CATEGORY') {
          return 'iconfont icon-xitong'
        }
      } else {
        let className = ''
        if (data.code) {
          className = 'tree-icon domain'
          if (data.updatingId) {
            className += ' is-updating'
          }
        } else {
          if (node.expanded) {
            className = 'iconfont icon-openfile'
          } else {
            className = 'iconfont icon-file'
          }
        }
        return className
      }
    },
    handleItemClicked(data, node) {
      this.allLeftValue = false
      this.allRightValue = false
      this.tableDataLeftData = data
      if (this.simplePage === 'metaDataAdd') {
        if (data.type === 'MODEL' || data.type === 'MODEL_SCHEMA') {
          this.getTableDataLeft()
        }
      } else {
        this.getTableDataLeft()
      }
    },
    getTableDataLeft() {
      this.$refs.tableDataLeft.clearSelection()
      if (this.simplePage === 'domainAdd') {
        const obj = {
          keyword: this.firstKeyword,
          folderId: this.tableDataLeftData.foldId,
          currentPage: this.currentPageLeft,
          pageSize: this.pageSizeLeft,
          categoryId: 1,
        }
        this.$http
          .post(this.$domain_url + `/domains/domain/getPublicPage`, obj)
          .then(res => {
            this.tableDataLeft = res.data.content
            this.totalLeft = res.data.totalItems
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else if (this.simplePage === 'domainCode') {
        const obj = {
          currentPage: this.currentPageLeft,
          pageSize: this.pageSizeLeft,
          name: this.firstKeyword,
          state: 'A',
          datasetName:
            this.tableDataLeftData.type !== 'root'
              ? this.tableDataLeftData.name
              : '',
          tagIds: null,
          categoryId: 1,
        }
        this.$http
          .post(this.$domain_url + `/domains/code/getPage`, obj)
          .then(res => {
            this.tableDataLeft = res.data.data
            this.totalLeft = res.data.total
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        const obj = {
          currentPage: this.currentPageLeft,
          pageSize: this.pageSizeLeft,
          keyword: this.firstKeyword,
          modelIds: this.tableDataLeftData
            ? this.tableDataLeftData.modelIds
            : null,
          schema:
            this.tableDataLeftData &&
            this.tableDataLeftData.type === 'MODEL_SCHEMA'
              ? this.tableDataLeftData.name
              : null,
          typeIds: ['80000004', '80500008'],
          sortByName: null,
          sortByCreateTime: null,
        }
        this.$http
          .post(this.$meta_url + `/entities/searchMetadata`, obj)
          .then(res => {
            this.tableDataLeft = res.data.content
            this.totalLeft = res.data.totalItems
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handleSizeChangeLeft(val) {
      this.pageSizeLeft = val
      this.currentPageLeft = 1
      this.getTableDataLeft()
    },
    handleCurrentChangeLeft(val) {
      this.currentPageLeft = val
      this.getTableDataLeft()
    },
    handleSizeChangeRight(val) {
      this.pageSizeRight = val
      this.currentPageRight = 1
      if (this.simplePage === 'metaDataAdd') {
        this.getSimplePageData(this.selectIdlist, {
          modelIds: this.tableDataLeftData
            ? this.tableDataLeftData.modelIds
            : null,
          schema:
            this.tableDataLeftData &&
            this.tableDataLeftData.type === 'MODEL_SCHEMA'
              ? this.tableDataLeftData.name
              : null,
        })
      } else {
        this.getSimplePageData(this.selectIdlist)
      }
    },
    handleCurrentChangeRight(val) {
      this.currentPageRight = val
      if (this.simplePage === 'metaDataAdd') {
        this.getSimplePageData(this.selectIdlist, {
          modelIds: this.tableDataLeftData
            ? this.tableDataLeftData.modelIds
            : null,
          schema:
            this.tableDataLeftData &&
            this.tableDataLeftData.type === 'MODEL_SCHEMA'
              ? this.tableDataLeftData.name
              : null,
        })
      } else {
        this.getSimplePageData(this.selectIdlist)
      }
    },
    handleSelectionChangeLeft(list) {
      this.leftListSelection = list
      if (this.simplePage === 'domainAdd') {
        let domainIds = []
        list.forEach(element => {
          domainIds.push(element.domainId)
        })
        this.selectIdlist = domainIds
        if (list.length > 0) {
          this.getSimplePageData(domainIds)
        } else {
          this.tableDataRight = []
          this.totalRight = 0
        }
      } else if (this.simplePage === 'domainCode') {
        let code = []
        list.forEach(element => {
          code.push(element.code)
        })
        this.selectIdlist = code
        if (list.length > 0) {
          this.getSimplePageData(code)
        } else {
          this.tableDataRight = []
          this.totalRight = 0
        }
      } else {
        let parentIds = []
        list.forEach(element => {
          parentIds.push(element.objectId)
        })
        this.selectIdlist = parentIds
        if (list.length > 0) {
          this.getSimplePageData(parentIds)
        } else {
          this.tableDataRight = []
          this.totalRight = 0
        }
      }
    },
    getSimplePageData(data, metaData) {
      let obj = {
        typeIds: ['80000005'],
        currentPage: this.currentPageRight,
        pageSize: this.pageSizeRight,
        keyword: this.couKeyword,
      }
      if (
        (this.leftListSelection.length !== 0 || this.allLeftValue) &&
        this.firstKeyword
      ) {
        obj.parentName = this.firstKeyword
      }
      if (this.simplePage === 'domainAdd') {
        obj.domainIds = data
      } else if (this.simplePage === 'domainCode') {
        obj.domainCodes = data
      } else {
        if (!metaData) {
          obj.parentIds = data
        }
      }
      if (metaData) {
        obj.modelIds = metaData.modelIds
        obj.schema = metaData.schema
      }
      this.$http
        .post(this.$meta_url + `/entities/simplePage`, obj)
        .then(res => {
          this.tableDataRight = res.data.content
          this.totalRight = res.data.totalElements
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSelectionChangeRight(list) {
      this.columnList = list
    },
    createDataRule() {
      let obj = {}
      if (this.details) {
        obj.jobId = this.jobDetails.jobId
      } else {
        obj.batchNumber = this.batchNumber
      }
      if (this.simplePage === 'domainAdd') {
        obj.generateType = 'DOMAIN'

        if (this.allRightValue) {
          let domainIds = this.leftListSelection.map(item => item.domainId)
          obj.domainGenerate = {
            rightFull: this.allRightValue,
            domainIds: domainIds,
            columnKeyword: this.couKeyword,
          }
        } else {
          let columnIds = this.columnList.map(item => item.objectId)
          obj.domainGenerate = {
            rightFull: this.allRightValue,
            columnIds: columnIds,
          }
        }
      } else if (this.simplePage === 'domainCode') {
        obj.generateType = 'STANDARD'
        if (this.allRightValue) {
          let standardCodes = this.leftListSelection.map(item => item.code)
          obj.standardGenerate = {
            rightFull: this.allRightValue,
            standardCodes: standardCodes,
            columnKeyword: this.couKeyword,
          }
        } else {
          let columnIds = this.columnList.map(item => item.objectId)
          obj.standardGenerate = {
            rightFull: this.allRightValue,
            columnIds: columnIds,
          }
        }
      } else {
        obj.generateType = 'METADATA'
        if (this.allRightValue && this.allLeftValue) {
          obj.metadataGenerate = {
            leftFull: this.allLeftValue,
            rightFull: this.allRightValue,
          }
          if (this.tableDataLeftData.type === 'MODEL') {
            obj.metadataGenerate.modelIds = this.tableDataLeftData.modelIds
          }
          if (this.tableDataLeftData.type === 'MODEL_SCHEMA') {
            obj.metadataGenerate.schema = this.tableDataLeftData.name
            obj.metadataGenerate.modelIds = this.tableDataLeftData.modelIds
          }
        }
        if (!this.allLeftValue && this.allRightValue) {
          let tableIds = this.leftListSelection.map(item => item.objectId)
          obj.metadataGenerate = {
            leftFull: this.allLeftValue,
            rightFull: this.allRightValue,
            tableIds: tableIds,
          }
        }
        if (!this.allRightValue) {
          let columnIds = this.columnList.map(item => item.objectId)
          obj.metadataGenerate = {
            leftFull: this.allLeftValue,
            rightFull: this.allRightValue,
            columnIds: columnIds,
          }
        }
        if (this.allLeftValue) {
          obj.metadataGenerate.tableKeyword = this.firstKeyword
        }
        if (this.allRightValue) {
          obj.metadataGenerate.columnKeyword = this.couKeyword
        }
      }
      this.$http
        .post(this.$quality_url + `/quality/dataRule/generateRule`, obj)
        .then(res => {
          this.$message.success('创建成功')
          this.simplePageVisible = false
          this.getDataRuleData()
          this.$refs.tableDataRightTable.clearSelection() // 清空列表的选中
          this.$refs.tableDataLeft.clearSelection() // 清空列表的选中
          this.allRightValue = false
          this.allLeftValue = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeDialogDataRule() {
      this.simplePageVisible = false
      this.$refs.tableDataRightTable.clearSelection() // 清空列表的选中
      this.$refs.tableDataLeft.clearSelection() // 清空列表的选中
      this.allRightValue = false
      this.allLeftValue = false
      this.treeKeyword = ''
      this.firstKeyword = ''
      this.couKeyword = ''
      this.currentPageRight = 1
      this.pageSizeRight = 20
      this.currentPageLeft = 1
      this.pageSizeLeft = 20
      this.tableDataLeft = []
      this.totalLeft = 0
    },
    statusFormatter(row) {
      const value = row.publicState
      switch (value) {
        case 'X':
          return this.$t('quality.page.qualityRule.publishStatus.deprecated')
        case 'D':
          return this.$t(
            'quality.page.qualityRule.publishStatus.shortToBeAudited'
          )
        case 'C':
          return this.$t('quality.page.qualityRule.publishStatus.inReview')
        case 'A':
          return this.$t('quality.page.qualityRule.publishStatus.adopted')
      }
    },
    handleClose(idx) {
      this.emailReceivers.splice(idx, 1)
    },
    getDateTemplate() {
      this.$http
        .post(this.$job_url + `/dateTemplate/list`)
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
    updateParameterIds(parameterIds) {
      this.parameterIds = parameterIds
    },
    getSmallClassList() {
      this.searchFormData.smallClassSelectOption = ''
      this.smallClassList = []
      const pId = this.$bigClassList.filter(
        e => e.value === this.searchFormData.bigClassSelectOption
      )[0].id
      this.$http
        .post(`${this.$url}/select/option/getByParentId?parentId=${pId}`)
        .then(res => {
          res.data.forEach(e => {
            const obj = {
              label: e.optionValue,
              value: e.ruleCode,
            }
            this.smallClassList.push(obj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    qualityRulesSelected(data) {
      data
        .filter(rule => {
          return !this.ruleIds.includes(rule.id)
        })
        .map(i => i.id)
        .forEach(add => {
          this.ruleIds.push(add)
        })
      // this.getMultiPage()
    },
    removeAllRules() {
      this.$DatablauCofirm(
        this.$t('quality.page.qualityExamineJob.removeAllTips'),
        '',
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.removeIsPending = true
          this.$http
            .post(
              this.$quality_url + `/quality/rule/tech/multiCheck`,
              this.ruleIds
            )
            .then(res => {
              this.ruleIds = this.ruleIds.filter(i => {
                return !res.data.includes(i)
              })
              // this.getMultiPage()
              this.removeIsPending = false
            })
        })
        .catch(() => {})
    },
    closeDialog() {
      this.chooseRulesDialogVisible = false
    },
    labelFormatter(label, value) {
      if (label === 'scheduleType') {
        if (value === 'wait') {
          return '暂不运行'
        } else if (value === 'run') {
          return '立即运行'
        } else if (value === 'schedule') {
          return '周期调度'
        }
      } else if (label === 'selectedWeekDays') {
        switch (value) {
          case 'Mon':
            return '星期一'
          case 'Tue':
            return '星期二'
          case 'Wed':
            return '星期三'
          case 'Thu':
            return '星期四'
          case 'Fri':
            return '星期五'
          case 'Sat':
            return '星期六'
          case 'Sun':
            return '星期日'
        }
      }
    },
    disabledEmail(val) {
      if (val === false) {
        this.sendMail = false
      }
    },
    handleModelCategoryChange(val) {
      this.rulesDisplay = []
      this.ruleIds = []
      val && this.innerLoadDataSources()
    },
    getCronString(cron, type) {
      this.jobDetails.schedule = cron
    },
    showSearch() {
      this.updateMultipleCriteriaByCondition()
    },
    reset() {
      this.$refs.searchForm.resetFields()
      this.showSearch()
    },
    addReceiver() {
      this.mailList.push({})
    },
    removeReceiver(index) {
      this.mailList.splice(index, 1)
    },
    // getAllUsers(){
    //   this.$http.get(this.$url + '/service/main/users').then(res=>{
    //     this.allUsers = res.data;
    //   }).catch(e=>{
    //     this.$showFailure(e);
    //   });
    // },
    innerLoadDataSources: function () {
      if (!this.jobDetails.modelCategoryId && !this.details) {
        this.dataSources = []
        return
      } else {
        var categoryId = this.jobDetails.modelCategoryId
          ? this.jobDetails.modelCategoryId
          : this.details.modelCategoryId
      }
      /* this.$http
        .get(this.$meta_url + '/service/models/fromre/')
        .then(res => {
          this.dataSources = []
          res.data.forEach(item => {
            if (item.categoryId == categoryId) {
              this.dataSources.push(item)
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        }) */
    },
    removeTab() {
      // this.$bus.$emit('tabRemoved',this.details ? this.details.name : 'add');
      this.$emit('toBackList', this.jobListData)
    },
    closeAdd() {
      this.$emit('toBackList', this.jobListData)
    },
    getDefaultDetail() {
      let ruleIds = ''
      const jobDetail = JSON.parse(this.jobDetails.jobContent)
      jobDetail.parameters.forEach(p => {
        if (p.parameterName === 'modelCategoryId') {
          this.jobDetails.modelCategoryId = p.value - 0
        } else if (p.parameterName === 'sendMail') {
          this.sendMail = p.value === 'true'
        }
        // else if (p.parameterName === 'techRuleIds') {
        //   ruleIds = JSON.parse(p.value)
        //   this.ruleIds = ruleIds
        else if (p.parameterName === 'mailList') {
          this.emailReceivers = JSON.parse(p.value)
        }
      })
      this.rulesDisplay = null
      this.canExecuteDateTemplates = JSON.parse(
        this.jobDetails.jobContent
      ).canExecuteDateTemplates
      // this.getMultiPage()
    },
    handleChange() {},
    removeSelect(data) {},
    disableFormat(row, column) {
      var disabled = row[column.property]
      if (disabled == undefined) {
        return ''
      } else if (disabled == 0) {
        return '有效'
      } else if (disabled == 1) {
        return '无效'
      }
    },
    deleteRule(id) {
      const idx = this.ruleIds.indexOf(id)
      if (idx > -1) {
        this.ruleIds.splice(idx, 1)
      }
      // this.getMultiPage()
    },
    selectStaff() {
      this.$utils.staffSelect.open([], false).then(res => {
        if (res && Array.isArray(res)) {
          res.forEach(item => {
            if (!this.emailReceivers.includes(item.username)) {
              this.emailReceivers.push(item.username)
            }
          })
        }
      })
    },
    emit(cron) {
      const simpleSchedule = {
        repeatCount: '0',
        interval: '3', // 负值表示不立刻跑
        intervalUnit: 'SEC',
      }
      if (!cron) {
        if (this.scheduleType === 'wait') {
          simpleSchedule.interval = -1
        }
      }
      let schedule = 'simple:' + JSON.stringify(simpleSchedule)
      if (cron) {
        schedule = cron
      }
      {
        // todo 更新id列表
        // this.chosen = []
        // this.allDisplay.forEach(item => {
        //   this.chosen.push(item.id)
        // })
      }
      var requestBody = {
        name: this.jobDetails.name, // 11
        schedule: schedule, // 11
        '@class': 'com.datablau.job.scheduler.data.DatablauJobDescriptor', // 11
        // boundResourceId: this.jobDetails.modelCategoryId, // 11
        // boundResourceType: 'modelCategory',
        disable: this.disable, // 11
        runCycle: this.isUserCron ? '自定义' : this.getScheduleTime(schedule),
        canExecuteDateTemplates: this.canExecuteDateTemplates, // 11
        typeName: 'DataQuality',
        parameters: [
          {
            deleted: false,
            mandatory: false,
            parameterDescription: '批次',
            parameterName: 'batchNumber',
            type: 'STRING',
            value: this.batchNumber,
          },
          {
            deleted: false,
            mandatory: true,
            parameterDescription: '应用系统',
            parameterName: 'modelCategoryId',
            type: 'LONG',
            value: `${this.jobDetails.modelCategoryId}`,
          },
          {
            deleted: false,
            mandatory: false,
            parameterDescription: '是否发送邮件',
            parameterName: 'sendMail',
            type: 'BOOL',
            value: `${this.sendMail}`,
          },
        ],
      }
      if (this.jobDetails.name === '') {
        this.$message.warning(
          this.$t('quality.page.qualityExamineJob.validateRules.name1')
        )
      } else {
        if (this.parameterIds) {
          requestBody.parameters.push({
            deleted: false,
            mandatory: false,
            parameterDescription: '参数列表',
            parameterName: 'paramList',
            type: 'LIST_LONG',
            value: JSON.stringify(this.parameterIds),
          })
        }
        if (this.emailReceivers) {
          requestBody.parameters.push({
            deleted: false,
            mandatory: false,
            parameterDescription: '收件人',
            parameterName: 'mailList',
            type: 'LIST_STRING',
            value: JSON.stringify(this.emailReceivers),
          })
        }
        if (this.details) {
          // when update job
          this.$http
            .put(
              this.$quality_url +
                '/quality/job/updateDataRuleJob/' +
                this.jobDetails.jobId,
              requestBody
            )
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityExamineJob.successfullyModified')
              )
              this.$bus.$emit('jobAddedOrUpdated', this.jobDetails.name)
              this.writable = false
              this.$emit('reload-jobs')
              this.$emit('toBackList', this.jobListData) // 关闭页面
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          // add new job
          this.$http
            .post(
              this.$quality_url + '/quality/job/createDataRuleJob',
              requestBody
            )
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityExamineJob.operationSucceed')
              )
              this.$bus.$emit('jobAddedOrUpdated')
              this.$emit('reload-jobs')
              this.$emit('toBackList', this.jobListData) // 关闭页面
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    updateJobSchedule(cron) {
      const cronJobRequest = {
        schedule: cron ? 'cron:' + cron : null,
      }
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        } else {
          if (cron) {
            this.emit(cronJobRequest.schedule)
          } else {
            this.emit()
          }
        }
      })
    },
    onSubmit() {
      const self = this
      var cronString = null
      if (this.jobDetails.schedule === '') {
        this.$message.error(
          this.$t('quality.page.qualityExamineJob.periodicScheduling')
        )
      } else {
        self.updateJobSchedule(this.jobDetails.schedule)
      }
    },
    refreshtableHeigth() {
      const $tableBox = $('.sub-table-row')
      $tableBox.css({
        minHeight: $tableBox.height(),
      })
      this.showRuleTable = false
      this.$nextTick(() => {
        this.showRuleTable = true
        this.$nextTick(() => {
          $tableBox.css({
            minHeight: '0',
          })
        })
      })
    },
    categoryFocus() {},
    stateFormatter(val) {
      if (val === 1) {
        return '业务规则'
      } else {
        return '技术规则'
      }
    },
    typeFormatter(val) {
      if (val === 2) {
        return '标准映射'
      } else {
        return '监管报送'
      }
    },
    smallRuleFormatter(val) {
      switch (val) {
        case 1:
          return '空值检查'
        case 2:
          return '一致性检查'
        case 3:
          return '主外键关联检查'
        case 4:
          return '唯一性检查'
        case 6:
          return '长度检查'
        case 7:
          return '值域检查'
      }
    },
    bigRuleFormatter(val) {
      switch (val) {
        case 1:
          return this.$t('quality.page.qualityExamineJob.type.integrity')
        case 2:
          return this.$t('quality.page.qualityExamineJob.type.consistent')
        case 3:
          return this.$t('quality.page.qualityExamineJob.type.veracity')
        case 4:
          return this.$t('quality.page.qualityExamineJob.type.uniqueness')
        case 6:
          return this.$t('quality.page.qualityExamineJob.type.normative')
        case 7:
          return this.$t('quality.page.qualityExamineJob.type.effectiveness')
      }
    },
    getScheduleTime(scheduleInCron) {
      try {
        const scheduleString = scheduleInCron.split(':')
        const expressionFormat = scheduleString[0]
        let cron = null
        if (expressionFormat === 'cron') {
          cron = scheduleString[1]
          const cronFormatted = cron.split(' ')
          if (cronFormatted[3] !== '?') {
          } else {
            return '每周'
          }
          if (cronFormatted[4] === '*' && cronFormatted[5] === '?') {
            if (cronFormatted[3] === '*') {
              return '每天'
            } else {
              return '每月'
            }
          } else if (cronFormatted[4].includes(',')) {
            return '每季'
          } else if (cronFormatted.length === 7) {
            if (cronFormatted[6] === '*') {
              return '每年'
            } else {
              return '不重复'
            }
          }
        } else {
          return '暂不调度'
        }
      } catch (e) {
        return '暂不调度'
      }
    },
  },
  computed: {
    addReceiverDisabled() {
      let hasNull = false
      this.mailList.forEach(item => {
        if (!item.address) {
          hasNull = true
        }
      })
      return hasNull
    },
  },
  watch: {
    treeKeyword(val) {
      this.$refs.mainTree.filter(val)
    },
    firstKeyword(val) {
      this.handleCurrentChangeLeft(1)
      if (this.leftListSelection.length !== 0 || this.allLeftValue) {
        this.handleCurrentChangeRight(1)
      }
    },
    couKeyword(val) {
      if (this.selectIdlist.length > 0 || this.allLeftValue)
        this.handleCurrentChangeRight(1)
    },
  },
}
