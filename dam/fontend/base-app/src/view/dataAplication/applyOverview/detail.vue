<template>
  <div class="detail-info">
    <div class="detail">
      <div class="report-detail-check">
        <div class="model-category-header">
          <datablau-breadcrumb
            :node-data="nodeData"
            @nodeClick="nodeClick"
            @back="goBack"
          ></datablau-breadcrumb>
          <!-- <div class="top-back-line navigator">
            <span class="d-return icon-i-return" @click="goBack">
              {{ $t('common.button.return') }}
            </span>
            <span style="display: inline-block" class="d-figure">
              <i class="fa fa-database"></i>
              <span v-if="detailData && detailData.applicationName">
                应用详情 / {{ detailData.applicationName }}
              </span>
            </span>
          </div> -->
        </div>
      </div>
      <div class="top-descrpiption">
        <div class="first-partLeft">
          <datablau-icon
            data-type="api"
            :isIcon="true"
            :size="48"
          ></datablau-icon>
          <!-- <i class="iconfont icon-shujufuwu"></i> -->
          <div class="app-info">
            <datablau-tooltip
              :content="detailData.applicationName"
              :disabled="showNameTip"
            >
              <div class="first-label" @mouseover="getTooltip('first-label')">
                {{ detailData.applicationName }}
              </div>
            </datablau-tooltip>
            <br />
            <datablau-tooltip
              :content="detailData.applicationAbbr"
              :disabled="showArrTip"
            >
              <div class="second-label" @mouseover="getTooltip('second-label')">
                应用简称: {{ detailData.applicationAbbr }}
              </div>
            </datablau-tooltip>
          </div>
        </div>
        <div class="switch-info" v-if="hasAccess">
          <datablau-button @click="changeState" type="primary" size="mini">
            {{ applyStatus == 0 ? '启用' : '禁用' }}
          </datablau-button>
          <!-- <datablau-button @click="changeState(0)"v-if="applyStatus==1" type="primary" size="mini">禁用</datablau-button> -->
          <!-- <el-switch  v-model="applyStatus" @change="changeState"
          :active-value="activeVal" :inactive-value="inactiveVal" active-text="启用" inactive-text="禁用"></el-switch> -->
        </div>
      </div>
    </div>
    <datablau-tabs
      v-model="activeName"
      @tab-click="handleClick"
      class="tabs-info"
    >
      <el-tab-pane label="基本说明" name="baseInfo">
        <base-info
          :hasAccess="hasAccess"
          :componentType="componentType"
          :modeType="modeType"
          :moudleType="moudleType"
          :detailData="detailData"
        ></base-info>
      </el-tab-pane>
      <el-tab-pane v-if="hasAccess" label="授权用户" name="userInfo">
        <user-info :detailData="detailDataNew"></user-info>
      </el-tab-pane>
      <el-tab-pane label="访问监控" name="monitorInfo" appMonitor>
        <monitor-info :detailData="detailData"></monitor-info>
      </el-tab-pane>
    </datablau-tabs>
  </div>
</template>
<script>
// import HTTP from "@/http/main.js"
import HTTP from '../ddsHTTP.js'
import baseInfo from './baseInfo.vue'
import userInfo from './userInfo.vue'
import monitorInfo from './monitorInfo.vue'
export default {
  props: {
    detailData: {
      type: Object,
      required: true,
    },
    modeType: {
      type: String,
      default: 'normal',
    },
    moudleType: {
      type: String,
      default: 'normal',
    },
    componentType: {
      type: String,
      default: 'normal',
    },
  },
  name: 'apiDetails',
  components: { baseInfo, userInfo, monitorInfo },
  data() {
    return {
      // AccessAll: false,
      nodeData: [
        {
          name: '应用详情',
          couldClick: false,
        },
        {
          name: this.detailData.applicationName,
          couldClick: false,
        },
      ],
      showNameTip: false,
      showArrTip: false,
      AccessAll: this.$auth.APP_MANAGE_ALL,
      activeName: 'baseInfo',
      applyState: true,
      applyStatus: null,
      activeVal: 1,
      inactiveVal: 0,
      detailDataNew: {},
    }
  },
  mounted() {
    if (this.detailData.status !== null) {
      this.applyStatus = this.detailData.status
    } else {
      this.applyStatus = this.detailData.appStatus
    }
    this.detailDataNew = this.detailData
  },
  computed: {
    switchEdit() {
      const result = this.AccessAll || this.detailData.userState === 1
      return result
    },
    hasAccess() {
      let result = false
      if (this.moudleType === 'manageApp') {
        return true
      }
      if (this.componentType === 'devApp') {
        return true
      }
      if (this.modeType === 'applyOverview') {
        result = false
      }
      if (this.modeType === 'requestApp') {
        result = false
      }

      return result
    },
  },
  methods: {
    getTooltip(str) {
      let self = this
      this.$nextTick(() => {
        let aScroolWidth = $(`.${str}`)[0] ? $(`.${str}`)[0].scrollWidth : 0
        let aWidth = $(`.${str}`)[0] ? $(`.${str}`)[0].offsetWidth : 0
        if (aScroolWidth - aWidth > 0) {
          if (str == 'first-label') {
            self.showNameTip = false
          }
          if (str == 'second-label') {
            self.showArrTip = false
          }
        } else {
          if (str == 'first-label') {
            self.showNameTip = true
          }
          if (str == 'second-label') {
            self.showArrTip = true
          }
        }
      })
    },
    nodeClick() {
      this.goBack()
    },
    goBack() {
      this.$parent.showList = true
    },
    handleClick(tab, event) {
      this.activeName = tab.name
    },
    saveInfo() {},
    refreshData() {
      if (this.detailData.status !== null) {
        this.applyStatus = this.applyStatus == 1 ? 0 : 1
      } else {
        this.applyStatus = this.applyStatus == 1 ? 0 : 1
      }
    },
    changeState() {
      const status = this.applyStatus == 0 ? 1 : 0
      const id = this.detailData.id
      HTTP.changeApplyStatus(id, status)
        .then(res => {
          this.detailDataNew = res.data
          // this.isEdit = false;
          this.$showSuccess('更新状态成功')
          this.refreshData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
<style scoped lang="scss">
$grey-font: #6d6d6d;
$blue: #4278c9;
$green-blue: #849fca;
@import '~@/next/components/basic/color.sass';

.detail-info {
  background-color: white;
  height: 100%;
  padding-right: 20px;
  .tabs-info {
    margin-top: 95px;
  }
  /deep/ .el-tabs {
    .el-tabs__content {
      position: absolute;
      top: 166px;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: white;
      border-top: none;
      .el-table {
        &:before {
          background-color: transparent;
        }
      }
    }
  }
  .model-category-header {
    height: 40px;
    background-color: #fff;
    padding-top: 8px;
    > div {
      height: 100%;
      border-bottom: 1px solid var(--border-color-lighter);
    }
  }
  .detail {
    position: relative;
    height: 40px;
    .top-descrpiption {
      width: 100%;
      height: 90px;
      padding: 21px 0;
      .first-partLeft {
        width: 80%;
        display: inline-block;
        i {
          font-size: 48px;
          color: $green-blue;
        }
        .app-info {
          margin-left: 62px;
          margin-top: -48px;
          color: $text-default;
          .first-label {
            width: 800px;
            height: 20px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 20px;
            font-weight: 500;
            line-height: 20px;
          }
          .second-label {
            width: 800px;
            height: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-top: 10px;
            font-size: 14px;
            font-weight: 400;
            line-height: 14px;
          }
        }
      }
      .switch-info {
        display: inline-block;
        float: right;
      }
    }
    .d-return {
      float: right;
    }
    .title-info {
      font-weight: bold;
      float: left;
    }

    .button-info {
      float: right;
    }
  }
}
</style>
