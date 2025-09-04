/**
 * Created by baobao on 2017/6/30.
 */
import driveManagementTab from './driveManagementTab.vue'
import editDriveManagement from './editDriveManagement.vue'

import _ from 'lodash'
;('use strict')
const moment = require('moment')
export default {
  mounted() {
    this.$bus.$on('refreshList', type => {
      this.$refs.driveManagementTab.getdriverTypeList()
      this.$refs.driveManagementTab.getdriverList(type)
    })
  },
  destroyed() {
    this.$bus.$off('refreshList')
  },
  components: {
    driveManagementTab,
    editDriveManagement,
  },
  methods: {
    getNode() {
      this.nodeData = [
        {
          name: this.$t('meta.driveManage.driveManage'),
          level: 1,
        },
        {
          name: this.$t('meta.driveManage.addCustomDriver'),
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
      // this.currentTab = 'dataSourceTab'
    },
    handleTab(tab) {
      this.currentTab = tab.name
      this.getNode()
    },
    addDs() {
      this.$bus.$emit('callDataSourceTabToAddDs')
    },
    closeEidTab(id) {
      if (id) {
        this.removeTab(id)
      } else {
        this.removeTab('ediDataSource')
      }
    },
    removeTab(name) {
      const index = this.editTabsArray.findIndex(item => {
        return item.id == name
      })
      if (name === 'downloadTab') {
        this.ifShowDownloadTab = false
      } else if (index > -1) {
        this.editTabsArray.splice(index, 1)
      }
      this.currentTab = 'dataSourceTab'
    },
    showtab(isEdi, para) {
      let item = {}
      if (isEdi === false) {
        item = {
          id: 'add',
          name: this.$t('meta.driveManage.addCustomDriver'),
          supdsform: para,
          suppara: para,
          isEdit: false,
        }
      } else {
        item = {
          id: para.id,
          name: para.driverName,
          supdsform: para,
          isEdit: true,
        }
      }
      const index = this.editTabsArray.findIndex(tabdata => {
        return tabdata.id === item.id
      })
      index < 0 && this.editTabsArray.push(item)
      if (index >= 0 && !isEdi) {
        this.editTabsArray.splice(index, 1, item)
      }
      this.currentTab = item.id + ''
      this.getNode()
    },
    showDownloadTab(modelId) {
      this.ifShowDownloadTab = true
      this.modelId = modelId
      this.currentTab = 'downloadTab'
    },
  },
  computed: {
    showTabs() {
      return (
        this.ifShowDownloadTab ||
        (Array.isArray(this.editTabsArray) && this.editTabsArray.length > 0)
      )
    },
  },

  watch: {
    currentTab(newVal) {
      this.$nextTick(() => {
        if (newVal === 'dataSourceTab') {
          this.$bus.$emit('dataSourceTabOntop')
        } else {
          this.$bus.$emit('downloadOntop')
        }
      })
    },
  },

  data() {
    return {
      nodeData: [],
      currentTab: 'dataSourceTab',
      ifShowDownloadTab: false,
      editTabsArray: [],
    }
  },
}
