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
    }
  },
  mounted() {
    this.$bus.$on('addTab', detail => {
      if (detail) {
        this.addTab(_.clone(detail))
      } else {
        this.showAddTab = true
        this.currentTab = 'add'
      }
    })
    this.$bus.$on('removeTab', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
    })
  },
  beforeDestroy() {
    this.$bus.$off('addTab')
    this.$bus.$off('removeTab')
  },
  methods: {
    addTab(data) {
      if (this.dataMap[data.name]) {
      } else {
        this.dataMap[data.name] = data
        this.dataArray.push(data)
      }
      this.currentTab = data.name
    },
    removeTab(tabName) {
      if (tabName == 'add') {
        this.currentTab = this.lastTab
        this.showAddTab = false
      } else {
        this.dataArray.forEach((rule, index) => {
          if (rule.name == tabName) {
            this.dataArray.splice(index, 1)
            delete this.dataMap[tabName]
          }
        })
        this.currentTab = this.lastTab
      }
    },
  },
}
