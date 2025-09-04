import _ from 'lodash'
const vThis = window.vueThis
if (typeof mxGraph === 'undefined') {
  $(document.body).append(
    '<script src="./static/libs/mxgraph/mxClient.min.js"></script>'
  )
}
const STD = {
  TABLE_WIDTH: 180,
  PADDING_TOP: 10,
  PADDING_LEFT: 10,
  TITLE_HEIGHT: 25,
  MARGIN_VERTICAL: 50,
  MARGIN_ALIGN: 200,
  COL_WIDTH: 160,
  COL_HEIGHT: 20,
}
const highlightCellsSet = new Set()

function myGraph(container) {
  mxGraph.call(this, container)
}
myGraph.prototype = new mxGraph()
myGraph.prototype.constructor = myGraph
myGraph.prototype.expandedImage = ''

class DrawGraph {
  constructor(container, data, param, outlineContainer, lineageData) {
    this.maxHeight = []
    this.container = container
    this.initEventListener()
    this.param = param
    this.data = data
    this.outlineContainer = outlineContainer
    this.lineageData = lineageData
    this.tableOnly = data.properties.$table_lineage
    this.pureLineage = data.properties.$pure_lineage
  }

  start(callback) {
    this.sortColumns()
    this.getTableLines()
    this.graph = this.buildGraph()
    this.initStyles(this.graph)
    if (this.param.showModel) {
      this.drawModelLineage(this.graph, callback)
    } else {
      this.draw(this.graph, callback)
    }
  }

  /**
    Draw the full lineage graph.
    1. draw single model
      1.1 create model cell
      1.2 add step cells into the model cell
      1.3 add lines among step cells
      1.4 do layout
      1.5 remove all lines, and redraw lines among column cells
    2. iterately draw each model
    3. draw lines among models
    4. do layout
    5. remove all lines among models
    6. link up all column cells
  **/
  drawModelLineage(graph, callback) {
    const self = this
    self.prepareModelData()
    const modelCells = {}
    const colCells = {}
    const stepCells = {}
    const steps = self.data.steps
    for (var m in self.stepGroup) {
      const ret = self.drawSingleModel(self.stepGroup[m], graph)
      modelCells[m] = ret.modelCell

      for (const n in ret.colCells) {
        colCells[n] = ret.colCells[n]
      }

      for (const k in ret.stepCells) {
        stepCells[k] = ret.stepCells[k]
      }
    }

    const parent = graph.getDefaultParent()
    const graphModel = graph.getModel()
    self.param.layoutModel = true
    graphModel.beginUpdate()
    try {
      const toBeRemovedLines = []

      for (const ml in self.interModelLines) {
        const line = self.interModelLines[ml]

        const srcModel = modelCells[line.src]
        const dstModel = modelCells[line.dst]

        const tline = graph.insertEdge(parent, null, null, srcModel, dstModel)
        toBeRemovedLines.push(tline)
      }

      const layout = new mxHierarchicalLayout(graph, 'west')
      layout.execute(parent)
      graph.removeCells(toBeRemovedLines)
      if (self.param.showColumn) {
        self.crossModelLines.forEach(line => {
          const src =
            line.source && line.source - 0 !== 0
              ? colCells[line.sourceStepId + line.source]
              : stepCells[line.sourceStepId]
          const dst =
            line.target && line.target - 0 !== 0
              ? colCells[line.targetStepId + line.target]
              : stepCells[line.targetStepId]
          graph.insertEdge(parent, null, null, src, dst, 'normalEdge')
        })
      } else {
        const paintedLines = {}
        self.crossModelLines.forEach(line => {
          const src = stepCells[line.sourceStepId]
          const dst = stepCells[line.targetStepId]

          if (!paintedLines[line.sourceStepId + '' + line.targetStepId]) {
            paintedLines[line.sourceStepId + '' + line.targetStepId] =
              graph.insertEdge(parent, null, null, src, dst, 'normalEdge')
          }
        })
      }
    } finally {
      const morph = new mxMorphing(graph, 20, 1.2, 20)
      morph.addListener(mxEvent.DONE, () => {
        graphModel.endUpdate()

        const rect = graph.getBoundingBox(parent.children)
        if (rect) {
          graph.doResizeContainer(rect.width + 100, rect.height + 100)
        }
        graph.center(false, true)
        graph.refresh()
        self.installCollapseHandler(steps)
        self.installSelectionHandler(graph)
        self.param.layoutModel = false
        if (callback) {
          callback(null, true)
        }
      })
      morph.startAnimation()
    }
  }

  drawSingleModel(model, graph) {
    const self = this
    const parent = graph.getDefaultParent()
    let modelCell = null
    const stepCells = {}
    const paintedLines = {}
    const graphModel = graph.getModel()
    const colCells = {}
    graphModel.beginUpdate()
    try {
      if (model.ddmModel) {
        modelCell = graph.insertVertex(
          parent,
          'm:' + model.name,
          vThis.$mainVue.$t('meta.map.system') +
            ':&nbsp;' +
            model.categoryName +
            '<br/>' +
            vThis.$mainVue.$t('meta.map.model') +
            ':&nbsp;' +
            model.name,
          0,
          0,
          2000,
          2000,
          'ddmModelCell'
        )
      } else {
        modelCell = graph.insertVertex(
          parent,
          'm:' + model.name,
          vThis.$mainVue.$t('meta.map.system') +
            ':&nbsp;' +
            model.categoryName +
            '<br/>' +
            vThis.$mainVue.$t('meta.map.datasource') +
            ':&nbsp;' +
            model.name,
          0,
          0,
          2000,
          2000,
          'modelCell'
        )
      }

      modelCell.isModel = true

      model.steps.forEach(step => {
        const ret = self.drawStep(step, graph, modelCell)
        stepCells[ret.stepCell['@id']] = ret.stepCell

        for (const n in ret.columnCells) {
          colCells[n] = ret.columnCells[n]
        }
      })

      model.innerLines.forEach(line => {
        var src = line.sourceStepId
        var dst = line.targetStepId

        if (!paintedLines[src + dst]) {
          paintedLines[src + dst] = graph.insertEdge(
            modelCell,
            null,
            null,
            stepCells[src],
            stepCells[dst]
          )
        }
      })

      const layout = new mxHierarchicalLayout(graph, 'west')
      layout.execute(modelCell)
    } finally {
      graphModel.endUpdate()
    }

    const rect = graph.getBoundingBox(modelCell.children)

    const dx = rect.x + 10
    const dy = rect.y + 65

    graphModel.beginUpdate()
    try {
      const toBeRemovedLines = []
      for (const pl in paintedLines) {
        toBeRemovedLines.push(paintedLines[pl])
      }

      graph.removeCells(toBeRemovedLines)

      const mgeo = mxUtils.clone(modelCell.getGeometry())
      mgeo.width = rect.width + 20
      mgeo.height = rect.height + 70
      graphModel.setGeometry(modelCell, mgeo)

      modelCell.children.forEach(cell => {
        const cgeo = mxUtils.clone(cell.getGeometry())
        cgeo.x += dx
        cgeo.y += dy
        graphModel.setGeometry(cell, cgeo)
      })

      if (self.param.showColumn) {
        model.innerLines.forEach(line => {
          const srcCell = line.source
            ? colCells[line.sourceStepId + line.source]
            : stepCells[line.sourceStepId]
          const dstCell = line.target
            ? colCells[line.targetStepId + line.target]
            : stepCells[line.targetStepId]

          graph.insertEdge(
            modelCell,
            null,
            null,
            srcCell,
            dstCell,
            'normalEdge'
          )
        })
      } else {
        const innerModelLines = {}
        model.innerLines.forEach(line => {
          const src = line.sourceStepId
          const dst = line.targetStepId

          if (!innerModelLines[src + dst]) {
            innerModelLines[src + dst] = graph.insertEdge(
              modelCell,
              null,
              null,
              stepCells[src],
              stepCells[dst],
              'normalEdge'
            )
          }
        })
      }
    } finally {
      graphModel.endUpdate()
    }

    return {
      modelCell: modelCell,
      colCells: colCells,
      stepCells: stepCells,
    }
  }

  prepareModelData() {
    const self = this
    var steps = self.data.steps
    var lines = self.data.lines
    self.stepGroup = {}
    for (var v in steps) {
      const step = steps[v]
      const modelName = step.properties.modelName

      if (!self.stepGroup[modelName]) {
        self.stepGroup[modelName] = {
          name: modelName,
          ddmModel: step.properties.ddm === 'true',
          categoryName:
            step.properties.modelCategoryName +
            '(' +
            step.properties.modelCategoryAbbr +
            ')',
          stepIds: {},
          steps: [],
          innerLines: [],
        }
      }

      self.stepGroup[modelName].stepIds[v] = true
      self.stepGroup[modelName].steps.push(step)
    }

    var foundModel = function (stepId) {
      for (var m in self.stepGroup) {
        const model = self.stepGroup[m]

        if (model.stepIds[stepId]) {
          return model
        }
      }

      return null
    }

    self.crossModelLines = []
    lines.forEach(line => {
      const model = foundModel(line.sourceStepId)

      if (model != null) {
        if (model.stepIds[line.targetStepId]) {
          model.innerLines.push(line)
        } else {
          self.crossModelLines.push(line)
        }
      } else {
        self.crossModelLines.push(line)
      }
    })

    self.interModelLines = {}

    self.crossModelLines.forEach(line => {
      const srcModel = foundModel(line.sourceStepId)
      const dstModel = foundModel(line.targetStepId)

      self.interModelLines[srcModel.name + dstModel.name] = {
        src: srcModel.name,
        dst: dstModel.name,
      }
    })
  }

  destroy() {
    if (this.outline) {
      this.outline.destroy()
    }

    if (this.graph) {
      this.graph.destroy()
    }
  }

  sortColumns() {
    for (const step in this.data.steps) {
      const columns = this.data.steps[step].columns
      this.data.steps[step].columnsLength = columns.length
      columns.sort((a, b) => {
        if (!a.name) {
          a.name = ''
        }
        if (!b.name) {
          b.name = ''
        }
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
      })
    }
  }

  getTableLines() {
    /* var steps = this.data.steps;
    var lines = this.data.lines;

    this.data.tLines = [];
    var tLines = this.data.tLines;
    var tLinesString = [];
    lines.forEach(line => {
      if (!line.source && line.source === '0') {
        line.source = null;
      }
      if (!line.target && line.target === '0') {
        line.target = null;
      }
      let source = line.sourceStepId;
      let target = line.targetStepId;
      let str = source + target;
      if (tLinesString.indexOf(str) === -1) {
        tLinesString.push(str);
        tLines.push({ source: source, target: target });
      }
    }); */
  }

  buildGraph() {
    const self = this
    var graph = new myGraph(this.container)
    graph.setCellsEditable(false)
    graph.setAllowDanglingEdges(false)
    graph.setDisconnectOnMove(false)
    graph.setEnabled(true)
    mxText.prototype.ignoreStringSize = true
    graph.htmlLabels = !(!this.param.showColumn && !this.param.showModel)
    graph.htmlLabels = true
    graph.setPanning(true)
    graph.setTooltips(true)

    graph.getTooltipForCell = function (cell) {
      return false
    }

    graph.isCellFoldable = function (cell) {
      return false
    }

    mxHierarchicalLayout.prototype.filterDescendants = function (cell, result) {
      var model = this.graph.model

      if (
        model.isVertex(cell) &&
        cell != this.parent &&
        this.graph.isCellVisible(cell)
      ) {
        result[mxObjectIdentity.get(cell)] = cell
      }

      if (
        this.traverseAncestors ||
        (cell == this.parent && this.graph.isCellVisible(cell))
      ) {
        var childCount = model.getChildCount(cell)

        for (var i = 0; i < childCount; i++) {
          var child = model.getChildAt(cell, i)
          if (!this.isPort(child) && !child.isColumn) {
            if (self.param.showModel && self.param.layoutModel) {
              if (!child.isStep) {
                this.filterDescendants(child, result)
              }
            } else {
              this.filterDescendants(child, result)
            }
          }
        }
      }
    }

    graph.isCellMovable = function (cell) {
      const res = mxGraph.prototype.isCellMovable.apply(this, cell)

      if (cell.isModel) {
        return false
      }

      if (cell.isStep && cell.parent.isModel) {
        return false
      }

      if (cell.isColumn) {
        return false
      }

      return res
    }

    if (this.outlineContainer) {
      this.outline = new mxOutline(graph, this.outlineContainer)
    }

    mxConstants.VERTEX_SELECTION_COLOR = 'green'
    mxConstants.VERTEX_SELECTION_DASHED = false
    mxConstants.VERTEX_SELECTION_STROKEWIDTH = 3

    if (this.param.showColumn) {
      mxConstants.EDGE_SELECTION_STROKEWIDTH = 3
      mxConstants.EDGE_SELECTION_DASHED = 0
      mxConstants.EDGE_SELECTION_COLOR = 'red'
    } else {
      mxConstants.EDGE_SELECTION_STROKEWIDTH = 0
      mxConstants.EDGE_SELECTION_COLOR = 'green'
    }

    return graph
  }

  draw(graph, callback) {
    const self = this
    self.param.collapseSteps = !self.param.meta

    var ver = {}
    var verStep = {}
    var edges = {}
    var colCells = {}
    var stepCells = {}
    var tLines = this.data.tLines
    var drewLines = {}
    var steps = this.data.steps
    var model = graph.getModel()
    var parent = graph.getDefaultParent()

    model.beginUpdate()
    try {
      if (callback) {
        callback('绘制元素...')
      }
      for (const v in steps) {
        const msg = steps[v]
        const ret = self.drawStep(msg, graph, parent)
        ver[v] = ret.stepCell
        for (const n in ret.columnCells) {
          colCells[n] = ret.columnCells[n]
        }
        stepCells[v] = ret.stepCell
      }
      tLines.forEach(line => {
        if (!drewLines[line.source + line.target]) {
          drewLines[line.source + line.target] = graph.insertEdge(
            parent,
            null,
            null,
            ver[line.source],
            ver[line.target]
          )
        }
      })
    } finally {
      if (callback) {
        callback('开始计算布局...')
      }
      setTimeout(function () {
        try {
          const layout = new mxHierarchicalLayout(graph, 'west')
          layout.execute(parent)
          if (self.param.showColumn && !self.tableOnly && !self.pureLineage) {
            var toBeRemovedLines = []
            for (var l in drewLines) {
              toBeRemovedLines.push(drewLines[l])
            }
            graph.removeCells(toBeRemovedLines)
          }
        } finally {
          try {
            self.data.lines.forEach(line => {
              let src = line.sourceStepId + line.source
              if (!line.source) {
                src = line.sourceStepId
              }
              let dst = line.targetStepId + line.target
              if (!line.target) {
                dst = line.targetStepId
              }
              graph.insertEdge(
                parent,
                null,
                null,
                colCells[src] ? colCells[src] : stepCells[src],
                colCells[dst] ? colCells[dst] : stepCells[dst],
                'edgeStyle=datablauStyle'
              )
            })
            // self.postDraw(graph, steps)
          } finally {
            if (callback) {
              callback('完成绘制...')
            }
            setTimeout(function () {
              model.endUpdate()
              if (callback) {
                callback(null, true)
              }
              const morph2 = new mxMorphing(graph, 20, 1.2, 20)
              morph2.addListener(mxEvent.DONE, () => {
                self.paintBindedOverlays(graph)
              })
              morph2.startAnimation()
              self.postDraw(graph, steps)
            }, 100)
          }
        }
      }, 100)
    }
  }

  paintBindedOverlays(graph) {
    const self = this
    if (!self.lineageData || self.lineageData.length == 0) {
      return
    }
    const scale = graph.view.getScale()
    const offset = new mxPoint(0, scale * 12)
    for (let i = 0; i < self.lineageData.length; i++) {
      const step = self.lineageData[i]

      const id = step.stepId
      const cell = graph.getModel().getCell('v:' + id)
      if (!cell) {
        continue
      }

      const overlays = graph.getCellOverlays(cell)
      if (overlays == null) {
        const overlay = new mxCellOverlay(
          new mxImage('./static/images/bind_24.png', 24, 24),
          '<div style="padding:5px"><span style="font-weight:bold">已绑定:</span><br/><span style="width:45px;display:inline-block">系统</span>:&nbsp;' +
            step.modelCategoryName +
            '<br/><span style="width:45px;display:inline-block">' +
            (step.ddmStep ? '模型' : '数据源') +
            '</span>:&nbsp;' +
            step.modelName +
            '</div>',
          mxConstants.ALIGN_RIGHT,
          mxConstants.ALIGN_TOP,
          offset
        )

        graph.addCellOverlay(cell, overlay)
      } else {
        graph.removeCellOverlays(cell)
      }
    }
  }

  static propertyFormatter(value) {
    const map = new Map()
    map.set('$input_table', '输入表')
    map.set('$output_table', '输出表')
    map.set('databaseName', '数据库名称')
    map.set('databaseType', '数据库类型')
    map.set('port', '端口')
    map.set('hostName', 'host_name')
    map.set('$dam_obj', 'dam_object')
    map.set('$ddm_obj', 'ddm_object')
    map.set('$schema', 'schema_name')
    map.set('$compress_sql', 'compressed_sql')
    map.set('filename', 'filename')
    map.set('serverName', 'server_name')
    map.set('sql', 'sql')
    if (map.has(value)) {
      return map.get(value)
    } else {
      return false
    }
  }

  static propertyValueFormatter(key, value) {
    /* const map = new Map();
    map.set('$input_table','');
    map.set('$output_table','');
    if(map.has(key)){
      return '';
    }else{
      return ': ${value}';
    } */
    if (value === 'true') {
      return ''
    } else {
      return `: ${value}`
    }
  }

  drawStep(msg, graph, parent) {
    const self = this
    const buildCellId = function (id) {
      return 'v:' + id
    }

    const result = { columnCells: {} }
    let stepStyle
    if (msg.properties.$output_table) {
      stepStyle = 'outputStepCell'
    } else if (msg.properties.$input_table) {
      stepStyle = 'inputStepCell'
    } else {
      stepStyle = 'stepCell'
    }
    let tableHtml = ''
    let titleString = `${msg.name}`
    if (msg.properties) {
      for (const key in msg.properties) {
        if (DrawGraph.propertyFormatter(key)) {
          const value = msg.properties[key]
          titleString += `\r${DrawGraph.propertyFormatter(
            key
          )}${DrawGraph.propertyValueFormatter(key, value)}`
        }
      }
    }
    if (msg.schema) {
      titleString += `\rschema: ${msg.schema}`
    }
    if (
      !this.param.showColumn &&
      !this.param.showModel &&
      !msg.properties.databaseName
    ) {
      tableHtml = `<div style="width:${STD.TABLE_WIDTH}px" class="svg-col svg-title" title="${titleString}">${msg.name}</div>`
    } else {
      tableHtml = '<div style="width:' + STD.TABLE_WIDTH + 'px" class="'

      if (
        msg.properties.$output_table ||
        msg.properties.$input_table ||
        this.param.developerMode
      ) {
        tableHtml += 'svg-col svg-title'
      } else {
        tableHtml += 'svg-col'
      }
      tableHtml += '" data-id="' + msg.id + '"'

      if (msg.properties.databaseName) {
        tableHtml +=
          ' title="模型：' +
          msg.properties.databaseName +
          '\r' +
          msg.name +
          '">'
      } else {
        tableHtml += ' title="' + titleString + '">'
      }

      if (this.param.showColumn) {
        if (
          !msg.properties.$input_table &&
          !msg.properties.$output_table &&
          self.param.collapseSteps
        ) {
          tableHtml +=
            '<i class="fa fa-plus step-icon" aria-hidden="true" id="step-' +
            msg.id +
            '"> </i>'
        } else {
          tableHtml +=
            '<i class="fa fa-minus step-icon" aria-hidden="true" id="step-' +
            msg.id +
            '"></i>'
        }
      }

      tableHtml += msg.name + '</div>'
    }

    if (this.param.showColumn) {
      if (msg.columnsLength === 0) {
        result.stepCell = graph.insertVertex(
          parent,
          buildCellId(msg.id),
          tableHtml,
          0,
          0,
          STD.TABLE_WIDTH,
          25,
          stepStyle
        )
      } else {
        result.stepCell = graph.insertVertex(
          parent,
          buildCellId(msg.id),
          tableHtml,
          0,
          0,
          STD.TABLE_WIDTH,
          STD.COL_HEIGHT * msg.columnsLength + 50,
          stepStyle
        )
      }

      msg.columns.forEach((col, index) => {
        result.columnCells[msg.id + col.id] = graph.insertVertex(
          result.stepCell,
          null,
          '<div style="width:' +
            STD.TABLE_WIDTH +
            'px" class="svg-col" title="' +
            col.name +
            '">' +
            col.name +
            '</div>',
          10,
          index * STD.COL_HEIGHT + 40,
          STD.COL_WIDTH,
          STD.COL_HEIGHT,
          'colCell'
        )

        // colCells[v + col.id].isColumn = true;
        result.columnCells[msg.id + col.id].isColumn = true
      })

      if (
        !msg.properties.$input_table &&
        !msg.properties.$output_table &&
        self.param.collapseSteps
      ) {
        graph.getModel().setCollapsed(result.stepCell, true)
        result.stepCell.actualHeight = result.stepCell.getGeometry().height
        result.stepCell.getGeometry().height = 25
      } else {
        result.stepCell.actualHeight = 25
      }
    } else {
      result.stepCell = graph.insertVertex(
        parent,
        buildCellId(msg.id),
        tableHtml,
        0,
        0,
        STD.TABLE_WIDTH,
        25,
        stepStyle
      )
    }

    result.stepCell['@id'] = msg.id
    result.stepCell.isStep = true
    return result
  }

  postDraw(graph, steps) {
    var boundingBox = graph.view.getGraphBounds()
    var dx = 0 - boundingBox.x + 20
    var dy = 0 - boundingBox.y + 20
    graph.view.scaleAndTranslate(graph.view.getScale(), dx, dy)

    if (this.outline) {
      this.outline.refresh()
    }

    this.installSelectionHandler(graph)

    if (this.param.showColumn) {
      this.installCollapseHandler(steps)
    }
  }

  collapseCell(stepId) {
    const self = this
    var cell = self.graph.getModel().getCell('v:' + stepId)
    const id = stepId
    self.graph.getModel().beginUpdate()
    try {
      self.graph.getModel().setCollapsed(cell, !cell.isCollapsed())
      if (cell.oldGeo) {
        var currentGeo = cell.getGeometry()
        self.graph.getModel().setGeometry(cell, cell.oldGeo)
        cell.oldGeo = currentGeo
      } else {
        var currentGeo = mxUtils.clone(cell.getGeometry())
        currentGeo.height = cell.actualHeight
        cell.oldGeo = cell.getGeometry()
        self.graph.getModel().setGeometry(cell, currentGeo)
      }
    } finally {
      self.graph.getModel().endUpdate()
    }

    let $dom = $(document.getElementById('step-' + id))
    $dom.click(function (evt) {
      $dom.unbind('click')
      const collapsed = self.collapseCell(id)
      self.toggleIcon(id, collapsed)
      evt.stopPropagation()
    })

    return cell.isCollapsed()
  }

  toggleIcon(id, collapsed) {
    var elem = $(document.getElementById('step-' + id))
    if (collapsed) {
      elem.removeClass('fa-minus')
      elem.addClass('fa-plus')
    } else {
      elem.removeClass('fa-plus')
      elem.addClass('fa-minus')
    }
  }

  installCollapseHandler(steps) {
    const self = this
    setTimeout(() => {
      for (const v in steps) {
        let $dom = $(document.getElementById('step-' + v))
        $dom.click(function (evt) {
          $dom.unbind('click')
          const collapsed = self.collapseCell(v)
          self.toggleIcon(v, collapsed)
          evt.stopPropagation()
        })
      }
    }, 1000)
  }

  installSelectionHandler(graph) {
    var selectedCells = []

    var isSelectedAlready = function (cell) {
      var selected = false
      for (var i = 0; i < selectedCells.length; i++) {
        if (selectedCells[i] === cell) {
          selected = true
          break
        }
      }

      return selected
    }

    var highlightCells = function (cell, forward, highlighted) {
      if (!cell) {
        return
      }
      let highlightCellsStr =
        cell.id + (forward ? 'f' : '') + (highlighted ? 'h' : '')
      if (highlightCellsSet.has(highlightCellsStr)) {
        return
      } else {
        highlightCellsSet.add(highlightCellsStr)
      }

      if (!highlighted && !isSelectedAlready(cell)) {
        selectedCells.push(cell)
        cell.oldStyle = cell.getStyle()

        if (cell.isColumn) {
          graph.getModel().setStyle(cell, 'selectedColCell')
        } else if (cell.isStep) {
          graph.getModel().setStyle(cell, 'selectedStepCell')
        }
      }

      for (var i = 0; i < cell.getEdgeCount(); i++) {
        var edge = cell.getEdgeAt(i)
        if (edge.target == edge.source) {
          continue
        }

        if (forward && edge.source === cell) {
          highlightCells(edge.target, forward)

          if (!isSelectedAlready(edge)) {
            edge.oldStyle = edge.getStyle()
            graph.getModel().setStyle(edge, 'selectedEdge')
            selectedCells.push(edge)
          }
        }

        if (!forward && edge.target === cell) {
          highlightCells(edge.source, forward)

          if (!isSelectedAlready(edge)) {
            edge.oldStyle = edge.getStyle()
            graph.getModel().setStyle(edge, 'selectedEdge')
            selectedCells.push(edge)
          }
        }
      }
    }

    // if (this.param.showColumn) {
    const showColumn = this.param.showColumn
    graph
      .getSelectionModel()
      .addListener(mxEvent.CHANGE, function (sender, evt) {
        const addedCells = evt.getProperty('removed')
        graph.getModel().beginUpdate()

        try {
          var i = 0
          var cell
          for (i = 0; i < selectedCells.length; i++) {
            cell = selectedCells[i]
            graph.getModel().setStyle(cell, cell.oldStyle)
          }
          selectedCells.length = 0
          highlightCellsSet.clear()
          if (addedCells) {
            for (i = 0; i < addedCells.length; i++) {
              cell = addedCells[i]
              if (
                (cell.isColumn && showColumn) ||
                (cell.isStep && !showColumn)
              ) {
                highlightCells(cell, true)
                highlightCells(cell, false, true)
              } else if (cell.isEdge()) {
                highlightCells(cell.target, true)
                highlightCells(cell.source, false, false)
              } else {
                graph.orderCells(false, [cell])
              }
            }
          }
        } finally {
          graph.getModel().endUpdate()
        }
      })
    // }
  }

  initStyles(graph) {
    var style = mxUtils.clone(graph.getStylesheet().getDefaultVertexStyle())
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE
    style[mxConstants.STYLE_STARTSIZE] = 25
    style[mxConstants.STYLE_FILLCOLOR] = '#D9DFEF'
    style[mxConstants.STYLE_ROUNDED] = 1
    style[mxConstants.STYLE_MOVABLE] = 1
    style[mxConstants.STYLE_FOLDABLE] = 1
    style[mxConstants.STYLE_STROKECOLOR] = 'gray'
    style[mxConstants.STYLE_RESIZABLE] = 0
    graph.getStylesheet().putCellStyle('stepCell', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = '#CBE8CA'
    graph.getStylesheet().putCellStyle('outputStepCell', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = '#E7C58E'
    graph.getStylesheet().putCellStyle('inputStepCell', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = '#EE756B'
    style[mxConstants.STYLE_FONTCOLOR] = '#fff'
    graph.getStylesheet().putCellStyle('selectedStepCell', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = '#579864'
    style[mxConstants.STYLE_FONTCOLOR] = '#fff'
    style[mxConstants.STYLE_OVERFLOW] = 'hidden'
    style[mxConstants.STYLE_STARTSIZE] = 50
    graph.getStylesheet().putCellStyle('modelCell', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = '#ff7c61'
    style[mxConstants.STYLE_STARTSIZE] = 50
    graph.getStylesheet().putCellStyle('ddmModelCell', style)

    style = mxUtils.clone(graph.getStylesheet().getDefaultVertexStyle())
    style[mxConstants.STYLE_FILLCOLOR] = '#fff'
    style[mxConstants.STYLE_STROKECOLOR] = 'gray'
    style[mxConstants.STYLE_MOVABLE] = 0
    style[mxConstants.STYLE_RESIZABLE] = 0
    graph.getStylesheet().putCellStyle('colCell', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = 'red'
    style[mxConstants.STYLE_STROKECOLOR] = '#ddd'
    style[mxConstants.STYLE_FONTCOLOR] = '#fff'
    graph.getStylesheet().putCellStyle('selectedColCell', style)

    style = mxUtils.clone(graph.getStylesheet().getDefaultVertexStyle())
    style[mxConstants.STYLE_FILLCOLOR] = '#48BEEF'
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#fff'
    style[mxConstants.STYLE_FONTSIZE] = 25
    style[mxConstants.STYLE_FONTCOLOR] = '#272822'
    style[mxConstants.STYLE_STROKECOLOR] = '#9f9f9f'
    style[mxConstants.STYLE_GRADIENT_DIRECTION] = mxConstants.DIRECTION_NORTH
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CYLINDER
    graph.getStylesheet().putCellStyle('databaseCell', style)

    mxEdgeStyle.DatablauStyle = function (
      state,
      source,
      target,
      points,
      result
    ) {
      const scale = source.width / source.unscaledWidth
      if (source != null && target != null) {
        var pt = new mxPoint(source.x + source.width, source.getCenterY())
        result.push(pt)
        pt = new mxPoint(
          source.x + source.width + scale * 20,
          source.getCenterY()
        )
        result.push(pt)
        pt = new mxPoint(target.x - scale * 20, target.getCenterY())
        result.push(pt)
        pt = new mxPoint(target.x, target.getCenterY())
        result.push(pt)
      }
      return result
    }

    mxStyleRegistry.putValue('datablauStyle', mxEdgeStyle.DatablauStyle)
    style = graph.getStylesheet().getDefaultEdgeStyle()
    style[mxConstants.STYLE_CURVED] = '1'

    style = mxUtils.clone(graph.getStylesheet().getDefaultEdgeStyle())
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.DatablauStyle
    style[mxConstants.STYLE_MOVABLE] = 0
    style[mxConstants.STYLE_STROKEWIDTH] = 2
    style[mxConstants.STYLE_STROKECOLOR] = '#7f7f7f'
    graph.getStylesheet().putCellStyle('normalEdge', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_STROKECOLOR] = 'red'
    style[mxConstants.STYLE_STROKEWIDTH] = 3
    graph.getStylesheet().putCellStyle('selectedEdge', style)
  }

  initEventListener() {
    const root = $(this.container)
    root.off('click')
    /* root.on('click','.svg-col',(e)=>{
      let id = $(e.target).attr('data-id');
      let pId = $(e.target).attr('p-id');
      this.param.$This.showColDetail(id,pId);
    }) */
    //  root.on('click', '.svg-title', (e) => {
    //    let id = $(e.target).attr('data-id');
    //    if (this.param.$This && this.param.$This.showTabDetail) {
    //      this.param.$This.showTabDetail(this.data.steps[id]);
    //    }
    //  })
  }
}
export default DrawGraph
