<template></template>
<script>
import vis from 'vis'
export default {
  name: 'tableLevelGraph',
  props: ['data'],
  data() {
    return {
      rawData: null,
      endpoints: {},
      categoryMap: {},
      sourceMap: {},
      relationships: [],
      zoneMap: null,
      colors: [],
      nodes: [],
      edges: [],
      options: null,
      network: null,
      groupMap: {},
      lang: 'en',
      tableCnt: 0,
    }
  },
  mounted() {
    this.rawData = this.data
    this.colors = this.data.colors
    this.zoneMap = this.data.zoneMap
    this.prepareData()
    this.draw()
    this.$bus.$on('tableNameLangChange', val => {
      this.network.destroy()
      this.lang = val
      this.nodes.forEach(node => {
        if (node.type === 'table') {
          ;[node.label, node.alias] = [node.alias, node.label]
        }
      })
      this.draw()
    })
  },
  beforeDestroy() {
    if (this.network) {
      this.network.destroy()
    }
    this.$bus.$off('tableNameLangChange')
  },
  methods: {
    prepareData() {
      this.endpoints = this.rawData.rawData.endpoints
      this.relationships = this.rawData.rawData.relationships
      let i = -1
      if (Object.keys(this.endpoints).length === 0) {
        const catId = this.data.rawData.catId
        this.nodes.push({
          id: 'c' + catId,
          label:
            this.$modelCategoriesDetailsMap[catId].categoryName +
            '(' +
            this.$modelCategoriesDetailsMap[catId].categoryAbbreviation +
            ')',
          detail: this.$modelCategoriesDetailsMap[catId],
          type: 'category',
          group: 0,
        })
        this.categoryMap[catId] = true
      }
      this.$parent.tableCnt = 0

      const edgeSet = new Set()
      this.relationships.forEach(r => {
        edgeSet.add(r.first)
        edgeSet.add(r.second)
      })

      for (const k in this.endpoints) {
        const v = this.endpoints[k]
        //           let group = this.zoneMap[this.$modelCategoriesDetailsMap[v.catId].zone];
        if (!this.categoryMap.hasOwnProperty(v.catId)) {
          i++
          this.groupMap[v.catId] = i
          this.categoryMap[v.catId] = true
          this.nodes.push({
            id: 'c' + v.catId,
            //               label:v.cat,
            label:
              v.cat +
              '(' +
              this.$modelCategoriesDetailsMap[v.catId].categoryAbbreviation +
              ')',
            detail: v,
            type: 'category',
            group: i,
          })
        }
        if (!this.sourceMap.hasOwnProperty(v.modelId)) {
          this.sourceMap[v.modelId] = true
          this.nodes.push({
            id: 'm' + v.modelId,
            label: v.model,
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
            to: 'm' + v.modelId,
            dashes: false,
            type: 'column',
          })
        }
        if (!v.tabAlias) {
          v.tabAlias = v.tab
        }
        if (edgeSet.has(k)) {
          this.nodes.push({
            id: k,
            label: this.lang === 'en' ? v.tab : v.tabAlias, // class="fa fa-table"
            alias: this.lang === 'en' ? v.tabAlias : v.tab,
            detail: v,
            type: 'table',
            group: this.groupMap[v.catId],
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf0ce',
              size: 25,
              color: this.colors[this.groupMap[v.catId]],
            },
          })
          this.edges.push({
            from: 'm' + v.modelId,
            to: k,
            dashes: false,
            type: 'column',
          })
        }
        this.$parent.tableCnt++
      }

      this.relationships.forEach(r => {
        this.edges.push({
          from: r.first,
          to: r.second,
          arrows: 'to',
          width: 3,
          dashes: true,
          type: 'lineage',
        })
      })
      if (this.data.call && this.data.call.length > 0) {
        this.data.call.forEach(item => {
          let catId = item.calleeModelCategoryId
          if (!this.categoryMap.hasOwnProperty(catId)) {
            i++
            this.groupMap[catId] = i
            this.categoryMap[catId] = true

            this.nodes.push({
              id: 'c' + catId,
              label:
                this.$modelCategoriesDetailsMap[catId].categoryName +
                '(' +
                this.$modelCategoriesDetailsMap[catId].categoryAbbreviation +
                ')',
              detail: this.$modelCategoriesDetailsMap[catId],
              type: 'category',
              group: i,
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
                this.$modelCategoriesDetailsMap[catId].categoryName +
                '(' +
                this.$modelCategoriesDetailsMap[catId].categoryAbbreviation +
                ')',
              detail: this.$modelCategoriesDetailsMap[catId],
              type: 'category',
              group: i,
            })
          }
          const to = item.calleeModelCategoryId
          const from = item.callerModelCategoryId
          this.edges.push({
            from: 'c' + from,
            to: 'c' + to,
            arrows: 'to',
            width: 3,
            dashes: true,
            type: 'call',
          })
        })
      }
    },

    draw() {
      const nodes = new vis.DataSet(this.nodes)
      const edges = new vis.DataSet(this.edges)
      const data = {
        nodes: nodes,
        edges: edges,
      }
      let options = {
        nodes: {
          shape: 'dot',
          color: {
            //            background:'#3B85FF'
          },
          font: {
            size: 16,
            color: '#ccc',
          },
        },
        groups: {},
        physics: {
          //            enabled:false,
          stabilization: {
            iterations: 100,
          },
          barnesHut: {
            gravitationalConstant: -3000,
            springConstant: 0.04,
            springLength: 95,
          },
        },
        layout: {
          randomSeed: 2,
          //            improvedLayout:true
        },
        interaction: { hover: true },
        manipulation: {
          enabled: true,
        },
      }
      options = {
        nodes: {
          shape: 'dot',
          color: {
            //            background:'#3B85FF'
          },
          font: {
            size: 16,
            color: '#ccc',
          },
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
      const container = document.getElementById('network2')
      this.network = new vis.Network(container, data, options)

      this.network.on('click', params => {
        if (params.nodes.length === 0 && params.edges.length === 0) {
          // when click vacant part.
          this.$parent.removeDetail()
        } else if (params.nodes.length === 1) {
          // when click one node.
          if (this.categoryMap[params.nodes[0].substr(1)]) {
            this.$parent.showNodeDetail(params)
          } else if (!this.sourceMap[params.nodes[0].substr(1)]) {
            this.$parent.showTableDetail(this.endpoints[params.nodes[0]])
          }
        } else if (params.edges.length === 1) {
          const edgeId = params.edges[0]
          const edge = this.network.body.data.edges._data[edgeId]
          if (edge) {
            if (edge.type === 'lineage') {
              const from = this.endpoints[edge.from]
              const to = this.endpoints[edge.to]
              const requestBody = {
                currentPage: 0,
                pageSize: 100,
                keyword: null,
                user: null,
                types: null,
              }
              const requestUrl =
                this.$meta_url +
                '/service/lineage/imported?' +
                //                  + 'srcCatId='+ from.catId
                //                  + '&dstCatId=' + to.catId
                'srcTableId=' +
                from.tabId +
                '&dstTableId=' +
                to.tabId +
                '&srcDdm=' +
                from.ddm +
                '&dstDdm=' +
                to.ddm +
                '&srcModelId=' +
                from.modelId +
                '&dstModelId=' +
                to.modelId

              this.$http
                .post(requestUrl, requestBody)
                .then(res => {
                  this.$parent.showEtlDetails(res.data)
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            } else if (edge.type === 'call') {
              const edgeId = params.edges[0]
              const edge = this.network.body.data.edges._data[edgeId]
              this.$parent.showEdgeDetailOnlyCall(edge)
            }
          }
        }
      })
    },
  },
}
</script>
