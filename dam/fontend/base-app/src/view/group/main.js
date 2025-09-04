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
      nodeData: [],
      tableData: [],
    }
  },
  mounted() {
    this.$bus.$on('addTab', (detail, dataDisplay) => {
      if (detail) {
        this.addTab(_.clone(detail))
        this.tableData = dataDisplay
      } else {
        this.showAddTab = true
        this.currentTab = 'add'
        this.getNode()
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
      this.getNode(data.name)
    },
    removeTab(tabName) {
      if (tabName === 'add') {
        this.currentTab = this.lastTab
        this.showAddTab = false
      } else {
        this.dataArray.forEach((rule, index) => {
          if (rule.name === tabName) {
            this.dataArray.splice(index, 1)
            delete this.dataMap[tabName]
          }
        })
        this.currentTab = this.lastTab
      }
    },
    handleClick(value) {
      this.currentTab = value.name
      this.getNode(value.label)
    },
    // 返回到上一页
    goBack() {
      // 新建页面的返回
      if (this.currentTab === 'add') {
        if (this.$refs.addGroup.groupCount > 1) {
          this.datablauConfirm()
        } else {
          this.removeTab(this.currentTab)
        }
      } else {
        // 编辑页面的返回
        if (this.$refs.editGroup[0].groupCount > 3) {
          this.datablauConfirm()
        } else {
          this.removeTab(this.currentTab)
        }
      }
      // this.removeTab(this.currentTab)
    },
    datablauConfirm() {
      this.$DatablauCofirm(
        this.$t('common.info.savePage'),
        this.$t('common.info.title'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          if (this.currentTab === 'add') {
            return this.$refs.addGroup.confirm()
          } else {
            return this.$refs.editGroup[0].confirm()
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('common.info.editCancelled'),
          })
          this.removeTab(this.currentTab)
        })
    },
    getNode(name = '') {
      this.nodeData = [
        {
          name: this.$t('system.group.role'),
          level: 1,
        },
        {
          name:
            this.currentTab === 'add' ? this.$t('system.group.create') : name,
          level: 2,
        },
      ]
    },
  },
}
