import LineageGraph from '../class/LineageGraph'
import LineageView from '../view/lineageView.vue'
import miniView from '../view/miniView.vue'
import unfold from '../view/unfold.vue'
import GraphType from '../types/GraphType'
import Version from '../class/Version'
import Drag from '../class/Drag'
import { cloneDeep } from 'lodash'
import DetailDrawer from '@/components/lineage/view/detailDrawer'


export default {
  name: 'lineage',
  props: {
    // data,
    rawData: {
      type: Object,
      default: () => {
        return {}
      },
    },
    options: {
      type: Object,
      default: () => {
        return {
          showColumn: true,
          showMiddleProcess: false,
        }
      },

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
      pageColor: '#FFF',
      param: {
        $This: this,
        showModel: false, // schema信息单独列出
        showColumn: true,
        showMiddleProcess: false,
        inputTableColor: '',
        developerMode: false,
        groupBySchema: false,
        groupByCategory: false,
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
    $(document).on('keydown', this.dev)
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

    checkedSources(modelId) {
      this.select = false
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
          this.param.showColumn = true
          this.param.showMiddleProcess = false
          this.paintGraph()
        } else {
        }
      },
    },
  },
  methods: {
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
    replaceNullSchema() {
      try {
        Object.values(this.rawData.steps).forEach(item => {
          if (!item.schema) {
            item.schema = '@@'
          }
        })
      } catch (e) {}
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
      lines && lines.length && lines.forEach(item => {
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
      lines && lines.length && lines.forEach(line => {
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
      this.$nextTick(() => {

      })
      this.$refs.view.clearRecords()
      this.graphType = lineageGraph.getGraphType()
    },
    redraw() {
      this.drawGraph = null
      setTimeout(() => {
        this.paintGraph()
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
