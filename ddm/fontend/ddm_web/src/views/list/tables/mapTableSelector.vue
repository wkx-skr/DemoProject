<template>
  <div class="map-table-selector-wrapper">
    <div class="left-wrapper">
      <datablau-input style="display: block" :icon-font="true" v-model="query" placeholder="搜索" @input="searchTreeData"></datablau-input>
      <datablau-tree
        class="tree-wrapper"
        ref="tree"
        :data="treeData"
        node-key="id"
        :default-expanded-keys="defaultExpandList"
        :expand-on-click-node="true"
        :filter-node-method="filterNode"
        @node-click="nodeClick"
        :props="defaultProps"
        :data-icon-function="dataIconFunction"
      >
      </datablau-tree>
    </div>
    <div class="right-wrapper">
      <datablau-input style="display: block" :icon-font="true" v-model="tableQuery" placeholder="搜索" @input="searchTableData"></datablau-input>
      <div class="table-wrapper">
        <datablau-table
          :key="tableKey"
          @selection-change="handleSelectionChange"
          :data="tableShowData"
          :dataSelectable="true"
          :reserveSelection="true"
          height="100%"
          row-key="Id"
          v-loading="tableLoading"
          class="datablau-table"
          @sort-change="handleSortChange"
        >
          <el-table-column width="30">
            <template>
              <img style="
                width:20px;
                height:20px;
                position: relative;
                bottom: 2px;"
                   :src="tableImg"
                   class="table-img"
              >
            </template>
          </el-table-column>
          <el-table-column
            :label="(isConceptual || isLogicalModel) ? $store.state.$v.dataEntity.entityOrViewName : $store.state.$v.dataEntity.tableOrViewName"
            prop="Name"
            min-width="140"
            sortable="custom"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="link-text">{{scope.row.Name}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="150" sortable="custom" prop="LogicalName" :label="$store.state.$v.dataEntity.alias"  show-overflow-tooltip></el-table-column>
        </datablau-table>
      </div>
    </div>
  </div>
</template>

<script>
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'

export default {
  data () {
    return {
      tableKey: 0,
      selectedData: [],
      tableImg: require('@/assets/images/mxgraphEdit/Table.svg'),
      tableData: [],
      tableShowData: [],
      tableQuery: '',
      tableLoading: false,
      currentModel: null,
      query: '',
      defaultExpandList: [],
      treeData: [],
      defaultProps: {
        children: 'arr',
        label: 'name',
        isLeaf: function (data) {
          return !data.arr?.length
        }
      },
      currentPage: 1,
      pageSize: 20,
      total: 0
    }
  },
  props: {
    isConceptual: {},
    isLogicalModel: {}
  },
  components: {

  },
  computed: {

  },
  mounted () {
    this.getModelData()
  },
  methods: {
    handleSelectionChange (rows) {
      this.selectedData = rows
    },
    handleSortChange ({ column, prop, order }) {
      this.prop = prop
      this.order = order
      this.currentPage = 1
      this.getTablePageData()
    },
    searchTableData () {
      this.currentPage = 1
      this.getTablePageData()
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getTablePageData()
    },
    handleCurrentChange (current) {
      this.currentPage = current
      this.getTablePageData()
    },
    getTablePageData () {
      let filterData = this.tableData.filter(item => string.matchKeyword(item, this.tableQuery, 'Name', 'LogicalName'))
      if (this.order) {
        sort.sortConsiderChineseNumber(filterData, this.prop, this.order)
      }
      this.tableShowData = filterData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    searchTreeData () {
      this.$refs.tree.filter(this.query)
    },
    getAllTableData () {
      this.tableLoading = true
      this.$http.get(`${this.$url}/models/${this.currentModel.id}/direct/content/json`).then(res => {
        console.log(res.data)
        let tableData = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.EntityComposite').map(item => item.properties)
        this.tableData = tableData
        this.total = this.tableData.length
        this.currentPage = 1
        this.$emit('paginationKeyRefresh')
        this.getTablePageData()
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.tableLoading = false
      })
    },
    nodeClick (data) {
      if (data.seed) { // 模型
        this.currentModel = data
        this.selectedData = []
        this.tableKey++
        this.getAllTableData()
      }
    },
    filterNode (value, data, node) {
      if (!value) return true
      let current = node
      if (string.matchKeyword(current.data, value, 'name')) {
        return true
      } else {
        return false
      }
    },
    dataIconFunction (data, node) {
      if (data.seed) {
        return 'tree-icon model'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    getModelData () {
      this.$http.get(`${this.$url}/models/`).then(res => {
        let treeData = [res.data]
        this.defaultExpandList = [res.data.id]
        this.formatTreeData(treeData)
        this.treeData = treeData
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    formatTreeData (treeData) {
      treeData.forEach(item => {
        let arr = []
        if (item.children) {
          arr = arr.concat(item.children)
        }
        if (item.models) {
          arr = arr.concat(item.models)
        }
        this.$set(item, 'arr', arr)
        if (item.children) {
          this.formatTreeData(item.children)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.map-table-selector-wrapper {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  align-items: stretch;
  /deep/ .tree-icon.model {
    width: 24px!important;
    max-height: 24px!important;
  }
  .left-wrapper {
    position: relative;
    flex: 0 0 300px;
    padding: 20px;
  }
  .tree-wrapper {
    position: absolute;
    top: 70px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    overflow: auto;
  }
  .right-wrapper {
    flex: 1 1 auto;
    overflow: auto;
    position: relative;
    padding: 20px;
  }
  .table-wrapper {
    position: absolute;
    top: 70px;
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
}
</style>
