import ourList from './list.vue'
import ourDetail from './detail.vue'
import HTTP from '@/http/main'
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
      allRoles: [],
      nodeData: [], // 设置头部的内容
    }
  },
  mounted() {
    this.$bus.$on('addTab', detail => {
      // 刷新 是否需要强密码校验
      this.$refreshStrongPassword()
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(e => {
          if (detail) {
            this.addTab(_.clone(detail))
          } else {
            this.showAddTab = true
            this.currentTab = 'add'
            this.getNode()
          }
        })

    })
    this.$bus.$on('removeTab', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
    })
    this.getAllRoles()
  },
  beforeDestroy() {
    this.$bus.$off('addTab')
    this.$bus.$off('removeTab')
  },
  methods: {
    getAllRoles() {
      HTTP.getAllGroups()
        .then(res => {
          const rawDataMap = res.data
          this.allRoles = []
          for (const user in rawDataMap) {
            const item = rawDataMap[user]
            this.allRoles.push(item)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addTab(data) {
      if (this.dataMap[data.username]) {
      } else {
        this.dataMap[data.username] = data
        this.dataArray.push(data)
      }
      this.currentTab = data.username
      this.getNode(data.username)
    },
    removeTab(tabName) {
      if (tabName == 'add') {
        this.currentTab = this.lastTab
        this.showAddTab = false
      } else {
        this.dataArray.forEach((rule, index) => {
          if (rule.username === tabName) {
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
      // 新建页面时
      if (this.currentTab === 'add') {
        if (this.$refs.addDetail.count > 1) {
          this.dialogConfirm()
        } else {
          this.removeTab(this.currentTab)
        }
      } else {
        // 编辑页面时
        if (this.$refs.editDetail[0].count > 4) {
          this.dialogConfirm()
        } else {
          this.removeTab(this.currentTab)
        }
      }
      // this.removeTab(this.currentTab)
    },
    dialogConfirm() {
      this.$DatablauCofirm(this.$t('common.info.savePage'), this.$t('common.info.title'), {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          if (this.currentTab == 'add') {
            return this.$refs.addDetail.confirm()
          } else {
            return this.$refs.editDetail[0].confirm()
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
          name: this.$t('system.user.user'),
          level: 1,
        },
        {
          name: this.currentTab === 'add' ? this.$t('system.user.create') : name,
          level: 2,
        },
      ]
    },
  },
}
