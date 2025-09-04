<template>
  <div class="mainDiv">
    <datablau-dialog
      :title="applyDetailData.processInstanceName || applyDetailData.taskName"
      :visible.sync="showApplyDetails"
      :show-close="!$route.query.taskId"
      :width="$route.query.taskId ? '100vw' : '1000px'"
      :fullscreen="$route.query.taskId"
      :height="520"
    >
      <div class="dialog-outer detail-dialog-outer">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
        ></apply-detail>
      </div>
    </datablau-dialog>
    <datablau-list-search style="padding: 0 20px" @domResize="domResize">
      <template slot="title">
        <div>数据申请单</div>
      </template>
      <div>
        <el-form>
          <el-form-item label="" class="form-item-180">
            <datablau-userselect
              v-model="startUserId"
              :placeholder="'请输入或选择提交人搜索'"
            ></datablau-userselect>
            <datablau-button
              style="margin-left: 6px"
              type="icon"
              class="iconfont icon-tianjia"
              @click="selectPartment"
            ></datablau-button>
          </el-form-item>
          <el-form-item label="审批结果" class="min-form-item">
            <datablau-select v-model="status" style="width: 180px">
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="提交时间">
            <datablau-dateRange
              v-model="dataRange"
              type="daterange"
              value-format="yyyy-MM-dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              range-separator="至"
            ></datablau-dateRange>
          </el-form-item>
          <el-form-item label="所属部门" class="min-form-item">
            <datablau-input
              style="width: 180px"
              clearable
              class="width"
              maxlength="100"
              readonly
              v-model="department"
              placeholder="点击选择所属机构"
              @focus="selectDepartment"
            ></datablau-input>
          </el-form-item>
          <el-form-item class="btn">
            <datablau-button type="normal" @click="searchResult()">
              查询
            </datablau-button>
            <datablau-button type="secondary" @click="resetForm">
              重置
            </datablau-button>
          </el-form-item>
        </el-form>
      </div>
    </datablau-list-search>
    <div class="table-box" :style="{ top: listSearchH }">
      <datablau-form-submit>
        <datablau-table
          ref="multipleTable"
          :data="tableData"
          v-loading="loading"
          height="100%"
        >
          <el-table-column
            :min-width="180"
            prop="processInstanceName"
            label="流程名称"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="startUserFullUserName"
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
            :min-width="120"
            :formatter="$timeFormatter"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="流程类型"
            prop="processType"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column prop="result" label="审批结果" show-overflow-tooltip>
            <template slot-scope="scope">
              <span
                :class="{
                  'success-color': scope.row.result == '审核通过',
                  'wait-color': scope.row.result == '审核中',
                  'fail-color': scope.row.result == '审核不通过',
                  'revoke-color': scope.row.result == '已撤销',
                }"
              >
                {{ scope.row.result }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="currentAssigneeFullUserName"
            label="当前处理人"
            :width="100"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="操作"
            align="center"
            fixed="right"
            :width="50"
          >
            <template slot-scope="scope">
              <div>
                <datablau-tooltip
                  effect="dark"
                  content="查看"
                  placement="bottom"
                >
                  <datablau-button
                    type="text"
                    @click.stop="checkItemDetail(scope.row)"
                  >
                    <i class="iconfont icon-see"></i>
                  </datablau-button>
                </datablau-tooltip>
              </div>
            </template>
          </el-table-column>
        </datablau-table>
        <div slot="buttons">
          <datablau-pagination
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
          </datablau-pagination>
        </div>
      </datablau-form-submit>
    </div>
    <process-detail ref="processDetail" v-if="false"></process-detail>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import processDetail from '../../../components/processDetail/processDetail'
import applyDetail from '@/view/processControl/applyDetail.vue'
export default {
  components: {
    processDetail,
    applyDetail,
  },
  data() {
    return {
      listSearchH: '',
      showDialog: false,
      taskName: '',
      statusList: [
        { label: '全部', value: '' },
        { label: '审核中', value: '审核中' },
        { label: '审核通过', value: '审核通过' },
        { label: '审核不通过', value: '审核不通过' },
        { label: '已撤销', value: '已撤销' },
      ],
      status: '',
      searchWord: '',
      department: '',
      currentPage: 1,
      pageSize: 10,
      tableData: [],
      tableAllData: [],
      manyEachPage: 10,
      tableAllData2: [],
      loading: true,
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
      deleteArr: ['tableData', 'tableAllData', 'tableAllData2', 'nameMapping'],
      dialogTitle: '',
      showApplyDetails: false,
      applyDetailData: {},
    }
  },
  beforeDestroy() {
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
  mounted() {
    this.initData()
  },
  methods: {
    resetForm() {
      this.startUserId = ''
      this.status = ''
      this.dataRange = null
      this.department = ''
      this.pageTurn = true
      this.initData()
    },
    domResize(h) {
      this.listSearchH = h + 40 + 'px'
    },
    selectDepartment() {
      this.$utils.branchSelect.open().then(res => {
        this.department = res.fullName
      })
    },
    checkItemDetail(data) {
      this.dialogTitle = data.processInstanceName
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.requestType = 1
      this.applyDetailData.processType = data.processType
    },
    searchResult() {
      this.pageTurn = true
      this.initData()
    },
    initData() {
      this.loading = true
      if (this.pageTurn) {
        this.currentPage = 1
      }
      // if (this.startUser === '') {
      //   this.startUserId = ''
      // }
      const requestBody = {
        allApply: true,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        applyResult: this.status,
        orderByCreateTime: false,
        processName: this.searchWord,
        startUserId: this.startUserId,
        startTimeLeft: this.dataRange !== null ? this.dataRange[0] : '',
        startTimeRight: this.dataRange !== null ? this.dataRange[1] : '',
        processType: '数据权限申请',
        departmentName: this.department,
      }
      HTTP.getMyApply(requestBody)
        .then(res => {
          this.loading = false
          // this.tableAllData = res.data.value
          // this.tableAllData2 = this.tableAllData
          this.tableData = res.data.value
          console.log(this.tableData)
          // this.handleCurrentChange(1)
          this.total = res.data.total
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    showDetail(row) {
      setTimeout(() => {
        this.$refs.processDetail.initData(row)
      })
    },
    selectPartment() {
      this.$utils.staffSelect.open([], true).then(res => {
        const arr1 = []
        const arr2 = []
        res.forEach(e => {
          // arr1.push(e.username)
          arr1.push(e.fullUserName)
          arr2.push(e.username)
        })
        this.startUserId = arr1.toString()
        // this.startUser = arr2.toString()
      })
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.initData()
    },
    handleCurrentChange(val) {
      this.pageTurn = false
      this.currentPage = val
      this.initData()
    },
    spliceData() {
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
    getUserByIds(idList) {
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
    getPeopleName(list) {
      const list2 = list.includes(',') ? list.split(',') : [list]
      // return list2.map(e => this.nameMapping[e]).toString()
      return list2.toString()
    },
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
    startUserId: {
      handler(newVal, oldVal) {
        console.log('newValSingle', newVal)
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.form-item-180 {
  /deep/ &.el-form-item {
    .el-form-item__content {
      width: 210px;
      min-width: 210px !important;
      .datablau-userselect {
        display: inline-block;
      }
      .el-select {
        width: 180px;
      }
    }
  }
}
.mainDiv {
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  background-color: var(--default-bgc);
  overflow: auto;
  .table-box {
    position: absolute;
    top: 84px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
.bottom {
  position: absolute;
  bottom: 5px;
  width: 98%;
  min-width: 700px;
}
.page {
  position: absolute;
  bottom: 8px;
  right: 20px;
}
.keyword {
  margin-top: 10px;
}
.status {
  float: right;
  margin-top: 10px;
  margin-right: 20px;
}
el-form-item__label {
  vertical-align: middle;
}
</style>
