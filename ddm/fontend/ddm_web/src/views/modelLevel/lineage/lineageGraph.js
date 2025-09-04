import DrawGraph from './DrawGraph.js'
import mockData from './mockData.js'
import lineage from '@/next/service/lineage/main/lineage.vue'

export default {
  props: {
    data: {},
    modelId: {
      required: true
    },
    entityId: {
      default: 1
    },
    isModel: {
      type: Boolean,
      default: true
    },
    title: {
      type: String
    },
    subtitle: {
      type: String
    }
  },
  components: {
    lineage
  },
  data () {
    return {
      writable: false,
      disableShowColumn: false,
      rawData: {},
      jsonData: '',
      drawGraph: null,
      pageColor: '#FFF',
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ],
      param: {
        $This: this,
        showModel: false,
        showColumn: false,
        showMiddleProcess: false,
        inputTableColor: '',
        developerMode: false
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
        stepId: ''
      },
      select: false,
      checkedSources: undefined,
      checkedSourcesDetail: null,
      currentName: '',
      // title: '',
      // subtitle: '',
      bindCategory: {
        visible: false
      },
      showFullProcess: false,
      showMiddleProcess: true,
      exportBaseData: null
    }
  },
  mounted () {
    // this.title = this.$route.query.title
    // this.subtitle = this.$route.query.subtitle
    // this.writable = Boolean(this.$route.query.writable)
    // this.getData()
    // this.getMetadata()
    // $(document).on('keydown', this.dev)
    // this.exportGraph()
  },
  beforeDestroy () {
    // $(document).off('keydown')
  },
  computed: {
    // selectBtnText () {
    //   var model = this.checkedSourcesDetail
    //   if (model) {
    //     return model.label
    //   } else {
    //     return '筛选数据源'
    //   }
    // }
  },
  methods: {
    getLineageDataPromise () {
      const self = this
      return new Promise((resolve, reject) => {
        let url = `${self.$url}/service/model/relation/bind/findrelationship?modelid=${this.modelId}&entityid=${this.entityId}&parent=true&child=true&ismodel=${this.isModel}`
        self.$http.get(url)
          .then(res => {
            resolve(res)
            // resolve({ data: mockData.data })
            // resolve({ data: {} })
          })
          .catch(e => {
            reject(e)
          })
      })
    },
    dev (e) {
      if (e.keyCode === 46 && e.ctrlKey) {
        this.param.developerMode = !this.param.developerMode
        this.paintGraph()
      }
    },
    getData () {
      const self = this
      self.loading = true
      self.setProgress('加载数据中...')
      let url = `${self.$url}/service/model/relation/bind/findrelationship?modelid=${this.modelId}&entityid=${this.entityId}&parent=true&child=true&ismodel=${this.isModel}`
      self.$http
        .get(url)
        .then(res => {
          if (typeof res.data === 'string') {
            self.rawData = JSON.parse(res.data)
          } else {
            self.rawData = res.data
          }
          // self.rawData = mockData.data
          self.setProgress('准备绘图...')
          if (!this.writable) {
            this.paintGraph()
            return
          }
          self.$http
            .get(
              self.$url +
              '/service/lineage/endpoints/lineage?lineageId=' +
              self.$route.query.id
            )
            .then(res => {
              self.endpointsBind = res.data
              this.paintGraph()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleJson () {
      this.rawData = JSON.parse(this.jsonData)
      this.paintGraph()
    },
    setProgress (progress) {
      $('#loading-progress').text(progress)
    },

    // @deprecated
    prepareIgnoreMiddleProcessDataOld (data) {
      const newTLines = []
      const newSteps = {}
      const tLinesMap = new Map()
      const tLinesReverseMap = new Map()
      const steps = data.steps
      data.tLines.forEach(item => {
        if (item.source !== item.target) {
          if (!tLinesMap.has(item.source)) {
            tLinesMap.set(item.source, [item.target])
          } else {
            tLinesMap.get(item.source).push(item.target)
          }
          if (!tLinesReverseMap.has(item.target)) {
            tLinesReverseMap.set(item.target, [item.source])
          } else {
            tLinesReverseMap.get(item.target).push(item.source)
          }
        }
      })
      for (const stepName in steps) {
        const step = steps[stepName]
        if (
          !tLinesReverseMap.has(stepName) &&
          (step.properties.$input_table || step.properties.$output_table)
        ) {
          let outputStepName
          const currentStepName = stepName
          const stepMarked = new Set()
          const sendOne = (current, map) => {
            if (map.has(current)) {
              return
            }
            map.add(current)
            const currentStepName = current
            if (tLinesMap.has(currentStepName)) {
              const targets = tLinesMap.get(currentStepName)
              targets.forEach(item => {
                //                 currentStepName = tLinesMap.get(item);
                //                 outputStepName = currentSteipName;
                const outputTable =
                  steps[item].properties.$input_table ||
                  steps[item].properties.$output_table
                if (!tLinesMap.has(item) || outputTable) {
                  newSteps[stepName] = step
                  newSteps[item] = steps[item]
                  newTLines.push({
                    source: stepName,
                    target: item
                  })
                } else {
                  sendOne(item, map)
                }
              })
            }
          }
          sendOne(currentStepName, stepMarked)
        }
      }
      data.tLines = newTLines
      data.steps = newSteps
    },

    prepareIgnoreMiddleProcessData (data) {
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
      // foreach input or output steps
      const toString = self => {
        return (
          self.sourceStepId +
          ':' +
          self.source +
          ';' +
          self.targetStepId +
          ':' +
          self.target
        )
      }
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
              const itemString = toString(item)
              if (!linesMarked.has(itemString)) {
                if (!prev || prev === item.source) {
                  linesMarked.add(itemString)
                  if (inputOrOutputSteps.has(item.targetStepId)) {
                    finalLines.push({
                      source: start,
                      sourceStepId: startStepId,
                      target: item.target,
                      targetStepId: item.targetStepId
                    })
                  } else {
                    findNext(item.targetStepId, item.target, startStepId, start)
                  }
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
    prepareIgnoreParsedSteps (data) {
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
      // foreach input or output steps
      const toString = self => {
        return (
          self.sourceStepId +
          ':' +
          self.source +
          ';' +
          self.targetStepId +
          ':' +
          self.target
        )
      }
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
              const itemString = toString(item)
              if (!linesMarked.has(itemString)) {
                if (!prev || prev === item.source) {
                  linesMarked.add(itemString)
                  if (!parsedSteps.has(item.targetStepId)) {
                    finalLines.push({
                      source: start,
                      sourceStepId: startStepId,
                      target: item.target,
                      targetStepId: item.targetStepId
                    })
                  } else {
                    findNext(item.targetStepId, item.target, startStepId, start)
                  }
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
    paintGraph () {
      const data = _.cloneDeep(this.rawData)
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

      if (this.drawGraph) {
        this.drawGraph.destroy()
      }
      setTimeout(() => {
        this.disableShowColumn = data.properties.$table_lineage === true
        this.drawGraph = null
        this.drawGraph = new DrawGraph(
          $('#consa-graph')[0],
          data,
          this.param,
          $('#graph-outline')[0],
          this.endpointsBind
        )
        this.setProgress('开始绘图...')
        this.drawGraph.start((progress, finished) => {
          this.setProgress(progress)
          if (finished) {
            this.loading = false
          }
        })
      }, 50)
    },
    showTabDetail (data) {
      if (!data) {
        data = this.dialogRawData
      } else {
        this.dialogRawData = data
      }
      this.dialogData = data.properties
      this.columns = data.columns
      this.getTableBindMessage(this.$route.query.id, data.id)
    },
    getTableBindMessage (lineageId, stepId) {
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
                if (column.id + '' === columnId + '') {
                  column.bindMessage = {
                    columnName: item.columnPhysicalName,
                    columnId: item.columnObjectId
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
    bind (i) {
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
        let id = i
        this.currentName = i.name + '的字段'
      }
      this.metaDialogVisible = true
      this.select = false
    },
    unbind () {
    },
    handleBind (objectId) {
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
              message: '绑定了:' + info
            })
          } else {
            this.$notify.success({
              title: this.$version.common.operationSucceed,
              message: ''
            })
            this.metaDialogVisible = false
          }
        })
        .catch(e => {
          this.$notify.error({
            title: '绑定失败',
            message: e.response.data.errorMessage
          })
        })
    },
    getMetadata () {
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
          modelId: this.checkedSources
        })
        .then(res => {
          that.metaData = res.data.content
        })
        .catch(e => {
          that.$notify.error({
            title: '错误',
            message: '读取数据列表失败'
          })
        })
    },
    query (id) {
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
    callBindDialog () {
      this.bindCategory.visible = true
    },
    exportGraph () {
      function exportPdf () {
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
            targetColumnName: targetColumnName
          })
        })
        /* original data */
        const filename = `${this.title}.xlsx`
        let rows = [
          ['源schema', '源表', '源字段', '目标schema', '目标表', '目标字段']
        ]
        resultContainsColumn.forEach(item => {
          rows.push([
            item.sourceSchema,
            item.sourceTableName,
            item.sourceColumnName,
            item.targetSchema,
            item.targetTableName,
            item.targetColumnName
          ])
        })
        ExportExcelService.export(rows, filename, '字段级血缘')
      }
    },
    changeParams (key) {
      let obj = {}
      obj[key] = this[key]
      this.$refs.lineageComponent.changeParams(obj)
    }
  },
  watch: {
    // keyword () {
    //   this.getMetadata()
    // },
    // checkedSources (modelId) {
    //   this.select = false
    //   this.getMetadata()
    // },
    // showFullProcess () {
    //   this.paintGraph()
    // }
  }
}
