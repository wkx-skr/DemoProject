/*eslint-disable*/
import G6 from '@antv/g6'
import databaseType from '@/components/common/DatabaseType.vue'
import HTTP from '@/dataWarehouse/resource/http'
import $const from '@/resource/const'
import editor from './editor.vue'
import { Base64 } from 'js-base64'
import { forEach } from 'lodash'

export default {
  mounted () {
    this.getDataSource()
  },
  components: {
    databaseType,
    editor
  },
  props: {
    migrationObj: {
      type: [Array, Object],
    },
    codeTree: {
      type: Object,
      default: () => {}
    },
    flagType :{
      type: Boolean
    },
    authPro: {
      type: Object,
    }
  },
  data () {
    let contentValidate = (rule, value, callback) => {
      value = _.trim(this.requestBody.name)
      if (!value) {
        callback(new Error(this.$store.state.$v.dataEntity.err1))
      } else {
        callback()
      }
    }
    let columnNameValidate = (rule, value, callback) => {
      if (!(value?.trim())) {
        callback(new Error('字段名是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure('字段名是必填的')
        }, 200)
      } else {
        if (this.checkColIsDuplicate2(value)) {
          callback(new Error(`字段名 ${value}重名`))
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.$showFailure(`字段名 ${value} 重名`)
          }, 200)
        } else {
          callback()
        }
      }
    }
    let dataTypeValidate = (rule, value, callback) => {
      if (!(value?.trim())) {
        callback(new Error('数据类型是必填的'))
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$showFailure(`数据类型是必填的`)
        }, 200)
      } else {
        callback()
      }
    }
    return {
      dataSourceId: '',
      dataSourceList: [],
      schemaList: [],
      schemaName: '',
      tableData: [],
      tableName: '',
      dataSourceId2: '',
      dataSourceList2: [],
      schemaList2: [],
      schemaName2: '',
      tableData2: [],
      tableName2: '',
      colList1: [],
      colArrList: [],
      colList2: [],
      sql: '',
      hasInit: false,
      dialogVisible: false,
      partSecond: false,
      step: 'first',
      radioValue: 1,
      lastPart: false,
      checkColArr: [],
      dialogVisibleColumn: false,
      tableDataCol: [],
      rules: {
        tableName: {
          required: true,
          validator: contentValidate,
          trigger: ['change', 'blur']
        },
        columnName: {
          validator: columnNameValidate,
          trigger: ['change', 'blur']
        },
        dataType: {
          required: true,
          validator: dataTypeValidate,
          trigger: ['change', 'blur']
        },
        value: [{ required: true, message: '请输入默认值', trigger: 'change' }]
      },
      dataTypeSearchMode: false,
      dataSourceType: '',
      dataTypeFocusPrevent: false,
      advanced: false,
      checkColArrAll: false,
      isIndeterminate: true,
      colArrOptions: [],
      colArrOptionsCont: [],
      noAdvanced: true,
      ddlitem: {
        nodeAuth: [],
        content: ''
      },
      ddlShow: false,
      jsPlumb: null, // 缓存实例化的jsplumb对象
      blankList: [],
      seniorBtn: false,
      nextStepType: 'first',
      queryTable: '',
      queryTable2: '',
      dataExplorationVisible: false,
      dataExplorationData: [],
      dataExplorationColumn: [],
      detailData: null,
      nameId: 'add',
      dml: '',
      transformName: '',
      transformDescribe: '',
      stepType: '1',
      tableTypes: 'single',
      tableDataMultiple: [],
      currentPageMultiple: 1,
      expandKeys: [],
      defaultProps: {
        label: 'name'
        // isLeaf: 'leaf'
      },
      totalItems: 0,
      allTablesChecked: false,
      selectType: 1,
      clearTargetRecord: false,
      prefixValue: '',
      suffixValue: '',
      rowLevelValue: 1,
      rowNumber: null,
      filterTableData: [],
      filterDataTitle: '创建数据过滤条件',
      filterDataVisible: false,
      filterDataForm: {
        name: '',
        field: '',
        condition: '',
        conditionNum: '',
        tableData: [],
        fieldOption: [],
        rowIndex: null
      },
      checkedTableDataMultiple: [],
      conditionalSqlMap: new Map(),
      // 生成ddl的请求体
      generateDdlData: [],
      columnsDetailAll: null,
      ddlSql: this.ddlSql,
      dtColumns: [],
      defaultValues: [],
      editState: false,
      defaultCheckedKeys: [],
      creatDdl: false,
      tableNameMultiple: [],
      fromDBType: null,
      targetSpliter: '',
      targetSpliterShow: false,
      dataSourceIdName: '',
      dataSourceIdName2: '',
      conditionOption: [{
        label: '>',
        value: '>'
      }, {
        label: '<',
        value: '<'
      }, {
        label: '=',
        value: '='
      }, {
        label: '>=',
        value: '>='
      }, {
        label: '<=',
        value: '<='
      }, {
        label: 'IN',
        value: 'IN'
      }, {
        label: 'LIKE',
        value: 'LIKE'
      }],
      stepNum: '',
      isIncrease: false
    }
  },
  computed: {
    requiredFormNotEmpty () {
      const columnsNotEmpty = this.tableDataCol.every(item => {
        return !!_.trim(item.name) && !!_.trim(item.dataType) && !!_.trim(item.value)
      })
      return columnsNotEmpty
    },
    addConditionsDisabled () {
      return this.filterDataForm.name === '' || this.filterDataForm.field === '' || this.filterDataForm.condition === '' || this.filterDataForm.conditionNum === ''
    },
    disabledThird () {
      if (this.selectType === 1) {
        if (this.tableTypes === 'single') {
          return this.dataSourceId2 === '' || this.schemaName2 === '' || this.tableName2 === ''
        } else {
          return this.dataSourceId2 === '' || this.schemaName2 === ''
        }
      } else {
        return this.dataSourceId2 === '' || this.schemaName2 === '' || !this.requiredFormNotEmpty
      }
    },
    disabledSecond () {
      if (this.tableTypes === 'single') {
        return this.tableName === '' || this.schemaName === '' || this.dataSourceId === ''
      } else {
        if (this.editState) {
          return false
        } else {
          return this.dataSourceId === '' || this.schemaName === '' || (this.checkedTableDataMultiple.length === 0 && this.allTablesChecked === false)
        }
      }
    },
    requiredFilterTable () {
      const columnsNotEmpty = this.filterTableData.every(item => {
        return !!_.trim(item.tableName) && !!_.trim(item.field) && !!_.trim(item.condition) && !!_.trim(item.conditionNum)
      })
      return columnsNotEmpty
    },
    disabledFifth(){
      if(this.filterTableData.length>0){
        if (this.rowLevelValue===1){
          return !this.requiredFilterTable
        } else {
          if (this.rowNumber===''||this.rowNumber === null || !this.requiredFilterTable) {
            return true
          } else {
            return false
          }
        }
      } else {
        if (this.rowLevelValue===1){
          return false
        } else {
          if (this.rowNumber===''||this.rowNumber === null) {
            return true
          } else {
            return false
          }
        }
      }
    },
  },
  methods: {
    // 更新表单
    refreshTableForm (type) {
      HTTP.refreshTable({ modelId: type === 'from'?this.dataSourceId:this.dataSourceId2, schemaName: type === 'from'?encodeURIComponent(this.schemaName): encodeURIComponent(this.schemaName2)})
        .then(res => {
          if (res) {
            this.getTables(type === 'from'?this.dataSourceId:this.dataSourceId2, type === 'from'?this.schemaName: this.schemaName2, type === 'from'?this.queryTable: this.queryTable2)
            .then(res => {
              if (type === 'from') {
                this.tableData = res.data.content
              } else {
                this.tableData2 = res.data.content
              }
            })
          }
        }).catch(e => {
          this.$showFailure(e)
        })
    },
    // 生成DDLsql
    ddlInitAll (type) {
      // generateDdlData
      this.creatDdl = true
      let url = ''
      url = `${this.$dddUrl}/service/workflow/ddl/init`
      if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0].type === 'HIVE') {
        this.generateDdlData[0].delimiter = this.targetSpliter
      }
      this.$http.post(url, this.generateDdlData)
        .then(res => {
          this.ddlSql = res.data
          this.creatDdl = false
          if(this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type === 'HIVE') {
            this.goLastData()
          } else {
            this.stepType = type
          }
        })
        .catch(e => {
          console.error(e)
          this.$showFailure(e)
        })
    },
    // 添加过滤条件
    addConditions () {
      this.filterTableData.push({
        tableName: this.filterDataForm.name,
        conditionSql: this.filterDataForm.field + this.filterDataForm.condition + this.filterDataForm.conditionNum,
        field: this.filterDataForm.field,
        condition: this.filterDataForm.condition,
        conditionNum: this.filterDataForm.conditionNum
      })
      this.filterDataVisible = false
      this.$message.success('添加成功')
    },
    addEditConditions () {
      this.$set(this.filterTableData, this.filterDataForm.rowIndex, {
        tableName: this.filterDataForm.name,
        conditionSql: this.filterDataForm.field + this.filterDataForm.condition + this.filterDataForm.conditionNum,
        field: this.filterDataForm.field,
        condition: this.filterDataForm.condition,
        conditionNum: this.filterDataForm.conditionNum
      })
      this.filterDataVisible = false
      this.$message.success('修改成功')
    },
    filterNameChange (row,index) {
      this.getColumns(this.dataSourceId, this.schemaName, row.tableName)
        .then(res => {
          this.$set(this.filterTableData[index],'fieldOption', res.data)
          // this.filterTableData[index].fieldOption = res.data
        })
    },
    tableDataMultipleChange () {
      this.checkedTableDataMultiple = this.$refs.tableDataMultiple.getCheckedNodes()
    },
    // 新建过滤条件
    newCondition () {
      let body = {
        name:'',
        field: '',
        condition: '',
        conditionNum: '',
      }
      this.filterTableData.push(body)
    },
    conditionsClose () {
      this.filterDataForm.name = ''
      this.filterDataForm.field = ''
      this.filterDataForm.condition = ''
      this.filterDataForm.conditionNum = ''
      this.filterDataVisible = false
    },
    // 删除过滤条件
    deleteCondition (row, index) {
      this.filterTableData.splice(index, 1)
    },
    // 编辑过滤条件
    editCondition (row, index) {
      this.filterDataTitle = '编辑数据过滤条件'
      this.filterDataVisible = true
      this.filterDataForm.name = row.tableName
      this.filterDataForm.field = row.field
      this.filterDataForm.condition = row.condition
      this.filterDataForm.conditionNum = row.conditionNum
      this.filterDataForm.rowIndex = index
      this.editConditionType = 'edit'
    },
    // 行级限制
    rowLevelChange () {

    },
    // 有目标/根据原表自动生成
    selectTypeChange () {
      if (this.selectType === 2) {
        this.clearTargetRecord = false
      }
    },
    // 单表 or 多表
    tableTypesChange () {
      if (this.tableTypes === 'multiple') {
        this.totalItems = 0
        this.currentPageMultiple = 1
        this.tableDataMultiple = []
        this.getTablesMultiple()
      }
    },
    getTablesMultiple () {
      let mapData = []
      // this.tableDataMultiple = []

      this.$http.get(`${this.$dddUrl}/datatype/${this.dataSourceId}/${encodeURIComponent(this.schemaName)}/raw-tables?pageSize=40&currentPage=${this.currentPageMultiple}&search=`).then(res => {
        // this.tableDataMultiple = res.data.content
        this.totalItems = res.data.totalItems
        mapData = res.data.content.map(i => ({
          name: i,
          type: 'table',
          // leaf: false
          children: null
        }))
        mapData.forEach(element => {
          if (this.editState) {
            element.disabled = true
          }
          this.tableDataMultiple.push(element)
        })
      })
        .catch(e => {
          console.error(e)
          this.$showFailure(e)
        })
    },
    dataIconFunction (data, node) {
      if (data.type === 'table') { // 表
        return 'iconfont icon-biao'
      } else if (data.type === 'column') { // 字段
        return 'iconfont icon-ziduan'
      } else {
        return ''
      }
    },
    renderContent (h, { node, data, store }) {
      if (node.data.type === 'table') {
        return (<span><i class='iconfont icon-biao' style='font-size:14px;padding-right:9px'></i>{data.name}</span>)
      } else {
        return (<span><i class='iconfont icon-ziduan' style='font-size:14px;padding-right:9px'></i>{data.name} <span style="color:#888;padding-left:4px">{data.dataType}({data.columnSize})</span></span>)
      }
    },
    lazyloadingMultiple () {
      if (this.totalItems > this.tableDataMultiple.length) {
        this.currentPageMultiple++
        this.getTablesMultiple()
        // this.loadDisabled = false
      }
    },
    getDetailEdit () {
      this.$nextTick(() => {
        if (this.flagType &&  this.detailData && JSON.stringify(this.detailData) !== '{}'){
          // this.getDataSource()
          this.nameId = this.detailData?.id
          this.tableDataCol = []
          this.filterTableData = []
          this.stepType = '1'
          this.transformName = this.detailData?.workflowName
          this.transformDescribe = this.detailData?.workflowDescription
          this.prefixValue = this.detailData?.pluginDto.prefix
          this.suffixValue = this.detailData?.pluginDto.suffix
          this.allTablesChecked = this.detailData?.pluginDto.isWholeTable === 1 ? true :false
          for (let key in this.detailData?.conditionMap) {
            this.detailData.conditionMap[key].forEach(element => {
              this.filterTableData.push(JSON.parse(element))
            })
          }
          this.tableTypes = this.detailData?.type
          this.selectType = this.detailData?.isMultiplex
          if (this.detailData?.rowLimit === 'all') { // 行级限制
            this.rowLevelValue = 1
          } else {
            this.rowLevelValue = 2
            this.rowNumber = this.detailData?.rowLimit
          }
          this.detailData?.pluginDto && this.detailData?.pluginDto.defaultColumns && this.detailData?.pluginDto.defaultColumns.forEach(element => {
            element.dataType = element.type
            this.tableDataCol.push(element)
          })
          // 源数据
          this.dataSourceId = this.detailData?.dsDatasourceDto.damDsId
          this.getChemaList('', 'edit')
          this.schemaName = this.detailData?.pluginDto.dsDatabase
          this.getSourceTables('', 'edit')
          if (this.detailData?.type === 'multiple') {
            this.$nextTick(() => {
              this.defaultCheckedKeys = this.detailData?.pluginDto.dsTable
              setTimeout(() => {
                this.$refs.tableDataMultiple?.setCheckedKeys(this.defaultCheckedKeys)
                this.checkedTableDataMultiple = this.$refs.tableDataMultiple.getCheckedNodes()
              }, 1000)
            })
          } else {
            this.tableName = this.detailData?.pluginDto.dsTable[0]
            this.getColList('', 'edit')
          }
          // 目标数据
          this.dataSourceId2 = this.detailData?.dtDatasourceDto.damDsId
            this.getChemaList2('', 'edit')
            this.schemaName2 = this.detailData?.pluginDto.dtDatabase
          this.getSourceTables2('', 'edit')
          if (this.detailData?.isMultiplex === '2') {
            this.selectType = 2
          } else {
            this.selectType = 1
            this.tableName2 = this.detailData?.pluginDto.dtTable[0]
            this.clearTargetRecord = this.detailData?.pluginDto.isDeleted === 1
          }
          if ( this.detailData?.taskParams.dtType === 'HIVE'){
            this.targetSpliter = this.detailData?.targetSpliter
          }
          let dsName = this.dataSourceList.filter(v => v.damDsId === this.detailData.dsDatasourceDto.damDsId)
          let dtName = this.dataSourceList.filter(v => v.damDsId === this.detailData.dtDatasourceDto.damDsId)
          this.dataSourceIdName = dsName.length && dsName[0].damDsName
          this.dataSourceIdName2 = dtName.length && dtName[0].damDsName
          this.isIncrease = this.detailData.isIncrease
        }
      })

      // this.tableName2 = this.detailData.pluginDto.dtTable
    },
    getLigature (str) {
      this.jsPlumb.deleteEveryEndpoint()
      this.jsPlumb.repaintEverything()
      let split = str.split(',')
      let split1 = []
      split1 = split.map(s => {
        return s.split(' ')
      })
      let res = []
      split1.forEach(s1 => {
        let asI = s1.indexOf('as')
        this.jsPlumb.connect({
          source: 'o_' + s1[asI - 1],
          target: 't_' + s1[asI + 1]
        })
      })
    },
    dataExploration () {
      this.dataExplorationColumn = []
      // let sql = `Select * From ${this.schemaName}.${this.tableName}`
      this.$http
        .get(HTTP.$dddServerUrl + `datatype/getSqlGeneration?datasourceId=${this.dataSourceId}&schemaName=${this.schemaName}&tableName=${this.tableName}`)
        .then(response => {
          if (response.data.code === 200){
            let url = `${HTTP.$dddServerUrl}sqls/runSql`
              this.$http.post(url, {
                // timeout: 30000,
                datasourceId: this.dataSourceId,
                timeout: 1800,
                maxLine: 10,
                sql: Base64.encode(response.data.data.sqlSelect),
                uuid: new Date().getTime() + Number.parseInt(Math.random() * 1000),
                properties: [],
                funNames: []
              })
                .then(res => {
                  if (res.data.code !== 200) {
                    this.$datablauMessage.warning(res.data.msg)
                    return
                  }
                  if (res.data.data) {
                    let resData = res.data.data[0][0]
                    this.dataExplorationColumn = resData.header
                    let lastData = []
                    resData.data.forEach((item) => {
                      let obj = {}
                      item.forEach((v, j) => {
                        obj[this.dataExplorationColumn[j]] = v
                      })
                      lastData.push(obj)
                    })
                    // this.dataExplorationColumn = Object.keys(res.data.data[0][0])
                    this.dataExplorationData = lastData
                    this.dataExplorationVisible = true
                  }
                })
                .catch(e => {
                  this.$showFailure(e)
                  this.loading = false
                })
          } else {
            this.$datablauMessage.warning(res.data.msg)
            return
          }
        })
        .catch(err => {
          this.$showFailure(err)
        })
      
    },
    scopeJsonFormatter (scope) {
      let cellValue = scope.row[scope?.column?.property] || ''
      return this.jsonFormatter(scope.row, scope.column, cellValue)
    },
    jsonFormatter (row, column, cellValue, index) {
      if (!cellValue) {
        return cellValue
      }
      let jsonData = null
      try {
        let jsonData2 = jsonData
        // json 字符串转义
        jsonData2 = JSON.parse(cellValue)
        jsonData2 = JSON.stringify(jsonData2)
        jsonData = jsonData2
      } catch (e) {
      }
      return jsonData || cellValue
    },
    deleteRow (row, index) {
      this.tableDataCol.splice(index, 1)
    },
    getBlankList () {
      let lineList = this.jsPlumb && this.jsPlumb.getConnections()
      let blankList = []
      lineList && lineList.forEach(i => {
        let storeInfo = {
          sourceName: i.sourceId.substring(2),
          targetName: i.targetId.substring(2)
        }
        blankList.push(storeInfo)
      })
      this.blankList = blankList
    },
    showPlumb () {
      this.jsPlumb = this.$jsPlumb.getInstance({
        Container: 'container' + this.nameId, // 选择器id
        EndpointStyle: { radius: 0.11, fill: '#999' }, // 端点样式
        PaintStyle: { stroke: '#999', strokeWidth: 2 }, // 绘画样式，默认8px线宽  #456
        HoverPaintStyle: { stroke: '#994B0A', strokeWidth: 3 }, // 默认悬停样式  默认为null
        ConnectionOverlays: [ // 此处可以设置所有箭头的样式
          ['Arrow', { // 设置参数可以参考中文文档
            location: 1,
            length: 12,
            paintStyle: {
              stroke: '#999',
              fill: '#999'
            }
          }]
        ],
        Connector: ['Straight'], // 要使用的默认连接器的类型：直线，折线，曲线等
        DrapOptions: { cursor: 'crosshair', zIndex: 2000 }
      })
      this.jsPlumb.batch(() => {
        for (let i = 0; i < this.colList1.length; i++) {
          this.initLeaf(this.colList1[i].id, 'source')
        }
        for (let j = 0; j < this.colList2.length; j++) {
          this.initLeaf(this.colList2[j].id, 'target')
        }
      })

      this.setjsPlumb(true, true)

      // 点击连线
      // this.jsPlumb.bind('click', (conn, originalEvent) => {
      //   this.jsPlumb.deleteConnection(conn)
      //   this.getBlankList()
      // })
      // 连线时触发
      this.jsPlumb.bind('connection', (conn, originalEvent) => {
        // 数据存入
        let obj = {}
        obj.sourceId = conn.sourceId
        obj.targetId = conn.targetId
        let lineObj = this.jsPlumb.getConnections().filter(item => (item.sourceId === obj.sourceId && item.targetId !== conn.targetId) || (item.sourceId !== obj.sourceId && item.targetId === conn.targetId))
        lineObj.forEach(element => {
          this.jsPlumb.deleteConnection(element)
        })
        this.jsPlumb.repaintEverything()
        this.getBlankList()
      })

      // 右键触发
      this.jsPlumb.bind('contextmenu', (conn, originalEvent) => {
        console.log(conn, '右键触发')
      })
      if (JSON.stringify(this.detailData) !== '{}') {
        this.getLigature(this.detailData.pluginDto.sql)
      }
    },
    leftClickClear (row) {
      let lineObj = this.jsPlumb.getConnections().filter(item => (item.sourceId === row.id))
      lineObj.forEach(element => {
        this.jsPlumb.deleteConnection(element)
      })
      this.getBlankList()
    },
    //  初始化规则使其可以连线、拖拽
    initLeaf (id, type) {
      const ins = this.jsPlumb
      const elem = document.getElementById(id)
      if (type === 'source') {
        ins.makeSource(elem, {
          anchor: [1, 0.5, 0, 0], // 左 上 右 下
          allowLoopback: false, // 允许回连
          maxConnections: -1 // 最大连接数（-1表示不限制）
        })
      } else {
        ins.makeTarget(elem, {
          anchor: [0, 0.5, 0, 0],
          allowLoopback: false,
          maxConnections: -1
        })
      }
    },
    setjsPlumb (sourceFlag, targetFlag) {
      const source = document.getElementsByName('source' + this.nameId)
      const target = document.getElementsByName('target' + this.nameId)
      this.jsPlumb.setSourceEnabled(source, sourceFlag)
      this.jsPlumb.setTargetEnabled(target, targetFlag)
      this.jsPlumb.setDraggable(source, false) // 是否支持拖拽
      this.jsPlumb.setDraggable(target, false) // 是否支持拖拽
    },
    // 执行到目标库
    executeTarget (type) {
      let url = `${HTTP.$dddServerUrl}sqls/runSql`
      this.$http.post(url, {
        // timeout: 30000,
        datasourceId: this.dataSourceId2,
        timeout: 1800,
        maxLine: 10,
        sql: Base64.encode(this.ddlitem.content),
        uuid: new Date().getTime() + Number.parseInt(Math.random() * 1000),
        properties: [],
        funNames: []
      })
        .then(res => {
          if (res.data.code === 200) {
            if (type === 'next') {
              this.lastPart = true
            } else {
              this.$message.success('执行成功')
              this.noAdvanced = true
            }
            this.refreshTable()
          } else {
            this.$message.error(res.data.msg)
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    previewDdl (type) {
      this.ddlShow = false
      let fromDBType = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type
      let toDBType = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0].type
      let fromColumnDetail = []
      this.checkColArr.forEach(element => {
        this.colArrList.forEach(item => {
          if (item.name === element) {
            if (item.precision) {
              fromColumnDetail.push({
                'name': item.name,
                'type': item.type,
                'length': item.length,
                'precision': item.precision,
                'scale': item.scale,
                'comment': item.comment
              })
            } else {
              fromColumnDetail.push({
                'name': item.name,
                'type': item.type,
                'length': item.length,
                'comment': item.comment
              })
            }
          }
        })
      })
      fromColumnDetail = this.fn3(fromColumnDetail)
      let obj = {
        'fromModelId': this.dataSourceId,
        'fromschemaName': this.schemaName,
        'fromTableName': this.tableName,
        'fromDBType': fromDBType,
        'fromColumnDetail': fromColumnDetail,
        'toModelId': this.dataSourceId2,
        'toschemaName': this.schemaName2,
        'toDBType': toDBType,
        'createType': 1
      }
      this.$http.post(`${this.$dddUrl}/service/datatype/convert`, obj)
        .then(res => {
          this.$set(this.ddlitem, 'content', res.data.data)
          if (type !== 'next') {
            this.ddlShow = true
          } else {
            this.executeTarget('next')
          }
        })
        .catch(e => {
          console.error(e)
          this.$showFailure(e)
        })
    },
    handleCheckChange (value) {
      let checkedCount = value.length
      this.checkColArrAll = checkedCount === this.colArrList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.colArrList.length
    },
    handleCheckAllChange (val) {
      this.checkColArr = val ? this.colArrOptionsCont : []
      this.isIndeterminate = false
    },
    saveAddColumn () {
      let list = this.colArrList
      let listOption = []
      this.tableDataCol.forEach(element => {
        let columnSize = element.dataType.match(/.*\((.*)\)/) && element.dataType.match(/.*\((.*)\)/)[1] !== '' ? element.dataType.match(/.*\((.*)\)/)[1] : '0'
        let type = element.dataType.match(/.*(?=\()/)
        if (columnSize.toString().indexOf(',') !== -1) {
          element.length = columnSize.split(',')[0]
          element.precision = columnSize.split(',')[0]
          element.scale = columnSize.split(',')[1]
        } else {
          element.length = columnSize === '0' ? null : columnSize
        }
        element.type = element.dataType
        element.id = 'o_' + element.name
        element.comment = element.cnName
        this.$nextTick(() => {
          this.colArrList.push(element)
          this.colArrOptions.push(element.name)
          this.colArrOptionsCont.push(element.name)
        })
      })
      this.$nextTick(() => {
        this.colArrList = this.fn3(this.colArrList)
        this.colArrOptions = this.colArrOptions.filter((item, index, array) => {
          return array.indexOf(item) === index
        })
        this.colArrOptionsCont = this.colArrOptions.filter((item, index, array) => {
          return array.indexOf(item) === index
        })
      })
      this.checkColArrAll = true
      this.handleCheckAllChange(this.checkColArrAll)
      this.closeColumn()
    },
    fn3 (tempArr) {
      let result = []
      let obj = {}
      for (let i = 0; i < tempArr.length; i++) {
        if (!obj[tempArr[i].name]) {
          result.push(tempArr[i])
          obj[tempArr[i].name] = true
        };
      };
      return result
    },
    closeColumn () {
      this.dialogVisibleColumn = false
    },
    checkColIsDuplicate2 (name) {
      let idx = 0
      this.tableDataCol.forEach(v => {
        if (v.deleted) {
          return
        }
        if (v.name === name) {
          idx++
        }
      })
      if (idx > 1) {
        return true
      } else {
        return false
      }
    },
    updateColumnsMapOfIndexEditor (col) {
      setTimeout(() => {
        if (col.elementId) {
          this.$refs.indexEditor.columnsMap.get(col.elementId).Name = col.name
        }
      })
    },
    advancedClick () {
      this.advanced = true
      this.checkColArrAll = true
      this.noAdvanced = false
      this.seniorBtn = true
      this.nextStepType = 'senior'
      this.handleCheckAllChange(this.checkColArrAll)
    },
    onFocus (index) {
      this.dataTypeSearchMode = false
      this.dataTypeCurrentIndex = index
    },
    onSelect (val) {
      let value = val.value
      let index = value.indexOf('(')
      if (index > 0) {
        let dom = $($(this.$refs.tableDetailList.$el).find('tr')[this.dataTypeCurrentIndex + 1]).find('td.data-type input')
        this.dataTypeFocusPrevent = true
        dom.focus()
        setTimeout(() => {
          this.dataTypeFocusPrevent = false
        }, 500)
        dom.click()
        setTimeout(() => {
          dom[0].selectionStart = dom[0].selectionEnd = index + 1
        })
      }
    },
    onInput () {
      this.dataTypeSearchMode = true
    },
    queryDataType (queryString, cb) {
      let allDataTypes = $const.DataTypes[this.dataSourceType.toLowerCase()]
      if (this.dataTypeFocusPrevent) {
        cb()
        return
      }
      let result = queryString && this.dataTypeSearchMode ? allDataTypes.filter((item) => {
        if (typeof item === 'string') {
          return (item.toLowerCase().indexOf(queryString.toLowerCase()) > -1)
        } else {
          return false
        }
      }) : allDataTypes
      const Folders = []
      if (queryString && this.dataTypeSearchMode) {
        /*  const folderSet = new Set()
        result.forEach(item => {
          let index = allDataTypes.indexOf(item)
          do {
            index--
          } while (typeof allDataTypes[index] === 'string')
          folderSet.add(allDataTypes[index])
        })
        result = _.concat(result, folderSet)  */
        result = _.uniq(result)
      }
      cb(result.map(item => {
        if (typeof item === 'string') {
          return {
            value: item
          }
        } else {
          return {
            value: item.label,
            type: 'folder'
          }
        }
      }))
    },
    onKeyPress (evt) {
      if (evt.code === 'ArrowDown') {
        this.moveToNextLine(evt.target)
      } else if (evt.code === 'ArrowUp') {
        this.moveToNextLine(evt.target, true)
      }
    },
    handleCellMouseEnter (row, column) {
      if (column.property) {
        let property = column.property.split('.')[1]
      }
    },
    addColumnNew () {
      let body = {
        cnName: '',
        name: '',
        dataType: ''
      }
      this.tableDataCol.push(body)
    },
    addColumn () {
      // this.tableDataCol = [{
      //   cnName: '',
      //   name: '',
      //   dataType: ''
      // }]
      this.dialogVisibleColumn = true
      // this.$refs['name-form1'].resetFields()
    },
    // 更新表单
    refreshTable () {
      HTTP.refreshTable({ modelId: this.dataSourceId2, schemaName: this.schemaName2 })
        .then(res => {
          this.getSourceTables2()
        }).catch(e => {
          this.$showFailure(e)
        })
    },
    backStep (type) {
      this.stepType = type
      if (type === '1'){
        this.$emit('backStep',type,this.disabledSecond)
      } else if (type === '2'){
        this.$emit('backStep',type,this.disabledThird)
      }  else if (type === '3'){
        this.$emit('backStep',type,this.disabledFifth)
      } 
    },
    nextStep (type) {
      this.stepNum = type
      if (type === '2') {

        let obj = {
          projectId: this.codeTree.projectId,
          parentId: this.codeTree.currentParentId,
          type: 15,
          name: this.transformName,
          admin: this.$store.state.user.username,
          updater: this.$store.state.user.username,
          branch: this.codeTree.branchName
        }
        if (!this.editState) {
          this.$http.post(`${this.$dddUrl}/service/code/check/repeat`, obj)
          .then(res => {
            this.stepType = '2'
          })
          .catch(err => {
            this.$showFailure(err)
          })
        } else {
          if (this.transformName !== this.detailData.workflowName){
            this.$http.post(`${this.$dddUrl}/service/code/check/repeat`, obj)
            .then(res => {
              this.stepType = '2'
            })
            .catch(err => {
              this.$showFailure(err)
            })
          } else {
            this.stepType = '2'
          }
        }
        this.$emit('changeSetp',type)
      } else if (type === '5') {
        this.filterTableData.forEach(element => {
          element.conditionSql = element.field + element.condition + element.conditionNum
        });
        this.goLastData()
        this.$emit('changeSetp',type)
      } else if (type === '4') {
        this.dtColumns = []
        this.dsColumns = []
        this.fromDBType  = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type
        if (this.allTablesChecked === true ) {
          if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0].type === 'HIVE' && this.targetSpliter === ''){
            this.$showFailure('请填写目标表分隔符')
            return false
          }
          this.goLastData()
        } else {
          this.saveAddColumn()
          this.generateDdlData = []
          let fromDBType = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type
          let toDBType = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0].type
          // 多表
          if (this.tableTypes === 'multiple') {
            this.$set(this.filterDataForm, 'tableData', this.checkedTableDataMultiple)
            for (let key in this.columnsDetailAll) {
              let fromColumnDetail = []
              this.columnsDetailAll[key].forEach(element => {
                fromColumnDetail.push({
                  'name': element.columnName,
                  'type': element.type
                })
              })
              if (this.selectType === 2) {
                if (this.tableDataCol.length > 0) {
                  this.tableDataCol.forEach(element => {
                    if (element.length) {
                      fromColumnDetail.push({
                        'name': element.name,
                        'type': element.dataType,
                        'nullable': true
                      })
                    } else {
                      fromColumnDetail.push({
                        'name': element.name,
                        'type': element.type,
                        'nullable': true
                      })
                    }
                  })
                }
              }
              this.generateDdlData.push({
                'fromModelId': this.dataSourceId,
                'fromschemaName': this.schemaName,
                'fromTableName': key,
                'fromDBType': fromDBType,
                'fromColumnDetail': fromColumnDetail,
                'toTableName': this.prefixValue + key + this.suffixValue,
                'toModelId': this.dataSourceId2,
                'toschemaName': this.schemaName2,
                'toDBType': toDBType,
                'createType': 1
              })
            }
            for (let key in this.columnsDetailAll) {
              this.columnsDetailAll[key].forEach(element => {
                const tempJson = _.cloneDeep(element)
                tempJson.table = this.prefixValue + key + this.suffixValue
                tempJson.name = tempJson.name ? tempJson.name: tempJson.columnName
                this.dtColumns.push(tempJson)

                const tempJson2 = _.cloneDeep(element)
                tempJson2.table = key
                tempJson2.name = tempJson2.name ? tempJson2.name: tempJson2.columnName
                this.dsColumns.push(tempJson2)
              })
            }
          } else { //单表
            this.$set(this.filterDataForm, 'tableData', [{
              name: this.tableName,
              type: 'table',
              children: null
            }])
            let fromColumnDetail = []
            this.colList1.forEach(element => {
              fromColumnDetail.push({
                'name': element.name,
                'type': element.type
              })
            })
            if (this.selectType === 2) {
              if (this.tableDataCol.length > 0) {
                this.tableDataCol.forEach(element => {
                  if (element.length) {
                    fromColumnDetail.push({
                      'name': element.name,
                      'type': element.dataType,
                      'nullable': true
                    })
                  } else {
                    fromColumnDetail.push({
                      'name': element.name,
                      'type': element.type,
                      'nullable': true
                    })
                  }
                })
              }
            }
            this.generateDdlData.push({
              'fromModelId': this.dataSourceId,
              'fromschemaName': this.schemaName,
              'fromTableName': this.tableName,
              'fromDBType': fromDBType,
              'fromColumnDetail': fromColumnDetail,
              'toTableName': this.prefixValue + this.tableName + this.suffixValue,
              'toModelId': this.dataSourceId2,
              'toschemaName':  this.schemaName2,
              'toDBType': toDBType,
              'createType': 1
            })
            if (this.selectType === 2) {
              this.colList1.forEach(element => {
                const tempJson = _.cloneDeep(element)
                tempJson.table = this.prefixValue + this.tableName + this.suffixValue
                tempJson.name = tempJson.name
                this.dtColumns.push(tempJson)

                const tempJson2 = _.cloneDeep(element)
                tempJson2.table = this.tableName
                tempJson2.name = tempJson.name
                this.dsColumns.push(tempJson2)
              })
            } else {
              this.colList2.forEach(element => {
                const tempJson = _.cloneDeep(element)
                tempJson.table = this.prefixValue + this.tableName2 + this.suffixValue
                tempJson.name = tempJson.name
                this.dtColumns.push(tempJson)
              })
              this.colList1.forEach(element => {
                const tempJson2 = _.cloneDeep(element)
                tempJson2.table = this.tableName
                tempJson2.name = tempJson2.name
                this.dsColumns.push(tempJson2)
              })
            }
          }
          if (this.selectType === 2) {
            if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0].type === 'HIVE' && this.targetSpliter === ''){
              this.$showFailure('请填写目标表分隔符')
              return false
            }
            // this.ddlInitAll(type)
            if(this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type === 'HIVE') {
              this.goLastData()
            } else {
              this.stepType = type
            }
          } else {
            if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0].type === 'HIVE' && this.targetSpliter === ''){
              this.$showFailure('请填写目标表分隔符')
              return false
            }
            if(this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type === 'HIVE') {
              this.goLastData()
            } else {
              this.stepType = type
            }
          }
        }
        this.$emit('changeSetp',type)
      } else {
        this.stepType = type
        this.$emit('changeSetp',type)
      }
      if (type === '3') {
        if (this.tableTypes === 'single') {
          // let colName = []
          // this.colArrList.forEach(element => {
          //   colName.push(element.name)
          // })
          // this.conditionalSqlMap = new Map()
          // if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type === 'ORACLE') {
          //   let name = []
          //   colName.forEach((element,i) => {
          //     name.push('^'+element+'^')
          //   });
          //   this.conditionalSqlMap.set(this.tableName, {
          //     sql: `SELECT ${name.join(
          //       ','
          //     )} FROM ${this.schemaName}.${this.tableName}`
          //   })
          // } else if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type === 'SQLSERVER'){
          //   this.conditionalSqlMap.set(this.tableName, {
          //     sql: `SELECT TOP ${this.rowNumber} ${colName.join(
          //       ','
          //     )} FROM ${this.schemaName}.${this.tableName}`
          //   })
          //   console.log(this.conditionalSqlMap,'this.conditionalSqlMap')
          // }  else {
          //   this.conditionalSqlMap.set(this.tableName, {
          //     sql: `SELECT ${colName.join(
          //       ','
          //     )} FROM ${this.schemaName}.${this.tableName}`
          //   })
          // }
        }  else {
          let tableNameArr = []

          this.checkedTableDataMultiple.forEach(element => {
            tableNameArr.push(element.name)
          })
          this.getField(tableNameArr)
        }
        this.$emit('changeSetp',type)
      }
    },
    goLastData () {
      let arrMap = new Map()
      let conditionMap = {}
      this.tableNameMultiple = []
      let dataSourceType = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type

      this.filterTableData.forEach(element => {
        if (dataSourceType === 'ORACLE' || dataSourceType === 'POSTGRESQL' || dataSourceType === 'DB2') {
          element.conditionSql2 = '^'+ element.field + '^' +  element.condition + element.conditionNum
        } else if (dataSourceType === 'SQLSERVER'){
          element.conditionSql2 = '['+ element.field + ']' +  element.condition + element.conditionNum
        } else {
          element.conditionSql2 = '`'+ element.field + '`' + element.condition + element.conditionNum
        }
      });
      this.filterTableData.forEach(item => {
        if (arrMap.has(item.tableName)) {
          conditionMap[item.tableName].push(JSON.stringify(item))
          arrMap.get(item.tableName).push(item)
        } else {
          conditionMap[item.tableName] = [JSON.stringify(item)]
          arrMap.set(item.tableName, [item])
        }
      })
      if (this.tableTypes === 'single') {
        let colName = []
        this.colList1.forEach(element => {
          colName.push(element.name)
        })
        this.conditionalSqlMap = new Map()
        if (dataSourceType === 'ORACLE' || dataSourceType === 'POSTGRESQL' || dataSourceType === 'DB2') {
          let name = []
          colName.forEach((element,i) => {
            name.push('^'+element+'^')
          });
          this.conditionalSqlMap.set(this.tableName, {
            sql: `SELECT ${name.join(
              ','
            )} FROM ^${this.schemaName}^.^${this.tableName}^`
          })
        } else if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type === 'SQLSERVER'){
          let name = []
          colName.forEach((element,i) => {
            name.push(`[${element}]`)
          });
          if (this.rowLevelValue === 1) {
            this.conditionalSqlMap.set(this.tableName, {
              sql: `SELECT ${name.join(
                ','
              )} FROM [${this.schemaName}].[${this.tableName}]`
            })
          } else {
            this.conditionalSqlMap.set(this.tableName, {
              sql: `SELECT TOP ${this.rowNumber} ${name.join(
                ','
              )} FROM [${this.schemaName}].[${this.tableName}]`
            })
          }
        } else {
          let name = []
          colName.forEach((element,i) => {
            name.push('`'+element+'`')
          });
          this.conditionalSqlMap.set(this.tableName, {
            sql: `SELECT ${name.join(
              ','
            )} FROM ` + '`' + `${this.schemaName}` + '`' + '.' + '`' + `${this.tableName}` + '`'
          })
        }
      } else {
        for (let key in this.columnsDetailAll) {
          let nameArr = []
          this.columnsDetailAll[key].forEach(element => {
            nameArr.push(element.columnName)
          })
          if (dataSourceType === 'ORACLE' || dataSourceType === 'POSTGRESQL' || dataSourceType === 'DB2') {
            let name = []
            nameArr.forEach((element,i) => {
              name.push('^'+element+'^')
            });
            this.conditionalSqlMap.set(key, {
              sql: `SELECT ${name.join(
                ','
              )} FROM ^${this.schemaName}^.^${key}^`
            })
          } else if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type === 'SQLSERVER'){
            let name = []
            nameArr.forEach((element,i) => {
              name.push(`[${element}]`)
            });
            if (this.rowLevelValue === 1) {
              this.conditionalSqlMap.set(key, {
                sql: `SELECT ${name.join(
                  ','
                )} FROM [${this.schemaName}].[${key}]`
              })
            } else {
              this.conditionalSqlMap.set(key, {
                sql: `SELECT TOP ${this.rowNumber} ${name.join(
                  ','
                )} FROM [${this.schemaName}].[${key}]`
              })
            }
          } else {
            let name = []
            nameArr.forEach((element,i) => {
              name.push('`'+element+'`')
            });
            this.conditionalSqlMap.set(key, {
              sql: `SELECT ${name.join(
                ','
              )} FROM ` + '`' + `${this.schemaName}` + '`' + '.' + '`' + `${key}` + '`'
            })
          }
        }
      }
      let strs = []
      for (let [key, value] of arrMap) {
        let str = ''
        let field = []
        let conditionSql = []
        value.forEach(v => {
          field.push(v.field)
          conditionSql.push(v.conditionSql2)
        })
        let type = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type
        if (this.rowLevelValue === 1) {
            str = {
              key: key,
              value: ` WHERE ${conditionSql.join(' and ')}`
            }
            strs.push(str)
          // }
        } else {
          if (type === 'ORACLE') {
            str = {
              key: key,
              value: ` WHERE ${conditionSql.join(' and ')} AND ROWNUM >0 AND ROWNUM <= ${this.rowNumber}`
            }
            strs.push(str)
          } else if (type === 'SQLSERVER') {
            str = {
              key: key,
              value: ` WHERE ${conditionSql.join(' and ')}`
            }
            strs.push(str)
          } else {
            str = {
              key: key,
              value: ` WHERE ${conditionSql.join(' and ')} LIMIT ${this.rowNumber}`
            }
            strs.push(str)
          }
        }
      }
      let sqlMontage = []
      if (this.filterTableData.length === 0){
        for (let [key, value] of this.conditionalSqlMap) {
          let type = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type
          if (this.rowLevelValue === 2){
            if (type === 'ORACLE') {
              value.valueSql = value.sql + ` WHERE ROWNUM >0 AND ROWNUM <= ${this.rowNumber}`
            } else if (type === 'SQLSERVER') {

            } else {
              value.valueSql = value.sql + ` LIMIT ${this.rowNumber}`
            }
          }
          sqlMontage.push(value.valueSql?value.valueSql:value.sql)
          this.tableNameMultiple.push(key)
        }
      } else {
        for (let [key, value] of this.conditionalSqlMap) {
          strs.forEach(element => {
            if (key === element.key) {
              value.valueSql = value.sql + element.value
            }
          })
          sqlMontage.push(value.valueSql?value.valueSql:value.sql)
          this.tableNameMultiple.push(key)
        }
      }
      let dsDs = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0]
      let dsDs2 = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0]
      this.generateSQL()
      let defaultValues = []
      this.tableDataCol.forEach(element => {
        if (element.name !== '') {
          defaultValues.push({
            'name': element.name,
            'value': element.value,
            'cnName': element.cnName,
            'type': element.dataType || element.type
          })
        }
      })
      let fromDBType = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type
      let toDBType = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0].type
      let data = {
        fromDBType: fromDBType,
        toDBType: toDBType,
        dataSourceId: this.dataSourceId,
        schemaName: this.schemaName,
        dataSourceId2: this.dataSourceId2,
        schemaName2: this.schemaName2,
        dsDs: dsDs,
        dsDs2: dsDs2,
        ddlSql: this.ddlSql,
        conditionalSqlMap: this.conditionalSqlMap,
        clearTargetRecord: this.clearTargetRecord === true ? 1 : 0,
        prefixValue: this.prefixValue,
        suffixValue: this.suffixValue,
        isWholeTable: this.allTablesChecked, // 是否是所有表
        sql: sqlMontage,
        conditionMap: conditionMap,
        dsColumns: [],
        dtColumns: this.dtColumns,
        defaultValues: defaultValues,
        comment: this.transformDescribe,
        name: this.transformName,
        type: this.tableTypes,
        rowLimit: this.rowLevelValue === 1 ? 'all' : this.rowNumber,
        isMultiplex: this.selectType.toString(),
        targetSpliter: this.targetSpliter,
        generateDdlData: this.generateDdlData,
        selectType: this.selectType,
        tableTypes: this.tableTypes,
        isIncrease: this.isIncrease
      }
      if(fromDBType === 'HIVE'){
        data.dsColumns = this.dsColumns
      }
      if (this.tableTypes === 'single') { // 单表
        data.tableName = [this.tableName]
        if (this.selectType === 1) {
          data.tableName2 = [this.tableName2]
        } else {
          data.tableName2 = [this.prefixValue + this.tableName + this.suffixValue]
        }
      } else { // 多表
        if (this.allTablesChecked) { // 所有表
          data.tableName = []
          data.tableName2 = []
        } else {
          data.tableName = this.tableNameMultiple
          if (this.selectType === 1) {
              data.tableName2 = this.tableNameMultiple
          } else {
            let tableNameArr2 = []
            this.tableNameMultiple.forEach(element => {
                tableNameArr2.push(this.prefixValue + element + this.suffixValue)
            })
            data.tableName2 = tableNameArr2
          }
        }
      }
      this.$emit('showLog', data)
    },
    getField (tableNameArr) {
      this.$http.post(`${this.$dddUrl}/datatype/selected/raw-columns-detail?datasourceId=${this.dataSourceId}&schemaName=${this.schemaName}`, tableNameArr).then(res => {

        this.columnsDetailAll = res.data
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    radioChange () {
      if (this.radioValue === 2) {
        this.nextStepType = 'second2'
      } else {
        this.nextStepType = 'first'
      }
    },
    generateSQL () {
      let str = ''
      this.blankList.forEach((v, i) => {
        if (v.sourceName !== '' && v.targetName !== '') {
          if (i > 0) {
            str += ','
          }
          str += `${v.sourceName} as ${v.targetName}`
        }
      })
      this.sql = `select ${str} from ${this.schemaName}.${this.tableName}`
      // this.dialogVisible = true
    },
    generateDml () {
      let str = ''
      this.blankList.forEach((v, i) => {
        if (v.sourceName !== '' && v.targetName !== '') {
          if (i > 0) {
            str += ','
          }
          str += `${v.sourceName} as ${v.targetName}`
        }
      })
      this.dml = `insert into ${this.schemaName2}. ${this.tableName2} (select ${str} from ${this.schemaName}.${this.tableName})`
      this.dialogVisible = true
    },
    copyDml () {
      this.$utils.string.setClipBoard(this.dml)
      this.$message.success('复制成功')
      this.dialogVisible = false
    },
    async getColumns (modelId, schemaName, tableName) {
      return this.$http.get(`${this.$dddUrl}/datatype/${modelId}/${schemaName}/${tableName}/raw-columns-detail`)
    },
    mapName () {
      this.jsPlumb && this.jsPlumb.deleteEveryEndpoint()
      this.jsPlumb && this.jsPlumb.repaintEverything()
      this.colList1.forEach(col1 => {
        this.colList2.forEach(col2 => {
          if (col1.name.toLowerCase() === col2.name.toLowerCase()) {
            this.jsPlumb.connect({
              source: col1.id,
              target: col2.id
            })
          }
        })
      })
      this.getBlankList()
    },
    mapRow () {
      this.jsPlumb && this.jsPlumb.deleteEveryEndpoint()
      this.jsPlumb && this.jsPlumb.repaintEverything()
      this.colList1.forEach((col1, indexcol1) => {
        this.colList2.forEach((col2, indexcol2) => {
          if (indexcol1 === indexcol2) {
            this.jsPlumb.connect({
              source: col1.id,
              target: col2.id
            })
          }
        })
      })
      this.getBlankList()
    },
    mapClickEmpty () {
      this.jsPlumb && this.jsPlumb.deleteEveryEndpoint()
      this.getBlankList()
      this.jsPlumb && this.jsPlumb.repaintEverything()
    },
    getColList (val, edit) {
      this.colList1 = []
      this.jsPlumb && this.jsPlumb.deleteEveryEndpoint()
      this.jsPlumb && this.jsPlumb.repaintEverything()
      this.colArrOptions = []
      this.dataExplorationVisible = false
      this.dataExplorationData = []
      this.getColumns(this.dataSourceId, this.schemaName, this.tableName)
        .then(res => {
          res.data.forEach(element => {
            this.colList1.push({
              type: element.type,
              name: element.name,
              id: 'o_' + element.name,
              columnSize: element.length
            })
            this.colArrList.push({
              type: element.type,
              name: element.name,
              id: 'o_' + element.name,
              columnSize: element.length
            })
          })
          this.colArrList.forEach(element => {
            this.colArrOptions.push(element.name)
            this.colArrOptionsCont.push(element.name)
          })
          if (this.tableName2) {
            this.getColList2('', edit)
          }
        })
    },
    tableName1Clear () {
      this.colList1 = []
    },
    getColList2 (val, edit) {
      this.colList2 = []
      this.jsPlumb && this.jsPlumb.deleteEveryEndpoint()
      this.jsPlumb && this.jsPlumb.repaintEverything()
      this.getColumns(this.dataSourceId2, this.schemaName2, this.tableName2)
        .then(res => {
          res.data.forEach(element => {
            this.colList2.push({
              type: element.type,
              name: element.name,
              id: 't_' + element.name,
              columnSize: element.length
            })
          })
          // if (!edit) {
          //   setTimeout(() => {
          //     this.mapRow()
          //   }, 300)
          // }
        })
    },
    tableName2Clear () {
      this.colList2 = []
    },
    getTables (modelId, schemaName, keyWord) {
      return this.$http.get(`${this.$dddUrl}/datatype/${modelId}/${encodeURIComponent(schemaName)}/raw-tables?pageSize=40&currentPage=1&search=${keyWord}`)
    },
    getSourceTables (edit) {
      this.mapClickEmpty()
      if (!edit) {
        this.tableName = ''
      }
      this.colList1 = []
      this.colArrList = []
      this.tableData = []
      this.tableName = ''
      this.dataExplorationVisible = false
      this.dataExplorationData = []
      // this.initG6()
      if (!this.dataSourceId || !this.schemaName) {
        return
      }
      if (this.tableTypes === 'single') {
        this.getTables(this.dataSourceId, this.schemaName, this.queryTable)
          .then(res => {
            this.tableData = res.data.content
          })
      } else {
        this.currentPageMultiple = 1
        this.tableDataMultiple = []
        this.getTablesMultiple()
      }
    },
    remoteTableData (query) {
      this.queryTable = query
      this.getSourceTables()
    },
    getSourceTables2 (edit) {
      this.mapClickEmpty()
      if (!edit) {
        this.tableName2 = ''
      }
      this.colList2 = []
      this.tableData2 = []
      // this.initG6()
      if (!this.dataSourceId2 || !this.schemaName2) {
        return
      }
      this.getTables(this.dataSourceId2, this.schemaName2, this.queryTable2)
        .then(res => {
          this.tableData2 = res.data.content
        })
    },
    remoteTableData2 (query) {
      this.queryTable2 = query
      this.getSourceTables2()
    },
    getDataSource () {
      this.dataSourceList = []
      this.$http.get(`${this.$dddUrl}/service/datasource/?projectId=${this.codeTree.projectId}`)
        .then(res => {
          res.data.forEach(element => {
            if (element.dsDsId) {
              this.dataSourceList.push(element)
            }
          })
          if(this.editState){
            let dsName = this.dataSourceList.filter(v => v.damDsId === this.detailData.dsDatasourceDto.damDsId)
            let dtName = this.dataSourceList.filter(v => v.damDsId === this.detailData.dtDatasourceDto.damDsId)
            this.dataSourceIdName = dsName.length && dsName[0].damDsName
            this.dataSourceIdName2 = dtName.length && dtName[0].damDsName
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDataSource2 () {
      this.$http.get(`${HTTP.$damServerUrl}models/fromre/`)
        .then(res => {
          let data = res.data
          this.dataSourceList2 = data
        })
        .catch(e => {
          console.error(e)
          this.$showFailure(e)
        })
    },
    getChemaList (val, edit) {
      this.mapClickEmpty()
      this.schemaName = ''
      this.tableName = ''
      this.colList1 = []
      // this.initG6()
      if (!this.dataSourceId) {
        return
      }
      this.$http.get(`${this.$dddUrl}/datatype/${this.dataSourceId}/raw-schemas?search=`).then(res => {
        this.schemaList = res.data
        if (!edit) {
          this.schemaName = ''
        }
        this.tableData = []
      }).catch(err => {
        this.$showFailure(err)
      })
      // if (this.dataSourceList && this.dataSourceId) {
      //   this.dataSourceType = this.dataSourceList.filter(item => item.damDsId === this.dataSourceId)[0].type
      // }
      this.dataSourceList.forEach(element => {
        if (element.damDsId === this.dataSourceId) {
          this.dataSourceType = element.type
        }
      })
      this.dataSourceId && this.$bus.$emit('dataSourceIdChange', this.dataSourceId)
    },
    getChemaList2 (val, edit) {
      this.mapClickEmpty()
      this.schemaName2 = ''
      this.tableName2 = ''
      this.colList2 = []
      // this.initG6()
      if (!this.dataSourceId2) {
        return
      }
      this.$http.get(`${this.$dddUrl}/datatype/${this.dataSourceId2}/raw-schemas?search=`).then(res => {
        this.schemaList2 = res.data
        if (!edit) {
          this.schemaName2 = ''
        }
        this.tableData2 = []
        this.$nextTick(() => {
          if (this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2).length && this.dataSourceList.filter(item => item.damDsId === this.dataSourceId2)[0].type === 'HIVE'){
            this.targetSpliterShow = true
          } else {
            this.targetSpliterShow = false
          }
        })
      }).catch(err => {
        this.$showFailure(err)
      })

      this.dataSourceId && this.$bus.$emit('dataSourceIdChange', this.dataSourceId)
    }
  },
  watch: {
    radioValue (value) {
      if (value === 1) {
      }
    },
    colList2 () {
      // this.$nextTick(() => {
      //   this.showPlumb()
      // })
    },
    migrationObj: {
      handler: function (val, val2) {
        if (JSON.stringify(val) === '{}'){
          this.editState = false
        }
        if (JSON.stringify(val) === JSON.stringify(val2)) return
        this.detailData = val instanceof Array ? val[0] : val
        if (this.detailData && JSON.stringify(this.detailData) !== '{}') {
          this.editState = true
          this.getDetailEdit()
        } else {
          this.editState = false
        }
      },
      deep: true,
      immediate: true
    },
    detailData (val, newV) {
      this.lastPart = false
      this.mapClickEmpty()
      if (val !== newV) {
        this.lastPart = true
      }
    },
    disabledThird(val){
      console.log(val,'val')
      if (val === true) {
        this.$emit('getThirdButton',val)
      }
    },
    disabledFifth(val){
      if (val === true) {
        this.$emit('getFifthButton',val)
      }
    },
    disabledSecond(val){
      if (val === true) {
        this.$emit('getSecondButton',val)
      }
    },
    transformName(val){
      if (val === '') {
        this.$emit('getFirstButton',true)
      }
    },
  }
}
