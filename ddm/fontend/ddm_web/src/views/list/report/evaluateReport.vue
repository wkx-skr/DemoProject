<template>
  <el-main class="model-evaluate">
    <div class="inner-container">
      <div class="top-part">
        <div class="title">
          <span class="return-button">
            <datablau-button
              type="icon" class="iconfont icon-leftarrow"
              @click="backToReportList"
            ></datablau-button>
          </span>
          {{ reportName }}
        </div>
        <div class="detail-conta">
          <div class="sub-title">{{$store.state.$v.report.basicInfo}}</div>
          <div class="basic-line">
            <div class="branch-type">{{$store.state.$v.modelList.branch}}</div>
            <i class="tree-icon folder" style="margin-left:1em;"></i>{{path}}
            <span class="grey-text" style="margin-left:2em;">{{$store.state.$v.modelDetail.owner}}</span>
            <i class="grey-text fa fa-user" style="font-size:16px;margin:0 .3em;"></i>
            <b>{{modelDetail.owner}}</b>
            <span class="grey-text" style="margin-left:.2em;">{{$store.state.$v.report.modFrom}} {{$timeFormatter(modelDetail.lastModificationTimestamp)}}</span>
          </div>
          <div class="description"><span v-if="modelDetail.description">{{modelDetail.description}}</span><span v-else>{{$store.state.$v.modelDetail.noDescription}}</span></div>
          <div class="line">
            <div class="info-item"><span class="label">{{$store.state.$v.report.modelVer}}</span><span class="info" :title="modelDetail.currentVersion">{{modelDetail.currentVersion}}</span></div>
            <div class="info-item"><span class="label">{{$store.state.$v.report.tableNum}}</span><span class="info">{{tableCount}}</span></div>
            <div class="info-item"><span class="label">{{$store.state.$v.report.colNum}}</span><span class="info">{{columnCount}}</span></div>
            <div class="info-item"><span class="label">{{$store.state.$v.report.themeNum}}</span><span class="info">{{modelDetail.diagramCount}}</span></div>
          </div>
        </div>
      </div>
      <div class="middle-part">
        <div class="total-count">
          <div class="circle-item circle-info">
            <div class="word-box">
              <p class="count">{{reportTipsData.length}}</p>
              <p class="circle-label">{{$store.state.$v.report.tipNum}}</p>
            </div>
          </div>
          <div class="circle-item circle-error" v-if="reportWrongData && reportWrongData.length > 0">
            <div class="word-box">
              <p class="count">{{reportWrongData.length}}</p>
              <p class="circle-label">{{$store.state.$v.report.errorNum}}</p>
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
              <p class="circle-label">{{$store.state.$v.report.warnNum}}</p>
            </div>
          </div>
        </div>
        <div class="right-tab">
          <div class="tab-count-item data-full">
            <span class="tab-item-label">{{$store.state.$v.report.metaFill}}</span>
            <div class="tab-progress">
              <multi-progress
                :percentData="cNamePerArr"
                :colorArray="['#4386F5', '#F1F1F1', '#F1F1F1']"
                :showLastPer="true"
              ></multi-progress>
            </div>
            <div class="tab-description">
              <p class="description"><span-with-tooltip
                  :content="$store.state.$v.report.content1"
                  :placement="'left'"
                  :widthStr="'100%'"
                  :classString="'span-with-tooltip'"
                ></span-with-tooltip></p>
              <p class="legend" v-if="getCheckResult">
                <span class="color-boxl"></span>
                <span-with-tooltip
                  :content="$store.state.$v.report.content2+(tableColumnAllCount-withoutCNameCount)+$store.state.$v.report.numPer+
                  (tableColumnAllCount - withoutCNameCount === 0 ? 0 : (100 - tableNoCnPer - columnNoCnPer).toFixed(2))+'%'"
                  :placement="'left'"
                  classString="info span-with-tooltip"
                ></span-with-tooltip>
              </p>
              <p class="legend" v-if="getCheckResult">
                <span class="color-boxl"></span>
                <span-with-tooltip
                  :content="`${$store.state.$v.report.content3}${withoutCNameCount - withoutCNameColumnCount}${$store.state.$v.report.numPer}${
                    withoutCNameCount - withoutCNameColumnCount === 0 ? 0 : tableNoCnPer.toFixed(2)
                  }%, ${$store.state.$v.report.Column} ${withoutCNameColumnCount}${$store.state.$v.report.numPer}${
                    withoutCNameColumnCount === 0 ? 0 : columnNoCnPer.toFixed(2)
                  }%`"
                  :placement="'left'"
                  classString="info span-with-tooltip"
                ></span-with-tooltip>
              </p>
              <p class="legend" v-else>{{$store.state.$v.udp.noData}}</p>
            </div>
          </div>
          <div class="tab-count-item data-domain">
            <span class="tab-item-label">{{$store.state.$v.report.domainCover}}</span>
            <div class="tab-progress">
              <multi-progress
                :percentData="domainPerArr"
                :colorArray="['#4386F5', '#2fdaa6', '#EEEEEE']"
                dataType="count"
              ></multi-progress>
            </div>
            <div class="tab-description">
              <p class="description"><span-with-tooltip
                  :content="$store.state.$v.report.content4+modelDetail.columnCount+$store.state.$v.report.num"
                  :placement="'left'"
                  :widthStr="'100%'"
                  :classString="'span-with-tooltip'"
                ></span-with-tooltip></p>
              <p class="legend">
                <span class="color-boxl"></span>
                <span-with-tooltip
                  :content="$store.state.$v.report.content5+(domainData.pub)+$store.state.$v.report.numTotal+ (domainData.pub === 0 ? 0 : pubDomainPre.toFixed(2))+'%'"
                  :placement="'left'"
                  classString="info span-with-tooltip"
                ></span-with-tooltip>
              </p>
              <!--<p class="legend">
                <span class="color-boxl"></span>
                <span-with-tooltip
                  :content="$store.state.$v.report.content6+(domainData.pra)+$store.state.$v.report.numTotal+ (domainData.pra === 0 ? 0 : praDomainPre.toFixed(2)) +'%'"
                  :placement="'left'"
                  classString="info span-with-tooltip"
                ></span-with-tooltip>
              </p>-->
            </div>

          </div>
        </div>
      </div>
      <div class="bottom-part">
        <div class="bottom-table-conta">
          <div class="sub-title" style="margin-top:1em;margin-bottom:1em">{{$store.state.$v.report.reportInfo}}</div>
            <datablau-table
              ref="table"
              class="datablau-table"
              :data="checkResultCount"
              @row-click="handleRowClick"
              max-height="300px"
            >
              <el-table-column
                :label="$store.state.$v.report.dataQuestion"
                min-width="300"
                class-name="type-column"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span class="que-label" :class="scope.row.level">{{scope.row.name}}</span>
                  <span>{{scope.row.name === 'MQ-22' ? $t('model.report.mq22Info') : scope.row.msg}}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="count"
                :label="$store.state.$v.report.questionNum"
                show-overflow-tooltip
                min-width="150"
              >
                <template slot-scope="scope">
                  <b>{{ scope.row.count }}</b>
                </template>
              </el-table-column>
            </datablau-table>
        </div>
      </div>
    </div>
    </el-main>
</template>

<script>
import evaluteReport from './evaluteReport'
export default evaluteReport
</script>
<style lang="scss" scoped>
@import './evaluteReport';
</style>
<style lang="scss">
@import '../../../assets/styles/tableStyleWidthBorder.scss';
.model-evaluate {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
    @include tableStyle;
    .el-table {
      .table-row-class {
        cursor: pointer;
      }
      .type-column {
        vertical-align:middle;
        .que-label {
          padding: 0 10px;
          display: inline-block;
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
    // color: red;
    // border: 1px solid red;
    .description {
      .span-with-tooltip {
        vertical-align: top;
      }
    }
    .legend {
      .span-content {
        position: absolute;
        top: 8px;
        left: 24px;
        bottom: 0;
        right: 0;
      }
    }
  }
</style>
