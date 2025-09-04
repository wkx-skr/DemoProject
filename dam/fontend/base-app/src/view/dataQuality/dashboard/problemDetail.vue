<template>
  <div class="box" v-loading="loading">
    <div class="inner-box">
      <div class="box-label">
        {{ $t('quality.page.dataQualityDashboard.problemDetail') }}
      </div>
      <datablau-tabs v-model="base" id="pd-tabs" @tab-click="onConditionChange">
        <el-tab-pane
          :label="$t('quality.page.dataQualityDashboard.busDepartment')"
          name="busDepartment"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('quality.page.dataQualityDashboard.itDepartment')"
          name="itDepartment"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('quality.page.dataQualityDashboard.categoryName')"
          name="categoryName"
        ></el-tab-pane>
        <!--      <el-tab-pane label="按数据类型" name="dataType"></el-tab-pane>-->
        <el-tab-pane
          :label="$t('quality.page.dataQualityDashboard.ruleType')"
          name="ruleType"
        ></el-tab-pane>
      </datablau-tabs>
      <div class="time-base">
        <el-popover
          placement="bottom-end"
          :visible-arrow="false"
          v-model="popoverVisible"
          :width="$i18n.locale === 'zh' ? 233 : 343"
          trigger="click"
        >
          <div class="button" slot="reference">
            <i class="el-icon-date"></i>
            {{ timeBaseLabel }}
          </div>
          <div class="time-base-pop">
            <el-checkbox v-model="thisYear" @change="thisYearChange">
              {{ $t('quality.page.dataQualityDashboard.thisYear') }}
            </el-checkbox>
            <span class="gun">|</span>
            <span
              class="radio"
              :style="{ width: $i18n.locale === 'zh' ? '30px' : '50px' }"
              @click="timeBaseChange('week')"
              :class="{ checked: timeBase === 'week' }"
            >
              {{ $t('quality.page.dataQualityDashboard.week') }}
            </span>
            <span
              class="radio"
              :style="{ width: $i18n.locale === 'zh' ? '30px' : '50px' }"
              @click="timeBaseChange('month')"
              :class="{ checked: timeBase === 'month' }"
            >
              {{ $t('quality.page.dataQualityDashboard.month') }}
            </span>
            <span
              class="radio"
              :style="{ width: $i18n.locale === 'zh' ? '30px' : '50px' }"
              @click="timeBaseChange('year')"
              :class="{ checked: timeBase === 'year', disabled: thisYear }"
            >
              {{ $t('quality.page.dataQualityDashboard.year') }}
            </span>
          </div>
        </el-popover>
      </div>
      <pd-graph
        id="pd-graph"
        :table-data="graphData"
        v-if="pdGraphKey"
        :key="pdGraphKey"
      ></pd-graph>
      <div id="pd-table">
        <span class="title">
          {{ $t('quality.page.dataQualityDashboard.qualityProblemList') }}
        </span>
        <div class="table-container">
          <datablau-table
            :data="tableData"
            class="pd-table"
            height="100%"
            border
          >
            <el-table-column
              v-if="base !== 'busDepartment' && base !== 'itDepartment'"
              :label="baseLabel"
              prop="category"
            ></el-table-column>
            <el-table-column v-else :label="baseLabel" prop="category">
              <template slot-scope="scope">
                {{ $utils.getBranchNameByBm(scope.row.category) }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('quality.page.dataQualityDashboard.questions')"
              prop="problem"
            ></el-table-column>
            <el-table-column
              :label="$t('quality.page.dataQualityDashboard.compareLast')"
              :width="$i18n.locale === 'zh' ? '' : 240"
              prop="problemIncrease"
            >
              <template slot-scope="scope">
                <div>
                  <span>
                    {{
                      scope.row.problemIncrease
                        ? Math.abs(scope.row.problemIncrease)
                        : '-'
                    }}
                  </span>
                  <i
                    v-if="scope.row.problemIncrease > 0"
                    class="iconfont icon-up"
                  ></i>
                  <i
                    v-else-if="scope.row.problemIncrease < 0"
                    class="iconfont icon-down"
                  ></i>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column
              label="重要问题数"
              prop="iProblem"
            >
            </el-table-column> -->
            <!-- <el-table-column
              label="较上期"
              prop="iProblemIncrease"
            >
              <template slot-scope="scope">
                <div>
                  <span>{{scope.row.iProblemIncrease ? Math.abs(scope.row.iProblemIncrease) : '-'}}</span>
                  <i v-if="scope.row.iProblemIncrease > 0" class="fa fa-long-arrow-up red-arrow"></i>
                  <i v-else-if="scope.row.iProblemIncrease < 0" class="fa fa-long-arrow-down green-arrow"></i>
                </div>
              </template>
            </el-table-column> -->
          </datablau-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import problemDetail from './problemDetail.js'
export default problemDetail
</script>

<style scoped lang="scss">
$grey: #9096a3;
@import './dashboard.scss';
.box {
  background: var(--default-bgc);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  border-radius: 3px;
}
.inner-box {
  min-width: 500px;
}
.box-label {
  position: absolute;
  left: 20px;
  top: 12px;
  font-size: 15px;
}
#pd-graph {
  position: absolute;
  top: 100px;
  left: 20px;
  right: 20px;
  height: 310px;
}
#pd-table {
  position: absolute;
  top: 440px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  .title {
    font-size: 14px;
  }
  .table-container {
    position: absolute;
    top: 30px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
<style lang="scss">
@import './global';
$grey: #9096a3;
#pd-tabs {
  position: absolute;
  left: 10px;
  top: 20px;
  .el-tabs__item {
    font-size: 12px;
  }
  .el-tab-pane {
    display: none;
  }
  .el-tabs__nav-wrap::after {
    background: transparent;
  }
  .el-tabs__active-bar {
    background-color: #4386f5;
  }
  .el-tabs__item {
    color: $grey;
    height: 30px;
    line-height: 30px;
    padding-right: 0px;
  }
  .el-tabs__item.is-active {
    color: #4386f5;
  }
}
.pd-table {
  font-size: 12px;
  thead {
    color: var(--table-head-bgc);
    th {
      /*font-weight:normal;*/
    }
  }
  .cell {
    padding-left: 20px !important;
  }
  tr {
    td:first-child {
      // color: #3b4861;
      /*font-weight:bold;*/
    }
  }
  .red-arrow,
  .green-arrow,
  i {
    float: right;
    margin-top: 5px;
    margin-right: 10px;
    // transform: scaleX(1.5);
  }
  .red-arrow,
  .icon-up {
    color: #f46565;
  }
  .green-arrow,
  .icon-down {
    color: #5cb793;
  }
}
</style>
