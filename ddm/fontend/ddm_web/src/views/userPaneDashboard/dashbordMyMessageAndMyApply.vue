<template>
  <div class="dashboard-item" :class="{'short-top': !$store.state.featureMap.ddm_Messages}">
    <div class="title-line">
      <span class="title">{{ showMessage ? '我的消息' : '我的申请' }}<span class="des">（最新20条）</span></span>
      <datablau-button
        type="text"
        style="float: right"
        @click="checkMore"
      >
        查看更多
      </datablau-button>
    </div>
    <!--<ul class="count-wrapper" v-if="$store.state.featureMap.ddm_Messages">
      <li :class="{current: currentTab === 'apply'}" @click="currentTab = 'apply'">
        <div class="content">
          <div>
            <h2>{{myReportCount}}</h2>
            <p>我的申请</p>
          </div>
        </div>
      </li>
      <li :class="{current: currentTab === 'message'}" @click="currentTab = 'message'">
        <div class="content">
          <div>
            <h2>{{myMessageCount}}</h2>
            <p>我的消息</p>
          </div>
        </div>
      </li>
    </ul>-->
    <datablau-tabs v-if="alive && showMessage" v-model="currentTab">
      <el-tab-pane :label="'我的申请'" name="apply"></el-tab-pane>
      <el-tab-pane :label="'我的消息'" name="message"></el-tab-pane>
    </datablau-tabs>
    <dashboard-my-message
      class="hide-item"
      :class="{'show-item': currentTab === 'message'}"
      @getCount="(count) => {this.myMessageCount = count}"
    ></dashboard-my-message>
    <dashboard-my-apply
      class="hide-item"
      :class="{'show-item': currentTab === 'apply', 'only-apply': !showMessage}"
      @getCount="(count) => {this.myReportCount = count}"
    ></dashboard-my-apply>
  </div>
</template>

<script>
import dashboardMyMessage from '@/views/userPaneDashboard/dashboardMyMessage'
import dashboardMyApply from '@/views/userPaneDashboard/dashboardMyApply'
import _ from 'lodash'
export default {
  data () {
    return {
      alive: true,
      currentTab: 'apply',
      myReportCount: 0,
      showMessage: this.$store.state.featureMap.ddm_Messages,
      myMessageCount: 0
    }
  },
  components: {
    dashboardMyMessage,
    dashboardMyApply
  },
  mounted () {
    this.resizeFunc = _.debounce(() => {
      this.alive = false
      this.$nextTick(() => {
        this.alive = true
      })
    }, 500)
    window.addEventListener('resize', this.resizeFunc)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeFunc)
  },
  methods: {
    checkMore () {
      if (this.currentTab === 'message') {
        this.$router.push({
          name: 'myMessage'
        })
      } else if (this.currentTab === 'apply') {
        this.$router.push({
          name: 'myApply'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.datablau-tabs.datablau-tabs-normal /deep/ {
  .el-tabs .el-tabs__header {
    .el-tabs__nav-wrap {
      width: 100%;
    }
    .el-tabs__nav {
      width: 100%;
    }
    .el-tabs__item {
      width: 50%;
      padding-left: 0 !important;
      padding-right: 0 !important;
      text-align: center;
    }
  }
}
.dashboard-item {
  background: #fff;
  padding: 16px 16px;
}
.title-line {
  .title {
    font-size: 14px;
    line-height: 24px;
    font-weight: bold;
    color: #555;

    .des {
      font-size: 12px;
      line-height: 20px;
      font-weight: normal;
    }
  }
}
.count-wrapper {
  margin-top: 6px;
  li {
    cursor: pointer;
    display: inline-block;
    width: 48%;
    border-radius: 8px;
    border: 1px solid #ddd;
    &.current {
      border-color: #409EFF;
      h2 {
        color: #409EFF;
      }
      p {
        color: #409EFF;
      }
    }
    .content {
      display: flex;
      justify-content: left;
      align-items: center;
      padding: 6px 14px;
      h2 {
        font-weight: normal;
        font-size: 20px;
        line-height: 24px;
        text-align: left;
      }
      p {
        margin-top: 4px;
        line-height: 17px;
        font-size: 12px;
      }
    }
  }
  li + li {
    margin-left: 4%;
  }
}
.dashboard-item /deep/ .table-container {
  //border: 1px solid red;
  position: absolute;
  top: 80px;
  bottom: 10px;
  left: 10px;
  right: 5px;
}

.short-top.dashboard-item /deep/ .table-container {
  top: 50px;
}

.hide-item {
  visibility: hidden;

  &.show-item {
    visibility: visible;
    &.only-apply {
      /deep/ {
        .table-container {
          //border: 1px solid red;
          top: 45px;
        }
      }
    }
  }
}
</style>
