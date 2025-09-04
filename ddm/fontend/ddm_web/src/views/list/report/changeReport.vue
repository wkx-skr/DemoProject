<template>
  <div :style="style.container">
    <div class="title">
      <span class="return-button">
        <datablau-button
            type="icon" class="iconfont icon-leftarrow"
            @click="backToReportList"
        ></datablau-button>
      </span>
      {{ $store.state.$v.report.title1 }}{{ reportName }}{{ $store.state.$v.report.title3 }}
    </div>
    <datablau-tabs
      v-model="activeTab"
      @tab-click="onTabChange"
      class="change-list-tabs"
    >
      <el-tab-pane
        :label="$store.state.$v.dataEntity.add + ' (' + addedCount + ')'"
        :disabled="addedCount===0"
        name="added">
      </el-tab-pane>
      <el-tab-pane
        :label="$store.state.$v.modelDetail.mod + ' (' + modifiedCount + ')'"
        :disabled="modifiedCount===0"
        name="modified">
      </el-tab-pane>
      <el-tab-pane
        :label="$store.state.$v.modelDetail.delete + ' (' + removedCount + ')'"
        :disabled="removedCount===0"
        name="removed">
      </el-tab-pane>
    </datablau-tabs>
    <div style="border-bottom:1px solid #ddd;height:40px;line-height:30px;">
      <el-checkbox-group v-model="types" @change="filterData" style="display:inline-block;">
        <el-checkbox label="table">{{ $store.state.$v.udp.table }}</el-checkbox>
        <el-checkbox label="view">{{ $store.state.$v.udp.view }}</el-checkbox>
        <el-checkbox label="column">{{ $store.state.$v.report.column }}</el-checkbox>
        <el-checkbox label="keyGroup">{{ $store.state.$v.report.index }}</el-checkbox>
        <el-checkbox label="keyMember">{{ $store.state.$v.report.indexMember }}</el-checkbox>
      </el-checkbox-group>
      <datablau-input
        v-model="keyword"
        :placeholder="$store.state.$v.report.placeholder2" size="small" style="float:right;width:300px;"
        clearable
      ></datablau-input>
    </div>
    <div style="position:absolute;top:146px;left:20px;right:20px;bottom:10px;">
      <datablau-table
        :data="tableData"
        class="change-list"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
        height="100%"
        @sort-change="handleSortChange"
        :tree-props="treeProps"
        row-key="id"
        :default-expand-all="defaultExpandAll"
        v-if="showTable"
      >
        <el-table-column
          prop="type"
          :label="$store.state.$v.drive.type"
          sortable="custom"
          width="350"
        >
          <template slot-scope="scope">
            {{ $store.state.$v.report[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$store.state.$v.tagMgr.name"
          sortable="custom"
        >
          <template slot-scope="scope">
            <b>{{ scope.row.name }}</b>
          </template>
        </el-table-column>

      </datablau-table>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import string from '@/resource/utils/string'
import $version from '@/resource/version.json'
import _ from 'lodash'
export default {
  props: {
    modelId: {},
    path: {},
    detail: {},
    reportName: {},
    currentReport: {},
    getCurrentReportPromise: {
      required: true
    }
  },
  beforeMount () {
    this.$version = $version
  },
  mounted () {
    this.getReportDetail()
  },
  data () {
    return {
      loading: true,
      added: [],
      addedCount: 0,
      modified: [],
      modifiedCount: 0,
      removed: [],
      removedCount: 0,
      rawData: [],
      filteredData: [],
      tableData: [],
      treeProps: {
        children: 'children'
      },
      showTable: true,
      activeTab: null,
      keyword: '',
      types: [],
      style: {
        container: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '20px',
          overflow: 'hidden'
        }
      }
    }
  },
  computed: {
    defaultExpandAll () {
      let bool = false
      if (_.trim(this.keyword) !== '' || this.types.length > 0) {
        bool = true
      }
      return bool
    }
  },
  methods: {
    onTabChange () {
      this.rawData = this[this.activeTab]
      this.filterData()
      this.forceRefreshTable()
    },
    getReportDetail () {
      this.getCurrentReportPromise
        .then(data => {
          this.formatData(data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
      // HTTP.getReport({
      //   id: this.currentReport.id,
      //   entire: true,
      //   successCallback: data => {
      //
      //   }
      // })
    },
    formatData (rawData) {
      const addedItem = []
      const added = rawData.incrementalReport.added || []

      const types = {
        '80000004': 'table',
        '80500008': 'view',
        '80000005': 'column',
        '80000093': 'keyGroup',
        '80500001': 'keyMember'
      }
      let addedTree = this.getModifiedTree(added)
      for (let typeId in types) {
        let type = types[typeId]
        if (added[typeId]) {
          added[typeId].forEach(item => {
            // console.log(item, 'item')
            addedItem.push({
              type: type,
              id: item.first,
              name: item.second
            })
          })
        }
      }
      this.addedCount = addedItem.length || 0
      this.added = addedTree
      if (addedTree.length > 0) {
        this.activeTab = 'added'
      }
      const modifiedItem = []
      const modified = rawData.incrementalReport.modified || []
      let modifiedTree = this.getModifiedTree(modified)
      for (let typeId in types) {
        let type = types[typeId]
        if (modified[typeId]) {
          modified[typeId].forEach(item => {
            modifiedItem.push({
              type: type,
              id: item.first,
              name: item.second
            })
          })
        }
      }
      this.modifiedCount = modifiedItem.length || 0
      this.modified = modifiedTree
      if (addedTree.length === 0 && modifiedTree.length > 0) {
        this.activeTab = 'modified'
      }
      const removedItem = []
      const removed = rawData.incrementalReport.removed || []
      let removedTree = this.getModifiedTree(removed)
      for (let typeId in types) {
        let type = types[typeId]
        if (removed[typeId]) {
          removed[typeId].forEach(item => {
            removedItem.push({
              type: type,
              id: item.first,
              name: item.second
            })
          })
        }
      }
      this.removedCount = removedItem.length || 0
      this.removed = removedTree
      if (addedTree.length === 0 && modifiedTree.length === 0 && removedTree.length > 0) {
        this.activeTab = 'removed'
      }
      this.onTabChange()
    },
    getModifiedTree (changeData) {
      const types = {
        '80000004': 'table',
        '80500008': 'view',
        '80000005': 'column',
        '80000093': 'keyGroup',
        '80500001': 'keyMember'
      }
      let data = []
      let tableArr = changeData['80000004'] || []
      let viewArr = changeData['80500008'] || []
      let columnArr = changeData['80000005'] || []
      let keyGroupArr = changeData['80000093'] || []
      let keyMemberArr = changeData['80500001'] || []
      let objectMap = {}
      tableArr.forEach(item => {
        let obj = {
          type: 'table',
          id: item.first,
          name: item.second,
          changed: true,
          children: []
        }
        objectMap[obj.id] = obj
        data.push(obj)
      })
      viewArr.forEach(item => {
        let obj = {
          type: 'view',
          id: item.first,
          name: item.second,
          changed: true,
          children: []
        }
        objectMap[obj.id] = obj
        data.push(obj)
      })

      columnArr.forEach(item => {
        let obj = {
          type: 'column',
          id: item.first,
          name: item.second,
          tableId: item.t,
          tableName: item.tn,
          changed: true,
          children: []
        }
        objectMap[obj.id] = obj
        if (obj.tableId) {
          let parent = objectMap[obj.tableId]
          if (!parent) {
            parent = {
              type: 'table',
              id: obj.tableId,
              name: obj.tableName,
              changed: false,
              children: []
            }
            objectMap[parent.id] = parent
            data.push(parent)
          }

          obj.parent = parent
          parent.children.push(obj)
        } else {
          data.push(obj)
        }
      })

      keyGroupArr.forEach(item => {
        let obj = {
          type: 'keyGroup',
          id: item.first,
          name: item.second,
          tableId: item.t,
          tableName: item.tn,
          changed: true,
          children: []
        }
        objectMap[obj.id] = obj

        if (obj.tableId) {
          let parent = objectMap[obj.tableId]
          if (!parent) {
            parent = {
              type: 'table',
              id: obj.tableId,
              name: obj.tableName,
              changed: false,
              children: []
            }
            objectMap[parent.id] = parent
            data.push(parent)
          }

          obj.parent = parent
          parent.children.push(obj)
        } else {
          data.push(obj)
        }
      })

      keyMemberArr.forEach(item => {
        let obj = {
          type: 'keyMember',
          id: item.first,
          name: item.second,
          tableId: item.t,
          tableName: item.tn,
          keyGroupId: item.k,
          keyGroupName: item.kn,
          changed: true,
          children: []
        }
        objectMap[obj.id] = obj

        if (obj.tableId) {
          let parent = objectMap[obj.tableId]
          if (!parent) {
            parent = {
              type: 'table',
              id: obj.tableId,
              name: obj.tableName,
              changed: false,
              children: []
            }
            objectMap[parent.id] = parent
            data.push(parent)
          }
          let middle = objectMap[obj.keyGroupId]
          if (!middle) {
            middle = {
              type: 'keyGroup',
              id: obj.keyGroupId,
              name: obj.keyGroupName,
              tableId: obj.tableId,
              tableName: obj.tableName,
              changed: false,
              children: []
            }
            objectMap[middle.id] = middle
            middle.parent = parent
            parent.children.push(middle)
          }
          middle.children.push(obj)
        } else {
          data.push(obj)
        }
      })

      return data
    },
    getRowClassName ({ row, rowIndex }) {
      let result = 'row-can-click'
      if (row.changed) {
        result += ' change-item'
      }
      return result
    },
    forceRefreshTable () {
      this.showTable = false
      this.$nextTick(() => {
        this.showTable = true
      })
    },
    handleRowClick (row) {
      // 权限校验
      let permission = this.detail?.permission || {}
      if (permission.admin || permission.editor || permission.viewer) {

      } else {
        this.$datablauMessage.error(this.$t('common.info.noModelPermission'))
        return
      }
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      if (row.type === 'table' || row.type === 'view') {
        this.getElementParent(row.id).then(() => {
          window.open(baseUrl + `main/list?id=${this.detail.id}&pId=${this.detail.categoryId}&objectId=${row.id}&objectType=${row.type}`, '_blank')
        }).catch(() => {
        })
      } else if (row.type === 'column') {
        this.getElementParent(row.id).then(parentId => {
          window.open(baseUrl + `main/list?id=${this.detail.id}&pId=${this.detail.categoryId}&objectId=${parentId}&objectType=table`, '_blank')
        })
      } else if (row.type === 'keyGroup') {
        this.getElementParent(row.id).then(parentId => {
          window.open(baseUrl + `main/list?id=${this.detail.id}&pId=${this.detail.categoryId}&objectId=${parentId}&objectType=table&tab=index`, '_blank')
        })
      } else if (row.type === 'keyMember') {
        this.getElementParent(row.id).then(parentId => {
          this.getElementParent(parentId).then(parentId => {
            window.open(baseUrl + `main/list?id=${this.detail.id}&pId=${this.detail.categoryId}&objectId=${parentId}&objectType=table&tab=index`, '_blank')
          })
        })
      } else if (row.type) {
        console.error(row.type)
      }
    },
    getElementParent (elementId) {
      return new Promise((resolve, reject) => {
        HTTP.getElementParent({
          elementId: elementId,
          modelId: this.detail.id,
          successCallback: data => {
            if (data) {
              resolve(data)
            } else {
              this.$message.error($store.state.$v.report.err2)
              reject(new Error())
            }
          },
          failureCallback: error => {
            this.$message.error($store.state.$v.report.err2)
            reject(error)
          },
          finallyCallback: data => {
          }
        })
      })
    },
    filterData () {
      let keyword = this.keyword
      const filterHandler = item => {
        let bool = false
        // 类型匹配
        if (this.types.length === 0 || this.types.includes(item.type)) {
          // 关键字匹配
          if (string.matchKeyword(item, keyword, 'name')) {
            // 本身被修改
            if (item.changed) {
              bool = true
            }
          }
        }

        let children = item.children || []
        if (children && Array.isArray(children)) {
          children.forEach(child => {
            if (filterHandler(child)) {
              bool = true
            }
          })

          item.children = children.filter(child => filterHandler(child))
        }

        return bool
      }
      let filteredData = (_.cloneDeep(this.rawData) || []).filter(item => filterHandler(item))
      this.filteredData = filteredData
      this.handleSortChange({})
    },
    handleSortChange ({ column, prop, order }) {
      this.tableData = _.clone(this.filteredData)

      if (order) {
        let sortHandler = (arr) => {
          sort.sortConsiderChineseNumber(arr, prop, order)
          arr.forEach(item => {
            if (item.children) {
              sortHandler(item.children)
            }
          })
        }
        sortHandler(this.tableData)
        // sort.sortConsiderChineseNumber(this.tableData, prop, order)
      }
    },
    backToReportList () {
      this.$emit('backToReportList')
    }
  },
  watch: {
    keyword () {
      this.filterData()
    },
    defaultExpandAll () {
      this.forceRefreshTable()
    }
  }
}
</script>

<style scoped lang="scss">
.title {
  font-size: 16px;
  //margin-bottom: 1em;
  line-height: 40px;
  margin-top: -20px;
}

.change-list-tabs {
  position: relative;
  //height: 30px;
  top: 1px;
}

.change-list /deep/ {
  .el-table.datablau-table .el-table__header-wrapper {
    border-bottom-color: #ddd;
  }

  .el-table__row {
    td.el-table__cell {
      border-bottom-color: #ddd;
    }

    &.change-item {
      background-color: #F4FAFC;
    }
  }

}

</style>
