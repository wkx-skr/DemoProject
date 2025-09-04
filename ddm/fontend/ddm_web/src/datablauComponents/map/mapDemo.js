import vis from 'vis'
import axios from 'axios'
export default {
  name: 'PropertyMap',
  props: ['dataName', 'dataType', 'dataId'],
  components: {},
  data() {
    return {
      keyword: '',
      searchResult: null,
      relationsResult: null,
      mode: /* 'table' */ 'graph',
      network: null,
      data: null,
      nodes: null,
      edges: null,
      currentNode: null,
      showColumn: true,
      fullScreen: false,

      checked: {
        column: false,
        table: true,
      },
      showDetailBox: false,
      dblClickTimeout: null,
      currentType: '',
    }
  },
  mounted() {
    if (this.dataName) {
      switch (this.dataType) {
        case 'meta':
        case 'domain':
        case 'catalog':
          this.keyword = this.dataName
          this.getDataBySearch()
          break
        default:
          break
      }
    } else {
      if (
        localStorage.hasOwnProperty(
          'entityMapLastKeyword' + this.$user.username
        )
      ) {
        this.keyword = localStorage.getItem(
          'entityMapLastKeyword' + this.$user.username
        )
        //      this.getDataBySearch();
      }
      if (this.keyword) {
        this.getDataBySearch()
      }
      //      this.$bus.$emit('toggleMainNav',false);
    }
  },
  watch: {
    showColumn() {
      this.getDataBySearch()
    },
    currentNode(newValue) {
      if (!newValue) {
        this.showDetailBox = false
      }
    },
  },

  methods: {
    addNode(rawData) {
      const node = rawData.obj

      node.group = this.combineGroupName(node)
      switch (node.type) {
        case 'ModelElement':
          node.id = node.type + ':' + node.objectId
          node.label = node.alias ? node.alias : node.name
          if (node.typeId === 80010001) {
            // don't display
            return
          }
          if (node.typeId === 80000005) {
            if (this.showColumn) {
            } else {
              return
            }
          }
          if (
            node.typeId !== 80000004 &&
            node.typeId !== 80000005 &&
            node.typeId !== 80500008 &&
            node.typeId !== 80010118 &&
            node.typeId !== 80010119
          ) {
            console.log(node)
          }
          break
        case 'DataStandard':
          node.id = node.type + ':' + node.domainId
          node.label = node.chineseName
          break
        case 'System':
          node.id = node.type + ':' + node.categoryId
          node.label = node.name
          break
        case 'Report':
          node.id = node.type + ':' + node.reportId
          node.label = node.name
          break
        case 'DataSource':
          node.id = node.type + ':' + node.modelId
          node.label = node.name
          break
        case 'Catalog':
          node.id = node.type + ':' + node.catalogId
          node.label = node.name
          break
        default:
          this.$message.warning(
            `type ${node.type} miss handler.< callback:addNode < mapDemo.js`
          )
          node.label = node.name
          break
      }
      this.addEdge(rawData)
      if (!this.nodes._data[node.id]) {
        this.nodes.add(node)
      }
    },
    edgeLabelFormatter(en) {
      switch (en) {
        case 'BELONG_TO':
          return '归属于'
        case 'SUB_ELEMENT_OF':
        case 'ELEMENT_OF':
          return '属于'
        case 'APPLY_TO':
          return '应用于'
        case 'GENERATE':
          return '血缘关系'
        case 'SUBTYPE_OF':
          return '隶属于'
        default:
          return en
      }
    },
    addEdge(rawData) {
      if (this.currentNode) {
        let [type, from, to] = [
          rawData.relation,
          rawData.obj.id,
          this.currentNode.id,
        ]
        if (rawData.source) {
          ;[from, to] = [to, from]
        }

        const allEdges = this.edges.get({ returnType: 'Object' })
        if (!allEdges[from + to]) {
          this.edges.add({
            // DataSource
            from: from,
            to: to,
            id: from + to,
            type: type,
            label: this.edgeLabelFormatter(type),
          })
        }
      }
    },
    getDataBySearch() {
      localStorage.setItem(
        'entityMapLastKeyword' + this.$user.username,
        this.keyword
      )
      const url = `${this.$url}/service/graph/search?includeReport=true&includeCatalog=true`
      const body = {
        currentPage: 1,
        keyword: this.keyword,
        pageSize: 100,
        types: [
          'TABLE',
          'COLUMN',
          'MODEL_CATEGORY',
          'QUALITY_BUSINESS_RULE',
          'CODE',
          'DOMAIN',
          'VIEW',
          'STORED_PROCEDURE',
          'FUNCTION',
        ],
      }

      this.nodes = new vis.DataSet([])
      this.edges = new vis.DataSet([])
      this.currentNode = null
      if (this.dataName && this.dataType === 'meta') {
        const url = `${this.$url}/service/graph/query`
        const body = `match(p:ModelElement) where p.object_id = ${this.dataId} return p`
        this.$plainRequest.post(url, body).then(res => {
          if (Array.isArray(res.data) && res.data.length === 1) {
            this.addNode({ obj: res.data[0].p })
          }
          const allNodes = this.nodes.get({ returnType: 'Array' })

          if (allNodes.length === 1) {
            this.currentNode = allNodes[0]
            const nodeId = allNodes[0].id
            this.getRelationsOfNode(nodeId)
          }
          this.draw()
        })
      } else {
        this.$http
          .post(url, body)
          .then(res => {
            this.searchResult = res.data
            if (this.dataName) {
              this.searchResult.forEach(item => {
                if (this.dataType === 'catalog') {
                  if (item.catalogId == this.dataId) {
                    this.addNode({ obj: item })
                  }
                } else if (this.dataType === 'meta') {
                  if (item.objectId == this.dataId) {
                    this.addNode({ obj: item })
                  }
                } else if (this.dataType === 'domain') {
                  if (item.domainId == this.dataId) {
                    this.addNode({ obj: item })
                  }
                }
              })
              const allNodes = this.nodes.get({ returnType: 'Array' })

              if (allNodes.length === 1) {
                this.currentNode = allNodes[0]
                const nodeId = allNodes[0].id
                this.getRelationsOfNode(nodeId)
              }
            } else {
              this.searchResult.forEach(item => {
                this.addNode({ obj: item })
              })
            }
            this.draw()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getRelationData() {},
    getAllRelationsByQuery() {
      const body =
        'match (n:ModelElement)-[r]-(m:ModelElement)\n' +
        'return n, r, m, startNode(r)=n as is_from_n, type(r) as relation_type'
      this.mode = 'relation'
      this.getDataByQuery(body)
    },
    getDataByQuery(query) {
      const plainRequest = axios.create({
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      const url = `${this.$url}/service/graph/query`
      const body = query || 'match(n) return n;'
      this.$plainRequest.post(url, body).then(res => {
        this.relationsResult = res.data
      })
    },
    itemDetailFormatter(item) {
      const json = JSON.stringify(item)
      return json.slice(1, -1).replace(/,/g, '<br>').replace(/:/g, ' : ')
    },
    draw() {
      // create a network
      const container = document.getElementById('myNetwork')
      const data = {
        nodes: this.nodes,
        edges: this.edges,
      }
      const options = {
        nodes: {
          shape: 'star',
        },
        edges: {
          width: 1,
          arrows: { to: true },
          dashes: true,
          color: {
            color: '#B1C1C1',
            highlight: '#666',
            //            inherit:'both'
          },
          arrowStrikethrough: false,
          font: { align: 'middle' },
        },
        groups: {
          E80010001: {
            // deprecated
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf06c',
              size: 30,
              color: '#ffe081',
            },

            /* color:{
              background:'#ffe081',
              border:'#a6a8a7'
            },
            chosen:{
              node:(values,id,selected,hovering)=>{
                values.color = '#ffe081';
              }
            } */
          },
          System: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf07b',
              //              code:'\uf0e8',
              size: 30,
              color: '#ffe081',
            },
          },
          Report: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf1fe',
              //              code:'\uf0e8',
              size: 30,
              color: '#f16667',
            },
          },
          DataStandard: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf2c2',
              //              code:'\uf0e8',
              size: 30,
              color: '#c990c0',
            },
          },
          E80000004: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf0ce',
              size: 30,
              color: '#4c8eda',
            },
          },
          E80010118: {
            // sp
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf295',
              size: 30,
              color: '#4c8eda',
            },
          },
          E80010119: {
            // function
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf295',
              size: 30,
              color: '#ffe081',
            },
          },
          E80000005: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf0db',
              size: 30,
              //              color: '#da7194'
              color: '#4c8eda',
            },
          },
          E80500008: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf022',
              size: 30,
              //              color: '#c990c0'
              color: '#4c8eda',
            },
          },
          DataSource: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf1c0',
              size: 30,
              color: '#569480',
            },
          },
          Catalog: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              //              code: '\uf07b',
              code: '\uf0e8',
              size: 30,
              color: '#ffe081',
            },
          },
        },
        interaction: { hover: true },
        manipulation: {
          enabled: true,
          addEdge: (data, callback) => {},
        },
        physics: {
          barnesHut: {
            springLength: 275,
          },
        },
        layout: { randomSeed: 2 },
      }
      const network = new vis.Network(container, data, options)
      //      this.network = network;
      this.initEventListener()
      network.on('click', params => {
        clearTimeout(this.dblClickTimeout)
        const allNodes = this.nodes.get({ returnType: 'Object' })
        this.currentNode = allNodes[params.nodes[0]]

        if (this.currentNode) {
          if (this.currentNode.domainId) {
            this.currentType = 'domain'
          } else if (this.currentNode.type === 'Catalog') {
            this.currentType = 'catalog'
          } else {
            this.currentType = 'meta'
          }
        } else {
          this.currentType = ''
        }

        this.dblClickTimeout = setTimeout(() => {
          if (params.nodes.length === 1) {
            // when click one node
            if (this.currentType === 'meta' || this.currentType === 'catalog') {
              this.showDetailBox = true
            }
          } else if (params.edges.length === 1) {
            this.showDetailBox = false
          } else {
            this.showDetailBox = false
          }
        }, 200)
      })
      network.on('doubleClick', params => {
        clearTimeout(this.dblClickTimeout)
        if (params.nodes.length === 1) {
          // when click one node
          const nodeId = params.nodes[0]
          this.getRelationsOfNode(nodeId)
        } else if (params.edges.length === 1) {
        }
      })
    },
    initEventListener() {},
    combineGroupName(node) {
      const type = node.type
      const typeId = node.typeId
      if (typeId) {
        return 'E' + String(typeId)
      }
      if (type) {
        return type
      }
    },
    getRelationsOfNode(nodeId) {
      if (!Array.isArray(nodeId.split(':'))) {
        return
      }
      const type = nodeId.split(':')[0]
      this.$http
        .get(
          this.$url + '/service/graph/' + nodeId.split(':')[1] + '/type/' + type
        )
        .then(res => {
          res.data.forEach(item => {
            if (type === 'DataSource' && item.obj.typeId === 80000005) {
            } else if (
              this.currentNode.typeId === 80000005 &&
              item.obj.type === 'DataSource'
            ) {
            } else {
              this.addNode(item)
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setFrameToFullScreen() {
      this.fullScreen = true
      $(this.$el).css('position', 'fixed')
      this.$fullScreen()
    },
    setFrameToWindow() {
      this.fullScreen = false
      $(this.$el).css('position', 'absolute')
      this.$exitFullScreen()
    },
  },
}
