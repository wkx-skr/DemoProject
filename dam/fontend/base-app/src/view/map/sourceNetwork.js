import vis from 'vis'
let self = null
const highlightActive = false
class SourceNetwork {
  constructor({ container, vThis, data, colors }) {
    this.data = data
    this.rawData = {}
    this.container = container
    self = vThis
    this.clickTimeout = []

    this.nodes = []
    this.edges = []
    this.vNodes = undefined
    this.vEdges = undefined
    this.options = null
    this.network = null
    this.groupMap = {}
    this.sourceMap = {}
    this.categoryMap = {}
    this.lang = 'en'
    this.colors = colors
  }

  destroy() {
    if (this.network) {
      this.network.destroy()
    }
  }

  start() {
    const { catId1, catId2 } = this.data
    this.findSystemCall(catId1, catId2, () => {
      this.getCategoryLineage(catId1, catId2)
    })
  }

  findSystemCall(from, to, callback) {
    const requestUrl = self.$meta_url + '/service/systemcall/search'
    const requestBody = {
      pageSize: 500,
      currentPage: 0,
      dstModelCategoryIds: [from],
    }
    if (to) {
      requestBody.srcModelCategoryIds = [to]
      self.$http
        .post(requestUrl, requestBody)
        .then(res => {
          this.rawData.call = res.data.content
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          self.$showFailure(e)
        })
    } else {
      self.$http
        .post(requestUrl, requestBody)
        .then(res => {
          this.rawData.call = []
          this.rawData.call = this.rawData.call.concat(res.data.content)
          requestBody.srcModelCategoryIds = [from]
          delete requestBody.dstModelCategoryIds
          self.$http
            .post(requestUrl, requestBody)
            .then(res => {
              if (!this.rawData.call || this.rawData.call.length === 0) {
                this.rawData.call = []
              }
              this.rawData.call = this.rawData.call.concat(res.data.content)
              if (callback) {
                callback()
              }
            })
            .catch(e => {
              self.$showFailure(e)
            })
        })
        .catch(e => {
          self.$showFailure(e)
        })
    }
  }

  getCategoryLineage(catId, catId2) {
    let requestUrl = self.$meta_url + '/lineage/relationships?catId=' + catId
    if (catId2) {
      requestUrl += '&targetCatId=' + catId2
    }
    self.$http
      .get(requestUrl)
      .then(res => {
        this.rawData.rawData = res.data
        if (Object.keys(res.data.endpoints).length === 0) {
          this.rawData.rawData.catId = catId
        }
        this.rawData.zoneMap = this.zoneMap
        this.rawData.colors = this.colors
        this.prepareData()
      })
      .catch(e => {
        this.rawData.rawData = {
          endpoints: {},
          relationships: [],
          catId: catId,
        }
        self.$showFailure(e)
      })
  }

  prepareData() {
    this.endpoints = this.rawData.rawData.endpoints
    this.relationships = this.rawData.rawData.relationships
    let i = -1
    if (Object.keys(this.endpoints).length === 0) {
      const catId = this.rawData.rawData.catId
      this.nodes.push({
        id: 'c' + catId,
        label:
          self.$modelCategoriesDetailsMap[catId].categoryName +
          '(' +
          self.$modelCategoriesDetailsMap[catId].categoryAbbreviation +
          ')',
        detail: self.$modelCategoriesDetailsMap[catId],
        type: 'category',
        group: 0,
        size: self.$modelCategoriesDetailsMap[catId].ballSize,
      })
      this.categoryMap[catId] = true
    }

    const edgeSet = new Set()
    this.relationships.forEach(r => {
      edgeSet.add(r.first)
      edgeSet.add(r.second)
    })

    for (const k in this.endpoints) {
      const v = this.endpoints[k]

      if (!this.categoryMap.hasOwnProperty(v.catId)) {
        i++
        this.categoryMap[v.catId] = true
        this.groupMap[v.catId] = i
        this.nodes.push({
          id: 'c' + v.catId,
          label:
            v.cat +
            '(' +
            self.$modelCategoriesDetailsMap[v.catId].categoryAbbreviation +
            ')',
          detail: self.$modelCategoriesDetailsMap[v.catId],
          type: 'category',
          group: i,
          size: self.$modelCategoriesDetailsMap[v.catId].ballSize,
        })
      }
      if (!this.sourceMap.hasOwnProperty(v.logicalModelId)) {
        this.sourceMap[v.logicalModelId] = true
        if (v.logicalModel) {
          this.nodes.push({
            id: 'm' + v.logicalModelId,
            label: v.logicalModel,
            detail: v,
            type: 'model',
            group: i,
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf1c0',
              size: 25,
              color: this.colors[this.groupMap[v.catId]],
            },
          })
          this.edges.push({
            from: 'c' + v.catId,
            to: 'm' + v.logicalModelId,
            dashes: false,
            type: 'column',
            length: 0.5,
            width: 1,
            color: '#CCC',
          })
        }
      }
      if (!v.tabAlias) {
        v.tabAlias = v.tab
      }
    }
    const relationSet = new Set()
    const points = this.endpoints
    this.relationships.forEach(r => {
      const modelString =
        points[r.first]?.logicalModelId + ':' + points[r.second]?.logicalModelId
      relationSet.add(modelString)
    })
    relationSet.forEach(r => {
      const first = r.split(':')[0]
      const second = r.split(':')[1]
      this.edges.push({
        from: 'm' + first,
        to: 'm' + second,
        arrows: 'to',
        width: 4,
        dashes: true,
        type: 'lineage',
        length: 100,
      })
    })

    if (this.rawData.call && this.rawData.call.length > 0) {
      const edgeSet = new Set()
      this.rawData.call.forEach(item => {
        let catId = item.calleeModelCategoryId
        if (!this.categoryMap.hasOwnProperty(catId)) {
          i++
          this.groupMap[catId] = i
          this.categoryMap[catId] = true

          this.nodes.push({
            id: 'c' + catId,
            label:
              self.$modelCategoriesDetailsMap[catId].categoryName +
              '(' +
              self.$modelCategoriesDetailsMap[catId].categoryAbbreviation +
              ')',
            detail: self.$modelCategoriesDetailsMap[catId],
            type: 'category',
            group: i,
            size: self.$modelCategoriesDetailsMap[catId].ballSize,
          })
        }
        catId = item.callerModelCategoryId
        if (!this.categoryMap.hasOwnProperty(catId)) {
          i++
          this.groupMap[catId] = i
          this.categoryMap[catId] = true
          this.nodes.push({
            id: 'c' + catId,
            label:
              self.$modelCategoriesDetailsMap[catId].categoryName +
              '(' +
              self.$modelCategoriesDetailsMap[catId].categoryAbbreviation +
              ')',
            detail: self.$modelCategoriesDetailsMap[catId],
            type: 'category',
            group: i,
            size: self.$modelCategoriesDetailsMap[catId].ballSize,
          })
        }
        const to = item.calleeModelCategoryId
        const from = item.callerModelCategoryId

        if (!edgeSet.has(from + ':' + to)) {
          edgeSet.add(from + ':' + to)
          this.edges.push({
            from: 'c' + to,
            to: 'c' + from,
            arrows: 'to',
            width: 3,
            dashes: true,
            type: 'call',
            length: 100,
          })
        }
      })
    }
    this.draw()
  }

  draw() {
    const nodes = new vis.DataSet(this.nodes)
    this.vNodes = nodes
    const edges = new vis.DataSet(this.edges)
    this.vEdges = edges
    const data = {
      nodes: nodes,
      edges: edges,
    }
    const options = {
      nodes: {
        shape: 'dot',
        font: {
          size: 16,
          color: '#ccc',
        },
        chosen: {
          node: (values, id, selected, hovering) => {
            //            values.size = 30;
            values.size += 5
            values.borderDashes = true
          },
          label: (values, id, selected, hovering) => {
            values.mod = 'bold'
            values.size = 20
          },
        },
        mass: 1,
      },
      edges: {
        color: {
          inherit: 'both',
        },
        arrowStrikethrough: false,
      },
      groups: {},
      physics: {
        stabilization: false,
        barnesHut: {
          gravitationalConstant: -3000,
          springConstant: 0.04,
          springLength: 95,
        },
      },

      layout: { randomSeed: 2 },
      interaction: { hover: true },
      manipulation: {
        enabled: true,
      },
    }
    this.colors.forEach((item, index) => {
      options.groups[index] = { color: item }
    })
    this.network = new vis.Network(this.container, data, options)
    this.network.on('hoverNode', () => {
      this.container.style.cursor = 'pointer'
    })
    this.network.on('hoverEdge', param => {
      const allEdges = this.vEdges.get({ returnType: 'Object' })
      const edge = allEdges[param.edge]
      if (edge.type !== 'column') {
        this.container.style.cursor = 'pointer'
      }
    })
    this.network.on('blurNode', () => {
      this.container.style.cursor = ''
    })
    this.network.on('blurEdge', () => {
      this.container.style.cursor = ''
    })
    this.network.on('doubleClick', params => {
      //      console.log(params)
      this.clickTimeout.forEach(item => {
        clearTimeout(item)
      })
      this.clickTimeout = []
      self.removeDetail()
      this.keyword = ''
      if (params.nodes.length === 1) {
        // when click one node
        const id = params.nodes[0]
        const allNodes = this.vNodes.get({ returnType: 'Object' })
        const selectedNode = allNodes[id]
        switch (selectedNode.type) {
          case 'category':
            self.handleEntityClick({ catId1: params.nodes[0].substring(1) })
            break
        }
      } else if (params.edges.length === 1) {
      }
    })
    this.network.on('click', params => {
      self.toolbarKey++
      const timeout = setTimeout(() => {
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

  showNodeDetail(params) {
    const id = params.nodes[0]
    const allNodes = this.vNodes.get({ returnType: 'Object' })
    const selectedNode = allNodes[id]
    switch (selectedNode.type) {
      case 'category':
        self.showCategoryDetail(selectedNode.detail)
        break
      case 'model':
        self.showModelDetail(selectedNode.detail)
        break
      default:
        console.log(selectedNode.type)
        break
    }
  }

  showEdgeDetail(params) {
    const id = params.edges[0]
    const allEdges = this.vEdges.get({ returnType: 'Object' })
    const selectedEdge = allEdges[id] /* console.log(selectedEdge) */
    if (selectedEdge.type === 'call') {
      self.showEdgeDetail({ edges: this.edges, id: id, callOnly: true })
    } else if (selectedEdge.type === 'lineage') {
      let { from, to } = selectedEdge
      if (from.indexOf('m') === 0) {
        from = Number(from.substring(1))
      }
      if (to.indexOf('m') === 0) {
        to = Number(to.substring(1))
      }
      const lineageArr = []
      const { endpoints, relationships } = this.rawData.rawData

      relationships.forEach(v => {
        const fromPoint = endpoints[v.first]
        const toPoint = endpoints[v.second]
        if (
          fromPoint?.logicalModelId === from &&
          toPoint?.logicalModelId === to
        ) {
          lineageArr.push({
            fromTab: fromPoint.tab,
            fromTabAlias: fromPoint.tabAlias,
            fromTabId: fromPoint.tabId,
            toTab: toPoint.tab,
            toTabAlias: toPoint.tabAlias,
            toTabId: toPoint.tabId,
          })
        }
      })
      const allNodes = this.vNodes.get({ returnType: 'Object' })

      self.showModelEdgeDetail({
        from: allNodes[selectedEdge.from],
        to: allNodes[selectedEdge.to],
        lineage: lineageArr,
      })
    }
  }
}
export default SourceNetwork
