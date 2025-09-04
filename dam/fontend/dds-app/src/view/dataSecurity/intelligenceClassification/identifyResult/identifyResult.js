import API from '@/view/dataSecurity/util/api'
import {
  ruleTypeEnum,
  assetsTypeEnum,
} from '@/view/dataSecurity/util/attrEnum.ts'
import {
  getPriorityType,
  methodRuleType,
  listDuplicate,
  getAttrList,
} from '@/view/dataSecurity/util/util.js'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import tableCell from '@/view/dataSecurity/components/tableCell.vue'
import tablePopover from './components/tablePopover.vue'
import tablePop from './components/tablePop.vue'
import classifyTree from '@/view/dataSecurity/components/classifyTree.vue'
export default {
  components: {
    isShowTooltip,
    tableCell,
    tablePopover,
    tablePop,
    classifyTree,
  },
  data() {
    return {
      listShow: true,
      typeNum: 1,
      getPriorityType: getPriorityType,
      methodRuleType: methodRuleType,
      ruleTypeEnum: ruleTypeEnum,
      form: {
        page: 1,
        size: 20,
        name: '',
        taskId: '',
        ruleId: '',
        system: '',
        datasourceId: '',
        modelId: '',
        schema: '',
        tableId: '',
        levelId: '',
      },
      gatherDataList: [],
      tableList: [],
      sort: '',
      orderBy: 'createTime',
      total: 0,
      systemList: [],
      systemIds: [],
      datasourceList: [],
      schemaList: [],
      selections: [],
      tableData: [],
      anquan: '',
      levelList: [],
      noNext: false,
      tableLoading: false,
      levelMap: {},
      showPopover: false,
      top: 52,
      tablePage: 1,
      tableTotal: 0,
      selectTableLoading: false,
      showClose: false,
      columnObj: {},
      columnLoading: false,
      colorList: [],
      ruleList: [],
      rulePage: 1,
      ruleTotal: 0,
      ruleLoading: false,
      taskList: [],
      taskPage: 1,
      taskTotal: 0,
      taskLoading: false,
      // 修改数据分类
      showModifyClassificationDialog: false,
      addTip: '',
      curClassifyNode: {},
    }
  },
  watch: {
    'form.name'(val) {
      if (!val) {
        this.handleSearch()
      }
    },
  },
  mounted() {
    this.colorList = [
      {
        color: '#3AD1BF',
        bg: 'rgba(58,209,191,0.1)',
      },
      {
        color: '#8DC78A',
        bg: 'rgba(141,199,138,0.1)',
      },
      {
        color: '#FB98B9',
        bg: 'rgba(251,152,185,0.1)',
      },
      {
        color: '#FBC372',
        bg: 'rgba(251,195,114,0.1)',
      },
      {
        color: '#FBA476',
        bg: 'rgba(251,164,118,0.1)',
      },
      {
        color: '#F9716C',
        bg: 'rgba(249,113,108,0.1)',
      },
      {
        color: '#BB6CF9',
        bg: 'rgba(187,108,249,0.1)',
      },
      {
        color: '#6F54EB',
        bg: 'rgba(111,84,235,0.1)',
      },
      {
        color: '#4E85F7',
        bg: 'rgba(78,133,247,0.1)',
      },
      {
        color: '#81B5FF',
        bg: 'rgba(129,181,255,0.1)',
      },
    ]
    this.getSystem()
    this.getRuleList()
    this.getTaskList()
    this.getSecurityData()
  },
  computed: {
    notAdd() {
      let result = true
      let strList = []
      if (this.curClassifyNode.assetsType) {
        const typeList = this.curClassifyNode.assetsType.split(',')
        const typeIdList = this.selections.map(item => item.typeId)
        // 选择资产的类型（去重）
        const ids = [...new Set(typeIdList)]
        let typeNameList = []
        ids.map(item => {
          switch (item) {
            case 80000005:
              typeNameList.push(assetsTypeEnum.DATA_OBJECT)
              if (!typeList.includes(assetsTypeEnum.DATA_OBJECT)) {
                strList.push(this.$t('securityModule.dataItem'))
              }
              break
            case 80000004:
              typeNameList.push(assetsTypeEnum.TABLE)
              if (!typeList.includes(assetsTypeEnum.TABLE)) {
                strList.push(this.$t('securityModule.table'))
              }
              break
            case 80500008:
              typeNameList.push(assetsTypeEnum.VIEW)
              if (!typeList.includes(assetsTypeEnum.VIEW)) {
                strList.push(this.$t('securityModule.shitu'))
              }
              break
            default:
              break
          }
        })
        if (strList.length > 0) {
          this.addTip = this.$t('intelligence.classifyTip3') + strList.join(',')
        } else {
          this.addTip = ''
        }
        const flag = this.getInclude(typeList, typeNameList)
        result = !flag
      } else {
        result = true
      }
      let bool = true
      if (!result) {
        if (!this.curClassifyNode.canAddAsset) {
          this.addTip = this.$t('intelligence.classifyTip')
        }
      }
      if (!result && this.curClassifyNode.canAddAsset) {
        bool = false
      } else {
        bool = true
      }
      return bool
    },
  },
  methods: {
    getInclude(arr1, arr2) {
      let temp = []
      for (const item of arr2) {
        arr1.includes(item) ? temp.push(item) : ''
      }
      return !!temp.length
    },
    clickChild(name, options) {
      switch (name) {
        case 'classifyTree':
          if (options) {
            this.curClassifyNode = options.data
          } else {
            this.curClassifyNode = {}
          }
          break
        default:
          break
      }
    },
    handlerClassify() {
      this.curClassifyNode = {}
      this.showModifyClassificationDialog = true
    },
    cancelChangeClassification() {
      this.showModifyClassificationDialog = false
    },
    changeClassification() {
      const levelMap = {
        catalog: this.curClassifyNode.name,
        catalogId: this.curClassifyNode.id,
        catalogPath: this.curClassifyNode.catalogNamePath,
      }
      API.getClassifyDetail(this.curClassifyNode.id)
        .then(res => {
          const data = res.data.securityLevel
          levelMap.tag = data.name
          levelMap.tagId = data.tagId
          this.selections.map(item => {
            this.tableData.map((m, index) => {
              if (m.resultId === item.resultId) {
                const newMap = {
                  catalogPath: this.curClassifyNode.catalogNamePath,
                  id: this.curClassifyNode.id,
                  name: this.curClassifyNode.name,
                  select: false,
                }
                if (
                  item.oriCatalogList.findIndex(ori => ori.id == newMap.id) ===
                  -1
                ) {
                  item.oriCatalogList.push(newMap)
                  item.levelList.push({
                    key: this.curClassifyNode.id,
                    select: false,
                    tagId: data.tagId,
                    tagName: data.name,
                  })
                }
                this.tableData.splice(index, 1, item)
              }
            })
          })
          this.$nextTick(() => {
            this.selections.map(item => {
              this.$refs.tablePopover.selectType(
                item,
                this.curClassifyNode.id,
                item.catalogList.length
              )
            })
          })
          this.getCatalogListLen(this.tableData)
          this.showModifyClassificationDialog = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    ruleSelect(val) {
      this.rulePage = 1
      this.getRuleList(val)
    },
    ruleLoad() {
      if (this.rulePage * 20 >= this.ruleTotal) return
      this.rulePage++
      this.getRuleList()
    },
    focusRule() {
      this.rulePage = 1
      this.getRuleList()
    },
    getRuleList(key) {
      this.ruleLoading = true
      const params = {
        pageNum: this.rulePage,
        pageSize: 20,
        orderBy: 'createTime',
        sort: 'DESC', // ASC/DESC
        searchStr: key || '',
        catalogId: '',
        search: true,
        catalogId: '',
      }
      API.getRuleList(params)
        .then(res => {
          this.listShow = true
          this.ruleLoading = false
          if (this.rulePage !== 1) {
            this.ruleList = this.ruleList.concat(res.data.data.rules)
          } else {
            this.ruleList = res.data.data.rules || []
          }
          this.ruleTotal = res.data.data.total
        })
        .catch(e => {
          this.listShow = false
          this.ruleLoading = false
          this.$showFailure(e)
        })
    },
    taskSelect(val) {
      this.taskPage = 1
      this.getTaskList(val)
    },
    taskLoad() {
      if (this.taskPage * 10 >= this.taskTotal) return
      this.taskPage++
      this.getTaskList()
    },
    focusTask() {
      this.taskPage = 1
      this.getTaskList()
    },
    getTaskList(key) {
      this.taskLoading = true
      const params = {
        catalogId: 0,
        searchStr: key || '',
        pageNum: this.taskPage,
        pageSize: 10,
        orderBy: 'createTime',
        sort: 'DESC', // ASC/DESC
      }
      API.getTaskList(params)
        .then(res => {
          this.taskLoading = false
          if (this.taskPage !== 1) {
            this.taskList = this.taskList.concat(res.data.data.list)
          } else {
            this.taskList = res.data.data.list || []
          }
          this.taskTotal = res.data.data.total
        })
        .catch(e => {
          this.taskLoading = false
          this.$showFailure(e)
        })
    },
    getType(id) {
      let result = ''
      switch (parseFloat(id)) {
        case 80000004:
          result = 'table'
          break
        case 80500008:
          result = 'view'
          break
        case 80000005:
          result = 'column'
          break
        default:
          result = 'column'
          break
      }
      return result
    },
    showTablePop(row) {
      API.getTableDetail(row.tableId)
        .then(res => {
          this.columnObj = res.data.data
          this.columnLoading = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    clear() {
      this.showClose = false
      this.$refs.loadSelect.blur()
    },
    domResize(e) {
      this.top = e
    },
    rowClass(scoped) {
      if (scoped.row.disabled) {
        return 'disabled-btn'
      } else {
        return 'checkbox-btn'
      }
    },
    cellClass(scoped) {
      if (scoped.column.property === 'none') {
        if (scoped.row.disabled) {
          return 'disabled-cell'
        } else {
          return 'checkbox-cell'
        }
      }
    },
    getName(row) {
      const result = row.assetName + (row.alias ? `(${row.alias})` : '')
      return result
    },
    getMinWidth(num) {
      let result = 120
      switch (num) {
        case 1:
          result = 120
          break
        case 2:
          result = 220
          break
        case 3:
          result = 380
          break
        default:
          result = 400
          break
      }
      return result
    },
    showTagPopover() {
      this.showPopover = true
    },
    sortChange(data) {
      if (data.order) {
        if (data.prop) {
          this.orderBy = data.prop === 'discernTime' ? 'createTime' : data.prop
        } else {
          this.orderBy = 'createTime'
        }
      } else {
        this.orderBy = 'createTime'
      }
      this.$refs.table.$refs.table.clearSelection()
      this.sort = data.order
      this.form.page = 1
      this.getList()
    },
    getLevel(row, num = 1) {
      let result = ''
      let style
      row.levelList &&
        row.levelList.map((item, index) => {
          if (item.select) {
            result = item.tagName
            style = {
              color: this.colorList[index].color,
              background: this.colorList[index].bg,
            }
          }
        })
      if (num === 1) {
        return result
      }
      if (num === 2) {
        return style
      }
    },
    getSecurityData() {
      getAttrList(API).then(data => {
        this.levelList = data
      })
    },
    getSystem() {
      // 获取业务系统
      API.getBusinessSystemList()
        .then(res => {
          this.systemList = res.data.data || []
          this.systemIds = res.data.data.map(item => item.categoryId) || []
          this.getList()
        })
        .catch(e => {
          this.getList()
          this.$showFailure(e)
        })
    },
    // 切换系统
    handleSystemChange(id) {
      this.gatherDataList = []
      this.form.datasourceId = ''
      this.datasourceList = []
      this.form.modelId = ''
      this.schemaList = []
      this.form.schema = ''
      this.tableList = []
      this.form.tableId = ''
      if (id) {
        this.gatherList(id)
      }
    },
    // 查询采集源
    gatherList(id) {
      API.realAataSourceListApi(id)
        .then(res => {
          console.log(res, 'res')
          this.gatherDataList = res.data.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleGatherChange(id) {
      this.datasourceList = []
      this.form.modelId = ''
      this.schemaList = []
      this.form.schema = ''
      this.tableList = []
      this.form.tableId = ''
      if (id) {
        this.getDatasourceList(id)
      }
    },
    // 获取数据源
    getDatasourceList(id) {
      API.virDataSourceListApi(id)
        .then(res => {
          this.datasourceList = res.data.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 切换数据源
    handleDatasourceChange(id) {
      this.schemaList = []
      this.form.schema = ''
      this.tableList = []
      this.form.tableId = ''
      this.form.schema = ''
      this.datasourceList.map(item => {
        if (parseFloat(item.modelId) === parseFloat(id)) {
          if (item.type === 'DATADICTIONARY_LOGICAL') {
            this.form.schema = item.reverseOptions.DatabaseName.split(',')[0]
            this.schemaList = item.reverseOptions.DatabaseName.split(',')
          } else {
            this.form.schema = item.schema || item.database
            this.schemaList = [item.schema || item.database]
          }
        }
      })
      this.tableList = []
      this.form.tableId = ''
      this.tablePage = 1
      if (this.form.schema) {
        this.getTableList()
      }
    },
    // 切换Schema
    handleSchemaChange(name) {
      this.tableList = []
      this.form.tableId = ''
      this.tablePage = 1
      if (name) {
        this.form.schema = name
      }
      this.getTableList()
    },
    clearTable() {
      this.getTableList()
    },
    remoteMethod(key) {
      if (this.form.schema) {
        this.tablePage = 1
        this.getTableList(key)
      }
    },
    lazyloading() {
      if (this.tablePage * 20 >= this.tableTotal) return
      this.tablePage++
      this.getTableList()
    },
    // 获取表列表
    getTableList(key = '') {
      this.selectTableLoading = true
      const params = {
        currentPage: this.tablePage,
        pageSize: 20,
        keyword: key,
        datasourceId: this.form.datasourceId,
        modelIds: this.form.modelId ? [this.form.modelId] : null,
        schema: this.form.schema,
        sortByCreateTime: null,
        sortByName: null,
        tagIds: null,
        typeIds: [80000004, 80500008],
      }
      API.searchMetadataApi(params)
        .then(res => {
          this.selectTableLoading = false
          this.tableTotal = res.data.totalItems
          if (this.tablePage !== 1) {
            this.tableList = this.tableList.concat(res.data.content)
          } else {
            this.tableList = res.data.content || []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    cancelPopover() {
      this.anquan = ''
      this.$refs.identifyPopover.doClose()
    },
    async handlerClick(type) {
      let status = ''
      switch (type) {
        case 1:
          status = 'UN_COMB' // 待梳理
          break
        case 2:
          status = 'NOT_COMB' // 暂不梳理
          break
        default:
          break
      }
      let newList = []
      this.selections.map(item => {
        const curMap = item.levelList.find(item => item.select === true)
        const newMap = {
          resultId: item.resultId,
          assetId: item.assetId,
          catalogId: item.catalogList.find(item => item.select === true).id,
          tagId: curMap ? curMap.tagId : '',
          infoId: item.infoId,
          status,
          objectId: item.objectId,
        }
        newList.push(newMap)
      })
      this.form.page = 1
      this.submitAssets(newList)
    },
    query() {
      this.form.page = 1
      this.getList()
    },
    handleSearch() {
      this.form.page = 1
      this.getList()
    },
    reset() {
      this.form = {
        size: this.form.size,
        page: 1,
        name: '',
        taskId: '',
        ruleId: '',
        system: '',
        datasourceId: '',
        modelId: '',
        schema: '',
      }
      this.datasourceList = []
      this.schemaList = []
      this.getList()
    },
    // 血缘识别结果获取选中的安全等级
    getLevelName(data) {
      let result = ''
      data.map(item => {
        if (item.select) {
          result = item.tagName
        }
      })
      return result
    },
    // 血缘识别结果切换安全等级
    selectLevelType(row, id) {
      row.levelList.map(item => {
        if (parseFloat(item.tagId) === parseFloat(id)) {
          item.select = true
        } else {
          item.select = false
        }
      })
    },
    getList() {
      this.tableLoading = true
      const params = {
        pageNum: this.form.page,
        pageSize: this.form.size,
        sort: this.sort === 'ascending' ? 'ASC' : 'DESC', // ASC/DESC
        orderBy: this.orderBy,
        assetName: this.form.name,
        categoryIds: this.form.system ? [this.form.system] : this.systemIds,
        datasourceId: this.form.datasourceId,
        modelId: this.form.modelId,
        schema: this.form.schema,
        tableId: this.form.tableId,
        tagId: this.form.levelId,
        ruleId: this.form.ruleId,
        taskId: this.form.taskId,
      }
      API.getTaskResult(params)
        .then(async res => {
          const data = res.data.data
          if (!data.results) {
            return
          }
          this.total = data.total
          data.results.map(async item => {
            let newList = []
            let levelList = []
            if (item.ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE) {
              if (item.sourceStr) {
                let bloodNameList = []
                item.sourceStr.split(';').map(m => {
                  if (m) {
                    let nameMap = {}
                    const oneList = m.split(',')
                    nameMap.enName = oneList[0]
                    nameMap.zhName = oneList[1] ? oneList[1] : ''
                    bloodNameList.push(nameMap)
                  }
                })
                item.bloodNameList = bloodNameList
              }
            }
            item.changeLevel = false
            if (item.discernedContentStr.length > 0) {
              item.discernedContentStr.map((item, index) => {
                const newMap = {}
                const levelMap = {}
                newMap.id = item.catalogId
                newMap.name = item.catalog
                newMap.catalogPath = item.catalogPath
                levelMap.key = item.catalogId
                levelMap.tagId = item.tagId
                levelMap.tagName = item.tag
                if (index === 0) {
                  newMap.select = true
                  levelMap.select = true
                } else {
                  newMap.select = false
                  levelMap.select = false
                }
                newList.push(newMap)
                levelList.push(levelMap)
              })
              // 跨页返回，回显以改变的安全等级和数据分类
              if (this.selections.length > 0) {
                this.selections.map(m => {
                  if (m.resultId === item.resultId) {
                    item.oriCatalogList = m.oriCatalogList
                    item.catalogList = m.catalogList
                    item.levelList = m.levelList
                  } else {
                    item.oriCatalogList = _.cloneDeep(newList)
                    item.catalogList = newList
                    item.levelList = levelList
                  }
                })
              } else {
                if (item.ruleType === ruleTypeEnum.CONSANGUINITY_CASCADE) {
                  newList = listDuplicate(newList, 'id')
                }
                item.oriCatalogList = _.cloneDeep(newList)
                item.catalogList = newList
                item.levelList = levelList
              }
            } else {
              item.catalogList = []
              item.levelList = []
            }
          })
          await this.getCatalogListLen(data.results)
          let logicalInfoArr = []
          data.results.forEach(item => {
            if (item.typeId === 80000004 || item.typeId === 80000005) {
              logicalInfoArr.push(item.objectId)
            }
          })
          this.getLogicalInfo(logicalInfoArr)
          this.tableLoading = false
          this.tableData = data.results
        })
        .catch(e => {
          this.tableData = []
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    getLogicalInfo(logicalInfoArr) {
      this.$http
        .post('/metadata/entities/getLogicalInfo', logicalInfoArr)
        .then(res => {
          this.tableData.forEach(element => {
            this.$set(element, 'logical', res.data[Number(element.objectId)])
          })
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    getCatalogListLen(data) {
      const num = Math.max(...data.map(item => item.catalogList.length))
      this.typeNum = num || 1
    },
    handleTableChange(data) {
      this.selections = data
      // this.checkTableData()
    },
    // 点击复选框或者翻页时，重新检测数据资产是否可以选择
    checkTableData() {
      this.tableData.map(item => {
        if (item.disabled) {
          // 取消选择时，之前置灰的放开
          if (item.isWeb) {
            const result = this.selections.some(m => m.assetId === item.assetId)
            if (!result) {
              item.disabled = false
              item.isWeb = false
            }
          }
        } else {
          // 选择后，同一个资产置灰
          this.selections.map(m => {
            if (m.assetId === item.assetId && m.resultId !== item.resultId) {
              item.disabled = true
              item.isWeb = true
            }
          })
        }
      })
    },
    handlePageChange(val) {
      this.form.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.form.size = val
      this.form.page = 1
      this.getList()
    },
    async submitAssets(params) {
      try {
        await API.handleTaskResult(params)
        this.$datablauMessage.success(this.$t('securityModule.submitSuccess'))
        this.$refs.table.$refs.table.clearSelection()
        this.getList()
      } catch (e) {
        console.log(e)
      }
    },
    async sureSubmit() {
      let newList = []
      // 判断所选数据资产的安全分类是否已被删除
      if (
        this.selections.find(i =>
          i.catalogList.filter(c => c.select).find(s => !s.catalogPath)
        )
      ) {
        this.$datablauMessage.warning(
          this.$t('intelligence.resultTip5', {
            type: this.$t('intelligence.submitReview'),
          })
        )
        return
      }
      this.selections.map(item => {
        const curMap = item.levelList.find(item => item.select === true)
        const newMap = {
          resultId: item.resultId,
          assetId: item.assetId,
          catalogId: item.catalogList.find(item => item.select === true).id,
          tagId: curMap ? curMap.tagId : '',
          infoId: item.infoId,
          status: 'PENDING_REVIEW',
          objectId: item.objectId,
        }
        newList.push(newMap)
      })
      const result = newList.some(item => !item.tagId)
      if (result) {
        this.$datablauMessage.warning(this.$t('intelligence.resultTip4'))
        return
      }
      this.form.page = 1
      this.submitAssets(newList)
    },
    showPop() {
      this.anquan = ''
    },
    handleLevel(e) {
      this.anquane = e
      const name = this.levelList.find(
        item => parseFloat(item.tagId) === e
      ).name
      this.levelMap = {
        tagName: name,
        tagId: e,
        select: true,
      }
    },
    changeLevel() {
      if (this.anquan) {
        this.cancelPopover()
        this.selections.map(item => {
          const result = item.levelList.some(
            o => parseFloat(o.tagId) === parseFloat(this.levelMap.tagId)
          )
          if (result) {
            // 修改的安全等级，自身的levelList里面含有
            item.levelList.map(list => {
              if (parseFloat(list.tagId) === parseFloat(this.levelMap.tagId)) {
                list.select = true
              } else {
                list.select = false
              }
            })
          } else {
            item.levelList.map(list => {
              list.select = false
            })
            item.levelList.push(this.levelMap)
          }
          item.changeLevel = true
          this.tableData.map((m, index) => {
            if (m.resultId === item.resultId) {
              this.tableData.splice(index, 1, item)
            }
          })
          setTimeout(() => {
            item.changeLevel = false
          }, 200)
        })
        this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
      } else {
        this.$datablauMessage.warning(
          this.$t('securityModule.selSecurityLevel')
        )
      }
    },
  },
}
