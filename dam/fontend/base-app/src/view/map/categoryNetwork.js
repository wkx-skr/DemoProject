import vis from 'vis'

let self = null
let highlightActive = false
class CategoryNetwork {
  constructor({ container, vThis }) {
    this.container = container
    this.zoneMapKey = 0
    this.zoneMapKeys = []
    this.colors = ['#1693F1', '#d54f82', '#f7ad29', '#08cbc5']
    const generateColor = () => {
      return Math.floor(Math.random() * 100) + 126
    }
    for (let i = 0; i < 100; i++) {
      this.colors.push(
        'rgb(' +
          generateColor() +
          ',' +
          generateColor() +
          ',' +
          generateColor() +
          ')'
      )
    }
    self = vThis
    self.colors = this.colors
    this.zoneMap = {}
    this.zoneCnt = {}
    this.x = 0
    this.y = 0
    this.createxys = []
    this.options = {}
    this.network = null
    this.clickTimeout = []
  }

  start() {
    this.getCategories()
  }

  getCategories() {
    this.modelCategories = _.cloneDeep(self.$modelCategories)
    this.getCount()
  }

  getCount() {
    this.getSystemCall()
  }

  getSystemCall() {
    self.$http
      .get(self.$meta_url + '/service/systemcall/overview')
      .then(res => {
        this.systemCallOverview = res.data
        self.systemCallOverview = res.data
        this.getLineage()
      })
      .catch(e => {
        self.$showFailure(e)
      })
  }

  getLineage() {
    self.$http
      .get(self.$meta_url + '/service/lineage/overview')
      .then(res => {
        this.lineageOverview = res.data
        this.handleOverviewData()
        this.initData(() => {
          this.initOption()
          this.draw()
        })
      })
      .catch(e => {
        self.$showFailure(e)
        this.initData(() => {
          this.initOption()
          this.draw()
        })
      })
  }

  handleOverviewData() {
    this.lineageData = {}
    const steps = this.lineageOverview.steps
    const lines = this.lineageOverview.lines
    const stepToStep = {}
    const edges = []

    const systemCall = {}
    this.systemCallOverview.forEach(item => {
      systemCall[item.dstSystemId + ';' + item.srcSystemId] = {
        from: item.dstSystemId,
        to: item.srcSystemId,
        arrows: 'to',
        type: 'call',
      }
    })
    lines.forEach((item, index) => {
      const fullStr = item.sourceStepId + item.targetStepId
      if (!stepToStep.hasOwnProperty(fullStr)) {
        stepToStep[fullStr] = true
        const from = steps[item.sourceStepId].properties.modelCategoryId
        const to = steps[item.targetStepId].properties.modelCategoryId
        const edge = {
          from: from,
          to: to,
          type: 'lineage',
          arrows: {
            to: true,
          },
        }
        if (systemCall.hasOwnProperty(from + ';' + to)) {
          delete systemCall[from + ';' + to]
          edge.arrows.to = { enabled: true }
          edge.type = 'both'
        }
        edges.push(edge)
      }
    })
    for (const i in systemCall) {
      edges.push(systemCall[i])
    }

    this.lineageData.edges = edges
  }

  redraw() {
    this.clearXY(() => {
      this.preDraw()
    })
  }

  initData(callback) {
    const arr = []
    const promises = []
    const positionMap = new Map()
    this.modelCategories.forEach(item => {
      const url = self.$meta_url + '/service/graph/position/lists/owner'
      const body = {
        itemId: item.categoryId,
        itemType: 'dataMap',
      }
      const promise = () => {
        return new Promise((resolve, reject) => {
          self.$http
            .post(url, body)
            .then(res => {
              try {
                const position = JSON.parse(res.data[0].nodePosition)
                positionMap.set(res.data[0].nodeId, position)
              } catch (e) {
                console.error('wrong node position data', res.data)
              }
              resolve()
            })
            .catch(e => {
              resolve()
            })
        })
      }
      promises.push(promise())
    })
    Promise.all(promises).then(() => {
      this.modelCategories.forEach(item => {
        if (!item.zone) {
          item.zone = self.$t('meta.map.noZone')
        }
        if (!this.zoneMap.hasOwnProperty(item.zone)) {
          this.zoneMap[item.zone] = Object.keys(this.zoneMap).length
          this.zoneCnt[item.zone] = 0
          this.zoneMapKeys.push({ name: item.zone })
        }
        this.zoneCnt[item.zone]++
        arr.push({
          id: item.categoryId,
          group: this.zoneMap[item.zone],
          label:
            item.categoryName +
            '(' +
            self.$modelCategoriesDetailsMap[item.categoryId]
              .categoryAbbreviation +
            ')',
          detail: _.clone(item),
          size: self.$modelCategoriesDetailsMap[item.categoryId].ballSize,
          x: positionMap.get(String(item.categoryId))
            ? positionMap.get(String(item.categoryId)).x
            : null,
          y: positionMap.get(String(item.categoryId))
            ? positionMap.get(String(item.categoryId)).y
            : null,
        })
      })
      this.zoneMapKey++
      self.$utils.sort.sortConsiderChineseNumber(this.zoneMapKeys)
      self.$bus.$emit('gotLegend', {
        names: this.zoneMapKeys,
        colors: this.colors,
        zoneCnt: this.zoneCnt,
        zoneMap: this.zoneMap,
      })
      this.nodes = new vis.DataSet(arr)
      // console.log(this.nodes);
      /* this.edges = new vis.DataSet([{from:3,to:15,dashes:true,arrows:'from,to'}]); */
      this.edges = this.lineageData.edges
      this.vEdges = new vis.DataSet(this.edges)
      this.data = {
        nodes: this.nodes,
        edges: this.vEdges,
      }
      if (callback) {
        callback()
      }
    })
  }

  initOption() {
    this.options = {
      nodes: {
        shape: 'dot',
        font: {
          size: 16,
          color: '#ccc',
        },
        chosen: {
          node: (values, id, selected, hovering) => {
            values.size += 5
            values.borderDashes = true
          },
          label: (values, id, selected, hovering) => {
            values.mod = 'bold'
            values.size = 20
          },
        },
      },
      edges: {
        width: 5,
        dashes: true,
        color: {
          inherit: 'both',
        },
        arrowStrikethrough: false,
      },
      groups: {
        grey: {
          color: 'rgba(60,60,60,0.95)',
        },
      },
      interaction: { hover: true },
      manipulation: {
        enabled: false,
      },
      physics: {
        enabled: false,
        barnesHut: {
          gravitationalConstant: -2000,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 1,
        },
      },
      layout: {},
    }
    // if (localStorage.getItem('physicsSwitch') === 'true') {
    //   this.options.physics = {
    //     stabilization: false,
    //     barnesHut: {
    //       gravitationalConstant: -3000,
    //       springConstant: 0.04,
    //       springLength: 95,
    //     },
    //     enabled: false,
    //   }
    // }
    this.colors.forEach((item, index) => {
      this.options.groups[index] = { color: item }
    })
  }

  draw() {
    const container = this.container
    this.network = new vis.Network(container, this.data, this.options)
    // setTimeout(() => {
    //   this.options.physics.enabled = false
    //   this.network.setOptions()
    //   this.nodes.update()
    // }, 1000)

    this.initEventListeners()
  }

  preDraw() {
    this.initData(() => {
      this.initOption()
      const container = this.container
      this.options.physics.enabled = true

      this.network = new vis.Network(container, this.data, this.options)
      $(this.container).hide()
      this.network.on('stabilized', () => {
        $(this.container).show()
        this.updateXY({ nodes: [true] }, () => {
          this.network.destroy()
          this.options.physics.enabled = false
          setTimeout(() => {
            this.initData(() => {
              this.initOption()
              this.draw()
            })
          })
        })
      })
    })
  }

  initEventListeners() {
    this.network.on('hoverNode', () => {
      this.container.style.cursor = 'pointer'
    })
    this.network.on('hoverEdge', param => {
      this.container.style.cursor = 'pointer'
    })
    this.network.on('blurNode', () => {
      this.container.style.cursor = ''
    })
    this.network.on('blurEdge', () => {
      this.container.style.cursor = ''
    })

    this.network.on('doubleClick', params => {
      this.clickTimeout.forEach(item => {
        clearTimeout(item)
      })
      this.clickTimeout = []
      self.removeDetail()
      this.neighbourhoodHighlight(params)
      this.keyword = ''
      if (params.nodes.length === 1) {
        // when click one node
        self.handleEntityClick({ catId1: params.nodes[0] })
      } else if (params.edges.length === 1) {
        const edgeId = params.edges[0]
        let catId1, catId2
        this.edges.forEach(edge => {
          if (edge.id === edgeId) {
            catId1 = edge.from
            catId2 = edge.to
          }
        })
        self.handleEntityClick({ catId1: catId1, catId2: catId2 })
      }
    })
    this.network.on('dragEnd', params => {
      let arr = {}
      self.toolbarKey++
      arr = params
      this.updateXY(arr)
    })
    this.network.on('click', params => {
      self.toolbarKey++
      const timeout = setTimeout(() => {
        this.neighbourhoodHighlight(params)
        if (params.nodes.length === 0 && params.edges.length === 0) {
          // when click vacant part.
          self.removeDetail()
        } else if (params.nodes.length === 1) {
          // when click one node.
          this.showNodeDetail(params)
        } else if (params.edges.length === 1) {
          // when click one edge.
          this.showEdgeDetail(params)
        }
      }, 300)
      this.clickTimeout.push(timeout)
    })
  }

  updateXY(arr, callback) {
    // 如果拖动画布，则return，不进行处理
    if (!arr.nodes[0]) {
      return
    }
    const url = self.$meta_url + '/service/graph/position/'
    // 给出画布的比例和尺寸
    const positions = this.network.getPositions()
    const promises = []
    Object.keys(positions).forEach(nodeId => {
      const position = positions[nodeId]
      const body = {
        nodeId: nodeId,
        nodePosition: JSON.stringify(position),
        itemId: nodeId,
        itemType: 'dataMap',
      }
      const promise = () => {
        return new Promise(resolve => {
          self.$http
            .post(url, body)
            .then(() => {
              resolve()
            })
            .catch(() => {
              resolve()
            })
        })
      }
      promises.push(promise())
    })
    Promise.all(promises).then(() => {
      if (callback) {
        callback()
      }
    })
  }

  clearXY(callback) {
    const url = self.$meta_url + '/service/graph/position/'
    // 给出画布的比例和尺寸
    const positions = this.network.getPositions()
    const promises = []
    Object.keys(positions).forEach(nodeId => {
      const position = {
        x: null,
        y: null,
      }
      const body = {
        nodeId: nodeId,
        nodePosition: JSON.stringify(position),
        itemId: nodeId,
        itemType: 'dataMap',
      }
      const promise = () => {
        return new Promise(resolve => {
          self.$http
            .post(url, body)
            .then(() => {
              resolve()
            })
            .catch(() => {
              resolve()
            })
        })
      }
      promises.push(promise())
    })
    Promise.all(promises).then(() => {
      this.network.destroy()
      if (callback) {
        callback()
      }
    })
  }

  findCategory(id) {
    const options = {
      scale: 1,
      offset: { x: -10, y: 0 },
      animation: {
        duration: 500,
        easingFunction: 'easeInOutQuad',
      },
    }
    this.network.focus(id, options)
    this.neighbourhoodHighlight({ nodes: [id], degrees: 1 })
  }

  focusEdgeByNodes({ from, to }) {
    if (!from || !to) {
      return
    }
    const allEdges = this.vEdges.get({ returnType: 'Object' })
    for (const edge in allEdges) {
      const obj = allEdges[edge]

      if (obj.type !== 'lineage' && obj.from == from && obj.to == to) {
        this.neighbourhoodHighlight({ nodes: [], edges: [edge] })
        this.showEdgeDetail({ nodes: [], edges: [edge] })
      }
    }
  }

  handleLegendClick(groupId) {
    const allNodes = this.nodes.get({ returnType: 'Object' })
    const network = this.network
    // mark all nodes as hard to read.
    for (const nodeId in allNodes) {
      if (allNodes[nodeId].group !== 'grey') {
        allNodes[nodeId].hiddenGroup = allNodes[nodeId].group
        allNodes[nodeId].group = 'grey'
      }
    }
    // transform the object into an array
    const updateArray = []
    for (const nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        const node = allNodes[nodeId]
        if (node.hiddenGroup === groupId) {
          node.group = node.hiddenGroup
          delete node.hiddenGroup
        }
        updateArray.push(allNodes[nodeId])
      }
    }
    const positions = this.network.getPositions()
    updateArray.forEach(node => {
      node.x = positions[node.id].x
      node.y = positions[node.id].y
    })
    this.nodes.update(updateArray)
    highlightActive = true
  }

  removeNeighbourhoodHighlight() {
    this.neighbourhoodHighlight({ nodes: [], edges: [] })
  }

  neighbourhoodHighlight(params) {
    // if something is selected:
    const allNodes = this.nodes.get({ returnType: 'Object' })
    const network = this.network

    if (params.nodes.length > 0 || params.edges.length > 0) {
      // mark all nodes as hard to read.
      for (const nodeId in allNodes) {
        if (allNodes[nodeId].group !== 'grey') {
          allNodes[nodeId].hiddenGroup = allNodes[nodeId].group
          allNodes[nodeId].group = 'grey'
        }
      }
    }
    if (params.nodes.length === 0 && params.edges.length > 0) {
      highlightActive = true
      const selectedEdge = params.edges[0]
      const connectedNodes = network.getConnectedNodes(selectedEdge)
      // all first degree nodes get their own color and their label back
      for (let i = 0; i < connectedNodes.length; i++) {
        const node = allNodes[connectedNodes[i]]
        if (node.group === 'grey') {
          const tmp = node.group
          node.group = node.hiddenGroup
          node.hiddenGroup = tmp
        }
      }
    } else if (params.nodes.length > 0) {
      highlightActive = true
      let i, j
      const selectedNode = params.nodes[0]
      this.selectedNode = allNodes[selectedNode]
      const degrees = 2
      if (params.degrees) {
        //        degrees = params.degress;
      }
      const connectedNodes = network.getConnectedNodes(selectedNode)
      let allConnectedNodes = []

      // get the second degree nodes
      for (i = 1; i < degrees; i++) {
        for (j = 0; j < connectedNodes.length; j++) {
          allConnectedNodes = allConnectedNodes.concat(
            network.getConnectedNodes(connectedNodes[j])
          )
        }
      }
      // all second degree nodes get a different color and their label back
      for (i = 0; i < allConnectedNodes.length; i++) {}

      // all first degree nodes get their own color and their label back
      for (i = 0; i < connectedNodes.length; i++) {
        const node = allNodes[connectedNodes[i]]
        const tmp = node.group
        node.group = node.hiddenGroup
        node.hiddenGroup = tmp
      }

      // the main node gets its own color and its label back.
      if (allNodes[selectedNode].hiddenGroup !== 'grey') {
        allNodes[selectedNode].group = allNodes[selectedNode].hiddenGroup
      }
    } else if (highlightActive === true) {
      // reset all nodes
      for (const nodeId in allNodes) {
        if (
          allNodes[nodeId].group === 'grey' &&
          allNodes[nodeId].hiddenGroup !== 'grey'
        ) {
          allNodes[nodeId].group = allNodes[nodeId].hiddenGroup
          allNodes[nodeId].hiddenGroup = undefined
        }
      }
      highlightActive = false
    }

    // transform the object into an array
    const updateArray = []
    for (const nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId])
      }
    }

    // update real position changed
    const positions = network.getPositions()
    updateArray.forEach(node => {
      node.x = positions[node.id].x
      node.y = positions[node.id].y
    })
    this.nodes.update(updateArray)
  }

  showNodeDetail(params) {
    let id = params.nodes[0]
    if (id[0] === 'c') {
      id = id.substr(1)
    }
    self.showCategoryDetail(this.selectedNode.detail)
  }

  showEdgeDetail(params) {
    const onlyCall = arguments[1]
    const id = params.edges[0]
    self.showEdgeDetail({ edges: this.edges, id: id })
  }
}
export default CategoryNetwork
