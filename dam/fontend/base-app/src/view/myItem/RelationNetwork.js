import HTTP from '../../http/main'
import vis from 'vis'
class RelationNetwork {
  constructor({ container, data, vThis }) {
    this.container = container
    this.data = data
    this.network = null
    this.vThis = vThis
  }

  start() {
    this.getData()
  }

  getData() {
    HTTP.getTableRelation({
      objectId: this.data.objectId,
      successCallback: res => {
        this.handleData(res)
        this.initEventListener()
      },
    })
  }

  initEventListener() {
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

    this.network.on('click', params => {
      if (params.nodes.length === 0 && params.edges.length === 0) {
        // when click vacant part.
        this.removeDetail()
      } else if (params.nodes.length === 1) {
        // when click one node.
        this.showNodeDetail(params)
      } else if (params.edges.length === 1) {
        // when click one edge.
        this.showEdgeDetail(params)
      }
    })
  }

  removeDetail() {
    this.vThis.hideTable()
  }

  showNodeDetail(params) {
    const getColumnId = item => {
      return item[Object.keys(JSON.parse(item))[0]].Id
    }
    const getColumnName = item => {
      return Object.keys(JSON.parse(item))[0]
    }
    const tableData = []
    const nodeId = params.nodes[0]
    if (nodeId === this.data.objectId) {
      this.removeDetail()
      return
    }
    const allNodes = this.nodes.get({ returnType: 'Object' })
    const selectedNode = allNodes[nodeId]
    selectedNode.relationJson.forEach(item => {
      tableData.push({
        sourceTable: item.sourceParent
          ? selectedNode.label
          : this.data.physicalName,
        targetTable: item.sourceParent
          ? this.data.physicalName
          : selectedNode.label,
        sourceColumn: getColumnName(item.source),
        targetColumn: getColumnName(item.target),
      })
    })
    this.vThis.showTable(tableData)
  }

  showEdgeDetail(params) {
    const edgeId = params.edges[0]
    const allEdges = this.edges.get({ returnType: 'Object' })
    const selectedEdge = allEdges[edgeId]
    const one = selectedEdge.from
    const other = selectedEdge.to
    if (one === this.data.objectId) {
      this.showNodeDetail({ nodes: [other] })
    } else {
      this.showNodeDetail({ nodes: [one] })
    }
  }

  handleData(rawData) {
    const tableData = [
      {
        label: this.data.physicalName,
        color: '#d54f82',
        id: this.data.objectId,
      },
    ]
    const tableRelationData = []
    const relations = rawData.relatedTableByFk
    relations.forEach(item => {
      const tableItem = {}
      tableItem.id = item.objectId
      tableItem.label = item.physicalName
      tableItem.relationJson = item.relationships
      let hasFrom = false
      let hasTo = false
      item.relationships.forEach(r => {
        if (r.sourceParent) {
          hasFrom = true
        } else {
          hasTo = true
        }
      })
      if (hasFrom && hasTo) {
        tableRelationData.push({
          from: item.objectId,
          to: this.data.objectId,
          arrows: 'both',
        })
      } else if (hasFrom) {
        tableRelationData.push({
          from: item.objectId,
          to: this.data.objectId,
          arrows: 'to',
        })
      } else if (hasTo) {
        tableRelationData.push({
          from: this.data.objectId,
          to: item.objectId,
          arrows: 'to',
        })
      }

      tableData.push(tableItem)
    })

    this.nodes = new vis.DataSet(tableData)
    this.edges = new vis.DataSet(tableRelationData)
    this.options = {
      nodes: {
        shape: 'dot',
        size: 15,
        chosen: {
          node: (values, id, selected, hovering) => {
            if (id !== this.data.objectId) {
              values.size = 25
            }
            // values.borderDashes = true;
          },
          label: (values, id, selected, hovering) => {
            values.mod = 'bold'
            values.size = 20
          },
        },
      },
      edges: {
        width: 2,
        /* color:{
          inherit:'both'
        }, */
      },
      interaction: { hover: true },
    }
    this.network = new vis.Network(
      this.container,
      { nodes: this.nodes, edges: this.edges },
      this.options
    )
  }

  other() {
    const getId = item => {}
    const getColumnName = item => {
      return Object.keys(item)[0]
    }
    item.relationships.forEach(r => {
      const source = JSON.parse(r.source)
      const target = JSON.parse(r.target)
      tableItem.relations += getColumnName(source)
      tableItem.relations += '=>'
      tableItem.relations += getColumnName(target)
      if (r.sourceParent) {
        console.log('外表中的该字段是主键')
      } else {
        console.log('本表中的该字段是主键')
      }
    })
  }
}
export default RelationNetwork
