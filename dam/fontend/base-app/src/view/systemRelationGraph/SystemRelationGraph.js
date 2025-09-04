import _ from 'lodash'

if (typeof mxGraph === 'undefined') {
  $(document.body).append(
    '<script src="./static/libs/mxgraph/mxClient.min.js"></script>'
  )
}

function myGraph(container) {
  mxGraph.call(this, container)
}
myGraph.prototype = new mxGraph()
myGraph.prototype.constructor = myGraph
myGraph.prototype.expandedImage = ''

class SystemRelationGraph {
  constructor(container, data, param, outlineContainer, outerScope) {
    this.container = container
    this.param = param
    this.data = data
    this.outlineContainer = outlineContainer
    this.outerScope = outerScope
  }

  start() {
    this.prepareSystemLineageData()
    this.graph = this.buildGraph()
    this.initStyles(this.graph)
    this.drawGraph(this.graph)
  }

  buildGraph() {
    const self = this
    var graph = new myGraph(self.container)
    graph.setCellsEditable(false)
    graph.setAllowDanglingEdges(false)
    graph.setDisconnectOnMove(false)
    graph.setEnabled(true)
    graph.htmlLabels = true
    graph.setPanning(true)
    graph.isCellFoldable = function (cell) {
      return false
    }

    graph.isCellSelectable = function (cell) {
      if (cell.isEdge()) {
        return false
      } else {
        return true
      }
    }

    graph.addListener(mxEvent.CLICK, (sender, evt) => {
      const cell = evt.getProperty('cell')
      if (cell) {
        if (cell.isEdge() && cell['@data']) {
          const data = cell['@data']
          self.outerScope
            .$confirm(
              '是否跳转查看"' +
                data.srcName +
                '"到"' +
                data.dstName +
                '"的血缘关系？',
              '跳转',
              {
                confirmButtonText: '跳转',
                type: 'warning',
              }
            )
            .then(() => {
              self.outerScope.$router.push({ name: 'lineage', query: data })
            })
        }
      }
      evt.consume()
    })

    if (self.outlineContainer) {
      self.outline = new mxOutline(graph, self.outlineContainer)
    }
    return graph
  }

  drawGraph(graph) {
    const self = this

    const parent = graph.getDefaultParent()
    const model = graph.getModel()

    model.beginUpdate()
    try {
      var sysCells = {}
      for (var s in self.systems) {
        const sys = self.systems[s]
        sysCells['sys-' + s] = graph.insertVertex(
          parent,
          'sys-' + s,
          sys.name,
          0,
          0,
          150,
          150,
          'databaseCell'
        )
      }

      var addedLine = {}
      self.systemLines.forEach(line => {
        const srcCell = sysCells['sys-' + line.src]
        const dstCell = sysCells['sys-' + line.dst]

        if (srcCell && dstCell) {
          if (addedLine[srcCell.getId() + '/' + dstCell.getId()] !== true) {
            const edge = graph.insertEdge(
              parent,
              null,
              '',
              srcCell,
              dstCell,
              'sysEdge'
            )
            edge['@data'] = {
              src: line.src,
              dst: line.dst,
              srcName: srcCell.value,
              dstName: dstCell.value,
            }
            addedLine[srcCell.getId() + '/' + dstCell.getId()] = true
          }
        }
      })

      var layout = new mxHierarchicalLayout(graph, 'west')
      layout.execute(parent)
    } finally {
      var morph = new mxMorphing(graph, 20, 1.2, 20)
      morph.addListener(mxEvent.DONE, () => {
        model.endUpdate()
        self.moveToCenterGraph(graph, self.container)
      })
      morph.startAnimation()
    }
  }

  relayout() {
    var graph = this.graph
    graph.getModel().beginUpdate()
    try {
      var layout = new mxHierarchicalLayout(graph, 'west')
      layout.execute(graph.getDefaultParent())
    } finally {
      var morph = new mxMorphing(graph, 20, 1.2, 20)
      morph.addListener(mxEvent.DONE, () => {
        graph.getModel().endUpdate()
        self.moveToCenterGraph(graph, self.container)
      })
      morph.startAnimation()
    }
  }

  moveToCenterGraph(graph, outContainer) {
    var boundingBox = graph.view.getGraphBounds()
    var container = $(outContainer)
    var height = container.height()
    var width = container.width()
    var dx = 0 - boundingBox.x + 20
    var dy = 0 - boundingBox.y + 20
    if (width > boundingBox.width) {
      dx = (width - boundingBox.width) / 2
    }

    if (height > boundingBox.height) {
      dy = (height - boundingBox.height) / 2
    }
    graph.view.scaleAndTranslate(graph.view.getScale(), dx, dy)
  }

  prepareSystemLineageData() {
    var steps = this.data.steps
    var lines = this.data.lines

    this.systemSteps = {}
    this.systems = {}
    var stepToSystemMap = {}

    for (var v in steps) {
      const step = steps[v]
      const catId = step.properties.modelCategoryId
      const catName = step.properties.modelCategoryName
      if (!this.systemSteps[catId]) {
        this.systemSteps[catId] = []
        this.systems[catId] = {
          name: catName,
          id: catId,
        }
      }
      this.systemSteps[catId].push(step)
      stepToSystemMap[v] = catId
    }

    this.systemLines = []

    lines.forEach(line => {
      const srcStep = line.sourceStepId
      const dstStep = line.targetStepId

      const srcCatId = stepToSystemMap[srcStep]
      const dstCatId = stepToSystemMap[dstStep]

      if (srcCatId && dstCatId) {
        this.systemLines.push({ src: srcCatId, dst: dstCatId })
      }
    })
  }

  initStyles(graph) {
    var style = mxUtils.clone(graph.getStylesheet().getDefaultVertexStyle())
    style[mxConstants.STYLE_FILLCOLOR] = '#049DE7'
    style[mxConstants.STYLE_FONTSIZE] = 20
    style[mxConstants.STYLE_FONTCOLOR] = '#fff'
    style[mxConstants.STYLE_STROKECOLOR] = '#dfdfdf'
    style[mxConstants.STYLE_WHITE_SPACE] = 'wrap'
    style[mxConstants.STYLE_PERIMETER_SPACING] = 3
    style[mxConstants.STYLE_STROKEWIDTH] = 8
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE
    graph.getStylesheet().putCellStyle('databaseCell', style)

    style = mxUtils.clone(graph.getStylesheet().getDefaultEdgeStyle())
    style[mxConstants.STYLE_MOVABLE] = 0
    style[mxConstants.STYLE_CURVED] = true
    style[mxConstants.STYLE_STROKEWIDTH] = 4
    style[mxConstants.STYLE_NOEDGESTYLE] = 0
    style[mxConstants.STYLE_MOVABLE] = 0
    style[mxConstants.STYLE_STROKECOLOR] = '#7f7f7f'
    graph.getStylesheet().putCellStyle('sysEdge', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_STROKECOLOR] = 'red'
    style[mxConstants.STYLE_STROKEWIDTH] = 3
    graph.getStylesheet().putCellStyle('selectedEdge', style)
  }
}

export default SystemRelationGraph
