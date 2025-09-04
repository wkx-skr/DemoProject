<template>
  <div>
    <div class="tab-topLine">
      <p class="tab-title">我的订阅</p>
      <div class="vertical-middle top-line-inner">
        <el-input
          class="search-input"
          size="small"
          placeholder="输入关键字进行搜索"
          prefix-icon="el-icon-search"
          v-model="keyword"
          :clearable="true"
        ></el-input>
      </div>
    </div>
    <div class="tab-tableLine styleTable">
      <el-table
        class="el-table datablau-table"
        ref="deTable"
        :data="tableData"
        v-loading="tableLoading"
      >
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <img
              class="tableIcon"
              style="width: 24px; height: auto; position: relative; top: 7px"
              v-if="scope.row.typeId === 80010066"
              src="../../assets/images/search/datastandard.svg"
              alt=""
            />
            <img
              class="tableIcon"
              style="width: 24px; height: auto; position: relative; top: 7px"
              v-if="scope.row.typeId === 80010001 && scope.row.flag === 0"
              src="../../../static/userCenter/dataSource.png"
              alt=""
            />
            <img
              class="tableIcon"
              style="width: 24px; height: auto; position: relative; top: 7px"
              v-if="scope.row.typeId === 80000005 && scope.row.flag === 1"
              src="../../assets/images/search/column.svg"
              alt=""
            />
            <span style="padding-left: 10px">{{ scope.row.objectName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订阅时间" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ $timeFormatter(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="jump(scope.row)">
              查看
            </el-button>
            <el-button type="text" size="small" @click="scan(scope.row)">
              取消订阅
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="tab-bottomLine"></div>
  </div>
</template>
<script>
import agTableComponent from '@/components/common/agTableComponent'
import MyScanRenderer from './MyScanRenderer.js'
export default {
  components: { agTableComponent },
  data() {
    return {
      gridApi: null,
      columnApi: null,
      gridOptions: {
        rowSelection: false,
      },
      tableLoading: false,
      columnDefs: null,
      tableData: null,
      tableDataOfSource: null,
      tableDataOfModel: null,
      frameworkComponents: null,
      keyword: '',
      tableLoading: true,
    }
  },
  beforeMount() {
    const cellStyle = {}
    this.frameworkComponents = {
      MyScanRenderer: MyScanRenderer,
    }
    this.columnDefs = [
      {
        headerName: '名称',
        field: 'objectName',
        sortable: true,
        filter: true,
        tooltipField: 'objectName',
        cellRenderer: params => {
          return /* '<i class="tree-icon folder"></i>' */ params.value
        },
      },
      {
        headerName: '订阅时间',
        field: 'createTime',
        width: 160,
        sortable: true,
        filter: true,
        cellRenderer: params => {
          if (typeof params.value === 'number') {
            return this.$timeFormatter(params.value)
          } else {
            return ''
          }
        },
      },
      {
        headerName: '操作',
        width: 120,
        cellRenderer: 'MyScanRenderer',
      },
    ]
    this.$bus.$on('removeDisSubscribe', () => {
      this.prepareTableData()
    })
  },
  mounted() {
    this.prepareTableData()
  },
  methods: {
    jump(data) {
      if (data.typeId === 80010001 && data.flag === 1) {
        this.$router.push({
          name: 'ddm',
          query: {
            modelId: data.objId,
            path: data.objectName,
          },
        })
      } else if (data.typeId === 80010001 && data.flag === 0) {
        this.$router.push({
          name: 'dataSource',
          query: { id: data.objId },
        })
      } else if (data.typeId === 80010066) {
        if (data.domainFolderId === 1) {
          this.$router.push({
            name: 'dataStandard',
            query: { domain: data.objId },
          })
        } else if (data.domainFolderId === 2) {
          this.$router.push({
            name: 'index',
            query: { domain: data.objId },
          })
        } else if (data.domainFolderId === 3) {
          this.$router.push({
            name: 'glossarys',
            query: { domain: data.objId },
          })
        }
      }
    },
    scan(data) {
      this.$confirm('确定要取消订阅吗?', '取消订阅', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$http
            .delete(this.$url + '/service/subscribe/' + data.id)
            .then(res => {
              this.$getSubscribe(() => {
                this.prepareTableData()
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    async prepareTableData() {
      this.tableData = []
      await this.$http
        .get(`${this.$url}/service/subscribe/`)
        .then(res => {
          if (this.keyword !== '') {
            res.data.forEach(item => {
              const keyword = this.keyword.trim().toLowerCase()
              if (item.objectName.toLowerCase().indexOf(keyword) !== -1) {
                this.tableData.push(item)
              }
            })
          } else {
            this.tableData = res.data
          }
          this.tableLoading = false
          // this.tableData = res.data.filter(e => e.typeId === 80010066)
          // this.tableDataOfSource = res.data.filter(e => e.typeId === 80010001 && e.flag === 0)
          // this.tableDataOfModel = res.data.filter(e => e.typeId === 80010001 && e.flag === 1)
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.setTableHeight()
    },
    setTableHeight() {
      if (this.$refs.domainsTable && this.tableData) {
        if (this.tableData.length <= 6) {
          this.$refs.domainsTable.$el.style.height =
            40 * this.tableData.length + 40 + 'px'
        } else {
          this.$refs.domainsTable.$el.style.height = '300px'
        }
      }
      if (this.$refs.sourceTable && this.tableDataOfSource) {
        if (this.tableDataOfSource.length <= 6) {
          this.$refs.sourceTable.$el.style.height =
            40 * this.tableDataOfSource.length + 40 + 'px'
        } else {
          this.$refs.sourceTable.$el.style.height = '300px'
        }
      }
      if (this.$refs.modelTable && this.tableDataOfModel) {
        if (this.tableDataOfModel.length <= 6) {
          this.$refs.modelTable.$el.style.height =
            40 * this.tableDataOfModel.length + 40 + 'px'
        } else {
          this.$refs.modelTable.$el.style.height = '300px'
        }
      }
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
      //        this.setTableHeight();
    },
    initAgGrid() {
      this.$refs.domainsTable.sizeColumnsToFit()
    },
  },
  watch: {
    keyword(newVal) {
      this.prepareTableData()
    },
  },
}
</script>
<style scoped lang="scss">
@import './_main';
</style>
