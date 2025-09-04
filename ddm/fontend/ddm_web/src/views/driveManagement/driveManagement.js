'use strict'
/**
 * Created by baobao on 2017/6/30.
 */
import driveManagementTab from './driveManagementTab.vue'
import editDriveManagement from './editDriveManagement.vue'
import $version from '@/resource/version.json'

import _ from 'lodash'

const moment = require('moment')
export default {
  mounted () {
    this.$bus.$on('refreshList', (type) => {
      this.$refs.driveManagementTab.getdriverTypeList()
      this.$refs.driveManagementTab.getdriverList(type)
    })
  },
  destroyed () {
    this.$bus.$off('refreshList')
  },
  components: {
    driveManagementTab,
    editDriveManagement
  },
  created () {
    this.$version = $version
  },
  methods: {
    addDs () {
      this.$bus.$emit('callDataSourceTabToAddDs')
    },
    closeEidTab (id) {
      if (id) {
        this.removeTab(id)
      } else {
        this.removeTab('ediDataSource')
      }
    },
    removeTab (name) {
      const index = this.editTabsArray.findIndex(item => {
        return item.id + '' === name + ''
      })
      if (name === 'downloadTab') {
        this.ifShowDownloadTab = false
      } else if (index > -1) {
        this.editTabsArray.splice(index, 1)
      }
      this.currentTab = 'dataSourceTab'
    },
    showtab (isEdi, para) {
      let item = {}
      if (isEdi === false) {
        item = {
          id: 'add',
          name: this.$v.drive.addCustomDriver, // '添加自定义驱动',
          supdsform: para,
          suppara: para,
          isEdit: false
        }
      } else {
        item = {
          id: para.id,
          name: para.driverName,
          supdsform: para,
          isEdit: true
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
    },
    showDownloadTab (modelId) {
      this.ifShowDownloadTab = true
      this.modelId = modelId
      this.currentTab = 'downloadTab'
    },
    refreshTable () {
      if (this.$refs.driveManagementTab && this.$refs.driveManagementTab.refreshDataList) {
        this.$refs.driveManagementTab.refreshDataList()
      }
    }
  },
  computed: {
    showTabs () {
      return this.ifShowDownloadTab || (Array.isArray(this.editTabsArray) && this.editTabsArray.length > 0)
    }
  },

  watch: {
    currentTab (newVal) {
      this.$nextTick(() => {
        if (newVal === 'dataSourceTab') {
          this.$bus.$emit('dataSourceTabOntop')
        } else {
          this.$bus.$emit('downloadOntop')
        }
      })
    }
  },

  data () {
    return {
      currentTab: 'dataSourceTab',
      ifShowDownloadTab: false,
      editTabsArray: []
    }
  }

}
