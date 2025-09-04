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
import Drag from '../class/Drag'
import { cloneDeep } from 'lodash'
import DetailDrawer from '@components/basic/lineage/view/detailDrawer'

export default {
  name: 'lineage',
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
        defaultOpenedLevel: 0,
      },
    },
    objectId: {
      required: true,
      type: [Number, String],
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
      loading: false,
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
      filterStepsSet: new Set(), // 存储要绘制的实体stepId
    }
  },
  created() {
    document.addEventListener('mouseup', this.graphMouseup)
  },
  mounted() {
    this.writable = Boolean(this.$route.query.writable)
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.graphMouseup)
  },
  computed: {
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
      const { steps, lines = [] } = data
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
                    lineageFiles:
                      item.lineageFiles || item?.properties?.lineageFiles,
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
      ;(lines || []).forEach(item => {
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
                    lineageFiles:
                      item.lineageFiles || item?.properties?.lineageFiles,
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
      let data = this.rawData
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
    executeFindParents(currentStepId) {
      const set$prevSteps = currentStepId => {
        rawData.tLines.forEach(item => {
          if (item.source !== currentStepId && item.target === currentStepId) {
            if (!rawData.steps[currentStepId].properties.$prevSteps) {
              rawData.steps[currentStepId].properties.$prevSteps = new Set()
            }
            rawData.steps[currentStepId].properties.$prevSteps.add(item.source)
          }
        })
      }
      const rawData = this.rawData
      if (
        !rawData.steps[currentStepId].properties.hasOwnProperty('$has_prev')
      ) {
      }
      rawData.steps[currentStepId].properties.$has_prev = rawData.tLines.find(
        item => {
          return item.source !== currentStepId && item.target === currentStepId
        }
      )
      if (rawData.steps[currentStepId].properties.$has_prev) {
        set$prevSteps(currentStepId)
        rawData.steps[currentStepId].properties.$is_first = false
      }
      const prevSteps = rawData.steps[currentStepId].properties.$prevSteps
      prevSteps &&
        prevSteps.forEach(currentStepId => {
          this.filterStepsSet.add(currentStepId)
          rawData.steps[currentStepId].properties.$is_first = true
          set$prevSteps(currentStepId)
          rawData.steps[currentStepId].properties.$has_prev =
            rawData.steps[currentStepId].properties.$prevSteps &&
            rawData.steps[currentStepId].properties.$prevSteps.size > 0
        })
      return prevSteps || new Set()
    },
    executeFindChildren(currentStepId) {
      const set$nextSteps = currentStepId => {
        rawData.tLines.forEach(item => {
          if (item.source === currentStepId && item.target !== currentStepId) {
            if (!rawData.steps[currentStepId].properties.$nextSteps) {
              rawData.steps[currentStepId].properties.$nextSteps = new Set()
            }
            rawData.steps[currentStepId].properties.$nextSteps.add(item.target)
          }
        })
      }
      const rawData = this.rawData
      if (
        !rawData.steps[currentStepId].properties.hasOwnProperty('$has_next')
      ) {
      }
      rawData.steps[currentStepId].properties.$has_next = rawData.tLines.find(
        item => {
          return item.source === currentStepId && item.target !== currentStepId
        }
      )
      if (rawData.steps[currentStepId].properties.$has_next) {
        set$nextSteps(currentStepId)
        rawData.steps[currentStepId].properties.$is_last = false
      }
      const nextSteps = rawData.steps[currentStepId].properties.$nextSteps
      nextSteps &&
        nextSteps.forEach(currentStepId => {
          this.filterStepsSet.add(currentStepId)
          rawData.steps[currentStepId].properties.$is_last = true
          set$nextSteps(currentStepId)
          rawData.steps[currentStepId].properties.$has_next =
            rawData.steps[currentStepId].properties.$nextSteps &&
            rawData.steps[currentStepId].properties.$nextSteps.size > 0
        })
      return nextSteps || new Set()
    },
    findParents(shapeData) {
      const currentStepId = shapeData.id
      const rawData = this.rawData
      this.executeFindParents(currentStepId)
      this.startDraw(rawData)
    },
    findChildren(shapeData) {
      const currentStepId = shapeData.id
      const rawData = this.rawData
      this.executeFindChildren(currentStepId)
      this.startDraw(rawData)
    },
    findChildrenAndParents(shapeData) {
      const currentStepId = shapeData.id
      const rawData = this.rawData
      if (
        this.rawData.steps[currentStepId].properties.$has_prev &&
        this.rawData.steps[currentStepId].properties.$is_first
      ) {
        this.executeFindParents(currentStepId)
      }
      if (
        this.rawData.steps[currentStepId].properties.$has_next &&
        this.rawData.steps[currentStepId].properties.$is_last
      ) {
        this.executeFindChildren(currentStepId)
      }

      this.startDraw(rawData)
    },
    initFilterSteps(rawData) {
      if (this.filterStepsSet.size === 0) {
        const currentStepId = Object.keys(rawData.steps).find(stepId => {
          return (
            Boolean(stepId.endsWith(String(this.objectId))) ||
            rawData.steps[stepId].columns.some(
              i => i.id === String(this.objectId)
            )
          )
        })
        const RootStepId = currentStepId
        rawData.steps[currentStepId].properties.$is_current = true
        this.filterStepsSet.add(currentStepId)
        const findLastStep = (currentStepId, restSteps) => {
          console.log('find-last')
          if (restSteps === 0) {
            return
          }
          if (
            RootStepId === currentStepId ||
            (this.rawData.steps[currentStepId].properties.$has_prev &&
              this.rawData.steps[currentStepId].properties.$is_first)
          ) {
            const parents = this.executeFindParents(currentStepId)
            parents.forEach(item => {
              findLastStep(item, restSteps - 1)
            })
          }
        }
        const findNextStep = (currentStepId, restSteps) => {
          console.log('find-next', currentStepId, restSteps, this.rawData)
          if (restSteps === 0) {
            return
          }
          if (
            RootStepId === currentStepId ||
            (this.rawData.steps[currentStepId].properties.$has_next &&
              this.rawData.steps[currentStepId].properties.$is_last)
          ) {
            const children = this.executeFindChildren(currentStepId)
            console.log('children', children)
            children.forEach(item => {
              findNextStep(item, restSteps - 1)
            })
          }
        }
        findLastStep(currentStepId, this.options.defaultOpenedLevel)
        findNextStep(currentStepId, this.options.defaultOpenedLevel)
      }
      const result = {
        lines: rawData.lines,
        tLines: rawData.tLines,
        properties: rawData.properties,
        steps: {},
      }
      this.filterStepsSet.forEach(stepId => {
        result.steps[stepId] = rawData.steps[stepId]
      })
      return result
    },
    startDraw(rawData) {
      const data = this.initFilterSteps(rawData)
      this.disableShowColumn = data.properties.$table_lineage === true
      this.loading = false
      const lineageGraph = new LineageGraph({
        data: data,
        container: $('#consa-graph')[0],
        param: this.param,
      })
      this.drawGraph = lineageGraph
      this.graphType = lineageGraph.getGraphType()
    },
    redraw() {
      this.drawGraph = null
      setTimeout(() => {
        this.paintGraph()
      })
    },
    handleOuterClick(evt) {
      this.removeDetail()
      this.$refs.view.handleOuterClick(evt)
    },
  },
}
