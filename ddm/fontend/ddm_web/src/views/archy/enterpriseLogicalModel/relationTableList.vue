<template>
  <div class="">
    <div class="table-container">
      <datablau-table
        :data="tableData"
        ref="staffTable"
        key="relationTable"
        :maxHeight="500"
      >
        <el-table-column
          show-overflow-tooltip
          label="名称"
          prop="name"
          min-width="120"
        >
          <template slot-scope="scope">
            <datablau-list-icon iconType="svg" :dataType="'table'"></datablau-list-icon>
            <span
              @click.stop="checkEntityDetail(scope.row)"
              class="list-table-link"
            >
              {{ scope.row.name }}
            </span>
          </template>

        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="中文名"
          prop="alias"
          min-width="120"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="模型"
          prop="path"
          min-width="120"
        >
          <template slot-scope="scope">
            <span
              @click.stop="checkModel(scope.row)"
              class="list-table-link"
            >
              {{ scope.row.path }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="实体"
          prop="source"
          min-width="120"
          :formatter="entitiesFormatter"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          label="CRUD"
          prop="crud"
          min-width="120"
        >
        </el-table-column>
        <el-table-column
          label="查看"
          width="80"
          fixed="right"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              class="iconfont icon-see"
              @click.stop="checkEntityDetail(scope.row)"
              tooltipContent="查看"
            >
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="page-pignation" v-if="total > 10">
      <datablau-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :current-page.sync="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import paginationMixin from '@/components/common/mixin/paginationMixin'

export default {
  name: 'relationTableList',
  data () {
    return {
      filterObj: {
        filterStatus: 'all',
        filterTheme: 'all',
        filterTime: ''
      },
      originData: null,
      showTable: false,
      pageSize: 10
    }
  },
  props: {
    objectId: {
      type: [String, Number],
      required: true
    },
    sourceId: {
      type: String,
      default: ''
    },
    entitiesMap: {
      type: Object
    }
  },
  mixins: [paginationMixin],
  components: {},
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.tableData = null
      this.getAllData()
      // this.fetchData()
    },
    getAllData () {
      let url = `${HTTP.$archyServerUrl}object/object/info/tables/${this.objectId}`
      this.$http.post(url)
        // HTTP.getBusinessObjList(para)
        .then(res => {
          let data = res.data

          // // TODO 测试数据
          // data.push(...data)
          // data.push(...data)
          // data.push(...data)
          // this.total = data.length
          // this.tableData = data
          this.originData = data
          this.showTable = true
          this.getFilterData()
        })
        .catch(e => {
          this.$showFailure(e)
          this.tableData = []
        })
    },
    getFilterData () {
      if (this.sourceId) {
        let sourceId = this.sourceId
        this.allData = this.originData.filter(item => {
          let source = item.source
          // console.log(item, 'item')
          // return item.combinedId === sourceId
          return source.find(id => id === sourceId)
        })
      } else {
        this.allData = [...this.originData]
      }
      this.fetchData()
    },
    refreshData () {
      // console.log('refreshData')
      let para = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }
      this.getData(para)
    },
    getData (para) {
      this.getDataFromAll(para)
    },
    entitiesFormatter (row, column, cellValue, index) {
      if (!this.entitiesMap) {
        return ''
      }
      return (cellValue || []).map(item => {
        return this.entitiesMap[item]?.name
      }).join(', ')
    },
    checkEntityDetail (row) {
      this.$emit('checkEntity', row)
    },
    checkModel (data) {
      this.$emit('checkModel', { modelId: data.modelId })
    }
  },
  watch: {
    sourceId (newVal) {
      // console.log(newVal, 'newVal')
      this.currentPage = 1
      this.getFilterData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/next/components/basic/color.sass";

.list-table-link {
  cursor: pointer;

  &:hover {
    color: $primary-color
  }
}

.table-container {
  margin: 0 20px 0;
  min-height: 240px;
  //max-height: 500px;
}

.page-pignation {
  //border-top: 1px solid #ddd;
  //position: absolute;
  //bottom: 0;
  //left: 0;
  //right: 0;
  height: 50px;
  display: flex;
  padding-right: 20px;
  justify-content: flex-end;
  align-items: center;
}
</style>
