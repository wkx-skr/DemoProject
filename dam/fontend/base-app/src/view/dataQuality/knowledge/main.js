import ourList from './list.vue'
import ourDetail from './detail.vue'
export default {
  components: {
    ourList,
    ourDetail,
  },
  data() {
    return {
      lastTab: 'list',
      currentTab: 'list',
      showAddTab: false,
      dataMap: {},
      dataArray: [],
      hasAccess: true,
      deleteArr: ['dataMap', 'dataArray'],
      showType: 1,
      // hasAccess: false,
      detail: null,
      detailData: [],
      nodeData: [],
    }
  },
  created() {
    // 获取系统
    this.$getModelCategories()
  },
  mounted() {
    this.$bus.$on('addTab', (detail, canUpdate) => {
      this.hasAccess = canUpdate
      // if (detail) {
      //   this.addTab(_.clone(detail))
      // } else {
      //   // 新增
      //   // this.showType = 3;
      //   this.showAddTab = true
      //   this.currentTab = 'add'
      // }
      this.detailData = detail
      if (detail) {
        this.nodeData = [
          { name: this.$t('common.page.knowledgebase'), couldClick: false },
          { name: detail.name, couldClick: false },
        ]
      } else {
        this.nodeData = [
          { name: this.$t('common.page.knowledgebase'), couldClick: false },
          {
            name: this.$t('quality.page.knowledgebase.add'),
            couldClick: false,
          },
        ]
      }
      this.showAddTab = true
    })
    this.$bus.$on('removeTab', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
      this.showType = 1
    })
  },
  beforeDestroy() {
    this.$bus.$off('addTab')
    this.$bus.$off('removeTab')
    this.$bus.$off('dataPrepared')
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    nodeClick(node) {
      if (node.level === 1) {
        this.removeTab()
      }
    },
    addTab(data) {
      // this.showType = 2;
      this.detail = data
      if (this.dataMap[data.name]) {
      } else {
        this.dataMap[data.name] = data
        this.dataArray.push(data)
      }
      this.currentTab = data.name
    },
    removeTab(tabName) {
      this.showAddTab = false
      // if (tabName === 'add') {
      //   this.currentTab = this.lastTab
      //   this.showAddTab = false
      // } else {
      //   this.dataArray.forEach((rule, index) => {
      //     if (rule.name === tabName) {
      //       this.dataArray.splice(index, 1)
      //       delete this.dataMap[tabName]
      //     }
      //   })
      //   this.currentTab = this.lastTab
      // }
    },
  },
  computed: {
    showTabs() {
      return this.showAddTab || this.dataArray.length > 0
    },
  },
}
