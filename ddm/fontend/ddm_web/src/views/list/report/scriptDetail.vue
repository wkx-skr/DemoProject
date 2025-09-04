<template>
  <div class="model-evaluate-script">
    <div class="inner-container" v-loading="loadingData">
      <div class="detail-tab" v-if="!ifFailed">
        <el-tabs
          v-model="currentTab"
          @tab-click="handleChangeTab"
          class="report-script-detail"
          v-show="false"
        >
          <el-tab-pane label="全局报告" name="total"></el-tab-pane>
          <el-tab-pane label="增量报告" name="incremental"></el-tab-pane>
          <el-tab-pane label="差异报告" name="compareDetail">

          </el-tab-pane>
        </el-tabs>
        <div
          class="report-detail-con"
          v-show="currentTab==='total' || currentTab==='incremental'"
        >
          <div class="table-count-line" v-if="currentTab === 'total'">
            <div class="info-count-item">
              <span class="item-count">{{showReportData.totalTables}}</span>
              <span class="item-name">总表数</span>
            </div>
            <div class="info-count-item">
              <span class="item-count">{{showReportData.totalColumns}}</span>
              <span class="item-name">总字段数</span>
            </div>
            <div class="info-count-item">
              <span class="item-count">{{showReportData.totalThemes}}</span>
              <span class="item-name">总主题数</span>
            </div>
            <div class="info-count-item">
              <span class="item-count">{{showReportData.modelVersion}}</span>
              <span class="item-name">模型版本</span>
            </div>
          </div>
          <div class="middle-part">
            <div class="total-count">
              <div class="circle-item circle-info">
                <div class="word-box">
                  <p class="count">{{reportTipsData.length}}</p>
                  <p class="circle-label">提示数</p>
                </div>
              </div>
              <div class="circle-item circle-error" v-if="reportWrongData && reportWrongData.length > 0">
                <div class="word-box">
                  <p class="count">{{reportWrongData.length}}</p>
                  <p class="circle-label">错误数</p>
                </div>
              </div>
              <div class="circle-item circle-error no-error" v-else>
                <div class="word-box">
                  <p class="count"><i class="el-icon-check"></i></p>
                </div>
              </div>
              <div class="circle-item circle-warning">
                <div class="word-box">
                  <p class="count">{{reportWarningData.length}}</p>
                  <p class="circle-label">警告数</p>
                </div>
              </div>
            </div>
            <div class="right-tab">
              <div class="tab-count-item data-full">
                <span class="tab-item-label">元数据充足率</span>
                <div class="tab-progress">
                  <multi-progress
                    :percentData="cNamePerArr"
                    :colorArray="['#4386F5', '#F1F1F1', '#F1F1F1']"
                    :showLastPer="true"
                  ></multi-progress>
                </div>
                <div class="tab-description">
                  <p class="description"><span-with-tooltip
                      :content="'统计了全部表与字段中没有中文名的比例。'"
                      :placement="'left'"
                      :widthStr="'100%'"
                      :classString="'span-with-tooltip'"
                    ></span-with-tooltip></p>
                  <p class="legend" v-if="getCheckResult">
                    <span class="color-boxl"></span>
                    <span-with-tooltip
                      :content="'有中文名的表和字段共有'+(tableColumnAllCount-tableWithoutCN-colWithoutCN)+'个，占比'+(100 - tableNoCnPer - columnNoCnPer).toFixed(2)+'%'"
                      :placement="'left'"
                      classString="info span-with-tooltip"
                    ></span-with-tooltip>
                  </p>
                  <p class="legend" v-if="getCheckResult">
                    <span class="color-boxl"></span>
                    <span-with-tooltip
                      :content="'没有中文名的表'+(tableWithoutCN)+'个，占比'+tableNoCnPer.toFixed(2)+'%'"
                      :placement="'left'"
                      classString="info span-with-tooltip"
                    ></span-with-tooltip>
                  </p>
                  <p class="legend" v-else>暂无数据</p>
                </div>
                <div class="btn-check" @click="handleCheckCnameRate('MQ-0')">查看问题</div>
              </div>
              <div class="tab-count-item data-domain">
                <span class="tab-item-label">标准覆盖率</span>
                <div class="tab-progress">
                  <multi-progress
                    :percentData="domainPerArr"
                    :colorArray="['#4386F5', '#2FDAA6', '#EEEEEE']"
                    dataType="count"
                  ></multi-progress>
                </div>
                <div class="tab-description">
                  <p class="description"><span-with-tooltip
                      :content="'统计了字段是否绑定标准。共有字段'+(columnCount || 0)+'个。'"
                      :placement="'left'"
                      :widthStr="'100%'"
                      :classString="'span-with-tooltip'"
                    ></span-with-tooltip></p>
                  <p class="legend">
                    <span class="color-boxl"></span>
                    <span-with-tooltip
                      :content="'绑定公共标准的字段有'+(currentTabData ? (currentTabData.columnWithPublicDS || 0) : 0)+'个，占总字段的'+pubDomainPre.toFixed(2)+'%'"
                      :placement="'left'"
                      classString="info span-with-tooltip"
                    ></span-with-tooltip>
                  </p>
                  <p class="legend">
                    <span class="color-boxl"></span>
                    <span-with-tooltip
                      :content="'绑定自定义标准的有'+(currentTabData ? (currentTabData.columnWithPrivateDS || 0) : 0)+'个，占总字段的'+praDomainPre.toFixed(2)+'%'"
                      :placement="'left'"
                      classString="info span-with-tooltip"
                    ></span-with-tooltip>
                  </p>
                </div>
                <div class="btn-check" @click="handleCheckDomainRate">查看问题</div>
              </div>
              <div class="tab-count-item" v-if="false">
                <span class="tab-item-label">数据规范</span>
                <div class="tab-progress">
                  <el-progress :percentage="80" color="#4386f5"></el-progress>
                </div>
                <div class="tab-description">详细信息详细信息详细信息详细信息详细信息</div>
                <div class="btn-check">查看问题</div>
              </div>
            </div>
          </div>
          <div class="data-info-table" v-if="currentTab === 'incremental'">
            <div class="title-conta">
              <span>数据信息</span>
            </div>
            <div class="data-grid-container">
              <el-table
                ref="dataInfoTable"
                class="el-table"
                :data="dataInfoTableData"
                header-row-class-name="table-head-row"
                header-cell-class-name="table-header-cell"
                row-class-name="table-row-class"
                cell-class-name="table-cell"
                @row-click="handleChangeClick"
                border
              >
                <el-table-column
                  prop="type"
                  label="类型"
                  show-overflow-tooltip
                  min-width="150"
                ></el-table-column>
                <el-table-column
                  prop="addCount"
                  label="新增数"
                  show-overflow-tooltip
                  min-width="150"
                ></el-table-column>
                <el-table-column
                  prop="updataCount"
                  label="更改数"
                  show-overflow-tooltip
                  min-width="150"
                ></el-table-column>
                <el-table-column
                  prop="removeCount"
                  label="删除数"
                  show-overflow-tooltip
                  min-width="150"
                ></el-table-column>
              </el-table>
            </div>
          </div>
          <div class="bottom-part">
            <div class="title-conta">
              <span>规范统计</span>
            </div>
            <div class="bottom-table-conta">
                <el-table
                  ref="table"
                  class="el-table"
                  :data="checkResultCount"
                  :height="reportTableHeight"
                  header-row-class-name="table-head-row"
                  header-cell-class-name="table-header-cell"
                  row-class-name="table-row-class"
                  cell-class-name="table-cell"
                  @row-click="handleRowClick"
                  border
                >
                    <!-- prop="name" -->
                  <el-table-column
                    label="数据质量问题"
                    min-width="300"
                    class-name="type-column"
                  >
                    <template slot-scope="scope">
                      <span class="que-label" :class="scope.row.level">{{scope.row.name}}</span>
                      <span>{{scope.row.msg}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="count"
                    label="问题数"
                    show-overflow-tooltip
                    min-width="150"
                  ></el-table-column>
                </el-table>
            </div>
          </div>
        </div>
        <div
          class="table-count-line compare-detail-con"
          v-if="currentTab==='compareDetail' && showCompareResult"
        >
          <compare-result
            @startLoading="startLoading"
            @closeLoading="closeLoading"
            @backToReportList="backToReportList"
            @uploadScript="uploadScript"
            :reportData="reportData"
            :model-data="modelData"
          ></compare-result>
        </div>
      </div>
    </div>
    </div>
</template>

<script>
import reportForCmbc from './scriptDetail.js'
export default reportForCmbc
</script>

<style lang="scss" scpoed>
$topPartLeftPadding: 30px;
$deepGreen: #4386f5;
$lightGreen: #d9e6fd;
$ddepGrey: #e8e8e8;
$lightGreyFont: #7a7a7a;
$testBorder: 1px solid red;
$middleHeight: 200px;

@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.model-evaluate-script {
  @include absPos();
  // height: 100%;
  .inner-container {
    min-width: 630px;
    @include absPos();
    margin: 0 auto;
    // overflow: auto;
    .detail-tab {
      @include absPos();
      // position: relative;
      // width: 100%;
      // height: 100%;
      overflow: auto;
      .report-script-detail {
        padding-left: 20px;
      }
      .report-detail-con {
        position: absolute;
        top: 50px;
        left: 0;
        right: 0;
        bottom: 0;
        /*border: 1px solid red;*/
        /*overflow: auto;*/
        .table-count-line {
          border: 1px solid #e8e8e8;
          height: 50px;
          margin: 0 30px;
          display: flex;
          align-content: stretch;
          border-right: none;
          .info-count-item {
            display: inline-block;
            width: 30%;
            border-right: 1px solid #e8e8e8;
            .item-count {
              display: inline-block;
              line-height: 50px;
              font-size: 18px;
              font-weight: bold;
              margin-left: 20px;
            }
            .item-name {
              /*display: inline-block;*/
              float: right;
              line-height: 50px;
              font-size: 12px;
              margin-right: 20px;
              color: #979797;
            }
          }
        }
        .middle-part {
          $leftCircleBoxWidth: 460px;
          // $leftCircleBoxWidth: 50%;
          $letMaxWidth: 460px;
          height: $middleHeight;
          border: 1px solid $ddepGrey;
          border-top: none;
          position: relative;
          .total-count {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            // right: 68%;
            width: $leftCircleBoxWidth;
            // border-right: 1px solid $ddepGrey;
            // border: 1px solid red;
            display: flex;
            justify-content: space-around;
            align-items: center;
            .circle-item {
              // display: inline-block;
              display: flex;
              border: 3px solid #000;
              border-radius: 50%;
              text-align: center;
              vertical-align: middle;
              justify-content: center;
              align-items: center;
              .word-box {
                display: inline-block;
              }
              &.circle-info, &.circle-warning {
                border-color: #DEDEDE;
                background-color: #F1F1F1;
                color: #696969;
                width: 80px;
                height: 80px;
                font-size: 15px;
                p.circle-label {
                  font-size: 10px;
                  margin-top: 4px;
                }
              }
              &.circle-error {
                border-color: #F46565;
                background-color: #FEF0F0;
                color: #F46565;
                width: 120px;
                height: 120px;
                font-size: 20px;
                p.circle-label {
                  font-size: 11px;
                  margin-top: 4px;
                }
                &.no-error {
                  border-color: #42C995;
                  background-color: #E3FFF4;
                  color: #42C995;
                  font-size: 44px;
                  i {
                    font-weight: bold;
                  }
                }
              }
              &.circle-warning {
                border-color: #FFCF4B;
                background-color: #FFF6DB;
                color: #E88F00;
              }
            }
          }
          .right-tab {
            position: absolute;
            top: 0;
            // left: 32%;
            bottom: 0;
            right: 0;
            left: $leftCircleBoxWidth;
            display: flex;
            justify-content: flex-start;
            .tab-count-item {
              flex-grow: 1;
              width: 50%;
              padding: 25px 20px 0 20px;
              position: relative;
              .tab-item-label {
                font-size: 14px;
                font-weight: bold;
              }
              .tab-progress {
                height: 30px;
                // width: 66%;
                width: 80%;
                padding-top: 8px;
              }
              .tab-description {
                color: $lightGreyFont;
                p {
                  // line-height: 24px;
                  padding-top: 8px;
                  color: #000;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;
                }
                .legend {
                  position: relative;
                  .color-boxl {
                    display: inline-block;
                    width: 11px;
                    height: 11px;
                    margin-right: 11px;
                    background-color: #4386F5;
                  }
                  &:last-child {
                    .color-boxl {
                      background-color: #F1F1F1;
                    }
                  }
                }
              }
              .btn-check {
                position: absolute;
                bottom: 17px;
                left: 20px;
                width: 100px;
                height: 30px;
                border: 1px solid $ddepGrey;
                text-align: center;
                line-height: 28px;
                cursor: pointer;
                background-color: #fff;
              }
              &.data-domain {
                .legend {
                  .color-boxl {
                    background-color: #4386F5;
                  }
                  &:last-child {
                    .color-boxl {
                      background-color: #2FDAA6;
                    }
                  }
                }
              }
            }
          }
          @media (max-width:1166px) {
            // max-width: $letMaxWidth;
            $leftCircleBoxWidth: 50%;
            .total-count {
              width: 50%;
            }
            .right-tab {
              left: 50%;
            }
          }
        }
        .data-info-table {
          .data-grid-container {
            position: relative;
            /*height: 200px;*/
          }
        }
        .bottom-part {
          border: 1px solid $ddepGrey;
          border-top: none;
          .bottom-table-conta {

          }
        }
        .data-info-table, .bottom-part {
          .title-conta {
            line-height: 20px;
            border-left: 4px solid $deepGreen;
            padding-left: 20px;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
          }
        }
      }

      .compare-detail-con {
        // border: 1px solid red;
        position: relative;
        // @include absPos();
        // top: -20px;
        padding: 20px 20px;
      }
    }
  }
}

</style>
<style lang="scss">
@import '../../../assets/styles/tableStyleWidthBorder.scss';
.model-evaluate-script {
  @include tableStyle;
  .el-table {
    .table-row-class {
      cursor: pointer;
    }
    .type-column {
      vertical-align:middle;
      .que-label {
        display: inline-block;
        width: 60px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        margin-right: 10px;
        &.WARNING, &.WARN {
          background-color: #FFE7A4;
          color: #E88F00;
        }

        &.ERROR {
          background-color: #F75A5A;
          color: #fff;
        }
        &.INFO {
          background-color: #E2E2E2;
          color: #696969;
        }
      }
    }
  }

  .description {
    .span-with-tooltip {
      vertical-align: top;
    }
  }
  .legend {
    .span-with-tooltip {
      position: absolute;
      top: 8px;
      left: 24px;
      bottom: 0;
      right: 0;
    }
  }
}
</style>
