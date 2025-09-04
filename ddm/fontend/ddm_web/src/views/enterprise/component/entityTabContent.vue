<template>
  <div class="entity">
    <business-entity :entityObj="paginationData" :tableData="tableData" :totalObjects="totalEntities" @entityList="queryTableData" @physical="physical" v-loading="loading"></business-entity>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import BusinessEntity from '@/views/enterprise/component/businessEntity'
export default {
  components: { BusinessEntity },
  props: {
    parentData: {
      type: Object,
      default () { return {} }
    } },
  data () {
    return {
      totalEntities: 0,
      tableData: [],
      paginationData: {
        currentPage: 0,
        total: 0,
        pageSize: 10
      },
      keyword: '',
      loading: true

    }
  },
  methods: {
    physical (row) {
      row.entityFlag = 'entity'
      let aliasList = JSON.parse(row.alias)
      row.aliasName = aliasList.alias
      row.definition = aliasList.definition
      row.parentObject = Object.values(aliasList.parentObject).join(',')
      this.$bus.$emit('showLowerData', { parentData: this.parentData, row })
    },
    // 查询表格数据
    queryTableData (params) {
      if (this.parentData.id) {
        const queryParams = {
          businessObjectId: this.parentData.id,
          content: this.keyword,
          currentPage: 0,
          pageSize: 10
        }
        this.loading = true
        HTTP.getObjEntityList({ ...queryParams, ...params }).then(res => {
          this.loading = false
          this.totalObjects = res.totalElements
          res.content.forEach(item => {
            let aliasList = JSON.parse(item.alias)
            item.aliasName = aliasList.alias
            item.definition = aliasList.definition
            item.parentObject = aliasList.parentObject
          })
          this.tableData = res.content
          this.paginationData.total = res.totalElements
        }).catch(() => {
          this.loading = false
        })
      }
    },
    // 刷新数据
    refreshTableData () {
      // console.log('刷新')
      this.queryTableData(this.paginationData)
    }
  },
  watch: {
    parentData: {
      handler (v, preV) {
        if (v.id) {
          this.queryTableData()
        }
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style>
  .entity{
    padding-bottom: 15px;
  }
.table-controller{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-props{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-props .el-select > .el-input{
  width: 100px;
}
.table-controller .el-button{
  margin-left: 10px;
}
.el-button{
  border-radius: 5px;
}
.el-autocomplete, .el-select{
  width: 100%;
}
.jumpClick{
  color: #4386f5;
  cursor: pointer;
}
</style>
