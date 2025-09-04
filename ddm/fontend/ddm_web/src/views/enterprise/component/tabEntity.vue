<template>
  <div>
    <business-entity :entityObj="entityObj" :tableData="tableData" :totalObjects="totalObjects" @entityList="entityList" @physical="physical" v-loading="loading" :areaOptions="areaOptions" :level="level" :parentData="parentData"></business-entity>
  </div>
</template>

<script>
import BusinessEntity from '@/views/enterprise/component/businessEntity'
import HTTP from '@/resource/http'
export default {
  components: { BusinessEntity },
  props: {
    parentData: {
      type: Object,
      default: () => {}
    },
    activeName: {
      type: String,
      default: () => ''
    }
  },
  data () {
    return {
      keyword: '',
      totalObjects: 0,
      entityObj: {
        currentPage: 0,
        pageSize: 10,
        total: 0
      },
      loading: false,
      tableData: [],
      level: 1,
      areaOptions: []
    }
  },
  methods: {
    entityList (val) {
      let params = {
        categoryId: this.parentData.id,
        content: this.keyword,
        currentPage: this.entityObj.currentPage ? this.entityObj.currentPage - 1 : 0,
        pageSize: this.entityObj.pageSize
      }
      let json = { ...params, ...val }
      this.loading = true
      HTTP.getEntityList(json).then(res => {
        this.loading = false
        res.content.forEach(item => {
          let aliasList = JSON.parse(item.alias)
          item.aliasName = aliasList.alias
          item.definition = aliasList.definition
          item.parentObject = aliasList.parentObject
        })
        this.tableData = res.content
        this.totalObjects = res.totalElements
        this.entityObj = {
          currentPage: res.pageable.pageNumber,
          pageSize: res.pageable.pageSize,
          total: res.totalElements,
          origin: true
        }
      }).catch(() => {
        this.loading = false
      })
    },
    physical (row) {
      row.entityFlag = 'entity'
      let aliasList = JSON.parse(row.alias)
      row.aliasName = aliasList.alias
      row.definition = aliasList.definition
      row.parentObject = aliasList.parentObject
      this.$bus.$emit('showLowerData', { parentData: this.parentData, row })
    },
    getTree () {
      HTTP.categoryTreeById({
        categoryId: this.parentData.id
      }).then(res => {
        this.areaOptions = res
        this.areaOptions.unshift({ id: '', name: '所有领域' })
      })
    }
  },
  watch: {
    parentData: { // 监听parentData
      handler (v, preV) {
        if (v.id) {
          this.entityList()
        }
        if (v.level === 1) {
          this.getTree()
        }

        this.level = v.level
      },
      deep: true
    }
  },
  mounted () {

  }
}
</script>

<style scoped lang='scss'>
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
  .search-props .el-input{
    margin-left: 10px;
  }
  .jumpClick{
    color: #4386f5;
    cursor: pointer;
  }
</style>
