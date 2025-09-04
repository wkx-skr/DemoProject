import _ from 'lodash'
import LDMTypes from '@constant/LDMTypes'
function getIcon(iconMap) {
  function getStr(type) {
    let dataURL = (iconMap[type] || {}).base64Url || ''
    if (!dataURL) {
      dataURL = (iconMap[type] || {}).url || ''
    }
    if (!dataURL) return ''
    let str = `<div style="display: inline-block; text-align: center; width: 18px;padding: 2px 4px 0 0;text-indent:0;"><div style="background: transparent url('${dataURL}') ;background-size:contain; display: inline-block;width: 14px;height:14px;"></div></div>`
    return str
  }

  return getStr
}

function getHeaderLineStyle(show = true) {
  return `display: inline-block; margin-bottom: 4px;color: #fff;cursor: default;width: 100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;${
    show ? '' : 'display: none;'
  }`
}

// function getHeaderTitleStyle() {
//   return `max-width: 160px;display: inline-block; color: red;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;`
// }
const getHeaderTitleStyle = `max-width: 160px;display: inline-block; white-space: nowrap;overflow: hidden;text-overflow: ellipsis;`

function getColNameStyle(para) {
  // svg-step-name
  // border:1px solid red;
  let str = `position: relative;display: inline-block;text-align: left;height: 21px;`
  if (para && para.width) {
    str += `width: ${para.width}px;`
  }
  return str
}

function getStepNameStyle() {
  // svg-step-name
  // return `overflow: hidden;`
  return 'display: inline-block;position: absolute;left: 0;right: 20px ;padding-left: 28px;overflow:hidden;text-overflow: ellipsis;white-space: nowrap;'
}
function columnStyle() {
  return 'display: inline-block;position: absolute;left: 0;right: 20px ;padding-left: 28px;text-overflow: ellipsis;white-space: nowrap;'
}
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

function myGraph(container) {
  mxGraph.call(this, container)
}

let line2FileMap = {}

function getLineFileName(line, newLine) {
  let result = ''
  if (line && line.properties && line.properties.lineageFiles && newLine) {
    result = line.properties.lineageFiles
    line2FileMap[newLine.id] = line
  }
  return result
}

myGraph.prototype = new mxGraph()
myGraph.prototype.constructor = myGraph
myGraph.prototype.expandedImage = ''
let $this = null

class DrawGraph {
  /**
   * 构造函数, 绑定数据, 并增加 js 时间绑定
   * 返回 DrawGraph 类的实例, 未生成 mxGraph 实例, 未开始绘制, 未绑定 graph 事件
   * @param container
   * @param data
   * @param param
   *    showModel: 是否显示数据库
   *    showColumn: 是否显示字段
   *    showQuestionCount: 是否显示 质量问题统计
   *    scale: 缩放倍数百分比, 需要 /100
   * @param outlineContainer
   * @param lineageData
   */
  constructor(container, data, param, outlineContainer, lineageData) {
    this.maxHeight = []
    this.container = container
    this.param = param
    this.data = data
    $this = param.$this
    this.getIcon = getIcon($this.iconMap)
    this.outlineContainer = outlineContainer
    this.lineageData = lineageData
    this.tableOnly = data.properties.$table_lineage
    this.pureLineage = data.properties.$pure_lineage
    // 用于关键字搜索, key 是 label, value 是数组 [{type, cell}]
    this.labelMap = new Map()
    this.searchCells = []

    this.initEventListener()
  }

  /**
   * 开始函数, 开始绘制 graph 图像, 需要手动调用
   * @param callback
   */
  start(callback) {
    this.sortColumns()
    this.getTableLines()
    this.graph = this.buildGraph()
    this.initStyles(this.graph)
    // 是否显示 数据库
    if (this.param.showModel) {
      this.drawModelLineage(this.graph, callback)
    } else {
      this.draw(this.graph, callback)
    }

    setPopupMenu(this.graph)
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

        const tline = graph.insertEdge(parent, null, '', srcModel, dstModel)
        getLineFileName(line, tline)
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
          let newLine = graph.insertEdge(
            parent,
            null,
            '',
            src,
            dst,
            'normalEdge'
          )
          getLineFileName(line, newLine)
        })
      } else {
        const paintedLines = {}
        self.crossModelLines.forEach(line => {
          const src = stepCells[line.sourceStepId]
          const dst = stepCells[line.targetStepId]

          if (!paintedLines[line.sourceStepId + '' + line.targetStepId]) {
            paintedLines[line.sourceStepId + '' + line.targetStepId] =
              graph.insertEdge(parent, null, '', src, dst, 'normalEdge')
            getLineFileName(
              line,
              paintedLines[line.sourceStepId + '' + line.targetStepId]
            )
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
        graph.center(true, true)
        // graph.doResizeContainer(rect.width + 100, rect.height + 100)
        graph.refresh()
        self.installCollapseHandler(steps)
        self.installSelectionHandler(graph)
        self.param.layoutModel = false
        if (callback) {
          callback(null, true)
        }
      })
      morph.startAnimation()

      self.zoomGraph(self.param.scale)
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
      let systemIcon = 'system'
      let schemaIcon = 'schema'
      let databaseIcon = 'database'
      if (model.typeId === String(LDMTypes.Report)) {
        systemIcon = 'report2'
        schemaIcon = 'schema'
        databaseIcon = 'file'
      }
      if (model.typeId === String(LDMTypes.Index)) {
        systemIcon = 'index2'
        schemaIcon = 'schema'
        databaseIcon = 'file'
      }

      const headerHtml = `<div class="header-container"><span style="${getHeaderLineStyle()}">${self.getIcon(
        systemIcon
      )} <span title="${model.categoryName}" style="${getHeaderTitleStyle}">${
        model.categoryName
      }</span></span>
        <span title="${model.schema}" style="${getHeaderLineStyle(
        ![LDMTypes.Report, LDMTypes.Index]
          .map(i => String(i))
          .includes(model.typeId)
      )}">${self.getIcon(schemaIcon)}<span style="${getHeaderTitleStyle}">${
        model.schema
      }</span></span>
          <span style="${getHeaderLineStyle()}"> ${self.getIcon(
        databaseIcon
      )}<span title="${model.name}" style="${getHeaderTitleStyle}">${
        model.name
      }</span></span>
          </div>`
      let style = 'modelCell'
      if (model.ddmModel) {
        style = 'ddmModelCell'
      }

      modelCell = graph.insertVertex(
        parent,
        'm:' + model.name,
        headerHtml,
        0,
        0,
        2000,
        2000,
        style
      )
      // if (model.ddmModel) {
      //   modelCell = graph.insertVertex(parent, "m:" + model.name, `<span class="system"></span>系统:&nbsp;" + model.categoryName +  "<br/>模型:&nbsp;" + model.name`, 0, 0, 2000, 2000, 'ddmModelCell');
      // } else {
      //   modelCell = graph.insertVertex(parent, "m:" + model.name, "系统:&nbsp;" + model.categoryName + "<br/>数据源:&nbsp;" + model.name, 0, 0, 2000, 2000, 'modelCell');
      // }

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
            '',
            stepCells[src],
            stepCells[dst]
          )
          getLineFileName(line, paintedLines[src + dst])
        }
      })

      const layout = new mxHierarchicalLayout(graph, 'west')
      layout.execute(modelCell)
    } finally {
      graphModel.endUpdate()
    }

    const rect = graph.getBoundingBox(modelCell.children)

    // 字段列表 开始位置
    const dx = rect.x + 10
    const dy = rect.y + 95

    graphModel.beginUpdate()
    try {
      const toBeRemovedLines = []
      for (const pl in paintedLines) {
        toBeRemovedLines.push(paintedLines[pl])
      }

      graph.removeCells(toBeRemovedLines)

      // 字段列表 外层框 size
      const mgeo = mxUtils.clone(modelCell.getGeometry())
      mgeo.width = rect.width + 20
      mgeo.height = rect.height + 100
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

          let newLine = graph.insertEdge(
            modelCell,
            null,
            '',
            srcCell,
            dstCell,
            'normalEdge'
          )
          getLineFileName(line, newLine)
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
              '',
              stepCells[src],
              stepCells[dst],
              'normalEdge'
            )
            getLineFileName(line, innerModelLines[src + dst])
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
      // 模型名称
      let modelName = step.properties.modelName
      if (!self.stepGroup[modelName]) {
        // 系统名称
        let abbr = step.properties.modelCategoryAbbr
          ? `(${step.properties.modelCategoryAbbr})`
          : ''
        let categoryName = (step.properties.modelCategoryName || '-') + abbr
        if (
          [LDMTypes.Report, LDMTypes.Index]
            .map(i => String(i))
            .includes(step.properties.typeId)
        ) {
          categoryName = step.properties.typeName || ''
          modelName = step.properties.path || '/'
        }
        self.stepGroup[modelName] = {
          name: modelName,
          ddmModel: step.properties.ddm === 'true',
          categoryName: categoryName,
          // schema: step.schema,
          schema: step.schema || '-',
          stepIds: {},
          steps: [],
          innerLines: [],
        }
        // 报表 标记类型
        if (
          [LDMTypes.Report, LDMTypes.Index]
            .map(i => String(i))
            .includes(step.properties.typeId)
        ) {
          self.stepGroup[modelName].typeId = String(step.properties.typeId)
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
      if (!srcModel || !dstModel) return

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
    line2FileMap = {}
  }

  hideMenu() {
    if (this.graph && this.graph.popupMenuHandler) {
      this.graph.popupMenuHandler.hideMenu()
    }
  }

  sortColumns() {
    for (const step in this.data.steps) {
      const columns = this.data.steps[step].columns
      this.data.steps[step].columnsLength = columns.length
      columns.sort((a, b) => {
        if (a.hasOwnProperty('order') && b.hasOwnProperty('order')) {
          return a.order - b.order
        }
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
    var steps = this.data.steps
    var lines = this.data.lines

    this.data.tLines = []
    var tLines = this.data.tLines
    var tLinesString = []
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
        tLines.push({
          source: source,
          target: target,
          properties: line.properties,
        })
      }
    })
  }

  buildGraph() {
    const self = this
    var graph = new myGraph(this.container)
    graph.setCellsEditable(false)
    graph.setAllowDanglingEdges(false)
    graph.setDisconnectOnMove(false)
    graph.setEnabled(true)
    mxText.prototype.ignoreStringSize = true
    //    graph.htmlLabels = !(!this.param.showColumn && !this.param.showModel);
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

    mxConstants.VERTEX_SELECTION_COLOR = '#008000'
    mxConstants.VERTEX_SELECTION_DASHED = false
    mxConstants.VERTEX_SELECTION_STROKEWIDTH = 3

    if (this.param.showColumn) {
      mxConstants.EDGE_SELECTION_STROKEWIDTH = 3
      mxConstants.EDGE_SELECTION_DASHED = 0
      mxConstants.EDGE_SELECTION_COLOR = 'red'
    } else {
      mxConstants.EDGE_SELECTION_STROKEWIDTH = 0
      mxConstants.EDGE_SELECTION_COLOR = '#008000'
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
      }
      tLines.forEach(line => {
        if (!drewLines[line.source + line.target]) {
          let newLine = (drewLines[line.source + line.target] =
            graph.insertEdge(
              parent,
              null,
              '',
              ver[line.source],
              ver[line.target]
            ))
          getLineFileName(line, newLine)
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
              const src = line.sourceStepId + line.source
              const dst = line.targetStepId + line.target

              let newLine = graph.insertEdge(
                parent,
                null,
                '',
                colCells[src],
                colCells[dst],
                'edgeStyle=datablauStyle'
              )
              getLineFileName(line, newLine)
            })
            self.postDraw(graph, steps)
          } finally {
            // const rect = graph.getBoundingBox(parent.children)
            const rect = graph.getBoundingBox(parent)
            if (rect) {
              graph.doResizeContainer(rect.width + 100, rect.height + 100)
            }
            graph.refresh()

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

              self.zoomGraph(self.param.scale)
            }, 100)
          }
        }
      }, 100)
    }
  }

  zoomGraph(scale = 100) {
    this.graph.zoomTo(scale / 100)
  }

  searchStep(keyword) {
    let cells = []
    if (_.trim(keyword)) {
      for (const [key, value] of this.labelMap.entries()) {
        if (key.toLowerCase().includes(_.trim(keyword).toLowerCase())) {
          cells.push(...value)
        }
      }
    }

    cells = cells.map(item => item.cell)

    let searchCellsMap = new Map()
    cells.forEach(cell => {
      searchCellsMap.set(cell.getId(), true)
      this.resetCellStyle(cell, 'search')
    })

    this.searchCells.forEach(cell => {
      if (!searchCellsMap.has(cell.getId())) {
        this.resetCellStyle(cell, 'clearSearch')
      }
    })
    this.searchCells = cells
  }

  outputImg() {
    let svgDom = new mxSvgCanvas2D(this.container)
    let clip = svgDom.createClip(0, 0, 500, 500)
  }

  addCellClickHandler(graph) {
    graph.addListener(mxEvent.CLICK, (sender, evt) => {
      // 当 节点类型是 table 时, 显示 右侧弹框
      let { cell } = evt.properties
      let id = ''
      if ($this.showTableInfoTabs && cell && cell.id) {
        if (cell.id.indexOf('v:dam-') !== -1) {
          id = cell.id.replace('v:dam-', '')
        } else if (cell.id.indexOf('v:') !== -1) {
          id = cell.id.replace('v:', '')
        }
      }

      if (id && !isNaN(id - 0)) {
        $this.showTableInfoTabs(id)
      } else {
        $this.hideDialog()
      }
    })
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

  drawStep(msg, graph, parent) {
    const self = this
    var buildCellId = function (id) {
      return 'v:' + id
    }

    var result = { columnCells: {} }
    var stepStyle = null
    let stepType = 'TABLE'
    if (msg.properties.$output_table) {
      stepStyle = 'outputStepCell'
    } else if (msg.properties.$input_table) {
      stepStyle = 'inputStepCell'
    } else if (msg.properties.typeId === String(LDMTypes.Report)) {
      stepStyle = 'reportCell'
      stepType = 'REPORT'
    } else if (msg.properties.typeId === String(LDMTypes.Index)) {
      stepStyle = 'indexCell'
      stepType = 'INDEX'
    } else {
      stepStyle = 'stepCell'
    }
    let tableHtml = ''
    if (
      !this.param.showColumn &&
      !this.param.showModel &&
      !msg.properties.databaseName &&
      !msg.properties.modelName &&
      !msg.properties.typeId
    ) {
      let titleString = msg.name
      if (msg.schema) {
        titleString += `\rschema: ${msg.schema}`
      }
      let id = msg.id
      if (isNaN(id - 0)) {
        id = msg.id.slice(4)
      }
      let objId = ''
      if (msg.properties.$obj_id) {
        objId = ` data-obj-id="${msg.properties.$obj_id}"`
      }
      tableHtml = `<div style="${getColNameStyle({
        width: STD.TABLE_WIDTH,
      })}" class="svg-col not-col" title="name: ${titleString}">${self.getIcon(
        stepType.toLowerCase()
      )}<span style="${getStepNameStyle()}" class="svg-step-name" data-id="${id}" data-full-id="${
        msg.id
      }" ${objId}>${msg.name}</span></div>`
    } else {
      // title 文本
      let titleString = ''
      if (msg.properties.databaseName) {
        titleString += `模型：${msg.properties.databaseName}\r${msg.name}`
      } else if (msg.properties.modelName) {
        titleString += `${msg.properties.modelCategoryName}(${msg.properties.modelCategoryAbbr}) / ${msg.properties.modelName}\r${msg.name}`
      } else {
        titleString += `${msg.name}`
      }
      if (msg.schema) {
        titleString += `\rschema: ${msg.schema}`
      }

      // 外层 类名
      let outerClass = ''
      if (
        msg.properties.$output_table ||
        msg.properties.$input_table ||
        this.param.developerMode
      ) {
        outerClass = 'svg-col svg-title'
      } else {
        outerClass = 'svg-col not-col'
      }

      // 收起/展开 字段 按钮
      let unfoldColumnsButton = ''
      let unfoldIconType = ''
      if (this.param.showColumn) {
        if (
          !msg.properties.$input_table &&
          !msg.properties.$output_table &&
          self.param.collapseSteps
        ) {
          unfoldIconType = `plus`
        } else {
          unfoldIconType = `minus`
        }
        let iconUnfoldStyle = function (type) {
          return `display: ${
            unfoldIconType === type ? 'inline-block' : 'none'
          };`
        }
        unfoldColumnsButton = `<span id="outer-table-name-${
          msg.id
        }" class="step-icon" aria-hidden="true" style="position: relative;z-index: 5;display: inline-block;float: right;padding: 0;font-size: 14px;color: #000;cursor: pointer; "><span class="line-cols-plus" style="${iconUnfoldStyle(
          'plus'
        )}" >${self.getIcon(
          'plus'
        )}</span><span class="line-cols-minus" style="${iconUnfoldStyle(
          'minus'
        )}">${self.getIcon('minus')}</span><span class="cover-btn"  id="step-${
          msg.id
        }" style="position: absolute;z-index: 10;left:0;right:0;top:0;bottom:0;"></span></span>`
      }

      // 当前节点是否是 中心源点
      let ifOrigin = false
      if (
        $this.data &&
        $this.data.objectId === Number.parseInt(msg.id.slice(4))
      ) {
        ifOrigin = true
      } else if (
        this.param.originType === 'REPORT' &&
        msg.properties.typeId === String(LDMTypes.Report) &&
        `dam-report-${$this.data.objectId}` === msg.id
      ) {
        ifOrigin = true
      }

      let skipBtnStr = ''

      let countStyle = `position: absolute;right:20px;top:0;font-size: 12px;right: -3px;top: -13px;padding: 0 6px;height: 18px; text-align: center;background: #f2220a;border-radius: 9px 9px 9px 1px;border: 1px solid #b6dbff;min-width: 20px;color: #fff;line-height: 18px;vertical-align: bottom;font-style:normal;z-index: 8;`
      countStyle += this.param.showQuestionCount
        ? `display: inline-block;`
        : 'display: none;'

      let problemCount = (msg.properties || {}).qualityNum || 0
      let typeId = (msg.properties || {}).typeId
      // table 的 typeId 为空, 报表和指标有 typeId
      if (typeId) {
        problemCount = 0
      }
      let countSpan = problemCount
        ? `<i class="problem-count" style="${countStyle}">${problemCount}</i> `
        : ''
      if (!ifOrigin) {
        let id = msg.id
        if (isNaN(id - 0)) {
          id = msg.id.slice(4)
        }
        let objId = ''
        if (msg.properties.$obj_id) {
          objId = `data-obj-id="${msg.properties.$obj_id}"`
        }
        skipBtnStr = ` data-id="${id}" data-full-id="${msg.id}"${objId}`
      }
      // table
      tableHtml = `<div style="${getColNameStyle({
        width: STD.TABLE_WIDTH,
      })}" class="${outerClass}" data-id="${msg.id}" title="${
        titleString || ''
      }">${unfoldColumnsButton}${self.getIcon(
        stepType.toLowerCase()
      )}<span style="${getStepNameStyle()}" class="svg-step-name" ${skipBtnStr}>${
        ifOrigin ? self.getIcon('location') : ''
      }${msg.name}</span>${countSpan}</div>`
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
      // 字段
      msg.columns.forEach((col, index) => {
        result.columnCells[msg.id + col.id] = graph.insertVertex(
          result.stepCell,
          null,
          `<div style="width:${
            STD.TABLE_WIDTH
          }px; overflow: hidden !important;" :style="${columnStyle()}" class="svg-col" title="${
            col.name
          }">${col.name}</div>`,
          10,
          index * STD.COL_HEIGHT + 40,
          STD.COL_WIDTH,
          STD.COL_HEIGHT,
          'colCell'
        )

        // colCells[v + col.id].isColumn = true;
        result.columnCells[msg.id + col.id].isColumn = true

        if (!this.labelMap.has(col.name)) {
          this.labelMap.set(col.name, [])
        }
        this.labelMap
          .get(col.name)
          .push({ type: 'column', cell: result.columnCells[msg.id + col.id] })
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
    if (!this.labelMap.has(msg.name)) {
      this.labelMap.set(msg.name, [])
    }
    this.labelMap.get(msg.name).push({ type: 'table', cell: result.stepCell })
    return result
  }

  /**
   * cell 点击选中和搜索选中样式调整
   * @param cell
   * @param type
   */
  resetCellStyle(cell, type = 'select') {
    // searchStyle 搜索样式覆盖之前的样式,
    // 如果有 oldStyle, 就取 oldStyle, 表示当前样式为选中样式
    let bool = false // 是否高亮
    const graph = this.graph
    let normal = cell.oldStyle || cell.searchStyle || cell.getStyle()
    // 点击选中
    if (type === 'select') {
      bool = true
      cell.oldStyle = normal
    } else if (type === 'search') {
      bool = true
      cell.searchStyle = normal
    } else if (type === 'clearSelect') {
      if (cell.searchStyle) {
        bool = true
      }
      cell.oldStyle = null
    } else if (type === 'clearSearch') {
      if (cell.oldStyle) {
        bool = true
      }
      cell.searchStyle = null
    }

    if (bool) {
      if (cell.isColumn) {
        graph.getModel().setStyle(cell, 'selectedColCell')
      } else if (cell.isStep) {
        graph.getModel().setStyle(cell, 'selectedStepCell')
      }
    } else {
      graph.getModel().setStyle(cell, normal)
    }
    if (this.param.showQuestionCount) {
      $('.problem-count').css('display', 'inline-block')
    } else {
      $('.problem-count').css('display', 'none')
    }
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

    this.addCellClickHandler(graph)
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

    $('#step-' + id).click(function (evt) {
      let id = $(evt.target).attr('data-id')
      if (!id) {
        id = ($(evt.target).attr('id') || '').replace('step-', '')
      }
      const fullId = $(evt.target).attr('data-full-id')
      $('#step-' + id).unbind('click')
      const collapsed = self.collapseCell(id)
      self.toggleIcon(id, collapsed)
      evt.stopPropagation()
    })

    return cell.isCollapsed()
  }

  toggleIcon(id, collapsed) {
    if (collapsed) {
      // 显示 plus
      $(`#outer-table-name-${id} .line-cols-plus`).css(
        'display',
        'inline-block'
      )
      $(`#outer-table-name-${id} .line-cols-minus`).css('display', 'none')
    } else {
      // 显示 minus
      $(`#outer-table-name-${id} .line-cols-plus`).css('display', 'none')
      $(`#outer-table-name-${id} .line-cols-minus`).css(
        'display',
        'inline-block'
      )
    }
  }

  toggleProblemCount() {
    // $('.problem-count').css('display', 'none')
  }

  installCollapseHandler(steps) {
    const self = this
    setTimeout(() => {
      for (const v in steps) {
        $('#step-' + v).click(function (evt) {
          $('#step-' + v).unbind('click')
          const collapsed = self.collapseCell(v)
          self.toggleIcon(v, collapsed)
          evt.stopPropagation()
        })
      }
    }, 1000)
  }

  installSelectionHandler(graph) {
    const self = this
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
      if (!highlighted && !isSelectedAlready(cell)) {
        selectedCells.push(cell)
        // cell.oldStyle = cell.getStyle()
        //
        // if (cell.isColumn) {
        //   graph.getModel().setStyle(cell, 'selectedColCell')
        // } else if (cell.isStep) {
        //   graph.getModel().setStyle(cell, 'selectedStepCell')
        // }
        self.resetCellStyle(cell, 'select')
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
            // graph.getModel().setStyle(cell, cell.oldStyle)
            self.resetCellStyle(cell, 'clearSelect')
          }
          selectedCells.length = 0

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
    style[mxConstants.STYLE_FILLCOLOR] = '#B7DBFF'
    style[mxConstants.STYLE_ROUNDED] = 1
    style[mxConstants.STYLE_ARCSIZE] = 1
    style[mxConstants.STYLE_MOVABLE] = 1
    style[mxConstants.STYLE_FOLDABLE] = 1
    style[mxConstants.STYLE_STROKECOLOR] = 'gray'
    style[mxConstants.STYLE_RESIZABLE] = 0
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE
    graph.getStylesheet().putCellStyle('stepCell', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = '#E0EFF1'
    graph.getStylesheet().putCellStyle('reportCell', style)

    // 指标
    let indexStyle = mxUtils.clone(style)
    indexStyle[mxConstants.STYLE_FILLCOLOR] = '#FBEBCB'
    graph.getStylesheet().putCellStyle('indexCell', indexStyle)

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
    style[mxConstants.STYLE_FILLCOLOR] = '#647EBE'
    style[mxConstants.STYLE_FONTCOLOR] = '#fff'
    style[mxConstants.STYLE_OVERFLOW] = 'hidden'
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP
    // 数据库顶部 高度
    style[mxConstants.STYLE_STARTSIZE] = 80

    graph.getStylesheet().putCellStyle('modelCell', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = '#ff7c61'
    style[mxConstants.STYLE_STARTSIZE] = 80 // 数据库/schema 顶部信息 高度
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
      // const scale = source.width / source.unscaledWidth
      let scale = graph.getView().scale

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

    style = mxUtils.clone(graph.getStylesheet().getDefaultEdgeStyle())
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.DatablauStyle
    // style[mxConstants.STYLE_EDGE] = mxEdgeStyle.SegmentConnector
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
    root.on('click', '.svg-step-name', e => {
      let id = $(e.target).attr('data-id')
      const fullId = $(e.target).attr('data-full-id')

      let type = 'TABLE'
      if (id && id.indexOf('report-') !== -1) {
        type = 'REPORT'
        id = id.replace('report-', '')
      }
      // 指标
      if (!id || id.includes('metrics')) {
        return
      }
      if (this.param.originType === 'REPORT') {
        let skipType = 'table'
        let query = {
          objectId: Number.parseInt(id),
        }
        if (type === 'REPORT') {
          skipType = 'report'
          query = {
            id: Number.parseInt(id),
          }
        }

        $this.$skip2(
          {
            name: skipType,
            query: query,
          },
          'dam'
        )
      } else {
        // 原本调用方法, 触发全局事件, 监听器在父组件, 没有全局监听
        if (fullId.includes('dam-')) {
          if (type === 'REPORT') {
            $this.$skip2({
              name: 'report',
              query: {
                reportId: Number.parseInt(id),
              },
            })
          } else {
            $this.$bus.$emit('jumpToObject', {
              type: type,
              object: { objectId: Number.parseInt(id) },
            })
          }
        } else if (fullId.includes('ddm-')) {
          $this.$bus.$emit('cannotJumpToObject', '无法跳转到设计模型中的表')
        } else {
          const objId = $(e.target).attr('data-obj-id')
          if (objId) {
            $this.$bus.$emit('jumpToObject', {
              type: 'TABLE',
              object: { objectId: Number.parseInt(objId) },
            })
          } else {
            $this.$bus.$emit(
              'cannotJumpToObject',
              '未检测到对应的元数据，请绑定后重试'
            )
          }
        }
      }
    })
  }
}

function setPopupMenu(graph) {
  // // Configures automatic expand on mouseover
  // graph.popupMenuHandler.autoExpand = true

  // Installs context menu
  // 鼠标右键菜单
  graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
    if (cell && cell.edge && cell.id && line2FileMap[cell.id]) {
      let lineData = line2FileMap[cell.id]
      let data = lineData
      if (data && data.properties && data.properties.lineageFiles) {
        data = data.properties.lineageFiles
      } else {
        data = ''
      }
      try {
        data = JSON.parse(data)
      } catch (e) {
        console.log(e)
      }
      if (data && Array.isArray(data)) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        data.forEach(item => {
          menu.addItem(item.name, null, function () {
            if (item.fileName) {
              let url = `${baseUrl}lineageGraph?id=${
                item.id
              }&filename=${encodeURIComponent(
                item.name
              )}&fileName=${encodeURIComponent(item.fileName)}`
              if (item.username === $this.$user.username) {
                url += '&writable=true'
              }
              window.open(url, '_blank')
            } else {
              // 存储过程 函数
              $this.$skip2({
                name: 'table',
                query: { objectId: item.id },
              })
            }
          })
        })
      }
    }

    // demo
    // https://gist.github.com/davidjgraph/6543073
    // menu.addItem('Item 1', null, function () {
    //   alert('Item 1')
    // })
    //
    // menu.addItem('Item 2', null, function () {
    //   alert('Item 2')
    // })
    //
    // menu.addSeparator()
    //
    // var submenu1 = menu.addItem('Submenu 1', null, null)
    //
    // menu.addItem(
    //   'Subitem 1',
    //   null,
    //   function () {
    //     alert('Subitem 1')
    //   },
    //   submenu1
    // )
    // menu.addItem(
    //   'Subitem 1',
    //   null,
    //   function () {
    //     alert('Subitem 2')
    //   },
    //   submenu1
    // )
  }
}

export default DrawGraph
