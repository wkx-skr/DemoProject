<template>
  <div class="content-area">
    <div class="top-header-info-panel-wrapper">
      <el-input
        size="small"
        v-model="keyword"
        @input="search"
        prefix-icon="el-icon-search"
        :placeholder="$v.userMgr.placeholder_01"
      ></el-input>
      <span style="margin-left: 20px;font-size: 14px;">
        在线编辑模型数量：<span>{{ this.sessionCnt }}</span>
        <!--，License剩余数：<span>{{this.remainCnt === -1 ? '无限制': this.remainCnt}}</span>-->
      </span>
    </div>
    <div class="table-container">
      <el-table
        class="datablau-table"
        :data="tableShowData"
        row-class-name="row-can-click1"
        height="100%">
        <el-table-column
          prop="username"
          :label="$v.userMgr.userName"
          show-overflow-tooltip
          width="150"
        >
          <template slot-scope="scope">
            <div>
              <i class="user-icon"></i>
              {{scope.row.userName}}
            </div>
          </template>
        </el-table-column>
        <!--<el-table-column
          :min-width="200"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{pathMap.get(scope.row.categoryId)}}
          </template>
        </el-table-column>-->
        <el-table-column
          prop="path"
          label="模型路径"
        ></el-table-column>
        <el-table-column
          prop="ip"
          label="IP"
        >
          <template slot-scope="scope">
            <div>
              {{scope.row.ip.split(',')[0]}}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="模型编辑时间"
          width="150"
        >
          <template slot-scope="scope">
            <div>
              {{moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="更新时间"
          width="150"
        >
          <template slot-scope="scope">
            <div>
              {{moment(scope.row.updateTime).format('YYYY-MM-DD HH:mm:ss')}}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        :current-page.sync="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import HTTP from '@/resource/http'
export default {
  data () {
    return {
      tableShowData: [],
      tableData: [],
      keyword: '',
      total: 0,
      pageSize: 20,
      currentPage: 1,
      moment,
      pathMap: new Map(),
      sessionCnt: 0,
      remainCnt: 0
    }
  },
  mounted () {
    this.getPathMap()
    this.getSessionData()
  },
  methods: {
    getPathMap () {
      const pathMap = new Map()
      const forEach = (obj, path) => {
        if (obj.models && Array.isArray(obj.models)) {
          pathMap.set(obj.id, path + '/' + obj.name)
        }
        if (obj.children && Array.isArray(obj.children)) {
          obj.children.forEach(child => {
            forEach(child, path + '/' + obj.name)
          })
        }
      }
      const handler = data => {
        this.$store.state.modelsTree = data
        forEach(data, '')
        this.pathMap = pathMap
      }
      if (this.$store.state.modelsTree) {
        handler(this.$store.state.modelsTree)
      } else {
        HTTP.getModels({
          successCallback: handler
        })
      }
    },
    search () {
      this.currentPage = 1
      let list = this.tableData.filter(i => i.userName.indexOf(this.keyword) !== -1)
      this.total = list.length
      this.tableShowData = list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    getSessionData () {
      this.$http.get(this.$url + '/service/editor/session').then(res => {
        this.remainCnt = res.data.remainCnt
        this.sessionCnt = res.data.sessionCnt
        this.tableData = res.data.sessionDtos
        this.total = this.tableData.length
        this.tableShowData = this.tableData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.currentPage = 1
      this.tableShowData = this.tableData.filter(i => i.userName.indexOf(this.keyword) !== -1).slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    handleCurrentChange (current) {
      this.currentPage = current
      this.tableShowData = this.tableData.filter(i => i.userName.indexOf(this.keyword) !== -1).slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    }
  }
}
</script>

<style lang="scss" scoped>
  .content-area {
    left:0;
  }
  .table-container {
    top:65px;
    bottom:50px;
  }
  .user-icon {
    display: inline-block;
    margin-right: 8px;
    width: 11px;
    height: 13px;
    background: url('../common/navIcon/user.svg');
    background-size: contain;
    vertical-align: middle;
  }
</style>
