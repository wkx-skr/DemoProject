<template>
  <div class="dataQuality-toDo">
    <el-card class="box-card" style="height: 100%">
      <div slot="header" class="clearfix" style="position: relative">
        <span class="sub-title">
          {{ $t('userPane.userPane.pendingDataQualityIssues') }}
        </span>
        <datablau-button class="showMore" type="text" @click="showMore">
          {{ $t('userPane.userPane.more') }}
        </datablau-button>
      </div>
      <datablau-table :data="tableData" height="433" hasHeaderStyle>
        <el-table-column
          :label="$t('userPane.userPane.dataQualityName')"
          prop="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('userPane.userPane.rule')"
          prop="ruleName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('userPane.userPane.table')"
          prop="tableNames"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('userPane.userPane.column')"
          prop="columnNames"
          width="115"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('userPane.userPane.records')"
          prop="unresolvedNum"
          width="180"
        >
          <template slot-scope="scope">
            <div
              style="
                height: 40px;
                line-height: 40px;
                display: flex;
                align-items: center;
              "
              v-if="scope.row.unSolveRatio"
            >
              <div class="unSolve-wrap">
                <div
                  class="unSolve-wrap-green"
                  v-if="scope.row.unSolveRatio != 1"
                  :style="setGreenWidth(scope.row.unSolveRatio)"
                >
                  {{ scope.row.allNum - scope.row.unresolvedNum }}
                </div>
                <div
                  class="unSolve-wrap-red"
                  v-if="scope.row.unSolveRatio != 0"
                  :style="{ width: setRedWidth(scope.row.unSolveRatio) }"
                >
                  {{ scope.row.unresolvedNum }}
                </div>
                <div
                  class="divide"
                  v-if="
                    scope.row.unSolveRatio !== '0.00' &&
                    scope.row.unSolveRatio !== '1.00'
                  "
                  :style="{
                    left: setDividePosition(scope.row.unSolveRatio),
                  }"
                ></div>
              </div>
              <span style="margin-left: 5px" v-if="true">
                {{ parseInt(scope.row.unSolveRatio * 100) + '%' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('userPane.userPane.status')"
          prop="dealStatus"
          width="80"
        >
          <template slot-scope="scope">
            <div
              class="stauts-box"
              :style="{
                background: scope.row.dealStatus == 1 ? '#66BF16' : '#E6AD00',
              }"
            ></div>
            <span
              :style="{
                marginLeft: '2px',
                fontSize: '12px',
                color: scope.row.dealStatus == 1 ? '#66BF16' : '#E6AD00',
              }"
            >
              {{ scope.row.dealStatus == 1 ? ' 已确认' : '未处理' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          width="90"
          :label="$t('userPane.userPane.date')"
          prop="dateTime"
          :formatter="dateFormater"
          show-overflow-tooltip
        ></el-table-column>
        <!-- fixed="right"
          header-align="right"
          align="right"-->
        <el-table-column
          width="60"
          align="center"
          :label="$t('userPane.userPane.operation')"
        >
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="viewDetail(scope.row)">
              {{ $t('common.button.scan') }}
            </el-button>
          </template>
        </el-table-column>
      </datablau-table>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'dataQualiyToDo',
  data() {
    return {
      currentJob: {},
      tableData: [],
    }
  },
  created() {},
  mounted() {
    this.$http
      // .get(this.$url + '/service/dashboard/workbench/question')
      .post(this.$quality_url + '/dashboard/quality/problems')
      .then(res => {
        // console.log('question', res, 'res')
        if (res.data && res.data.length > 0) {
          for (let i in res.data) {
            let rate
            if (res.data[i].allNum) {
              rate = res.data[i].unresolvedNum / res.data[i].allNum
              res.data[i].unSolveRatio = isNaN(rate) ? null : rate.toFixed(2)
            }
          }
        }
        this.tableData = res.data || []
      })
      .catch(e => {
        console.log(e)
      })
  },
  computed: {},
  methods: {
    dateFormater(row, column, cellValue, index) {
      return this.$timeFormatter(cellValue, 'MM-DD hh:mm')
    },
    showMore() {
      this.$skip2({
        name: 'dataQualityRepairJob',
      })
    },
    setGreenWidth(val) {
      let width = (1 - val) * 100 + '%'
      let borderRadius = '10px 0 0 10px'
      if (val >= 0.8 && val < 1) {
        width = '20%'
      } else if (val <= 0.2 && val > 0) {
        width = '80%'
      } else if (val == 0) {
        borderRadius = '10px 10px 10px 10px'
      }
      return `width:${width};border-radius:${borderRadius}`
    },
    setRedWidth(val) {
      let width
      if (val == 1) {
        width = '100%'
      } else if (val >= 0.8) {
        width = '80%'
      } else if (val <= 0.2 && val > 0) {
        width = '20%'
      } else {
        width = val * 100 + '%'
      }
      return width
    },
    setDividePosition(ratio) {
      let val = 1 - ratio
      let left = val * 100 + '%'
      if (val >= 0.8 && val < 1) {
        left = 'calc(80% - 1px )'
      } else if (val <= 0.2 && val > 0) {
        left = 'calc(20% - 1px )'
      }
      return left
    },
    viewDetail(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl +
          `main/dataQuality/repairJob?id=${row.id}&name=${row.name}&type=${row.createManually}`
      )

      // let isAdmin = this.$isAdmin || this.$auth.ROLE_FIXUP_QUALITY_ADMIN
      // let row = {
      //   id: 67,
      //   name: 'gjm_5000W-500W任务-20220217000012950116',
      //   code: 'Qd2022021700001',
      //   owner: 'admin',
      //   createManually: false,
      //   clearedByRuleEdited: false,
      //   status: 'CONFIRM',
      //   verifyStatus: 'NOT_VERIFIED_YET',
      //   createOn: 1645092218941,
      //   endTime: null,
      //   ruleId: 187,
      //   jobResultId: 1381,
      //   modelCategoryId: 1,
      //   modelCategoryName: 'gjm_test',
      //   solutionId: 13,
      //   ruleName: 'gjm_5000W',
      //   description:
      //     '数据源:gjm_5000W数据\n目标表:big_data_5000w.Personal_information',
      //   problemNum: 100000,
      //   fixedNum: null,
      //   batchNum: '20220217180128',
      //   businessDepartment: '机构管理',
      //   documents: null,
      //   candidates: null,
      // }

      // this.currentJob = _.cloneDeep(row)
      // if (this.currentJob.owner === this.$user.username || isAdmin) {
      //   this.currentJob.writable = true
      // }
      // this.currentJob.directEdit = true

      // setTimeout(() => {
      //   this.$bus.$emit(
      //     'editJob',
      //     this.currentJob,
      //     !!(
      //       (row.owner && row.owner.includes(this.$user.username)) ||
      //       (row.candidates && row.candidates.includes(this.$user.username)) ||
      //       this.$isRole('数据质量管理员')
      //     )
      //   )
      // }, 5000)

      // this.$router.push({
      //   name: 'dataQualityRepairJob',
      //   // query:{
      //   //   currentNav:'myTodo'
      //   // }
      // })
    },
  },
}
</script>

<style lang="scss">
.dataQuality-toDo {
  background: #fff;
  height: 100%;
  .el-card.is-always-shadow {
    box-shadow: none;
  }
  .el-card__header {
    padding: 14px 20px;
  }
  .el-card__body {
    padding-top: 6px;
  }
  .sub-title {
    width: 126px;
    height: 21px;
    font-size: 14px;
    // font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #555555;
    line-height: 21px;
  }
  .showMore {
    position: absolute;
    right: 0;
    font-size: 12px;
    color: #409eff;
  }
  .el-table.datablau-table th .cell {
    font-weight: 500;
  }
  .el-table .cell {
    padding-left: 10px;
    padding-right: 5px;
  }
  .unSolve-wrap {
    position: relative;
    // background: #5cb793;
    height: 20px;
    line-height: 20px;
    width: 70%;
    // top:50%;
    // transform: translateY(-50%);
    border-radius: 10px;
  }
  .unSolve-wrap-green {
    height: 20px;
    background: #5cb793;
    text-align: right;
    padding-right: 5px;
    z-index: 100;
    color: #ecfff7;
    display: inline-block;
  }
  .unSolve-wrap-green:hover {
    // animation: showShadow 1s linear;
    // animation-fill-mode: both;
    box-shadow: 0px 2px 8px 0 rgba(92, 183, 147, 0.5);
  }
  .unSolve-wrap-red {
    border-radius: 10px;
    text-align: right;
    color: #ecfff7;
    background: #f46565;
    display: inline-block;
    padding-right: 5px;
  }
  .unSolve-wrap-red:hover {
    //  box-shadow: 3px 0px 2px 2px rgba(211, 127, 127, 0.26)
    box-shadow: 1px 2px 8px 0 rgba(244, 101, 101, 0.5);
    // animation: redShowShadow 1s linear;
    // animation-fill-mode: both;
  }
  .divide {
    width: 8px;
    height: 20px;
    position: absolute;
    top: 0;
    // left: 50%;
    background: linear-gradient(
      105deg,
      #5cb793 0%,
      #5cb793 6px,
      white 7px,
      white 8px,
      #f46565 9px,
      #f46565 100%
    );
    // background: linear-gradient(
    //   to bottom right,
    //   rgb(92, 183, 147) 0%,
    //   rgb(92, 183, 147) calc(50% - 1px),
    //   white 50%,
    //   white calc(50% + 1px),
    //   rgb(244, 101, 101) calc(50% - 1px),
    //   rgb(244, 101, 101) 100%
    // );
  }
  .stauts-box {
    width: 6px;
    height: 6px;
    display: inline-block;
    transform: translate(-0px, -2px);
    border-radius: 50%;
  }

  @keyframes showShadow {
    0% {
      box-shadow: none;
    }
    50% {
      // box-shadow: -2px 0px 2px 2px #e2dede, -2px 2px 2px #e2dede;
      box-shadow: -2px 0px 2px 2px #447763, -2px 2px 2px #3f6858;
    }
    100% {
      // box-shadow:2px 1px 4px 4px #e2dede, 1px 0px 5px 6px #e2dede
      //  box-shadow: 4px 0px 3px 2px #e2dede, 6px 0px 2px 2px #e2dede;
      box-shadow: -4px 0px 3px 2px #8bd3b6, 6px 0px 2px 2px #447763;
    }
  }
  @keyframes redShowShadow {
    0% {
      box-shadow: none;
    }
    50% {
      box-shadow: 2px 0px 1px 1px #e2dede, 2px 2px 2px #e2dede;
    }
    100% {
      //  box-shadow:2px 1px 4px 4px #e2dede, 1px 0px 5px 6px #e2dede
      box-shadow: 4px 0px 3px 2px #e2dede, 6px 0px 2px 2px #e2dede;
    }
  }

  // .errorRatioStyle {
  //   display: flex;
  //   align-items: center;
  //   width: 148px;
  //   height: 12px;
  //   overflow: hidden;
  //   border-radius: 7px;
  //   .errorRatioStyle-left {
  //     height: 12px;
  //     background: #5cb793;
  //     &.errorRatioStyleLeft2 {
  //       border-right: 1px solid #fff;
  //     }
  //   }
  //   .errorRatioStyle-right {
  //     height: 12px;
  //     background: #f46565;
  //     &.errorRatioStyleRight2 {
  //       border-left: 1px solid #fff;
  //     }
  //   }
  // }
}
</style>
