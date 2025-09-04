import tableCom from '@/view/dataSecurity/accessStrategy/components/tableCom'
import { executeAction } from '../../util/attrEnum'
import folder from '@/assets/images/search/folder.svg'
import viewAll from '@/assets/images/strategy/viewAll.svg'
import fieldAll from '@/assets/images/strategy/fieldAll.svg'
import api from '../../util/api'
import { getSecurityList } from '@/view/dataSecurity/util/util'
export default {
  name: 'ThirdStep',
  components: { tableCom },
  props: {
    initData: {
      type: Object,
      default: () => {},
    },
    clickChild: {
      type: Function,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    rangeMap: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      preSchemaList: [],
      isView: true,
      isTable: true,
      height: '530',
      viewAll: viewAll,
      fieldAll: fieldAll,
      typeIconMap: {
        TABLE: 'biao',
        VIEW: 'shitu',
        COLUMN: 'ziduan',
      },
      formContent: {
        actionList: ['SELECT'],
        allow: true,
        schemaRange: 'ALL',
        tableRange: 'ALL',
        columnRange: 'ALL',
      },
      schema: true,
      view: true,
      field: true,
      tableData: [{ name: 'Table1', type: 'table' }],
      rules: {
        actionList: {
          required: true,
          trigger: 'blur',
          message: '请选择数据执行动作',
        },
        allow: {
          required: true,
          trigger: 'blur',
          message: '请选择数据访问动作',
        },
        modelId: {
          required: true,
          trigger: 'blur',
          message: '请选择数据源',
        },
      },
      options: executeAction,
      dataOriginOpt: [],
      dataSheetLog: false,
      treeLoading: false,
      defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
      assetName: '',
      tableSheet: [],
      tableLodaing: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // 字段
      fieldLog: false,
      modelPage: 1,
      modelLoading: false,
      modelTotal: 0,
      schemaItem: [], // 当前数据源下的所有schema
      schemaList: [], // 选中的schema集合
      exSchemaList: [], // schema为除指定外时，schema的集合
      tableTag: [],
      curTableList: [], // 当前选中的表集合
      curFieldList: [], // 当前选中的字段集合
      requestBodySchema: '',
      schemaName: '',
      schemaNameOption: [],
      tableName: '',
      tableNameOption: [],
      filedLodaing: false,
      sort: 'ASC',
      tableTotalModelId: 0,
      fieldTotalModelId: 0,
      elementModifyDtoList: [],
      // 删除的字段
      fieldModifyDel: {
        typeId: 80000005,
        modifyIdList: [],
        // modifyNameList: [],
        delete: true,
      },
      // 删除的表
      tableModifyDel: {
        typeId: 80000004,
        modifyIdList: [],
        // modifyNameList: [],
        delete: true,
      },
      // 编辑时表和字段的原始数据
      oriSchemaInfo: [],
      oriTableInfo: [],
      oriColumnInfo: [],
      tablePage: 1,
      selectTableLoading: false,
      selectTotal: 0,
      isLazy: false,
      levelList: [],
      levelId: '',
    }
  },
  computed: {
    treeData() {
      let newList = []
      if (this.formContent.schemaRange === 'EXCLUDE') {
        newList = this.exSchemaList
      } else {
        newList = this.schemaList
      }
      let ary = newList.map(item => {
        return {
          name: item,
          key: item,
        }
      })
      this.schemaNameOption = ary
      let name = this.dataOriginOpt.find(
        item => item.modelId === this.formContent.modelId
      )
      return name
        ? [
            {
              name: name && name.definition,
              key: this.formContent.modelId,
              children: ary,
            },
          ]
        : []
    },
  },
  mounted() {
    this.getModel()
    this.getSecurity()
  },
  methods: {
    getSecurity() {
      getSecurityList(api).then(data => {
        this.levelList = data
      })
    },
    getCopywriting(range, type) {
      let name = ''
      switch (type) {
        case 'column':
          if (range === 'ALL') {
            name = `schema下，全部的字段`
          }
          if (range === 'INCLUDE') {
            name = `[表/视图]中，设为”包含” 的列表下数据表的所有字段`
          }
          if (range === 'EXCLUDE') {
            name = `[表/视图] 中，设为“不包含”的数据表的全部字段`
          }
          break
        case 'table':
          name = `schema下，全部的数据表/视图`
          break
        default:
          break
      }
      return name
    },
    initSlectData(num) {
      switch (num) {
        case 1: // 切换数据源
          this.clearSchemaData()
          this.clearTableData()
          this.clearFieldData()
          break
        case 2: // 切换shema
          this.clearTableData()
          this.clearFieldData()
          break
        case 3: // 切换表
          this.clearFieldData()
          break
        default:
          break
      }
    },
    clearSchemaData() {
      this.schemaItem = []
      this.schemaList = []
    },
    clearTableData() {
      this.curTableList = []
    },
    clearFieldData() {
      this.curFieldList = []
    },
    // schema,table,column联动
    delSchemaMethed(nameList) {
      // scheam去掉时，清除起下的table和column
      nameList.map(item => {
        if (this.formContent.tableRange === 'ALL') {
          this.curTableList = []
        } else {
          this.curTableList.map(m => {
            if (m.parent === item) {
              this.delColumnMethod([m.objectId])
            }
            this.curTableList = this.curTableList.filter(m => m.parent !== item)
          })
        }
      })
    },
    delColumnMethod(idList) {
      if (this.formContent.columnRange === 'ALL') {
        this.curFieldList = []
      } else {
        idList.map(item => {
          this.curFieldList = this.curFieldList.filter(
            m => parseFloat(m.parent) !== parseFloat(item)
          )
        })
      }
    },
    changeTable(bool) {
      this.isTable = bool
      this.currentPage = 1
      this.getTableList()
    },
    changeView(bool) {
      this.isView = bool
      this.currentPage = 1
      this.getTableList()
    },
    back() {
      this.clickChild('cancel')
    },
    delectData(ary, tex) {
      let { list, row } = ary
      if (tex == 'viewTagList') {
        this.curTableList = list
        this.delColumnMethod([row.objectId])
      } else {
        this.curFieldList = list
      }
    },
    // 上一步
    prev() {
      this.getFormContent()
      this.clickChild('step', { step: 1, prevStep: 2 })
    },
    canNext() {
      let result = false
      this.$refs.demoForm.validate(valid => {
        if (valid) {
          // 判断schema 选中指定或者除指定外 时，表单是否有数据
          // 选中不是all  且有schema数据，且schema表格为空时提示
          if (
            this.formContent.schemaRange !== 'ALL' &&
            this.schemaItem.length != 0 &&
            this.schemaList.length == 0
          ) {
            let text =
              this.formContent.schemaRange === 'INCLUDE' ? '指定' : '除指定外'
            this.$blauShowSuccess(`请选择schema${text}的数据`, 'warning')
            return
          } else if (
            this.formContent.tableRange !== 'ALL' &&
            this.curTableList.length == 0
          ) {
            let text =
              this.formContent.tableRange === 'INCLUDE' ? '指定' : '除指定外'
            this.$blauShowSuccess(`请选择表/视图${text}的数据`, 'warning')
            return
          } else if (
            this.formContent.columnRange !== 'ALL' &&
            this.curFieldList.length == 0
          ) {
            let text =
              this.formContent.columnRange === 'INCLUDE' ? '指定' : '除指定外'
            this.$blauShowSuccess(`请选择字段${text}的数据`, 'warning')
            return
          }
          result = true
        } else {
          result = false
        }
      })
      return result
    },
    async next() {
      const flag = await this.canNext()
      if (flag) {
        await this.getFormContent()
        this.clickChild('step', { step: 3, prevStep: 2 })
      }
    },
    handlerDelTable(ids) {
      this.tableModifyDel = {
        delete: true,
        modifyIdList: ids,
        typeId: 80000004,
      }
    },
    handlerDelColumn(ids) {
      this.fieldModifyDel = {
        delete: true,
        modifyIdList: ids,
        typeId: 80000005,
      }
    },
    async getFormContent() {
      let columnList = []
      this.curFieldList.forEach(item => {
        columnList.push({
          id: item.id || item.objectId,
          type: item.type || item.objectType,
          columnId: item.id || item.objectId,
          columnName: item.physicalName || item.objectName,
          physicalName: item.physicalName || item.objectName,
          tableName: this.curTableList.map(item => item.physicalName)[0],
          schemaName: this.schemaList[0],
        })
      })
      let obj = {
        // schema
        schemaNameList: this.schemaList,
        // 表，视图
        tableIdList: this.curTableList.map(item => item.objectId),
        tableList: this.curTableList,
        // 字段
        columnIdList: this.curFieldList.map(item => item.objectId),
        columnList: columnList,
      }
      if (this.initData.id) {
        // 点击删除，删除的表或字段
        // 判断是否切换schema，table、view
        const fieldModify = {
          typeId: 80000005,
          modifyIdList: this.curFieldList.map(m => m.objectId),
        }
        const tableModify = {
          typeId: 80000004,
          modifyIdList: this.curTableList.map(m => m.objectId),
        }
        let curDelTableIdList = []
        this.rangeMap.oriTableList.length > 0 &&
          this.rangeMap.oriTableList.map(item => {
            const flag = this.curTableList.some(
              m => parseFloat(m.objectId) === parseFloat(item)
            )
            if (!flag) {
              curDelTableIdList.push(item)
            }
          })
        curDelTableIdList = [...new Set(curDelTableIdList)]
        await this.handlerDelTable(curDelTableIdList)
        let curDelColumnIdList = []
        this.rangeMap.oriColumnList.length > 0 &&
          this.rangeMap.oriColumnList.map(item => {
            const flag = this.curFieldList.some(
              m => parseFloat(m.objectId) === parseFloat(item)
            )
            if (!flag) {
              curDelColumnIdList.push(item)
            }
          })
        curDelColumnIdList = [...new Set(curDelColumnIdList)]
        await this.handlerDelColumn(curDelColumnIdList)
        let elementModifyDtoList = [
          this.fieldModifyDel,
          this.tableModifyDel,
          fieldModify,
          tableModify,
        ]
        obj.elementModifyDtoList = elementModifyDtoList
      }
      Object.assign(this.formContent, obj)
    },
    handleClick(val) {
      this[val] = !this[val]
    },
    dropdownClick() {
      this.preSchemaList = _.cloneDeep(this.schemaList)
    },
    schemaChange(list, isTrue = false) {
      // this.schemaList = list
      if (this.formContent.schemaRange === 'EXCLUDE') {
        let newList = []
        this.schemaItem.map(item => {
          if (this.schemaList.some(m => m === item)) {
            this.delSchemaMethed([item])
          } else {
            newList.push(item)
          }
        })
        this.exSchemaList = newList
      } else {
        // 如果schema是包含，清除schema时，同时清除起下的表和字段
        if (this.schemaList.length > 0) {
          if (isTrue) {
            this.preSchemaList.map(item => {
              const flag = this.schemaList.some(m => m === item)
              if (!flag) {
                this.delSchemaMethed([item])
              }
            })
          } else {
            // 点击删除schema传来的
            this.delSchemaMethed(list)
          }
        } else {
          this.initSlectData(2)
        }
      }
    },
    // schema 指定,全部切换
    schemaRadioChange() {
      if (this.formContent.schemaRange === 'ALL') {
        this.schemaList = this.schemaItem
      } else {
        this.schemaList = []
      }
      this.initSlectData(2)
    },
    tagSchemaClose(v) {
      this.schemaList = this.schemaList.filter(item => item != v)
      this.schemaChange([v])
    },
    // 表的状态切换
    viewRadioChange() {
      this.curTableList = []
      this.initSlectData(3)
    },
    // 字段切换
    fieldRadioChange() {
      this.curFieldList = []
    },
    // 添加数据表
    addDataTable() {
      if (this.schemaList.length === 0) {
        this.$blauShowSuccess('请选择schema', 'warning')
        return
      }
      if (
        this.formContent.schemaRange === 'EXCLUDE' &&
        this.exSchemaList.length === 0
      ) {
        this.$blauShowSuccess('schema不能为空', 'warning')
        return
      }
      this.dataSheetLog = true
      let list = this.treeData[0].children
      this.requestBodySchema = list[0].name
      this.$nextTick(() => {
        // 选中第一个schema
        this.$refs.tree && this.$refs.tree.setCurrentKey(list[0].name)
      })
      this.restorePage()
      this.getTableList()
    },
    // 页码，页数重置
    restorePage() {
      this.currentPage = 1
      this.pageSize = 20
      this.total = 0
      this.tableSheet = []
      this.tableTag = []
      this.assetName = ''
      this.schemaName = ''
      this.tableName = ''
    },
    getSecurityName(list) {
      if (list) {
        return list.join(',')
      }
      return ''
    },
    getTableList() {
      if (!this.requestBodySchema) {
        this.tableSheet = []
        this.total = 0
        return
      }
      let requestBody = {
        currentPage: this.currentPage,
        keyword: this.assetName,
        pageSize: this.pageSize,
        schema: this.requestBodySchema,
        modelId: this.formContent.modelId,
        typeIds: [],
        tagIds: this.levelId ? [this.levelId] : [],
        sortByName: null,
        sortByCreateTime: null,
        withSecurityTagName: true,
      }
      if (this.isTable) {
        requestBody.typeIds.push(80000004)
      }
      if (this.isView) {
        requestBody.typeIds.push(80500008)
      }
      this.tableLodaing = true
      this.$http
        .post(this.$url + '/service/entities/searchMetadata', requestBody)
        .then(res => {
          if (this.curTableList.length != 0) {
            let ary = this.curTableList.map(k => k.objectId)
            res.data.content.forEach(item => {
              item.disabled = ary.indexOf(item.objectId) !== -1
              ary.indexOf(item.objectId) !== -1 &&
                this.$refs.assetsTable.toggleRowSelection(item)
            })
          } else {
            // this.$refs.assetsTable && this.$refs.assetsTable.clearSelection()
            res.data.content.forEach(item => {
              item.disabled = false
            })
          }

          // 字段弹窗中表的下拉
          this.tableSheet = res.data.content
          this.total = res.data.totalItems

          this.tableLodaing = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.tableLodaing = false
        })
    },
    close() {
      this.dataSheetLog = false
      this.fieldLog = false
      this.height = 530
      this.tableSheet = []
      this.total = 0
      this.levelId = ''
      this.isView = true
      this.isTable = true
      this.requestBodySchema = ''
    },
    sure(val) {
      this.tableTag.map(item => {
        if (val === 'viewTagList') {
          item.parent = item.schema
        } else {
          item.parent = item.parentId
        }
      })
      val === 'viewTagList'
        ? this.curTableList.push(...this.tableTag)
        : this.curFieldList.push(...this.tableTag)
      this.close()
      if (val === 'viewTagList') {
        setTimeout(() => {
          if (this.formContent.tableRange === 'EXCLUDE') {
            const ids = this.tableTag.map(v => v.objectId)
            this.delColumnMethod(ids)
          }
        })
      }
    },
    dealdataManagers(data) {
      if (data && Array.isArray(data)) {
        let strArr = []
        let len

        strArr = data.map(item => {
          return item.firstName
        })
        len = strArr.length
        if (len > 2) {
          return `${strArr[0]},${strArr[1]}等${len}人`
        } else {
          return strArr.join(',')
        }
      } else {
        return ''
      }
    },
    // 数据源树
    handleNodeClick(data) {
      if (this.dataSheetLog) {
        !Number(data.key) && (this.requestBodySchema = data.name)
        Number(data.key) && (this.requestBodySchema = '')
        this.getTableList()
      }
    },
    dataIconFunction(data) {
      return data.children ? 'iconfont icon-shujuyuan' : 'iconfont icon-schema'
    },
    searchFileName() {
      this.currentPage = 1
      this.dataSheetLog && this.getTableList()
      this.fieldLog && this.getColumns()
    },
    handleSelectionChange(row) {
      this.tableTag = row.filter(item => !item.disabled)
      this.height = 530
      this.$nextTick(() => {
        if (this.tableTag.length != 0) {
          let itemH
          this.fieldLog
            ? (itemH = this.$refs.selectedFieldItems.offsetHeight)
            : (itemH = this.$refs.selectedItems.offsetHeight)
          this.height = 530 + itemH
        } else {
          this.height = 530
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.dataSheetLog && this.getTableList()
      this.fieldLog && this.getColumns()()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.dataSheetLog && this.getTableList()
      this.fieldLog && this.getColumns()
    },
    async tagClose(v, index) {
      let table = this.dataSheetLog
        ? this.$refs.assetsTable
        : this.$refs.assetsField
      this.tableTag.forEach(item => {
        if (item.id !== v.id) {
          table.toggleRowSelection(item, true)
        } else {
          table.toggleRowSelection(item, false)
        }
      })
    },
    // 字段
    showFieldLog() {
      if (this.schemaList.length === 0) {
        this.$blauShowSuccess('请选择schema', 'warning')
        return
      }
      if (
        this.formContent.schemaRange === 'EXCLUDE' &&
        this.exSchemaList.length === 0
      ) {
        this.$blauShowSuccess('schema不能为空', 'warning')
        return
      }
      this.restorePage()
      if (this.formContent.tableRange !== 'ALL') {
        if (this.curTableList.length > 0) {
        } else {
          this.$blauShowSuccess('请选择表/视图', 'warning')
        }
      }
      this.fieldLog = true
      this.$nextTick(() => {
        this.$refs.assetsField.clearSelection()
      })
      this.getColumns()
    },
    tableSelect(val) {
      this.tablePage = 1
      this.getTbaleAndView(val)
    },
    // 选择字段时，搜索表视图
    getTbaleAndView(key = '') {
      this.selectTableLoading = true
      if (this.formContent.tableRange === 'EXCLUDE') {
        const nowSchemaList =
          this.formContent.schemaRange === 'EXCLUDE'
            ? this.exSchemaList
            : this.schemaList
        const requestBody = {
          pageSize: 10,
          currentPage: this.tablePage,
          keyword: key,
          modelId: this.formContent.modelId,
          schemaList: nowSchemaList,
          tableIdList: this.curTableList.map(item => item.objectId),
          sort: '',
          exclude: true,
        }
        api
          .getExcludeTable(requestBody)
          .then(res => {
            this.selectTableLoading = false
            this.selectTotal = res.data.data.totalItems
            if (this.tablePage !== 1) {
              this.tableNameOption = this.tableNameOption.concat(
                res.data.data.content
              )
            } else {
              this.tableNameOption = res.data.data.content
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        const params = {
          currentPage: this.tablePage,
          keyword: key,
          modelId: this.formContent.modelId,
          pageSize: 10,
          schemas: this.schemaList,
          sortByCreateTime: null,
          sortByName: null,
          tagIds: this.levelId ? [this.levelId] : [],
          typeIds: ['80000004', '80500008'],
          withSecurityTagName: true,
        }
        this.$http
          .post(this.$url + '/service/entities/searchMetadata', params)
          .then(res => {
            this.selectTableLoading = false
            this.selectTotal = res.data.totalItems
            if (this.tablePage !== 1) {
              this.tableNameOption = this.tableNameOption.concat(
                res.data.content
              )
            } else {
              this.tableNameOption = res.data.content
            }
          })
          .catch(e => {
            this.selectTableLoading = false
            this.$showFailure(e)
          })
      }
    },
    lazyloading() {
      if (this.isLazy) {
        if (this.tablePage * 10 >= this.selectTotal) return
        this.tablePage++
        this.getTbaleAndView()
      }
    },
    // 获取指定（table，view）下的字段
    getColumns1(id = '') {
      let ary = this.curTableList.map(item => item.objectId)
      if (!ary.length && !id) return
      this.filedLodaing = true
      let params = {
        tableIdList: id ? [id] : ary,
        keyword: this.assetName,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        sort: this.sort,
        tagId: this.levelId,
      }
      if (this.formContent.tableRange === 'EXCLUDE') {
        let nowSchemaList = []
        if (this.formContent.schemaRange === 'ALL') {
          nowSchemaList = this.schemaItem
        } else if (this.formContent.schemaRange === 'INCLUDE') {
          nowSchemaList = this.schemaList
        } else {
          nowSchemaList = this.exSchemaList
        }
        params.modelId = this.formContent.modelId
        params.exclude = !this.tableName // 表选择的为除指定外时
        params.schemaList = nowSchemaList
      }
      api
        .getFieldFromId(params)
        .then(res => {
          let data = res.data.data
          if (this.curFieldList.length != 0) {
            let ary = this.curFieldList.map(k => k.objectId)
            data.content.forEach(item => {
              item.disabled = ary.indexOf(item.objectId) !== -1
              ary.indexOf(item.objectId) !== -1 &&
                this.$refs.assetsField.toggleRowSelection(item)
            })
          } else {
            data.content.forEach(item => {
              item.disabled = false
            })
          }
          this.tableSheet = data.content
          this.total = data.totalItems
          this.filedLodaing = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.filedLodaing = false
        })
    },
    // 获取字段(元数据中的接口)
    getColumns(id = '') {
      if (this.formContent.tableRange === 'ALL') {
        if (id) {
          this.getColumns1(id)
        } else {
          // 当选择全部schema下的表和视图时
          const schemas = this.schemaList
          let requestBody = {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            keyword: this.assetName,
            schemas, // schema集合
            modelId: this.formContent.modelId,
            typeIds: ['80000005'],
            tagIds: this.levelId ? [this.levelId] : null,
            sortByName: null,
            sortByCreateTime: null,
            withSecurityTagName: true,
          }
          this.tableLodaing = true
          this.$http
            .post(this.$url + '/service/entities/searchMetadata', requestBody)
            .then(res => {
              if (this.curFieldList.length != 0) {
                let ary = this.curFieldList.map(k => k.objectId)
                console.log(ary)
                res.data.content.forEach(item => {
                  item.disabled = ary.indexOf(item.objectId) !== -1
                  ary.indexOf(item.objectId) !== -1 &&
                    this.$refs.assetsField.toggleRowSelection(item)
                })
              } else {
                res.data.content.forEach(item => {
                  item.disabled = false
                })
              }
              // 字段弹窗中表的下拉
              this.tableSheet = res.data.content
              this.total = res.data.totalItems
              this.tableLodaing = false
            })
            .catch(e => {
              this.$showFailure(e)
              this.tableLodaing = false
            })
        }
      } else {
        this.getColumns1(id)
      }
    },
    changeSelectTable(e) {
      if (!e.target.value) {
        this.clearTable()
      }
    },
    clearTable() {
      if (this.formContent.tableRange === 'ALL') {
        this.isLazy = true
        this.tablePage = 1
        this.getTbaleAndView()
      } else {
        if (this.formContent.tableRange === 'EXCLUDE') {
          this.isLazy = true
          this.tablePage = 1
          this.getTbaleAndView()
        } else {
          this.isLazy = false
          this.tableNameOption = this.curTableList
        }
      }
    },
    // 获取数据源
    getModel() {
      this.modelLoading = true
      const params = {
        categoryId: '',
        currentPage: this.modelPage,
        modelName: '',
        pageSize: 500,
      }
      api
        .getFromre(params)
        .then(res => {
          this.modelLoading = false
          this.dataOriginOpt = res.data.content
        })
        .catch(e => {
          this.modelLoading = false
          this.$showFailure(e)
        })
    },
    modelloading() {
      if (this.modelPage * 20 >= this.modelTotal) return
      this.modelPage++
      this.getModel()
    },
    selectSchema(modelId, v) {
      this.initSlectData(1)
      let id = modelId || this.formContent.modelId
      id &&
        api
          .getSchemaList(id)
          .then(res => {
            this.schemaItem = res.data.data || []
            this.schemaList = this.schemaItem
            if (v) {
              // 数据源切换
              return
            }
            this.schemaList = this.formContent.schemaNameList
            if (this.formContent.schemaRange === 'EXCLUDE') {
              let newList = []
              this.schemaItem.map(item => {
                if (this.schemaList.some(m => m === item)) {
                } else {
                  newList.push(item)
                }
              })
              this.exSchemaList = newList
            }
            this.initData.id && this.getTableFieldList({ typeId: 80000004 })
            this.initData.id && this.getTableFieldList({ typeId: 80000005 })
          })
          .catch(e => {
            this.$showFailure(e)
          })
    },
    // 字段搜索按钮
    queryClick() {
      this.currentPage = 1
      this.getColumns(this.tableName)
    },
    getTableFieldList(param) {
      // 80000005 字段  80000004 表
      let { currentPage, pageSize, typeId, controlId } = param
      let json = new FormData()
      json.append('currentPage', currentPage || 1)
      json.append('pageSize', pageSize || 20)
      json.append('sort ', 'ASC')
      api
        .getAccessDataList({
          controlId: controlId || this.initData.id,
          typeId: typeId,
          json,
        })
        .then(async res => {
          let data = res.data.data
          const ids = data.content.map(item => item.objectId)
          let nowList = []
          try {
            const resultData = await api.getAccessInfo(ids)
            nowList = resultData.data.data || []
            // 修改状态，获取之前的table和字段信息
            if (typeId == 80000004 || typeId == 80500008) {
              this.oriTableInfo = data.content
              data.content.map(item => {
                item.has = true
                item.path = nowList.filter(
                  m => item.objectId === m.objectId
                )[0].path
                item.tagNames = nowList.filter(
                  m => item.objectId === m.objectId
                )[0].tagNames
              })
              this.curTableList = data.content
            }
            if (typeId === 80000005) {
              this.oriColumnInfo = data.content
              data.content.map(item => {
                item.has = true
                item.path = nowList.filter(
                  m => item.objectId === m.objectId
                )[0].path
                item.tagNames = nowList.filter(
                  m => item.objectId === m.objectId
                )[0].tagNames
              })
              this.curFieldList = data.content
            }
          } catch (e) {
            this.$showFailure(e)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {
    initData: {
      handler(val) {
        // if (Object.keys(val).length && val.id !== this.formContent.id) {
        if (val.id) {
          this.formContent = _.cloneDeep(this.initData)
          this.schemaList = this.formContent.schemaNameList || []
          this.curTableList = this.formContent.tableList || []
          this.curFieldList = this.formContent.columnList || []
        }
      },
      immediate: true,
      deep: true,
    },
    rangeMap: {
      handler(val) {
        // console.log(val)
      },
      immediate: true,
      deep: true,
    },
    'formContent.actionList'(val) {
      this.clickChild('action', { data: val })
    },
  },
}
