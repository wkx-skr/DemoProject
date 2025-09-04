import tableCom from '@/view/dataSecurity/accessStrategy/components/tableCom'
import { executeAction } from '../../util/attrEnum'
import folder from '@/assets/images/search/folder.svg'
import viewAll from '@/assets/images/strategy/viewAll.svg'
import fieldAll from '@/assets/images/strategy/fieldAll.svg'
import api from '../../util/api'
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
        allow: true,
        schemaRange: 'ALL',
        tableRange: 'ALL',
        columnRange: 'ALL',
      },
      schemaTagList: {
        ALL: [],
        INCLUDE: [],
        EXCLUDE: [],
      },
      viewTagList: {
        ALL: [],
        INCLUDE: [],
        EXCLUDE: [],
      },
      fieldTagList: {
        ALL: [],
        INCLUDE: [],
        EXCLUDE: [],
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
      oriSchemaRange: '',
      oriTableRange: '',
      oriColumnRange: '',
      delTableList: [],
      delColumnList: [],
      tablePage: 1,
      selectTableLoading: false,
      selectTotal: 0,
      isLazy: false,
    }
  },
  computed: {
    treeData() {
      let newList = []
      if (this.formContent.schemaRange === 'EXCLUDE') {
        newList = this.exSchemaList
      } else {
        newList = this.schemaTagList[this.formContent.schemaRange]
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
  },
  methods: {
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
      this.schemaTagList = {
        ALL: [],
        INCLUDE: [],
        EXCLUDE: [],
      }
    },
    clearTableData() {
      this.viewTagList = {
        ALL: [],
        INCLUDE: [],
        EXCLUDE: [],
      }
    },
    clearFieldData() {
      this.fieldTagList = {
        ALL: [],
        INCLUDE: [],
        EXCLUDE: [],
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
        this.viewTagList[this.formContent.tableRange] = list
        if (row.has) {
          this.delTableList.push(row)
        }
      } else {
        this.fieldTagList[this.formContent.columnRange] = list
        if (row.has) {
          this.delColumnList.push(row)
        }
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
            this.schemaTagList[this.formContent.schemaRange].length == 0
          ) {
            let text =
              this.formContent.schemaRange === 'INCLUDE' ? '指定' : '除指定外'
            this.$blauShowSuccess(`请选择schema${text}的数据`, 'warning')
            return
          } else if (
            this.formContent.tableRange !== 'ALL' &&
            this.viewTagList[this.formContent.tableRange].length == 0
          ) {
            let text =
              this.formContent.tableRange === 'INCLUDE' ? '指定' : '除指定外'
            this.$blauShowSuccess(`请选择表/视图${text}的数据`, 'warning')
            return
          } else if (
            this.formContent.columnRange !== 'ALL' &&
            this.fieldTagList[this.formContent.columnRange].length == 0
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
        this.getFormContent()
        this.clickChild('step', { step: 3, prevStep: 2 })
      }
    },
    async getFormContent() {
      let columnList = []
      this.fieldTagList[this.formContent.columnRange].forEach(item => {
        columnList.push({
          id: item.id || item.objectId,
          type: item.type || item.objectType,
          columnId: item.id || item.objectId,
          columnName: item.physicalName || item.objectName,
          physicalName: item.physicalName || item.objectName,
          tableName: this.viewTagList[this.formContent.tableRange].map(
            item => item.physicalName
          )[0],
          schemaName: this.schemaTagList[this.formContent.schemaRange][0],
        })
      })
      let obj = {
        // schema
        schemaNameList: this.schemaTagList[this.formContent.schemaRange],
        // 表，视图
        tableIdList: this.viewTagList[this.formContent.tableRange].map(
          item => item.objectId
        ),
        tableList: this.viewTagList[this.formContent.tableRange],
        // 字段
        columnIdList: this.fieldTagList[this.formContent.columnRange].map(
          item => item.objectId
        ),
        columnList: columnList,
      }
      if (this.initData.id) {
        // 点击删除，删除的表或字段
        // 判断是否切换schema，table、view
        const fieldModify = {
          typeId: 80000005,
          modifyIdList: this.fieldTagList[this.formContent.columnRange].map(
            m => m.objectId
          ),
        }
        const tableModify = {
          typeId: 80000004,
          modifyIdList: this.viewTagList[this.formContent.tableRange].map(
            m => m.objectId
          ),
        }
        if (this.formContent.schemaRange === this.rangeMap.oriSchemaRange) {
          if (this.formContent.tableRange === this.rangeMap.oriTableRange) {
            this.viewTagList[this.formContent.tableRange].map(v => {
              this.delTableList = this.delTableList.filter(
                m => m.objectId !== v.objectId
              )
            })
            await this.getDelTableData(this.delTableList)
            if (this.formContent.columnRange === this.rangeMap.oriColumnRange) {
              this.fieldTagList[this.formContent.columnRange].map(v => {
                this.delColumnList = this.delColumnList.filter(
                  m => m.objectId !== v.objectId
                )
              })
              await this.getDelColumnData(this.delColumnList)
            } else {
              this.delColumnList = this.oriColumnInfo
              this.fieldTagList[this.formContent.columnRange].map(v => {
                this.delColumnList = this.delColumnList.filter(
                  m => m.objectId !== v.objectId
                )
              })
              await this.getDelColumnData(this.delColumnList)
            }
          } else {
            this.delTableList = this.oriTableInfo
            this.delColumnList = this.oriColumnInfo
            this.viewTagList[this.formContent.tableRange].map(v => {
              this.delTableList = this.delTableList.filter(
                m => m.objectId !== v.objectId
              )
            })
            this.fieldTagList[this.formContent.columnRange].map(v => {
              this.delColumnList = this.delColumnList.filter(
                m => m.objectId !== v.objectId
              )
            })
            await this.getDelTableData(this.delTableList)
            await this.getDelColumnData(this.delColumnList)
          }
        } else {
          this.delTableList = this.oriTableInfo
          this.delColumnList = this.oriColumnInfo
          this.viewTagList[this.formContent.tableRange].map(v => {
            this.delTableList = this.delTableList.filter(
              m => m.objectId !== v.objectId
            )
          })
          this.fieldTagList[this.formContent.columnRange].map(v => {
            this.delColumnList = this.delColumnList.filter(
              m => m.objectId !== v.objectId
            )
          })
          await this.getDelTableData(this.delTableList)
          await this.getDelColumnData(this.delColumnList)
        }
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
    getDelTableData(data) {
      this.tableModifyDel = {
        delete: true,
        // modifyNameList: data.map(item => item.objectName),
        modifyIdList: data.map(item => item.objectId),
        typeId: 80000004,
      }
    },
    getDelColumnData(data) {
      this.fieldModifyDel = {
        delete: true,
        // modifyNameList: data.map(item => item.objectName),
        modifyIdList: data.map(item => item.objectId),
        typeId: 80000005,
      }
    },
    handleClick(val) {
      this[val] = !this[val]
    },
    schemaChange(val) {
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
      this.schemaTagList[this.formContent.schemaRange] = this.schemaList
    },
    // schema 指定,全部切换
    schemaRadioChange() {
      this.schemaList = this.schemaTagList[this.formContent.schemaRange]
      this.initSlectData(2)
    },
    tagSchemaClose(v) {
      this.schemaList = this.schemaList.filter(item => item != v)
      this.schemaChange()
    },
    // 表的状态切换
    viewRadioChange() {
      this.initSlectData(3)
    },
    // 添加数据表
    addDataTable() {
      if (this.schemaTagList[this.formContent.schemaRange].length === 0) {
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
        tagIds: null,
        sortByName: null,
        sortByCreateTime: null,
      }
      if (this.isTable) {
        requestBody.typeIds.push(80000004)
      }
      if (this.isView) {
        requestBody.typeIds.push(80500008)
      }
      this.tableLodaing = true
      this.$http
        .post(this.$meta_url + '/service/entities/searchMetadata', requestBody)
        .then(res => {
          if (this.viewTagList[this.formContent.tableRange].length != 0) {
            let ary = this.viewTagList[this.formContent.tableRange].map(
              k => k.objectId
            )
            res.data.content.forEach(item => {
              item.disabled = ary.indexOf(item.objectId) !== -1
              ary.indexOf(item.objectId) !== -1 &&
                this.$refs.assetsTable.toggleRowSelection(item)
            })
          } else {
            this.$refs.assetsTable && this.$refs.assetsTable.clearSelection()
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
      this.requestBodySchema = ''
    },
    sure(val) {
      val === 'viewTagList'
        ? this[val][this.formContent.tableRange].push(...this.tableTag)
        : this[val][this.formContent.columnRange].push(...this.tableTag)
      this.close()
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
      if (this.schemaTagList[this.formContent.schemaRange].length === 0) {
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
      if (this.formContent.tableRange === 'ALL') {
        this.isLazy = true
        this.tablePage = 1
        this.getTbaleAndView()
      } else {
        if (this.viewTagList[this.formContent.tableRange].length > 0) {
          this.isLazy = false
          this.tableNameOption = this.viewTagList[this.formContent.tableRange]
        } else {
          this.$blauShowSuccess('请选择表/视图', 'warning')
          return
          this.isLazy = true
          this.tablePage = 1
          this.getTbaleAndView()
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
      // this.tableName = val
      this.getTbaleAndView(val)
    },
    // 选择字段时，搜索表视图
    getTbaleAndView(key = '') {
      this.selectTableLoading = true
      const params = {
        currentPage: this.tablePage,
        keyword: key,
        modelId: this.formContent.modelId,
        pageSize: 10,
        schemas: this.schemaTagList[this.formContent.schemaRange],
        sortByCreateTime: null,
        sortByName: null,
        tagIds: null,
        typeIds: ['80000004', '80500008'],
      }
      this.$http
        .post(this.$meta_url + '/service/entities/searchMetadata', params)
        .then(res => {
          this.selectTableLoading = false
          this.selectTotal = res.data.totalItems
          if (this.tablePage !== 1) {
            this.tableNameOption = this.tableNameOption.concat(res.data.content)
          } else {
            this.tableNameOption = res.data.content
          }
        })
        .catch(e => {
          this.selectTableLoading = false
          this.$showFailure(e)
        })
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
      let ary = this.viewTagList[this.formContent.tableRange].map(
        item => item.objectId
      )
      if (!ary.length && !id) return
      this.filedLodaing = true
      let params = {
        tableIdList: id ? [id] : ary,
        keyword: this.assetName,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        sort: this.sort,
      }
      if (this.formContent.tableRange === 'EXCLUDE') {
        let nowSchemaList = []
        if (this.formContent.schemaRange === 'ALL') {
          nowSchemaList = this.schemaItem
        } else if (this.formContent.schemaRange === 'INCLUDE') {
          nowSchemaList = schemaTagList[formContent.schemaRange]
        } else {
          nowSchemaList = this.exSchemaList
        }
        params.modelId = this.formContent.modelId
        params.exclude = true
        params.schemaList = nowSchemaList
      }
      api
        .getFieldFromId(params)
        .then(res => {
          let data = res.data.data
          if (this.fieldTagList[this.formContent.columnRange].length != 0) {
            let ary = this.fieldTagList[this.formContent.columnRange].map(
              k => k.objectId
            )
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
          const schemas = this.schemaTagList[this.formContent.tableRange]
          let requestBody = {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            keyword: this.assetName,
            schemas, // schema集合
            modelId: this.formContent.modelId,
            typeIds: ['80000005'],
            tagIds: null,
            sortByName: null,
            sortByCreateTime: null,
          }
          this.tableLodaing = true
          this.$http
            .post(
              this.$meta_url + '/service/entities/searchMetadata',
              requestBody
            )
            .then(res => {
              if (this.viewTagList[this.formContent.tableRange].length != 0) {
                let ary = this.viewTagList[this.formContent.tableRange].map(
                  k => k.objectId
                )
                res.data.content.forEach(item => {
                  item.disabled = ary.indexOf(item.objectId) !== -1
                  ary.indexOf(item.objectId) !== -1 &&
                    this.$refs.assetsTable.toggleRowSelection(item)
                })
              } else {
                this.$refs.assetsTable &&
                  this.$refs.assetsTable.clearSelection()
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
        if (this.viewTagList[this.formContent.tableRange].length > 0) {
          this.isLazy = false
          this.tableNameOption = this.viewTagList[this.formContent.tableRange]
        } else {
          this.isLazy = true
          this.tablePage = 1
          this.getTbaleAndView()
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
        pageSize: 20,
      }
      api.getFromre(params).then(res => {
        this.modelLoading = false
        this.modelTotal = res.data.totalItems
        if (this.modelPage !== 1) {
          this.dataOriginOpt = this.dataOriginOpt.concat(res.data.content)
        } else {
          this.dataOriginOpt = res.data.content
        }
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
            this.schemaTagList.ALL = this.schemaItem
            if (v) {
              // 数据源切换
              return
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
    schemaNameChange() {},
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
        .then(res => {
          let data = res.data.data
          // 修改状态，获取之前的table和字段信息
          if (typeId == 80000004) {
            this.oriTableInfo = data.content
            data.content.map(item => (item.has = true))
            this.viewTagList[this.formContent.tableRange] = data.content
          }
          if (typeId == 80000005) {
            this.oriColumnInfo = data.content
            data.content.map(item => (item.has = true))
            this.fieldTagList[this.formContent.columnRange] = data.content
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
          this.schemaTagList[this.formContent.schemaRange] =
            this.formContent.schemaNameList || []
          this.viewTagList[this.formContent.tableRange] =
            this.formContent.tableList || []
          this.fieldTagList[this.formContent.columnRange] =
            this.formContent.columnList || []
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
