<template>
  <div class="mainDiv">
    <div style="min-width: 700px">
      <datablau-page-title style="transform: translateX(-20px)">
        流程监控
      </datablau-page-title>
      <!-- <el-input clearable maxlength="100" class="width1 keyword" clearable v-model="searchWord" prefix-icon="el-icon-search" placeholder="请输入关键字" size="small"></el-input>
    <span class="status">
      <span>流程状态:</span>
      <el-select class="width2" v-model="status" size="small">
        <el-option
          v-for="item in statusList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </span> -->
      <el-form size="mini" :inline="true">
        <el-form-item label="流程名称">
          <el-input
            clearable
            type="text"
            v-model="searchWord"
            class="width"
            placeholder="请输入流程名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="提交人" style="margin-left: 40px">
          <el-input
            clearable
            type="text"
            placeholder="请选择提交人"
            class="width"
            v-model="startUser"
            @focus="selectPartment"
          ></el-input>
        </el-form-item>
        <br />
        <el-form-item label="审批结果">
          <el-select v-model="status" size="mini" class="width">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="提交时间"
          style="margin-left: 30px; margin-right: 40px"
        >
          <el-date-picker
            v-model="dataRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width:18vw;min-width: 345px;"
            range-separator="至"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchResult()">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      ref="multipleTable"
      :data="tableData"
      class="table"
      tooltip-effect="dark"
      style="width: 98%; min-width: 700px"
      size="small"
      v-loading="loading"
      :header-cell-style="{
        color: 'var(--base-font-color)',
        'font-size': '12px',
        'font-weight': 'bold',
      }"
    >
      <el-table-column
        prop="processInstanceName"
        label="流程名称"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="startUserId"
        label="提交人"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="department"
        label="所属部门"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="processInstanceStartTime"
        label="提交时间"
        :formatter="$timeFormatter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="流程类型"
        prop="processType"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="result"
        label="流程状态"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="currentAssignee"
        label="当前处理人"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <div style="width: 100px">
            <el-button
              type="text"
              size="mini"
              @click.stop="showDetail(scope.row)"
            >
              查看
            </el-button>
            <!--            <span class="history" v-if="$hasAuth(5014)">详情</span>-->
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="bottom">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="page"
      >
        >
      </el-pagination>
    </div>
    <processDetail ref="processDetail"></processDetail>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import processDetail from '../../components/processDetail/processDetail'
export default {
  components: {
    processDetail
  },
  data () {
    return {
      showDialog: false,
      taskName: '',
      statusList: [
        { label: '全部', value: '' },
        { label: '审核中', value: '审核中' },
        { label: '审核通过', value: '审核通过' },
        { label: '审核不通过', value: '审核不通过' }
      ],
      status: '',
      searchWord: '',
      currentPage: 1,
      pageSize: 10,
      tableData: [],
      tableAllData: [],
      manyEachPage: 10,
      tableAllData2: [],
      loading: false,
      statusDetailList: [],
      active: 0,
      detailVisible: false,
      msgList: [],
      nameMapping: {},
      total: 0,
      pageTurn: false,
      dataRange: null,
      startUserId: '',
      startUser: '',
      deleteArr: ['tableData', 'tableAllData', 'tableAllData2', 'nameMapping']
    }
  },
  beforeDestroy () {
    this.deleteArr.forEach(item => {
      if (typeof this[item] === 'object' && this[item]) {
        Object.keys(this[item]).forEach(o => {
          this[item][o] = null
        })
      }
      this[item] = null
    })
    if (window.CollectGarbage) {
      window.CollectGarbage()
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    searchResult () {
      this.pageTurn = true
      this.initData()
    },
    initData () {
      this.loading = true
      if (this.pageTurn) {
        this.currentPage = 1
      }
      if (this.startUser === '') {
        this.startUserId = ''
      }
      const requestBody = {
        allApply: true,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        applyResult: this.status,
        orderByCreateTime: false,
        processName: this.searchWord,
        startUserId: this.startUserId,
        startTimeLeft: this.dataRange !== null ? this.dataRange[0] : '',
        startTimeRight: this.dataRange !== null ? this.dataRange[1] : ''
      }
      HTTP.getMyApply(requestBody)
        .then(res => {
          this.loading = false
          // this.tableAllData = res.data.value
          // this.tableAllData2 = this.tableAllData
          this.tableData = res.data.value
          // this.handleCurrentChange(1)
          this.total = res.data.total
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    showDetail (row) {
      setTimeout(() => {
        this.$refs.processDetail.initData(row)
      })
    },
    selectPartment () {
      this.$utils.staffSelect.open([], true).then(res => {
        const arr1 = []
        const arr2 = []
        res.forEach(e => {
          arr1.push(e.username)
          arr2.push(e.username)
        })
        this.startUserId = arr1.toString()
        this.startUser = arr2.toString()
      })
    },
    handleSizeChange (val) {
      this.currentPage = 1
      this.pageSize = val
      this.initData()
    },
    handleCurrentChange (val) {
      this.pageTurn = false
      this.currentPage = val
      this.initData()
    },
    spliceData () {
      const arr1 = []
      this.tableAllData.forEach(e => {
        if (
          e.processInstanceName.includes(this.searchWord) ||
          e.startUserId.includes(this.searchWord) ||
          (e.department && e.department.includes(this.searchWord))
        ) {
          arr1.push(e)
        }
      })
      this.tableAllData2 = arr1
      if (this.status) {
        const arr = []
        this.tableAllData2.forEach(e => {
          if (e.result === this.status) {
            arr.push(e)
          }
        })
        this.tableAllData2 = arr
      }
      this.handleCurrentChange(1)
    },
    getUserByIds (idList) {
      // if (!idList) {
      //   return
      // }
      // return new Promise(resolve => {
      //   this.$http.post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList).then(res => {
      //     const obj = {}
      //     res.data.forEach(e => {
      //       obj[e.tuAcct] = e.tuCname
      //     })
      //     this.nameMapping = obj
      //
      //   }).catch(e => {
      //     this.$showFailure(e)
      //   })
      // })
    },
    getPeopleName (list) {
      const list2 = list.includes(',') ? list.split(',') : [list]
      // return list2.map(e => this.nameMapping[e]).toString()
      return list2.toString()
    }
  },
  // computed: {
  //   total () {
  //     return this.tableAllData2.length
  //   }
  // },
  watch: {
    // searchWord () {
    //   this.searchResult()
    // },
    // status () {
    //   this.searchResult()
    // }
  }
}
</script>

<style lang="scss" scoped>
.mainDiv {
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  background-color: var(--default-bgc);
  padding-left: 20px;
  overflow: auto;
}
.bottom {
  position: absolute;
  bottom: 5px;
  width: 98%;
  min-width: 700px;
}
.page {
  position: absolute;
  bottom: 0;
  right: 20px;
}
.table {
  position: absolute;
  top: 130px;
  bottom: 40px;
  overflow-y: auto;
}
.keyword {
  margin-top: 10px;
}
.status {
  float: right;
  margin-top: 10px;
  margin-right: 20px;
}
.width {
  width: 18vw;
  min-width: 200px;
}
</style>
