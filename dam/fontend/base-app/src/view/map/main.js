import CategoryNetwork from './categoryNetwork.js'
import SourceNetwork from './sourceNetwork.js'
import categoryLegend from './categoryLegend.vue'
import categoryDetail from './categoryDetail.vue'
import modelDetail from './modelDetail.vue'
import edgeDetail from './edgeDetail.vue'
import modelEdgeDetail from './modelEdgeDetail.vue'
import searchDetail from './searchDetail.vue'
import lineageGraph from './lineageGraph.vue'
import $ from 'jquery'

export default {
  components: {
    categoryLegend,
    categoryDetail,
    modelDetail,
    edgeDetail,
    modelEdgeDetail,
    searchDetail,
    lineageGraph,
  },
  mounted() {
    this.box = document.getElementById('network-box')
    this.getStatistics(this.drawCategoryNetwork)
    localStorage.setItem('physicsSwitch', false)
    document.addEventListener(
      'webkitfullscreenchange',
      this.handlewebkitfullscreenchange
    )
  },
  beforeDestroy() {
    document.removeEventListener(
      'webkitfullscreenchange',
      this.handlewebkitfullscreenchange
    )
  },
  data() {
    return {
      box: null,
      fullScreen: false,
      toolbarKey: 0,
      keyword: '',

      level: 'category',
      sourceNetworkData: {},
      categoryNetwork: null,
      sourceNetwork: null,
      colors: [],

      detailType: undefined,
      details: null,
      detailsKey: 0,
      isWidth: false,
      systemCallOverview: [],

      showLineage: false,
      lineageObject: {},
      physicsSwitchValue: localStorage.getItem('physicsSwitch'),
    }
  },
  watch: {
    detailType(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.showDetailBox()
      } else if (!newVal) {
        this.hideDetailBox()
      }
    },
  },
  methods: {
    changePhysicsSwitch(value) {
      localStorage.setItem('physicsSwitch', value)
      this.reDraw()
    },
    getStatistics(callback) {
      for (const cat in this.$modelCategoriesDetailsMap) {
        this.$modelCategoriesDetailsMap[cat].ballSize = 10
      }
      this.$http
        .get(this.$meta_url + '/service/entities/statistics')
        .then(res => {
          res.data.sort((a, b) => a.totalCol - b.totalCol)
          const max = res.data[res.data.length - 1].totalCol
          res.data.forEach(item => {
            this.$modelCategoriesDetailsMap[item.modelCategoryId].ballSize =
              Math.sqrt(Math.ceil((item.totalCol * 9) / max) + 1) * 10
          })
        })
        .catch(e => {})
        .then(() => {
          callback()
        })
    },
    back() {
      this.level = 'category'
      this.removeDetail()
    },
    drawCategoryNetwork() {
      this.categoryNetwork = new CategoryNetwork({
        container: $('#category-network')[0],
        vThis: this,
      })
      this.categoryNetwork.start()
    },
    drawSourceNetwork() {
      this.sourceNetwork = new SourceNetwork({
        container: $('#source-network')[0],
        vThis: this,
        data: this.sourceNetworkData,
        colors: this.colors,
      })
      this.sourceNetwork.start()
    },
    reDraw() {
      if (this.level === 'category') {
        if (this.categoryNetwork.positionBlur) {
          // this.categoryNetwork.clearXY(() => {
          this.categoryNetwork.redraw()
          // })
        } else {
          this.categoryNetwork.redraw()
        }
      } else if (this.level === 'source') {
        this.sourceNetwork.destroy()
        this.drawSourceNetwork()
      }
    },
    resetFullScreen(bool) {
      // 全链路血缘 全屏
      if (bool) {
        this.fullScreen = true
        $(this.box).css('position', 'fixed')
        $('#page-heading').hide()
        $('#top-menu').hide()
      } else {
        this.setFrameToWindow()
      }
    },
    setFrameToFullScreen() {
      this.fullScreen = true
      $(this.box).css('position', 'fixed')
      $('.db-heading').css('display', 'none')
      this.$fullScreen()
    },
    setFrameToWindow() {
      this.fullScreen = false
      $(this.box).css('position', 'absolute')
      $('.db-heading').css('display', 'block')
      this.$exitFullScreen()
    },
    handlewebkitfullscreenchange(e) {
      if (!e.currentTarget.webkitIsFullScreen) {
        this.setFrameToWindow()
        this.$refs.lineageBox.$refs.lineageGraph.fixed = false
      } else {
        this.setFrameToFullScreen()
      }
    },
    search() {
      this.detailType = 'search'
      this.isWidth = false
      this.$bus.$emit('searchTable')
      this.detailsKey++
    },
    handleLegendClick(groupId) {
      this.categoryNetwork.handleLegendClick(groupId)
      this.removeDetail()
    },
    showDetailBox() {
      jQuery('#detail-box').fadeIn()
    },
    hideDetailBox() {
      jQuery('#detail-box').fadeOut()
    },
    removeDetail() {
      this.detailType = undefined
      this.details = null
    },
    showCategoryDetail(data) {
      this.detailType = 'category'
      this.isWidth = false
      this.details = data
    },
    showModelDetail(data) {
      this.detailType = 'model'
      this.isWidth = false
      this.details = data
    },
    showEdgeDetail(data) {
      this.detailType = 'edge'
      this.isWidth = false
      this.details = data
      this.detailsKey++
    },
    showModelEdgeDetail(data) {
      this.detailType = 'modelEdge'
      this.isWidth = false
      this.details = data
      this.detailsKey++
    },
    handleEntityClick(data) {
      this.level = 'source'
      this.sourceNetworkData = data
      this.drawSourceNetwork()
    },
    findCategory(id) {
      if (this.level !== 'category') {
        this.level = 'category'
        setTimeout(() => {
          this.categoryNetwork.findCategory(id)
        })
      } else {
        this.categoryNetwork.findCategory(id)
      }
    },
    handleRowClick(row) {
      if (row.type === 'call') {
        if (row.type === 'call') {
          let [from, to] = [row.data.categoryId, this.details.categoryId]
          if (row.data.dir === 'in') {
            ;[from, to] = [to, from]
          }
          this.categoryNetwork.focusEdgeByNodes({ from: from, to: to })
        }
      } else if (row.objectId) {
        this.lineageObject = row
        this.showLineage = true
      } else {
        // TODO get table's object id by its id then show its lineage graph.
      }
    },
  },
}
