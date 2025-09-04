import vis from 'vis'
import categoryDetail from './catagoryDetail'
import tableDetail from './tableDetail'
import etlDetail from './etlDetail'
import tableLevelGraph from './tableLevelGraph'
import systemDetail from './systemDetail'
export default {
  components: {
    categoryDetail,
    tableLevelGraph,
    tableDetail,
    etlDetail,
    systemDetail,
  },
  data() {
    return {
      network: null,
      options: {},
      nodes: null,
      edges: null,
      data: null,
      container: null,
      fullScreen: false,

      modelCategories: [],
      modelCount: {},
      lineageOverview: {},
      lineageData: {},
      systemCallOverview: [],
      modelCategoryDetail: {},
      systemDetail: {},
      tableDetail: {},
      tableDetailKey: 0,
      etlDetail: {},
      etlDetailKey: 0,
      systemDetailKey: 0,
      resizeTimeout: null,
      clickTimeout: [],

      level: 'category',
      tableLevelData: {
        rawData: null,
        nodes: [],
        edges: [],
        data: null,
      },
      zoneMap: {},
      zoneCnt: {},
      zoneMapKey: 0,
      zoneMapKeys: [],
      zoneCategories: {},
      colors: ['#1693F1', '#d54f82', '#f7ad29', '#08cbc5'],
      detailType: undefined,
      keyword: '',
      autoCompleteKey: 0,
      tableNameLang: 'en',
      tableCnt: 0,
    }
  },
  watch: {
    keyword(value) {
      if (!value) {
        //        this.network.fit();
      }
    },
  },
  mounted() {
    $('#main-content').addClass('to-top') // D
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
    this.container = document.getElementById('network1')
    this.box = document.getElementById('network-box')
    this.initKeyboardListener()
    //    this.initData();
    //    this.initOption();
    //    this.draw();
    this.start()
    //    $(window).on('resize',this.handleResize);
  },
  beforeDestroy() {
    $('#main-content').removeClass('to-top') // D
    $(document).off('keydown', this.handleEsc)
    $(window).off('resize', this.handleResize)
    this.network.destroy()
  },
  methods: {
    handleTableNameLangChange(val) {
      this.$bus.$emit('tableNameLangChange', val)
    },
    handleResize() {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(this.start, 200)
    },
    moveToCategoryLevel() {
      this.removeDetail()
      this.level = 'category'
    },
    start() {
      this.level = 'category'
      this.getCategories()
    },
    getCount() {
      this.getSystemCall()
    },
    getSystemCall() {
      this.$http
        .get(this.$meta_url + '/service/systemcall/overview')
        .then(res => {
          this.systemCallOverview = res.data
          this.getLineage()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getLineage() {
      this.$http
        .get(this.$meta_url + '/service/lineage/overview')
        .then(res => {
          this.lineageOverview = res.data
          this.handleOverviewData()
          this.initData()
          this.initOption()
          this.draw()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleOverviewData() {
      this.lineageData = {}
      const steps = this.lineageOverview.steps
      const lines = this.lineageOverview.lines
      const stepToStep = {}
      const edges = []

      const systemCall = {}
      this.systemCallOverview.forEach(item => {
        systemCall[item.srcSystemId + ';' + item.dstSystemId] = {
          from: item.srcSystemId,
          to: item.dstSystemId,
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
    },
    getCategories() {
      this.modelCategories = _.cloneDeep(this.$modelCategories)
      this.getCount()
    },
    initKeyboardListener() {
      $(document).on('keydown', this.handleEsc)
    },
    handleEsc(arg) {
      if (arg.keyCode === 27 && this.fullScreen === true) {
        // keyCode 27 means escape key.
        this.setFrameToWindow()
      }
    },
    setFrameToFullScreen() {
      this.fullScreen = true
      $(this.box).css('position', 'fixed')
      this.$fullScreen()
    },
    setFrameToWindow() {
      this.fullScreen = false
      $(this.box).css('position', 'absolute')
      this.$exitFullScreen()
    },
    initData() {
      const arr = []
      this.modelCategories.forEach(item => {
        if (!item.zone) {
          item.zone = '未指定业务域'
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
            this.$modelCategoriesDetailsMap[item.categoryId]
              .categoryAbbreviation +
            ')',
          detail: _.clone(item),
        })
      })
      this.zoneMapKey++
      this.$utils.sort.sortConsiderChineseNumber(this.zoneMapKeys)
      this.nodes = new vis.DataSet(arr)
      /* this.edges = new vis.DataSet([{from:3,to:15,dashes:true,arrows:'from,to'}]); */
      this.edges = this.lineageData.edges

      this.data = {
        nodes: this.nodes,
        edges: new vis.DataSet(this.edges),
      }
    },
    initOption() {
      this.options = {
        nodes: {
          shape: 'dot',
          font: {
            size: 16,
            color: '#ccc',
          },
        },
        edges: {
          width: 3,
          dashes: true,
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
        this.options.groups[index] = { color: item }
      })
    },
    reDraw() {
      if (this.level === 'category') {
        this.draw()
      } else {
        this.$refs.tableLevelGraph.draw()
      }
    },
    draw() {
      const container = this.container
      this.network = new vis.Network(container, this.data, this.options)
      this.initEventListeners()
    },
    initEventListeners() {
      this.network.on('doubleClick', params => {
        this.clickTimeout.forEach(item => {
          clearTimeout(item)
        })
        this.clickTimeout = []
        this.removeDetail()
        this.keyword = ''
        if (params.nodes.length === 1) {
          // when click one node
          this.findSystemCall(params.nodes[0], null, () => {
            this.getCategoryLineage(params.nodes[0])
          })
        } else if (params.edges.length === 1) {
          const edgeId = params.edges[0]
          let catId1, catId2
          this.edges.forEach(edge => {
            if (edge.id === edgeId) {
              catId1 = edge.from
              catId2 = edge.to
            }
          })
          this.findSystemCall(catId1, catId2, () => {
            this.getCategoryLineage(catId1, catId2)
          })
        }
      })
      this.network.on('click', params => {
        if ($('.autoClass').css('display') !== 'none') {
          this.autoCompleteKey++
          //            this.keyword = '';
        }
        this.removeDetail()
        const timeout = setTimeout(() => {
          if (params.nodes.length === 0 && params.edges.length === 0) {
            // when click vacant part.
            //            this.removeDetail();
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
    },
    findSystemCall(from, to, callback) {
      const requestUrl = this.$meta_url + '/service/systemcall/search'
      const requestBody = {
        pageSize: 500,
        currentPage: 0,
        srcModelCategoryIds: [from],
      }
      if (to) {
        requestBody.dstModelCategoryIds = [to]
        this.$http
          .post(requestUrl, requestBody)
          .then(res => {
            this.tableLevelData.call = res.data.content
            if (callback) {
              callback()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(requestUrl, requestBody)
          .then(res => {
            this.tableLevelData.call = []
            this.tableLevelData.call = this.tableLevelData.call.concat(
              res.data.content
            )
            requestBody.dstModelCategoryIds = [from]
            delete requestBody.srcModelCategoryIds
            this.$http
              .post(requestUrl, requestBody)
              .then(res => {
                if (
                  !this.tableLevelData.call ||
                  this.tableLevelData.call.length === 0
                ) {
                  this.tableLevelData.call = []
                }
                this.tableLevelData.call = this.tableLevelData.call.concat(
                  res.data.content
                )
                if (callback) {
                  callback()
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getCategoryLineage(catId, catId2) {
      let requestUrl = this.$meta_url + '/lineage/relationships?catId=' + catId
      if (catId2) {
        requestUrl += '&targetCatId=' + catId2
      }
      this.$http
        .get(requestUrl)
        .then(res => {
          this.tableLevelData.rawData = res.data
          if (Object.keys(res.data.endpoints).length === 0) {
            this.tableLevelData.rawData.catId = catId
          }
          this.tableLevelData.zoneMap = this.zoneMap
          this.tableLevelData.colors = this.colors
          this.drawTableLineage()
        })
        .catch(e => {
          this.tableLevelData.rawData = {
            endpoints: {},
            relationships: [],
            catId: catId,
          }
          this.tableLevelData.zoneMap = this.zoneMap
          this.tableLevelData.colors = this.colors
          this.drawTableLineage()
          this.$showFailure(e)
        })
    },
    drawTableLineage() {
      this.level = 'table'
    },

    showNodeDetail(params) {
      // In fact, this function is just for model category.
      this.detailType = 'category'
      let id = params.nodes[0]
      if (id[0] === 'c') {
        id = id.substr(1)
      }
      this.showDetail()
      this.modelCategoryDetail = this.nodes._data[id].detail
    },
    showEdgeDetailOnlyCall(params) {
      const p = {
        edges: [],
      }
      this.edges.forEach(item => {
        if (item.from == params.from && item.to == params.to) {
          p.edges.push(item.id)
          this.showEdgeDetail(p)
        }
      })
    },
    showEdgeDetail(params) {
      const onlyCall = arguments[1]
      this.detailType = 'edge'
      const id = params.edges[0]
      //      this.showDetail();
      this.showBigDetail()
      this.edges.forEach(item => {
        if (item.id === id) {
          const from = item.from
          const to = item.to
          this.systemDetail.cat = {
            from: from,
            to: to,
          }
          if (item.type === 'lineage' || item.type === 'both') {
            this.getTableLineage(from, to)
          } else {
            this.systemDetail.lineage = []
            this.systemDetailKey++
          }
          if (item.type === 'call' || item.type === 'both') {
            this.getCall(from, to)
          } else {
            this.systemDetail.call = []
            this.systemDetailKey++
          }
        }
      })
    },
    getTableLineage(catId, catId2) {
      let requestUrl = this.$meta_url + '/lineage/relationships?catId=' + catId
      if (catId2) {
        requestUrl += '&targetCatId=' + catId2
      }
      this.$http.get(requestUrl).then(res => {
        this.systemDetail.lineage = []
        const lineage = this.systemDetail.lineage
        const data = res.data
        const endpoints = data.endpoints
        const relationships = data.relationships
        relationships.forEach(r => {
          lineage.push({
            from: endpoints[r.first],
            to: endpoints[r.second],
          })
        })
        this.systemDetailKey++
      })
    },
    getCall(from, to) {
      const requestUrl = this.$meta_url + '/service/systemcall/search'
      const requestBody = {
        pageSize: 500,
        currentPage: 0,
        srcModelCategoryIds: [from],
        dstModelCategoryIds: [to],
      }
      this.$http
        .post(requestUrl, requestBody)
        .then(res => {
          this.systemDetail.call = res.data.content
          this.systemDetailKey++
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    showTableDetail(params) {
      this.detailType = 'table'
      this.tableDetail = params
      this.showDetail()
      this.tableDetailKey++
    },
    showEtlDetails(params) {
      this.detailType = 'etl'
      this.etlDetail = params
      this.etlDetailKey++
      this.showDetail()
    },
    showDetail() {
      $('#big-detail-box').animate({ right: -620 }, 'fast')
      this.$nextTick(() => {
        $('#detail-box').show().animate({ right: 52 })
      })
    },
    showBigDetail() {
      $('#detail-box').animate({ right: -320 }, 'fast')
      this.$nextTick(() => {
        $('#big-detail-box').show().animate({ right: 52 })
      })
    },
    removeDetail() {
      setTimeout(() => {
        $('#detail-box').animate({ right: -320 }, 'fast') /* .hide(); */
        $('#big-detail-box').animate({ right: -620 }, 'fast') /* .hide(); */
      })
    },
    querySearch(queryString, cb) {
      const restaurants = []
      if (this.level === 'category') {
        for (const i in this.nodes._data) {
          restaurants.push({
            value: this.nodes._data[i].label,
            id: this.nodes._data[i].id,
          })
        }
      } else if (this.level === 'table') {
        const ref = this.$refs.tableLevelGraph.network.body.data
        for (const i in ref.nodes._data) {
          const data = ref.nodes._data[i]
          if (data.type === 'table') {
            const catId = data.detail.catId
            const cat =
              this.$modelCategoriesDetailsMap[catId].categoryName +
              '(' +
              this.$modelCategoriesDetailsMap[catId].categoryAbbreviation +
              ')'
            restaurants.push({
              id: data.id,
              value: `${data.label} (${cat})`,
            })
          } else {
            restaurants.push({
              value: data.label,
              id: data.id,
            })
          }
        }
      }
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      cb(results)
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0
        )
      }
    },
    handleSelect(item) {
      this.focusNode(item.id)
    },
    focusNode(nodeId) {
      const options = {
        scale: 2.5,
        offset: { x: 0, y: 0 },
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad',
        },
      }
      if (this.level === 'table') {
        this.$refs.tableLevelGraph.network.focus(nodeId, options)
      } else {
        this.network.focus(nodeId, options)
      }
    },
  },
}
