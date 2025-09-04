<template>
  <div class="mainDiv">
    <div style="min-width: 700px">
      <!-- <datablau-page-title style="transform: translateX(-20px)">
        流程监控
      </datablau-page-title> -->
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
      <datablau-list-search>
        <template slot="title">
          <div>
            {{ $t('meta.process.processMonitor') }}
          </div>
        </template>
        <div style="white-space: nowrap">
          <el-form :inline="true">
            <el-form-item label="">
              <datablau-input
                clearable
                type="text"
                v-model="searchWord"
                class="width"
                :placeholder="$t('meta.process.searchByName')"
                :iconfont-state="true"
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="$t('meta.process.submitter')">
              <datablau-input
                clearable
                :placeholder="$t('meta.process.selSubmitter')"
                class="width start-user-select"
                v-model="startUser"
                @focus="selectPartment"
                @change="changePartment"
              ></datablau-input>
            </el-form-item>
            <!-- <br /> -->
            <el-form-item :label="$t('meta.process.applyResult')">
              <datablau-select-weak
                class="width"
                :optionsData="{
                  data: statusList,
                  key: 'value',
                  value: 'value',
                  label: 'label',
                }"
                v-model="status"
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item :label="$t('meta.process.submitTime')">
              <datablau-dateRange
                value-format="yyyy-MM-dd"
                v-model="dataRange"
                @changeDateTime="changeEventStartTime"
                class="width"
              ></datablau-dateRange>
            </el-form-item>

            <el-form-item>
              <datablau-button
                type="normal"
                @click="searchResult()"
                style="margin-left: 10px"
              >
                {{ $t('common.button.query') }}
              </datablau-button>
            </el-form-item>
          </el-form>
        </div>
      </datablau-list-search>
    </div>
    <datablau-form-submit style="margin-top: 84px">
      <datablau-table
        ref="multipleTable"
        :data="tableData"
        class="datablau-table table"
        show-overflow-tooltip
        height="100%"
        size="small"
        :show-column-selection="false"
        v-loading="loading"
        :header-cell-style="{
          color: 'var(--base-font-color)',
          'font-size': '12px',
          'font-weight': 'bold',
        }"
      >
        <el-table-column
          prop="processInstanceName"
          :label="$t('meta.process.processName')"
          min-width="120"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="startUserFullUserName"
          :label="$t('meta.process.submitter')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="department"
          :label="$t('meta.process.dept')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="processInstanceStartTime"
          :label="$t('meta.process.submitTime')"
          :formatter="$timeFormatter"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.process.processType')"
          prop="processType"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="result"
          :label="$t('meta.process.processStatus')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-status
              :type="scope.row.resultType"
              :desc="scope.row.resultName"
            ></datablau-status>
          </template>
        </el-table-column>
        <el-table-column
          prop="currentAssigneeFullUserName"
          :label="$t('meta.process.currentAssignee')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.process.operation')"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <div style="width: 100px">
              <datablau-button
                type="text"
                size="mini"
                @click.stop="showDetail(scope.row)"
              >
                <!-- 查看 -->
                <datablau-tooltip
                  effect="dark"
                  content="查看"
                  placement="bottom"
                  style="margin-right: 6px"
                >
                  <i class="iconfont icon-see"></i>
                </datablau-tooltip>
              </datablau-button>
              <!--            <span class="history" v-if="$hasAuth(5014)">详情</span>-->
            </div>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="bottom">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="page"
          />
        </div>
      </template>
    </datablau-form-submit>
    <!-- <div class="apply-table">
    </div> -->
    <!-- <div class="bottom">
    </div> -->

    <processDetail ref="processDetail"></processDetail>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import processDetail from '../../components/processDetail/processDetail'
import userPane from '@constant/userPane'

export default {
  mixins: [userPane],
  components: {
    processDetail,
  },
  data() {
    return {
      showDialog: false,
      taskName: '',
      statusList: [],
      status: '',
      searchWord: '',
      currentPage: 1,
      pageSize: 20,
      tableData: null,
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
      deleteArr: ['tableData', 'tableAllData', 'tableAllData2', 'nameMapping'],
      dateArr: null, // 给后台接口返回的日期格式
      appName: HTTP.$appName,
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
  created() {
    this.statusList = [
      { label: this.$t('el.table.clearFilter'), value: '' },
      {
        label: this.resultMap['审核中'].label,
        value: this.resultMap['审核中'].value,
      },
      {
        label: this.resultMap['审核通过'].label,
        value: this.resultMap['审核通过'].value,
      },
      {
        label: this.resultMap['审核不通过'].label,
        value: this.resultMap['审核不通过'].value,
      },
      {
        label: this.resultMap['已撤销'].label,
        value: this.resultMap['已撤销'].value,
      },
    ]
  },
  mounted() {
    this.initData()
  },
  methods: {
    changeEventStartTime(val) {
      let arr = []
      if (!!val && val.length > 0) {
        arr = val.map(item => {
          return this.$dateFormatter(item)
        })
      } else {
        arr = val
      }
      this.dataRange = val
      this.dateArr = arr
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
        startTimeLeft: this.dateArr !== null ? this.dateArr[0] : '',
        startTimeRight: this.dateArr !== null ? this.dateArr[1] : '',
      }
      HTTP.getMyApply(requestBody)
        .then(res => {
          this.loading = false
          // this.tableAllData = res.data.value
          // this.tableAllData2 = this.tableAllData
          this.tableData = res.data.value
          this.tableData.forEach(item => {
            //   审核通过  审核中  审核不通过  已撤销
            for (let key in this.resultMap) {
              if (item.result === key) {
                item.resultType = this.resultMap[key].resultType
                item.resultName = this.resultMap[key].label
              }
            }
          })
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
          arr1.push(e.username)
          arr2.push(e.username)
        })
        this.startUserId = arr1.toString()
        this.startUser = arr2.toString()
      })
    },
    // 设置input输入框不能输入
    changePartment() {
      this.startUserId = ''
      this.startUser = ''
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
    // 设置颜色
    getColor(result) {
      let color = '#ccc'
      switch (result) {
        case '审核通过':
          color = '#66BF16'
          break
        case '审核不通过':
          color = '#FF4B53'
          break
        case '审核中':
          color = '#4386f5'
          break
        case '已撤销':
          color = '#afb4bf '
          break
      }
      return color
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
  },
}
</script>

<style lang="scss" scoped>
$green: #57a07f;
$red: #f46565;
$disColor: #4386f5;
.mainDiv {
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  background-color: var(--default-bgc);
  padding-left: 20px;
  overflow: hidden;
}
.bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  // box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
  z-index: 10;
  .page {
    position: absolute;
    right: 20px;
    bottom: 10px;
  }
}
// .apply-table {
// position: absolute;
// top: 85px;
// bottom: 50px;
// right: 20px;
// left: 20px;
.table {
  height: 100%;
  width: 100%;
  .cell {
    div {
      width: 100%;
      .status-style {
        width: 7px;
        height: 7px;
        display: inline-block;
        transform: translateY(-2px);
        border-radius: 50%;
      }
      span {
        margin-left: 5px;
        font-size: 12px;
      }
    }
  }
}
// }
.keyword {
  margin-top: 10px;
}
.status {
  float: right;
  margin-top: 10px;
  margin-right: 20px;
}
.width {
  width: 240px;
  min-width: 200px;
  margin-bottom: 10px !important;
  /deep/ .datablau-tooltip {
    width: 100% !important;
  }
}
/deep/ .el-form-item__label {
  line-height: 34px;
  height: 34px;
}
</style>
