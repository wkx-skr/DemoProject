import objectList from './list.vue'
import objectDetail from './objectDetail.vue'
export default {
  components: { objectList, objectDetail },
  data() {
    return {
      nodeData: [],
      currentTab: 'list',
      editTabsArray: [],
      appendingObject: false,
      currentObject: null,
    }
  },
  methods: {
    getNode(name = '') {
      this.nodeData = [
        {
          name: '业务实体',
          level: 1,
        },
        {
          name: this.currentTab === 'add' ? '添加业务实体' : name,
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
    goBack() {
      this.removeTab(this.currentTab)
    },
    handleTab(tab) {
      this.currentTab = tab.name
      this.getNode(tab.label)
    },
    addObject() {
      this.appendingObject = true
      this.currentTab = 'add'
      this.getNode()
    },
    removeTab(name) {
      const index = this.editTabsArray.findIndex(item => {
        return item.businessTabId === name
      })
      if (name === 'add') {
        this.appendingObject = false
      } else if (index > -1) {
        this.editTabsArray.splice(index, 1)
      }
      this.$refs.objectList.getData()
      this.currentTab = 'list'
    },
    refresh() {
      this.$refs.objectList.getData()
    },
    modify(row) {
      this.currentObject = row
      let isOpened = false
      this.editTabsArray.forEach(item => {
        if (item.businessTabId === row.businessTabId) {
          isOpened = true
        }
      })
      if (!isOpened) {
        this.editTabsArray.push(row)
      }
      this.currentTab = row.businessTabId
      this.getNode(row.businessTabName)
    },
  },
  computed: {
    showTabs() {
      return (
        this.appendingObject ||
        (Array.isArray(this.editTabsArray) && this.editTabsArray.length > 0)
      )
    },
  },
}
