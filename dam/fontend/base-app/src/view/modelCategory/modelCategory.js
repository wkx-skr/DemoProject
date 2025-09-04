import categoryDetails from './details.vue'
import categoryList from './list.vue'
export default {
  components: {
    categoryDetails,
    categoryList,
  },
  data() {
    return {
      currentTab: 'list',
      showAdd: false,
      tabs: [],
      tabsMap: {},
      itDepsArr: [],
      zoneArr: [],
      busDepArr: [],
      nodeData: [],
    }
  },
  mounted() {
    this.$bus.$on('addCategory', category => {
      this.addTab(category)
      this.getNode()
    })
    this.$bus.$on('removeTab', name => {
      this.removeTab(name)
    })
    this.$bus.$on('showAddTab', () => {
      this.showAdd = true
      this.currentTab = 'add'
      this.getNode()
    })
  },
  beforeDestroy() {
    this.$bus.$off('addCategory')
    this.$bus.$off('removeTab')
    this.$bus.$off('showAddTab')
  },
  methods: {
    getNode() {
      this.nodeData = [
        {
          name: this.$t('common.page.modelCategory'),
          level: 1,
        },
        {
          name:
            this.currentTab === 'add'
              ? this.$t('meta.modelCategory.addSystem')
              : this.currentTab + ' ' + this.$t('meta.modelCategory.system'),
          level: 2,
        },
      ]
    },
    nodeClick(node) {
      if (node.level == 1) {
        this.removeTab(this.currentTab)
      } else {
        this.currentTab = node.name
      }
    },
    handleTab(tab) {
      this.currentTab = tab.name
      this.getNode()
    },
    goBack() {
      this.removeTab(this.currentTab)
      // this.currentTab = 'list'
    },
    addTab(category) {
      if (this.tabsMap[category.categoryName]) {
      } else {
        this.tabs.push(category)
        this.tabsMap[category.categoryName] = category
      }
      this.currentTab = category.categoryName
    },
    removeTab(name) {
      this.currentTab = 'list'
      if (name == 'add') {
        this.showAdd = false
      } else {
        delete this.tabsMap[name]
        this.tabs.forEach((tab, index) => {
          if (tab.categoryName == name) {
            this.tabs.splice(index, 1)
          }
        })
      }
    },
    getItPars({ itDepsArr, zoneArr, busDepArr }) {
      this.itDepsArr = itDepsArr
      this.zoneArr = zoneArr
      this.busDepArr = busDepArr
    },
  },
  computed: {
    showTabs() {
      return (this.tabs && this.tabs.length > 0) || this.showAdd
    },
  },
}
