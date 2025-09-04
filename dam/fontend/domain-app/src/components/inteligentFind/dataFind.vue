<template>
  <div>
    <datablau-page-title
      :parent-name="$t('common.page.dataIntelligence')"
      :name="$t('common.page.dataFind')"
      v-if="showHome"
    ></datablau-page-title>

    <!--TODO:-->
    <!--title => breadcrumb-->
    <datablau-breadcrumb
      v-else
      style="
        height: 40px;
        background: #fff;
        display: flex;
        align-items: center;
        padding-left: 20px;
      "
      :node-data="breadcrumbData"
      :separator="'/'"
      :couldClick="false"
      @back="backClick"
      @nodeClick="nodeClick"
    ></datablau-breadcrumb>

    <div class="citic-card-tabs fit-old-code datablau-new-tabs data-find">
      <div v-if="showHome">
        <div class="find">
          <div class="left">
            <div
              class="background-box"
              :class="{ 'dark-box': themeName === 'dark' }"
            >
              <img src="./ring.png" alt="" />
            </div>
            <div class="outer-ring">
              <span class="ball"></span>
              <div class="inner-ring">
                <span class="ball1"></span>
                <span class="ball2"></span>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="right-box">
              <p class="result-head">
                <span v-if="showStopJobBtn">
                  {{
                    $t('domain.dataFind.scanProgress', {
                      percent: jobSta.percent,
                    })
                  }}
                </span>
                <span v-else-if="jobNeverRun">
                  {{ $t('domain.dataFind.taskNeverRunning') }}
                </span>
                <span v-else>{{ $t('domain.dataFind.scanComplete') }}</span>
              </p>
              <div class="progress-bar">
                <div class="finished"></div>
              </div>
              <p class="finish-count">
                <span class="result-icon finish-icon" v-if="!showStopJobBtn">
                  <i class="el-icon-check"></i>
                </span>
                <span class="result-icon checking-icon" v-else></span>
                <span>
                  <span v-if="showStopJobBtn">
                    {{ $t('domain.dataFind.scanningProgressCount') }}：
                  </span>
                  <span v-else>
                    {{ $t('domain.dataFind.totalNumberOfReferrals') }}：
                  </span>
                  <datablau-button
                    type="text"
                    class="ele-count big-font-btn"
                    @click="checkResult"
                    :disabled="!jobExist"
                  >
                    {{ countResult }}
                  </datablau-button>
                  {{ $t('domain.dataFind.item') }}
                </span>
              </p>
              <p class="set-line">
                <span class="grey-word">
                  {{ $t('domain.dataFind.scanSettings') }}：
                </span>
                <datablau-button
                  type="text"
                  @click="handleShowDatasource"
                  :disabled="!jobExist"
                  class="click-span big-font-btn"
                  style="padding-right: 0"
                >
                  {{ $t('domain.dataFind.dataRange') }}
                </datablau-button>
                <!-- <el-tooltip :content="$t('domain.dataFind.scanTooltip')">
                  <i class="el-icon-info"></i>
                </el-tooltip> -->
                <datablau-button
                  type="text"
                  @click="checkJobDetail"
                  :disabled="!jobExist"
                  class="click-span big-font-btn"
                >
                  {{ $t('domain.dataFind.runTime') }}
                </datablau-button>
              </p>
              <datablau-button
                type="secondary"
                @click="stopJob"
                disabled
                v-if="showStopJobBtn"
              >
                {{ $t('domain.dataFind.scanning') }}
              </datablau-button>
              <datablau-button
                type="secondary"
                @click="startJob"
                :disabled="!jobExist"
                v-else
              >
                {{ $t('domain.dataFind.startScanning') }}
              </datablau-button>
              <datablau-button
                type="important"
                @click="checkResult"
                :disabled="!jobExist"
                style="background: #0084ff; color: #fff"
              >
                <span class="check-result-btn">
                  {{ $t('domain.dataFind.scanResult') }}
                </span>
              </datablau-button>
            </div>
          </div>
        </div>
      </div>
      <datablau-tabs v-else v-model="currentTab" @tab-click="tabClick">
        <el-tab-pane
          v-for="item in tabsArr"
          :key="item"
          :label="
            item === 'showJobDetail'
              ? recJob.name
              : item === 'showDadaSource'
              ? $t('domain.dataFind.dataRange')
              : item === 'jobResult'
              ? $t('domain.dataFind.scanResult')
              : $t('domain.dataFind.reRecommend')
          "
          :name="item"
        >
          <!--TODO i18n-->
          <domain-job
            v-if="item === 'showJobDetail'"
            :jobId="currentJobId"
            job-type="数据标准-数据标准智能推荐任务"
          ></domain-job>

          <!--          <job-detail
            :job="recJob"
            v-if="item === 'showJobDetail' && currentTab === item"
            ref="showJobDetail"
          ></job-detail>-->
          <choose-datasource
            :choosedModels="choosedModels"
            :compareConfigObj="compareConfigObj"
            v-if="item === 'showDadaSource'"
            ref="showDadaSource"
            @chooseDatasource="handleChangeModel"
            @removeTab="handleRemoveTab('showDadaSource')"
          ></choose-datasource>
          <job-result
            v-else-if="item === 'jobResult' && currentTab === item"
            ref="jobResult"
          ></job-result>
          <reject-tab ref="openSeeRejectTable" v-if="item === 'openSeeRejectTable' && currentTab === item"></reject-tab>
        </el-tab-pane>
      </datablau-tabs>
    </div>
  </div>
</template>

<script>
import dataFind from './dataFind.js'

export default dataFind
</script>

<style lang="scss" scoped>
$bordertest: 1px solid red;
$blue: #2074df;
.data-find {
  // padding: 0 20px;
  background: #fff;
  overflow-y: auto;
  .left {
    position: absolute;
    left: 0;
    right: 60%;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 40px;
    overflow: hidden;

    .background-box {
      // position: absolute;
      // top: 150px;
      // left: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-grow: 0;
      flex-shrink: 0;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: #fff url('./bolang-line.png');
      background-repeat: repeat-x;
      background-position-y: 75%;
      background-position-x: 100%;
      // transform: rotate(45deg);
      // transform-origin: center center;
      transition: all 2s linear;
      animation: xscroll 8s linear infinite;
      &.dark-box {
        position: relative;
        background-color: #303133;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
        }
      }
    }
  }

  .right {
    position: absolute;
    right: 0;
    left: 45%;
    top: 0;
    bottom: 0;
    font-size: 14px;
    display: flex;
    justify-content: flex-start;
    align-items: Center;

    .right-box {
      width: 100%;

      .result-head {
        // margin-top: 195px;
        margin-bottom: 30px;
        font-size: 30px;
        //font-weight: bold;
      }

      .progress-bar {
        position: relative;
        width: 65%;
        height: 15px;
        background-color: #f0f4f8;

        .finished {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(to right, #2175e0, #91cdff);
        }
      }

      .grey-word {
        color: #aaa;
      }

      .finish-count {
        position: relative;
        margin-top: 30px;
        padding-left: 32px;

        .result-icon {
          position: absolute;
          //top: 5px;
          left: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          vertical-align: top;
        }

        .finish-icon {
          background-color: $blue;
          text-align: center;
          line-height: 24px;
          color: #fff;
        }

        @keyframes transCircle {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        .checking-icon {
          background: url('./checking-icon.png') center/cover;
          animation: transCircle 1s infinite linear;
        }

        .ele-count {
          color: $blue;
          display: inline-block;
          margin: 0 12px;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .set-line {
        margin: 10px 0;

        span {
          margin-right: 26px;
        }

        .click-span {
          // color: #000;
          color: $blue;

          &:hover {
            color: $blue;
          }
        }
      }

      .bottom-btn {
        width: 140px;
        height: 40px;
        border-radius: 0;
        margin-right: 20px;
        padding-top: 3px;

        &.white-btn {
          background-color: #fff;
          color: #000;
          border-color: #000;
        }

        &.gre-btn {
          background-color: $blue;
        }
      }
    }
  }

  @media (max-width: 1400px) {
    // .left {
    //   padding: 0;
    // }
    // .right {
    //   padding-top: 10%;
    //   left: 50%;
    //   .result-head {
    //     margin-top: 0;
    //   }
    //   .progress-bar {
    //     width: 450px;
    //   }
    // }
  }

  .big-font-btn {
    font-size: 14px;
  }
}
@keyframes xscroll {
  100% {
    background-position-x: 0%;
  }
  80% {
    background-position-x: 35%;
  }

  60% {
    background-position-x: 70%;
  }

  40% {
    background-position-x: 105%;
  }
  20% {
    background-position-x: 140%;
  }
  0% {
    background-position-x: 175%;
  }
}
</style>
<style lang="scss">
@import '~@/next/components/basic/color.sass';
.row-page-info {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 30px;
  height: 50px;
  padding-left: 26px;
  margin-right: -20px;
  margin-left: -30px;
  overflow-x: visible;
  overflow-y: hidden;
  line-height: 50px;
  border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);

  .check-info {
    display: inline-block;
    width: 14px;
    height: 14px;
    vertical-align: middle;
    background: $primary-color;
  }

  .footer-row-info {
    margin-right: 10px;

    &::before {
      margin-right: 5px;
      margin-left: -13px;
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      line-height: 13px;
      color: white;
      vertical-align: middle;
      content: '\e6da';
    }
  }
}
.data-find {
  .rightView {
    position: relative;
  }
  .job-detail-buttons {
    position: absolute;
    bottom: -20px;
    left: 0;
  }

  .check-result-btn {
    display: inline-block;
    white-space: pre;
  }
  .letter-spacing-10 {
    letter-spacing: 10px;
  }
}
</style>
<style lang="scss">
@import './animation.scss';
</style>
