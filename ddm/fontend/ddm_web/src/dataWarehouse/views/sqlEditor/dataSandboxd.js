import G6 from '@antv/g6'
import databaseType from '@/components/common/DatabaseType.vue'
import HTTP from '@/dataWarehouse/resource/http'
import $const from '@/resource/const'
import editor from './editor.vue'
import { Base64 } from 'js-base64'
import { forEach } from 'lodash'
import dataSandboxdView from './dataSandboxdView.vue'
import monaco from './monaco.vue'

export default {
  mounted () {
    this.getDataSource()
    this.getTreeData()
    this.getMetricsTree()
    this.getFileTreeData()
    this.getMappingList()
    this.getTreeDataList()
  },
  components: {
    databaseType,
    editor,
    dataSandboxdView,
    monaco
  },
  props: {
    // fileData: {
    //   type: [Array, Object],
    //   default: () => {}
    // },
    // modelsList: {
    //   type: [Array, Object],
    //   default: () => {}
    // }
    modelTreeData: {
      type: Array,
      default: () => []
    },
    sandboxdData: {
      type: Object,
      default: () => {}
    },
    item: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      modelId: '',
      modelList: [],
      edit: false,
      keyValue: '',
      tableDataList: [],
      step: '1',
      ddlitem: {
        content: ''
      },
      dataSourceList: [],
      schemaList: [],
      dataSourceId: null,
      schema: null,
      dataPreviewList: [],
      dataPreviewView: false,
      sandboxdForm: {
        analysisName: '',
        analysisDirectory: '',
        describe: '',
        sqlfileName: '',
        fileDirectory: '',
        modelStorage: '',
        entityName: ''
      },
      analysisDirectoryLIst: [],
      fileList: [],
      modelStorageList: [],
      rules: {
        analysisName: [{
          required: true,
          trigger: 'blur',
          message: '分析名称为必填'
        }],
        analysisDirectory: [{
          required: true,
          trigger: 'change',
          message: '请选择目录'
        }],
        modelStorage: [{
          required: true,
          trigger: 'change',
          message: '请选择模型存储'
        }],
        entityName: [{
          required: true,
          trigger: 'blur',
          message: '实体名称为必填'
        }],
        sqlfileName: [{
          required: true,
          trigger: 'blur',
          message: 'SQL文件名称为必填'
        }],
        fileDirectory: [{
          required: true,
          trigger: 'change',
          message: '请选择目录'
        }]
      },
      dataExplorationData: [],
      dataExplorationColumn: [],
      // 指标树
      dialogVisible: false,
      props: {
        label: 'name',
        children: 'nodes',
        isLeaf: (data, node) => {
          if (data.pageWithInfo) {
            return true
          }
          return false
        }
      },
      treeData: [],
      indexId: {},
      tableDataListSql: [],
      modelStorageLabel: '',
      fileDirectoryLabel: '',
      updatetableList: [],
      mappingList: [],
      mapPage: 1,
      mapTotal: 0,
      stepData: [
        {
          label: '数据需求',
          current: true,
          step: 1
        },
        {
          label: '数据预览',
          done: false,
          step: 2,
          disabled: true
        },
        {
          label: '新建分析',
          done: false,
          step: 3,
          disabled: true
        }
      ],
      currentStep: 1,
      filterText: ''
    }
  },
  computed: {
    requiredFilterTable () {
      const columnsNotEmpty = this.tableDataList.every(item => {
        return !!_.trim(item.name) && !!_.trim(item.colName) && !!_.trim(item.type)
      })
      return columnsNotEmpty
    },
    disabledFirst () {
      if (this.tableDataList.length > 0) {
        return !this.requiredFilterTable
      } else {
        return true
      }
    },
    addSandboxdDisabled () {
      if (this.sandboxdForm.analysisName === '' || this.sandboxdForm.analysisDirectory === '' ||
        this.sandboxdForm.sqlfileName === '' ||
        this.sandboxdForm.fileDirectory === '' ||
         this.sandboxdForm.modelStorage === '' ||
         this.sandboxdForm.entityName === '') {
        return true
      } else {
        return false
      }
    },
    monacoOpts () {
      return {
        value: this.ddlitem.content,
        origin: '',
        readOnly: false,
        theme: 'vs-dark'
      }
    }
  },
  methods: {
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    clickDeal (currentObj, treeStatus, halfCheckedNodes, halfCheckedKeys) {
      console.log(currentObj, treeStatus, halfCheckedNodes, halfCheckedKeys)
      treeStatus.checkedNodes.forEach(element => {
        if (element.indexN) {
          if (element.elementId === currentObj.elementId) {
            this.indexId = currentObj
            this.addNewFile()
          }
        }
      })
    },
    changeStepTop (row) {
      if (this.currentStep === 5) {
        this.show = false
      }
      if (this.currentStep === row.step) return
      if (row.step < this.currentStep) {
        this.currentStep = row.step
        this.backStep(row.step.toString())
      } else {
        if (!row.done) return
        this.currentStep = row.step
        this.nextStep(row.step.toString())
      }
    },
    fun (ary) {
      ary.forEach(item => {
        if (item.type !== 0) {
          this.modelList.push(item)
        }
        if (item.childList && item.childList.length) {
          this.fun(item.childList)
        }
      })
      this.modelId = this.modelList[0]?.id
    },
    reestablish () {
      this.edit = true
      this.getTreeDataList()
    },
    getMetricsTree () {
      this.$http.get(`${this.$dddUrl}/service/metrics/build/getMetricsTree/${this.$route.query.projectId}/Dir`).then(res => {
        this.analysisDirectoryLIst = res.data.data
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getFileTreeData () {
      let branch = this.branchName || 'master'
      this.treeLoading = true
      HTTP.changeDataTree({ id: this.$route.query.projectId, branch }).then(res => {
        this.findData2([res], 'file')
        this.handleTreeList([res])
        this.fileList = [res]
        this.filterList(this.fileList)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    filterList (ary) {
      if (ary) {
        for (let i = 0; i < ary.length; i++) {
          if (ary[i].type !== 0) {
            ary.splice(i, 1)
            i--
          }
        }
        ary.forEach(item => {
          if (item.childList && item.childList.length) {
            this.filterList(item.childList)
          }
          if (!item.childList || !item.childList.length) {
            item.childList = null
          }
        })
      }
    },
    getTreeData () {
      this.$http.get(`${this.$dddUrl}/service/model/tree/${this.$route.query.projectId}`).then(res => {
        this.findData1([res.data])
        this.modelStorageList = [res.data]
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    findData1 (treeData, type) {
      treeData.forEach(item => {
        if (item.type === 0) {
          item.disabled = true
        }
        if (item.childList && item.childList.length) {
          this.findData1(item.childList)
        }
      })
    },
    findData2 (treeData, type) {
      treeData.forEach(item => {
        if (item.type !== 0) {
          item.disabled = true
        }
        if (item.childList && item.childList.length) {
          this.findData2(item.childList)
        }
      })
    },
    handleTreeList (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].childList && list[i].childList.length < 1) {
          list[i].childList = undefined
        } else {
          this.handleTreeList(list[i].childList)
        }
      }
      return list
    },
    getDataSource () {
      this.dataSourceList = []
      this.$http.get(`${this.$dddUrl}/service/datasource/?projectId=${this.$route.query.projectId}`)
        .then(res => {
          res.data.forEach(element => {
            if (element.dsDsId) {
              this.dataSourceList.push(element)
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSql () {
      this.$http.post(`${this.$dddUrl}/service/metrics/build/getSql`, this.tableDataListSql).then(res => {
        this.$set(this.ddlitem, 'content', res.data.data)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    // 上一步
    backStep (type) {
      this.currentStep = Number(type)
      this.step = type
      if (type === '1') {
        this.stepData[0].done = true
        this.stepData[1].disabled = this.stepData[1].done !== true
        this.stepData[1].current = false
      } else if (type === '2') {
        this.stepData[2].disabled = this.stepData[2].done !== true
        this.stepData[2].current = false
      }
    },
    // 下一步
    nextStep (type) {
      if (type === '3') {
        this.stepData[1].done = true
        this.stepData[1].current = false
        this.stepData[2].current = this.stepData[2].done !== true
        this.stepData[2].disabled = false
        this.step = type
        this.currentStep = Number(type)
      }
      if (type === '2') {
        let ary = this.tableDataList.filter(item => !item.name || !item.colName || !item.type)
        if (ary.length) {
          this.$datablauMessage.warning('字段中文名，字段名，字段类型为必填项')
          return
        }
        this.duplicate(type)
        // this.getSql()
      }
    },
    duplicate (type) {
      this.tableDataListSql = this.tableDataList
      this.$http.post(`${this.$dddUrl}/service/metrics/build/duplicate`, this.tableDataListSql)
        .then(res => {
          this.step = type
          this.currentStep = Number(type)
          this.getSql()
          this.stepData[0].done = true
          this.stepData[0].current = false
          this.stepData[1].current = this.stepData[1].done !== true
          this.stepData[1].disabled = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    lazyloading () {
      if (this.mappingList.length && this.mappingList.length >= this.mapTotal) return
      this.mapPage += 1
      this.getMappingList()
    },
    getMappingList () {
      this.$http.get(`${this.$dddUrl}/service/dwmapping?currentPage=${this.mapPage}&pageSize=20`)
        .then(res => {
          if (this.mapPage === 1) {
            this.mappingList = res.data.content
          } else {
            this.mappingList.push(...res.data.content)
          }
          this.mapTotal = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    queryKeyValue () {
      // this.tableDataListSql = []
      this.tableDataList = this.tableDataList.filter(item => item.accessLogic === 'EXPRESSION' || item.addRow)
      this.$http.get(`${this.$dddUrl}/service/nlq/sentence?sentence=${encodeURIComponent(this.keyValue)}`).then(res => {
        let keywords = res.data
        /* this.$http.get(`${this.$dddUrl}/service/model/modelIds?projectId=${this.$route.query.projectId}`).then(res => { */
        let data
        if (!this.modelId) {
          data = this.modelList.map(item => {
            return {
              modelId: item.modelId,
              modelVersion: item.endVersion.name === 'Latest Version' ? null : item.endVersion.version
            }
          })
        } else {
          data = this.modelList.filter(item => item.id === this.modelId).map(item => {
            return {
              modelId: item.modelId,
              modelVersion: item.endVersion.name === 'Latest Version' ? null : item.endVersion.version
            }
          })
        }
        let obj = {
          autoModelWraps: data,
          keywords: keywords
        }
        this.$http.post(`${this.$ddmUrl}/service/models/columns`, obj).then(res => {
          res.data.forEach(element => {
            let formula = element.schemaName ? `${element.schemaName}.${element.entityEnName}.${element.properties['90000003']}` : `${element.entityEnName}.${element.properties['90000003']}`
            this.tableDataList.push({
              name: element.properties['80100005'],
              type: element.properties['80000002'],
              accessLogic: 'DCOPY',
              sourceData: element.modelName + '.' + element.entityChName,
              formula: formula,
              colName: element.properties['90000003'],
              tabName: element.entityEnName,
              schemaName: element.schemaName,
              editor: false,
              fieldSsource: '模型'
            })
          })
          this.tableDataListSql = this.tableDataList
        }).catch(err => {
          this.$showFailure(err)
        })
        /* }).catch(err => {
          this.$showFailure(err)
        }) */
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    modelStorageListChage () {
      const checkedNodes = this.$refs.modelStorageList.$refs.dataCascader.getCheckedNodes()
      this.modelStorageLabel = checkedNodes[0].pathLabels.join('/')
    },
    fileDirectoryChange () {
      const checkedNodes = this.$refs.fileDirectory.$refs.dataCascader.getCheckedNodes()
      this.fileDirectoryLabel = checkedNodes[0].pathLabels.join('/')
    },
    // 创建
    addSandboxd (edit) {
      this.$refs.sandboxdForm.validate(valid => {
        if (valid) {
          let obj = {
            'metric': {
              'type': 1,
              'parentId': this.sandboxdForm.analysisDirectory[this.sandboxdForm.analysisDirectory.length - 1],
              'projectId': this.$route.query.projectId,
              'content': JSON.stringify(this.tableDataList),
              'sql': this.monacoOpts.value,
              'name': this.sandboxdForm.analysisName,
              'comments': this.sandboxdForm.describe,
              'modelDirId': this.sandboxdForm.analysisDirectory[this.sandboxdForm.analysisDirectory.length - 1],
              'codeDirId': this.sandboxdForm.fileDirectory[this.sandboxdForm.fileDirectory.length - 1],
              'modelId': this.sandboxdForm.modelStorage[this.sandboxdForm.modelStorage.length - 1],
              'entityName': this.sandboxdForm.entityName,
              'entityChName': this.sandboxdForm.entityChName,
              'schemaName': this.schema,
              'codeName': this.fileDirectoryLabel,
              'modelDir': this.modelStorageLabel,
              'sqlName': this.sandboxdForm.sqlfileName + '.sql',
              'sourceId': this.dataSourceId
            },
            'autoModelDto': {
              'codeTreeNodeDto': {
                'name': this.sandboxdForm.sqlfileName + '.sql',
                'parentId': this.sandboxdForm.fileDirectory[this.sandboxdForm.fileDirectory.length - 1],
                'projectId': this.$route.query.projectId,
                'type': 1,
                'admin': this.$store.state.user.username,
                'updater': this.$store.state.user.username,
                'branch': 'master',
                content: this.monacoOpts.value
              },
              'columnDetailDtoList': [
              ],
              'tableName': this.sandboxdForm.entityName,
              'tableCnName': this.sandboxdForm.entityChName,
              'modelId': this.sandboxdForm.modelStorage[this.sandboxdForm.modelStorage.length - 1]
            }
          }
          this.tableDataList.forEach(element => {
            let num = (element.type.indexOf('(') !== -1 && element.type.split('(')) || [0, element.type]
            obj.autoModelDto.columnDetailDtoList.push({
              'type': element.type.substring(0, element.type.indexOf('(')),
              'columnName': element.name,
              'columnSize': num[1].indexOf(')') !== -1 ? num[1].substr(0, num[1].length - 1) : num[1],
              columnCnName: element.name
            })
          })
          if (edit) {
            obj.metric.id = this.sandboxdData.id
            obj.metric.parentId = this.sandboxdData.parentId
            obj.metric.createTime = this.sandboxdData.createTime
            obj.metric.updateTime = new Date().getTime()
            obj.metric.sort = this.sandboxdData.sort
            obj.metric.content = this.updatetableList
            this.$http.put(`${this.$dddUrl}/service/metrics/build/metrics`, obj)
              .then(res => {
                this.$datablauMessage.success('重建成功')
                this.$emit('updateTree', this.item.id)
                this.closeCreate()
                this.edit = false
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            this.$http.post(`${this.$dddUrl}/service/metrics/build/metrics`, obj)
              .then(res => {
                this.$datablauMessage.success('新建分析成功')
                this.$emit('updateTree', this.item.id)
                this.edit = false
                this.closeCreate()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    editRow () {

    },
    deleteRow (row, index) {
      this.tableDataList.splice(index, 1)
      // this.tableDataListSql.splice(index, 1)
    },
    addRow () {
      let obj = {
        name: '',
        type: '',
        accessLogic: '',
        sourceData: '',
        formula: '',
        colName: '',
        tabName: '',
        editor: true,
        addRow: true,
        fieldSsource: '自定义'
      }
      this.tableDataList.push(obj)
      // this.tableDataListSql.push(obj)
    },
    closeCreate () {
      /* let data = {}
      if (Object.keys(this.sandboxdData).length) {
        data = this.sandboxdData
      } else {
        data = this.item
      }
      this.$emit('closeCreate', data) */
      this.keyValue = ''
      this.tableDataListSql = []
      this.tableDataList = []
      this.modelId = this.modelList[0]?.id
      console.log(this.$refs.tree, '000')
      this.$refs.tree.setCheckedKeys([])
      this.getTreeDataList()
    },
    getChemaList () {
      if (!this.dataSourceId) return
      this.schema = ''
      this.$http.get(`${this.$dddUrl}/datatype/${this.dataSourceId}/raw-schemas?search=`).then(res => {
        this.schemaList = res.data
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    // 数据预览
    dataPreviewClick () {
      let editor = this.$refs['sandboxdEditor'].monacoEditor
      let content = editor.getValue()
      this.dataPreviewView = true
      this.dataExplorationColumn = []
      this.dataExplorationData = []
      let sql = content
      let url = `${HTTP.$dddServerUrl}sqls/runSql`
      this.$http.post(url, {
        // timeout: 30000,
        datasourceId: this.dataSourceId,
        timeout: 1800,
        maxLine: 10,
        sql: Base64.encode(sql),
        uuid: new Date().getTime() + Number.parseInt(Math.random() * 1000),
        properties: [],
        funNames: [],
        schemaName: this.schema
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
    // 指标树
    getIndex () {
      this.getTreeDataList()
    //   this.dialogVisible = true
    },
    addTable () {
      // this.tableDataList.push({
      //   name: '',
      //   type: '',
      //   accessLogic: '',
      //   sourceData: '',
      //   formula: ''
      // })
    },
    addNewFile () {
      this.tableDataListSql = []
      if (!this.indexId.tableId) {
        if (this.indexId.dataScale) {
          this.tableDataList.push({
            name: this.indexId.alias,
            colName: this.indexId.columnName,
            type: this.indexId.dataType + '(' + this.indexId.dataScale + ')',
            accessLogic: 'EXPRESSION',
            sourceData: this.indexId.origin,
            formula: this.indexId.calcLogic,
            editor: false,
            fieldSsource: '指标'
          })
        } else {
          this.tableDataList.push({
            name: this.indexId.alias,
            colName: this.indexId.columnName,
            type: this.indexId.dataType,
            accessLogic: 'EXPRESSION',
            sourceData: this.indexId.origin,
            formula: this.indexId.calcLogic,
            editor: false,
            fieldSsource: '指标'
          })
        }
        this.tableDataListSql.push({
          name: this.indexId.alias,
          colName: this.indexId.columnName,
          tabName: '',
          schemaName: '',
          fieldSsource: '指标'
          // source: ''
        })
        return
      }
      this.$http.get(HTTP.$damServerUrl + `entities/${this.indexId.tableId}/summary`)
        .then(res => {
          Object.assign(this.indexId, { origin: res.data.modelName + '.' + res.data.schemaName + '.' + res.data.physicalName })
          this.tableDataList.push({
            name: this.indexId.alias,
            colName: this.indexId.columnName,
            type: this.indexId.dataType,
            accessLogic: 'EXPRESSION',
            sourceData: this.indexId.origin,
            formula: this.indexId.calcLogic,
            tabName: res.data.physicalName,
            schemaName: res.data.schemaName,
            editor: false,
            fieldSsource: '指标'
          })
          this.tableDataListSql.push({
            name: this.indexId.alias,
            colName: this.indexId.columnName,
            tabName: res.data.physicalName,
            schemaName: res.data.schemaName,
            fieldSsource: '指标'
            // source: ''
          })
          this.dialogVisible = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    cancelLog () {
      this.dialogVisible = false
    },
    setData (data, type) {
      data.forEach((v, index) => {
        //  判断对象中是否有children
        if (v.nodes && v.nodes.length > 0) {
          v.domainType = type
          // 对children项递归
          this.setData(v.nodes, type)
        } else {
          v.domainType = type
          //  没有children直接赋值
        }
      })
      return data
    },
    getTreeDataList () {
      this.$http.post(HTTP.$domains + 'domains/tree/getTree', {
        categoryId: 5, // 原子和衍生指标
        onlyFolder: true,
        state: ''
      })
        .then(res => {
          if (res.data.nodes) {
            res.data.nodes.forEach(element => {
              console.log(element, 'element')
              element.disabled = true
            })
            this.treeData = this.setData(res.data.nodes, 5)
            this.$http.post(HTTP.$domains + 'domains/tree/getTree', {
              categoryId: 6, // 原子和衍生指标
              onlyFolder: true,
              state: ''
            })
              .then(res1 => {
                if (res1.data.nodes) {
                  res1.data.nodes && res1.data.nodes.forEach(element => {
                    element.disabled = true
                    this.treeData.push(element)
                  })
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    async loadNode (node, resolve) {
      let data = node.data
      let obj = this.findData(this.treeData, data.foldId)
      let res = await this.getContent(data.foldId, data.domainType)
      let contentData = []
      if (res && res.data) {
        contentData = res.data.map(item => {
          return {
            ...item,
            pageWithInfo: true,
            name: item.alias,
            indexN: true
          }
        })
      }
      if (obj && Object.keys(obj).length) {
        resolve([...obj, ...contentData])
      } else {
        resolve(contentData)
      }
      console.log(this.treeData, contentData, 'this.treeData')
    },
    getContent (folderId, domainType) {
      return folderId && this.$http.post(HTTP.$domains + 'metricManagement/domain/getPageWithInfo', {
        categoryId: domainType ? 5 : 6, // 原子和衍生指标
        ascOrder: [false],
        // currentPage: 1,
        domainState: null,
        firstPublishEnd: null,
        firstPublishStart: null,
        folderId,
        keyword: '',
        metricsType: null,
        orderColumn: ['domainCode'],
        // pageSize: 20,
        submitter: ''
      })
    },
    findData (treeData, id) {
      let obj = {}
      treeData.forEach(item => {
        if (item.foldId === id) {
          obj = item.nodes
        }
        if (item.nodes && item.nodes.length) {
          this.findData(item.nodes, id)
        }
      })
      return obj
    },
    dataIconFunction (data) {
      if (data.pageWithInfo) {
        return 'iconfont icon-zhibiao'
      } else {
        return 'iconfont icon-file'
      }
    },
    handleNodeClick (data) {
      if (data.pageWithInfo) {
        this.indexId = data
      } else {
        this.indexId = {}
      }
    }

  },
  watch: {
    disabledFirst (val) {
      if (val === true) {
        this.stepData[0].done = false
        this.stepData[0].current = true
        this.stepData[1].disabled = val
        this.stepData[1].done = false
        this.stepData[1].current = false
        this.stepData[2].disabled = val
        this.stepData[2].done = false
        this.stepData[2].current = false
      }
    },
    filterText (val) {
      this.$refs.tree.filter(val)
    },
    modelTreeData: {
      handler: function (val) {
        this.modelList = []

        this.fun(this.modelTreeData)
      },
      deep: true,
      immediate: true
    },
    sandboxdData: {
      handler: function (val, val2) {
        if (!Object.keys(val).length) return
        this.$nextTick(() => {
          this.updatetableList = val.content
          JSON.parse(val.content).forEach(element => {
            this.tableDataListSql.push({
              name: element.name,
              colName: element.colName,
              tabName: element.tabName,
              schemaName: element.schemaName
            })
          })
          this.tableDataList = JSON.parse(val.content)
          this.ddlitem.content = val.sql
          this.dataSourceId = val.sourceId
          this.dataSourceId && this.getChemaList()
          this.schema = val.schemaName
          this.sandboxdForm.analysisName = val.name
          this.sandboxdForm.analysisDirectory = val.parentId
          this.sandboxdForm.describe = val.comments
        })
      },
      deep: true,
      immediate: true
    }
  }
}
