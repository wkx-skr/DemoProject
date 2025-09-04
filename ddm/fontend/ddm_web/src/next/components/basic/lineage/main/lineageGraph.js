// import sourceSelect from '@/components/dataCatalog/sourceSelectBySystem'
// import ExportPdfService from '@service/ExportPdfService'
// import ExportExcelService from '@service/ExportExcelService'
import LineageGraph from '../class/LineageGraph'
import LineageView from '../view/lineageView.vue'
import miniView from '../view/miniView.vue'
import unfold from '../view/unfold.vue'
import GraphType from '../types/GraphType'
// import MetaSelector from '@/components/common/metaSelector.vue'
import Version from '../class/Version'
import Log from '../class/Log'
import Drag from '../class/Drag'
import { cloneDeep } from 'lodash'
import DetailDrawer from '@components/basic/lineage/view/detailDrawer'

export default {
  name: 'datablau-lineage',
  props: {
    // data,
    rawData: {
      type: Object,
      default: {},
    },
    options: {
      type: Object,
      default: {
        showColumn: true,
        showMiddleProcess: false,
      },
    },
    theme: {
      type: String,
    },
    consagraphTop: {
      type: Number,
      default: 20
    },
    dataWarehouse: {
      type: Boolean,
      default: false
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: { LineageView, miniView, unfold, DetailDrawer },
  data() {
    return {
      writable: false,
      disableShowColumn: false,
      // rawData: {},
      jsonData: '',
      drawGraph: null,
      pageColor: this.theme === 'black'?'#3C3F41':'#FFF',
      param: {
        $This: this,
        showModel: false, // schema信息单独列出
        showColumn: true,
        showMiddleProcess: false,
        inputTableColor: '',
        developerMode: false,
        groupBySchema: false,
        groupByCategory: false,
        groupByModel: false,
        groupBySchemaByCategory: false,
        verticalAlign: false,
        absorb: 10,
      },
      dialogVisible: false,
      dialogKey: 0,
      dialogRawData: {},
      dialogData: [],
      columns: [],
      loading: true,
      metaDialogVisible: false,
      keyword: '',
      type: 'TABLE',
      metaData: [],
      bindMsg: {
        lineageId: this.$route.query.id,
        stepId: '',
      },
      select: false,
      checkedSources: undefined,
      checkedSourcesDetail: null,
      currentName: '',
      title: '',
      subtitle: '',
      showFullProcess: false,
      exportBaseData: null,
      dragInfo: {
        dragFlag: false,
        mouseX: 0,
        mouseY: 0,
        graphDom: null,
        scrollTop: 0,
        scrollLeft: 0,
      },
      isTable: false,
      graphType: GraphType.TABLE,
      currentPosition: {
        x: 9999,
        y: 9999,
      },
      canUndo: false,
      canRedo: false,
      currentVersion: null,
      versionList: [],
      editMode: false,
    }
  },
  created() {
    document.addEventListener('mouseup', this.graphMouseup)
  },
  mounted() {
    this.subtitle = this.$route.query.name
    this.title = this.$route.query.filename
    this.writable = Boolean(this.$route.query.writable)
    // this.getData()
    // this.initVersionId()
    this.getMetadata()
    $(document).on('keydown', this.dev)
    // this.exportGraph()
    // this.getVersionList()
    this.paintGraph()
  },
  beforeDestroy() {
    $(document).off('keydown')
    document.removeEventListener('mouseup', this.graphMouseup)
  },
  computed: {
    selectBtnText() {
      var model = this.checkedSourcesDetail
      if (model) {
        return model.label
      } else {
        return '筛选数据源'
      }
    },
    supportEdit() {
      return (
        this.editMode &&
        this.$route.query.writable === 'true' &&
        ((!this.currentVersion && this.versionList.length === 1) ||
          (this.currentVersion &&
            this.currentVersion === this.versionList[0].id)) &&
        !this.param.showMiddleProcess &&
        this.param.showColumn &&
        !this.param.groupBySchema &&
        !this.param.groupByCategory &&
        !this.param.groupByModel &&
        !this.param.groupBySchemaByCategory &&
        !this.param.showModel
      )
    },
  },
  watch: {
    // 监听配置项变化
    options: {
      deep: true,
      handler: function (newVal) {
        let customParam = cloneDeep(newVal)
        for (let key in customParam) {
          if (key !== 'showFullProcess') {
            this.$set(this.param, key, customParam[key])
          } else {
            this.showFullProcess = customParam[key]
          }
        }
        this.$nextTick(() => {
          this.paintGraph()
        })
      },
      immediate: true,
    },
    keyword() {
      this.getMetadata()
    },
    checkedSources(modelId) {
      this.select = false
      this.getMetadata()
    },
    showFullProcess() {
      this.paintGraph()
    },
    'param.showMiddleProcess': {
      handler() {
        if (!this.param.showMiddleProcess) {
          if (this.showFullProcess) {
            this.showFullProcess = false
          } else {
            this.paintGraph()
          }
        } else {
          this.paintGraph()
        }
      },
    },
    editMode: {
      handler() {
        if (this.editMode) {
          this.param.groupBySchema = false
          this.param.groupByCategory = false
          this.param.groupByModel = false
          this.param.showColumn = true
          this.param.showMiddleProcess = false
          this.paintGraph()
        } else {
        }
      },
    },
    rawData(val){
      this.paintGraph()
    }
  },
  methods: {
    showDetailTabs(details) {
      this.$emit('show-detail-tabs', details)
    },
    showDetail(args) {
      this.$refs.drawer.showDetails(args)
    },
    removeDetail() {
      this.$refs.drawer.removeDetail()
    },
    changeAbsorb() {
      Drag.changeAbsorb(this.param.absorb)
    },
    clearVersions() {
      Version.clearVersions().then(() => {
        this.getVersionList()
      })
    },
    deleteVersion() {
      Version.deleteVersion().then(() => {
        this.getVersionList()
      })
    },
    getVersionList() {
      Version.getVersionList().then(list => {
        this.versionList = [
          {
            id: 0,
            title: '原始版本',
          },
        ].concat(list)
        this.versionList.reverse()
        this.currentVersion = this.versionList[0].id
        this.handleVersionChange()
      })
    },
    handleVersionChange() {
      Version.currentVersion = this.currentVersion
      // this.paintGraph()
      // this.getData()
      // Log.importantLog('切换到版本' + this.currentVersion)
    },
    updateCanUndo(canUndo) {
      this.canUndo = canUndo
    },
    updateCanRedo(canRedo) {
      this.canRedo = canRedo
    },
    handleUndo() {
      this.$refs.view.undo()
    },
    handleRedo() {
      this.$refs.view.redo()
    },
    handleSave() {
      this.$refs.view.save()
    },
    goToGraph() {
      this.$router.push({
        name: 'lineageGraph',
        query: this.$route.query,
      })
    },
    handleClose() {
      // this.$router.back()
      window.close()
    },
    handleFold(fold) {
      if (fold) {
        $('#graph-outline').css({
          right: '-300px',
        })
        $('body').css({
          'overflow-x': 'hidden',
        })
      } else {
        $('#graph-outline').css({
          right: '38px',
        })
      }
    },
    graphMousedown(e) {
      this.isTable =
        e.target.parentNode.classList.contains('table') ||
        e.target.parentNode.classList.contains('column')
      if (!this.isTable) {
        this.dragInfo.dragFlag = true
        e = e || window.event
        this.dragInfo.mouseX = e.clientX
        this.dragInfo.mouseY = e.clientY
        this.dragInfo.graphDom = $('#consa-graph')
        this.dragInfo.scrollTop = this.dragInfo.graphDom.scrollTop()
        this.dragInfo.scrollLeft = this.dragInfo.graphDom.scrollLeft()
      }
      if (e.target.parentNode.classList.contains('column') && this.dataWarehouse === true) {
        this.$bus.$emit('sqlHighlight', e.toElement.innerText)
      } else {
        this.$bus.$emit('sqlHighlightClear', e.toElement.innerText)
      }
    },
    graphMousemove(e) {
      this.isTable =
        e.target.parentNode.classList.contains('table') ||
        e.target.parentNode.classList.contains('column')
      if (!this.isTable) {
        if (this.dragInfo.dragFlag) {
          e = e || window.event
          let newX = this.dragInfo.mouseX - e.clientX
          let newY = this.dragInfo.mouseY - e.clientY
          const scrollTop = this.dragInfo.scrollTop + newY
          const scrollLeft = this.dragInfo.scrollLeft + newX
          this.dragInfo.graphDom.scrollTop(scrollTop)
          this.dragInfo.graphDom.scrollLeft(scrollLeft)
          this.drawGraph.setMaskMove(scrollLeft, scrollTop)
        }
      }
    },
    graphMouseup(e) {
      this.dragInfo.dragFlag = false
    },
    graphScroll(e) {
      this.drawGraph.setMaskMove(e.target.scrollLeft, e.target.scrollTop)
    },
    callSelectTable() {
      this.$refs.metaSelector.init()
    },
    handleMetaSelect({ table }) {
      const getColumns = (tableId, callback) => {
        let columns = []
        if (tableId) {
          const requestUrl = `${this.$url}/service/entities/${tableId}/columns`
          this.$http
            .get(requestUrl)
            .then(res => {
              columns = res.data
            })
            .catch(e => {
              this.$showFailure(e)
            })
            .then(() => {
              if (callback) {
                callback(columns)
              }
            })
        } else {
          throw new Error('table object id not available')
        }
      }
      getColumns(table.objectId, columns => {
        this.$refs.view.addTable({
          table: table,
          columns: columns,
          position: this.currentPosition,
        })
      })
    },
    handleEvent(evt) {
      if (!this.supportEdit) {
        return false
      }
      evt.preventDefault()
      if (
        ['CANVAS'].includes(evt.target.tagName) ||
        ['l-6dot2'].includes(evt.target.className) ||
        ['consa-graph'].includes(evt.target.id)
      ) {
      } else {
        return false
      }
      const getOffset = () => {
        if (
          ['CANVAS'].includes(evt.target.tagName) ||
          ['l-6dot2'].includes(evt.target.className)
        ) {
          return {
            x: evt.offsetX,
            y: evt.offsetY,
          }
        } else if (['consa-graph'].includes(evt.target.id)) {
          let scale = 1
          try {
            scale = parseFloat($('.l-6dot2')[0].style.transform.slice(6))
          } catch (e) {
            throw new Error('未定位到容器元素，scale获取失败')
          }
          return {
            x: Math.floor(evt.offsetX / scale),
            y: Math.floor(evt.offsetY / scale),
          }
        }
      }

      this.currentPosition = getOffset()
      return true
    },
    onDblClick(evt) {
      return
      const valid = this.handleEvent(evt)
      if (!valid) {
        return
      }
      evt.stopPropagation()
      this.callSelectTable()
    },
    onContextMenu(evt) {
      return
      const valid = this.handleEvent(evt)
      if (!valid) {
        return
      }
      const { clientX: x, clientY: y } = evt
      evt.stopPropagation()
      const options = [
        {
          icon: 'el-icon-plus',
          label: '添加元数据',
          callback: () => {
            this.callSelectTable()
          },
          args: null,
        },
      ]
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
          placement: 'right',
        })
      }
    },
    dev(e) {
      if (e.ctrlKey) {
        // 'Z'
        if (e.keyCode === 90) {
          if (e.shiftKey) {
            this.handleRedo()
          } else {
            this.handleUndo()
          }
          // 'S'
        } else if (e.keyCode === 83) {
          this.handleSave()
          e.preventDefault()
        } else if (e.keyCode === 65) {
          // 'A'
          const Input = $(e.target)
          Input.focus()
          Input.select()
        }
      }
      if (e.keyCode === 46 && e.ctrlKey) {
        this.param.developerMode = !this.param.developerMode
        this.paintGraph()
      }
    },
    initVersionId() {
      if (this.$route.query.id) {
        Version.lineageId = this.$route.query.id
      } else if (this.$route.query.folderId) {
        Version.lineageId = this.$route.query.folderId
      }
    },
    replaceNullSchema() {
      try {
        Object.values(this.rawData.steps).forEach(item => {
          if (!item.schema) {
            item.schema = '@@'
          }
        })
      } catch (e) {}
    },
    getData() {
      const self = this
      self.loading = true
      self.setProgress('加载数据中...')

      // {
      //   console.log('start...')
      //   this.rawData = require('../testData/format.1659593953422.json')
      //   console.log('data loaded')
      //   this.paintGraph()
      //   return
      // }
      let requestUrl = ''
      let requestMethod = 'get'
      if (this.$route.query.id) {
        requestUrl = self.$url + '/service/lineage/' + self.$route.query.id
      } else if (this.$route.query.folderId) {
        requestMethod = 'post'
        requestUrl = `${this.$url}/service/lineage/getLineageOfFolderId?folderId=${this.$route.query.folderId}`
      }

      self.$http[requestMethod](requestUrl)
        .then(res => {
          if (typeof res.data == 'string') {
            self.rawData = JSON.parse(res.data)
          } else {
            self.rawData = res.data
          }
          // this.rawData = require('./test/10624')
          if (!this.rawData) {
            this.$message.warning('未解析到血缘信息', 0)
            this.loading = false
            return
          }
          this.replaceNullSchema()
          self.setProgress('准备绘图...')
          if (!this.writable) {
            this.paintGraph()
            return
          }
          // self.$http
          //   .get(
          //     self.$url +
          //       '/service/lineage/endpoints/lineage?lineageId=' +
          //       self.$route.query.id
          //   )
          //   .then(res => {
          //     self.endpointsBind = res.data
          //
          //   })
          //   .catch(e => {
          //     this.$showFailure(e)
          //   })
          this.paintGraph()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleJson() {
      try {
        this.rawData = JSON.parse(this.jsonData)
        this.paintGraph()
      } catch (e) {
        this.$datablauMessage.error(e)
      }
    },
    setProgress(progress) {
      $('#loading-progress').text(progress)
    },

    prepareIgnoreMiddleProcessData(data) {
      const { steps, lines } = data
      const [finalSteps, finalLines] = [{}, []]
      // find input and output steps.
      const inputOrOutputSteps = new Set()
      for (const stepsKey in steps) {
        if (steps.hasOwnProperty(stepsKey)) {
          const stepsValue = steps[stepsKey]
          if (
            stepsValue.properties.$input_table ||
            stepsValue.properties.$output_table
          ) {
            inputOrOutputSteps.add(stepsKey)
            finalSteps[stepsKey] = stepsValue
          }
        }
      }
      // build lines map.
      const linesMap = new Map()
      lines.forEach(line => {
        const sourceStepId = line.sourceStepId
        if (!linesMap.has(sourceStepId)) {
          linesMap.set(sourceStepId, [])
        }
        linesMap.get(sourceStepId).push(line)
      })
      inputOrOutputSteps.forEach(step => {
        const linesMarked = new Set()
        finalSteps[step] = steps[step]
        const findNext = (prevStep, prev, startStepId, paraStart) => {
          if (linesMap.has(prevStep)) {
            linesMap.get(prevStep).forEach(item => {
              if (!startStepId || prevStep === step) {
                // first step
                startStepId = item.sourceStepId
              } else {
              }
              const start = paraStart || item.source
              if (!prev || prev === item.source) {
                if (inputOrOutputSteps.has(item.targetStepId)) {
                  finalLines.push({
                    source: start,
                    sourceStepId: startStepId,
                    target: item.target,
                    targetStepId: item.targetStepId,
                    $user_custom: item.$user_custom === 'true',
                    lineageFiles: item.lineageFiles
                      ? item.lineageFiles
                      : item.properties.lineageFiles,
                  })
                } else {
                  findNext(item.targetStepId, item.target, startStepId, start)
                }
              }
            })
          }
        }
        findNext(step)
      })
      data.lines = finalLines
      data.steps = finalSteps
    },
    prepareIgnoreParsedSteps(data) {
      const { steps, lines } = data
      const [finalSteps, finalLines] = [{}, []]
      // find input and output steps.
      const inputOrOutputSteps = new Set()
      const parsedSteps = new Set()
      // build source and target step set.
      lines.forEach(item => {
        inputOrOutputSteps.add(item.sourceStepId)
        inputOrOutputSteps.add(item.targetStepId)
      })

      for (const stepsKey in steps) {
        if (steps.hasOwnProperty(stepsKey)) {
          const stepsValue = steps[stepsKey]
          if (!stepsValue.properties.$parsed_step) {
            finalSteps[stepsKey] = stepsValue
          } else {
            parsedSteps.add(stepsKey)
          }
        }
      }
      // build lines map.
      const linesMap = new Map()
      lines.forEach(line => {
        const sourceStepId = line.sourceStepId
        if (!linesMap.has(sourceStepId)) {
          linesMap.set(sourceStepId, [])
        }
        linesMap.get(sourceStepId).push(line)
      })
      inputOrOutputSteps.forEach(step => {
        const linesMarked = new Set()
        const findNext = (prevStep, prev, startStepId, paraStart) => {
          if (linesMap.has(prevStep)) {
            linesMap.get(prevStep).forEach(item => {
              if (!startStepId || prevStep === step) {
                // first step
                startStepId = item.sourceStepId
              } else {
              }
              const start = paraStart || item.source
              if (!prev || prev === item.source) {
                if (!parsedSteps.has(item.targetStepId)) {
                  finalLines.push({
                    source: start,
                    sourceStepId: startStepId,
                    target: item.target,
                    targetStepId: item.targetStepId,
                    $user_custom: item.properties
                      ? item.properties.$user_custom
                      : null,
                    lineageFiles: item.lineageFiles
                      ? item.lineageFiles
                      : item.properties.lineageFiles,
                  })
                } else {
                  findNext(item.targetStepId, item.target, startStepId, start)
                }
              }
            })
          }
        }
        findNext(step)
      })
      data.lines = finalLines
      data.steps = finalSteps
    },
    paintGraph() {
      let data = _.cloneDeep(this.rawData)
      if (this.showFullProcess) {
        this.param.showMiddleProcess = true
      } else {
        this.prepareIgnoreParsedSteps(data)
      }
      if (!this.param.showMiddleProcess) {
        this.prepareIgnoreMiddleProcessData(data)
      }
      this.exportBaseData = data
      const steps = data.steps
      const lines = data.lines
      data.tLines = []
      const tLines = data.tLines
      const tLinesString = []
      lines.forEach(line => {
        if (!line.source && line.source === '0') {
          line.source = null
        }
        if (!line.target && line.target === '0') {
          line.target = null
        }
        const source = line.sourceStepId
        const target = line.targetStepId
        const str = source + target
        if (tLinesString.indexOf(str) === -1) {
          tLinesString.push(str)
          tLines.push({ source: source, target: target })
        }
      })
      this.startDraw(data)
    },
    startDraw(data) {
      this.disableShowColumn = data.properties.$table_lineage === true
      this.loading = false
      const lineageGraph = new LineageGraph({
        data: data,
        container: $('#consa-graph')[0],
        param: this.param,
      })
      this.drawGraph = lineageGraph
      this.$refs.view.clearRecords()
      this.graphType = lineageGraph.getGraphType()
    },
    redraw() {
      this.drawGraph = null
      setTimeout(() => {
        this.paintGraph()
      })
    },
    showTabDetail(data) {
      if (!data) {
        var data = this.dialogRawData
      } else {
        this.dialogRawData = data
      }
      this.dialogData = data.properties
      this.columns = data.columns
      this.getTableBindMessage(this.$route.query.id, data.id)
    },
    getTableBindMessage(lineageId, stepId) {
      this.$http
        .get(
          this.$url +
            '/service/lineage/endpoints/steps?LineageId=' +
            lineageId +
            '&stepId=' +
            stepId
        )
        .then(res => {
          const dialog = this.dialogRawData
          this.dialogRawData.bindMessage = res.data
          if (dialog.bindMessage.length === 0) {
            dialog.bindTableEnable = true
          } else {
            dialog.bindTableEnable = false
            dialog.bindMessage.forEach(item => {
              const columnId = item.lineageTerminalId.split('@@@')[2]
              this.columns.forEach(column => {
                if (column.id == columnId) {
                  column.bindMessage = {
                    columnName: item.columnPhysicalName,
                    columnId: item.columnObjectId,
                  }
                }
              })
            })
          }
          this.dialogKey++
          this.dialogVisible = true
        })
        .catch(e => {
          this.$message.error('出错')
        })
    },
    bind(i) {
      this.bindMsg.stepId = this.dialogRawData.id
      if (!i) {
        // 表
        //        this.keyword = this.dialogRawData.name;
        this.type = 'TABLE'
        var id = this.dialogRawData.id
        this.currentName = this.dialogRawData.name + '的表'
      } else {
        this.type = 'COLUMN'
        //        this.keyword = i.name;
        this.bindMsg.columnId = i.id
        var id = i
        this.currentName = i.name + '的字段'
      }
      this.metaDialogVisible = true
      this.select = false
    },
    unbind() {},
    handleBind(objectId) {
      this.bindMsg.objectId = objectId
      this.$http
        .post(this.$url + '/service/lineage/lineagebind', this.bindMsg)
        .then(res => {
          this.showTabDetail()
          if (res.data.length > 0) {
            var info = ''
            for (var i = 0; i < res.data.length; i++) {
              var mapping = res.data[i]
              info =
                info +
                '\n' +
                mapping.srcModelName +
                '/' +
                mapping.srcTableName +
                '/' +
                mapping.srcColumnName +
                '->' +
                mapping.dstModelName +
                '/' +
                mapping.dstTableName +
                '/' +
                mapping.dstColumnName
            }
            this.$notify.success({
              title: '自动绑定成功',
              message: '绑定了:' + info,
            })
          } else {
            this.$notify.success({
              title: this.$version.common.operationSucceed,
              message: '',
            })
            this.metaDialogVisible = false
          }
        })
        .catch(e => {
          this.$notify.error({
            title: '绑定失败',
            message: e.response.data.errorMessage,
          })
        })
    },
    getMetadata() {
      return
      const self = this
      const reg = /^\w*$/
      let keyword = ''
      if (this.keyword) {
        keyword = this.keyword.replace('_', ' ')
      }
      if (keyword && reg.test(keyword)) keyword = '*' + keyword + '*'

      const that = this
      var queryString = ''

      this.$http
        .post(this.$url + '/service/entities/search' + queryString, {
          pageSize: 1000,
          currentPage: 1,
          keyword: keyword || null,
          types: [this.type],
          modelId: this.checkedSources,
        })
        .then(res => {
          that.metaData = res.data.content
        })
        .catch(err => {
          that.$notify.error({
            title: '错误',
            message: '读取数据列表失败',
          })
        })
    },
    query(id) {
      const type = id.type
      if (type === 'COLUMN') {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl +
            'main/dataCatalog?content=true&keyword=' +
            this.keyword +
            '&type=column&column=' +
            id.objectId,
          '_blank'
        )
      } else {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl +
            'main/dataCatalog?content=true&keyword=' +
            this.keyword +
            '&type=table&table=' +
            id.objectId,
          '_blank'
        )
      }
    },
    exportGraph() {
      return
      function exportPdf() {
        ExportPdfService.export($('#consa-graph svg')[0])
      }
      window.exportPdf = exportPdf
      window.exportExcel = () => {
        const data = this.exportBaseData
        const steps = data.steps
        const lines = data.lines
        const resultContainsColumn = []
        lines.forEach(line => {
          const source = steps[line.sourceStepId]
          const target = steps[line.targetStepId]
          let sourceColumnName = ''
          let targetColumnName = ''
          if (source.columns.filter(i => i.id === line.source)[0]) {
            sourceColumnName = source.columns.filter(
              i => i.id === line.source
            )[0].name
          }
          if (target.columns.filter(i => i.id === line.target)[0]) {
            targetColumnName = target.columns.filter(
              i => i.id === line.target
            )[0].name
          }
          resultContainsColumn.push({
            sourceTableName: source.name,
            sourceSchema: source.schema,
            targetTableName: target.name,
            targetSchema: target.schema,
            sourceColumnName: sourceColumnName,
            targetColumnName: targetColumnName,
          })
        })
        /* original data */
        const filename = `${this.title}.xlsx`
        let rows = [
          ['源schema', '源表', '源字段', '目标schema', '目标表', '目标字段'],
        ]
        resultContainsColumn.forEach(item => {
          rows.push([
            item.sourceSchema,
            item.sourceTableName,
            item.sourceColumnName,
            item.targetSchema,
            item.targetTableName,
            item.targetColumnName,
          ])
        })
        ExportExcelService.export(rows, filename, '字段级血缘')
      }
    },
    handleOuterClick(evt) {
      this.removeDetail()
      this.$refs.view.handleOuterClick(evt)
    },
  },
}
