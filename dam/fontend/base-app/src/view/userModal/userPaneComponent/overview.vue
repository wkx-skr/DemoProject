<template>
  <div class="overview-bar">
    <div class="box-left inline-block">
      <!-- <img class="avatar" src="./88.jpg" alt="" /> -->
      <div class="avatar">
        {{ $user.fullname.substr(0, 1) }}
      </div>
    </div>
    <div class="box-middle inline-block">
      <div class="greetings" v-if="$i18n.locale === 'zh'">
        {{ greeting }}{{ $user.fullname }}，祝你开心每一天
      </div>
      <div class="greetings" v-else>Hello, {{ $user.fullname }}</div>
      <div style="margin-top: 10px; display: flex">
        <i
          class="iconfont icon-menu-fwzl iconLeft"
          style="color: #8c5dff; font-size: 10px"
        ></i>
        <datablau-tooltip
          class="tip1"
          :content="$user.orgName"
          :open-delay="700"
        >
          <span class="tip1_info">
            {{ $user.orgName }}
          </span>
        </datablau-tooltip>
        <!-- 暂无接口，暂时屏蔽 -->
        <div class="tip2" v-if="false">
          <i class="iconfont icon-dingyue" style="color: #409eff"></i>
          {{ message }}
          <div
            style="
              position: absolute;
              top: 5px;
              right: 10px;
              height: 12px;
              width: 12px;
              overflow: hidden;
            "
          >
            <i
              style="font-size: 16px; transform: translate(-3px, -4px)"
              :class="[
                'el-icon-caret-left',
                currentIndex == 0 ? 'disabled' : 'canClick',
              ]"
              @click="preMessage"
            ></i>
          </div>
          <div
            style="
              position: absolute;
              right: -1px;
              top: 5px;
              height: 12px;
              width: 12px;
              color: #409eff;
              overflow: hidden;
            "
          >
            <i
              style="font-size: 16px; transform: translate(-4px, -4px)"
              :class="[
                'el-icon-caret-right',
                currentIndex == 2 ? 'disabled' : 'canClick',
              ]"
              @click="nextMessage"
            ></i>
          </div>
        </div>
      </div>
    </div>
    <div class="box-right inline-block">
      <div style="background: #fff; height: 56px; display: flex">
        <!-- 数据质量问题 -->
        <div class="icon-bg">
          <!-- <i class="iconfont icon-warn overview-icon-style"></i> -->
          <img src="./icon/qualityPro.png" />
        </div>
        <div style="height: 56px; display: inline-block; margin-left: 10px">
          <div class="num">{{ qualityData.questNumCounts | nullFilter }}</div>
          <div class="sub-title">
            {{ $t('userPane.userPane.dataQualityIssues') }}
          </div>
        </div>
        <div class="separator-line"></div>
        <!-- 进行中申请 -->
        <div class="icon-bg">
          <!-- <i
            class="iconfont icon-warn overview-icon-style"
            style="color: #409eff"
          ></i> -->
          <img src="./icon/processApply.png" />
        </div>
        <div style="height: 56px; display: inline-block; margin-left: 10px">
          <div class="num">{{ workflowData.applyingCounts | nullFilter }}</div>
          <div class="sub-title">
            {{ $t('userPane.userPane.pendingApplications') }}
          </div>
        </div>
        <div class="separator-line"></div>
        <!-- 待办任务 -->
        <div class="icon-bg">
          <!-- <i
            class="iconfont icon-warn overview-icon-style"
            style="color: #e6ad00"
          ></i> -->
          <img src="./icon/todoTask.png" />
        </div>
        <div style="height: 56px; display: inline-block; margin-left: 10px">
          <div class="num">{{ workflowData.assigneeCounts | nullFilter }}</div>
          <div class="sub-title">{{ $t('userPane.userPane.todoList') }}</div>
        </div>
        <div class="separator-line"></div>

        <!-- 近一个月完成任务 -->
        <div class="icon-bg">
          <!-- <i
            class="iconfont icon-warn overview-icon-style"
            style="color: #66bf16"
          ></i> -->
          <img src="./icon/oneMonthTask.png" />
        </div>
        <div style="height: 56px; display: inline-block; margin-left: 10px">
          <div class="num">{{ workflowData.finishedCounts | nullFilter }}</div>
          <div class="sub-title">{{ $t('userPane.userPane.30History') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messageList: ['这是第1条消息', '这是第2条消息', '这是第3条消息'],
      currentIndex: 0,
      workbenchData: {},
      workflowData: {},
      qualityData: {},
    }
  },
  created() {
    // console.log(this.$user, '{{{this.$user.username}}')
  },
  mounted() {
    this.initData()
    this.$nextTick(() => {
      setInterval(this.nextMessage, 3000)
    })
  },
  filters: {
    nullFilter(val) {
      return val || 0
    },
  },
  computed: {
    greeting() {
      let hour = new Date().getHours()
      let txt
      if (hour < 6) {
        txt = '凌晨好，'
      } else if (hour < 9) {
        txt = '早上好，'
      } else if (hour < 12) {
        txt = '上午好，'
      } else if (hour < 14) {
        txt = '中午好，'
      } else if (hour < 17) {
        txt = '下午好，'
      } else if (hour < 19) {
        txt = '傍晚好，'
      } else {
        txt = '晚上好，'
      }
      return txt
    },
    message() {
      return this.messageList[this.currentIndex]
    },
  },
  methods: {
    initData() {
      const appName = JSON.parse(localStorage.getItem('allServers'))
      this.$http
        .post('/workflow/task/counts', { appName: appName })
        .then(res => {
          this.workflowData = res.data
        })
      this.$http
        .post(`${this.$quality_url}/dashboard/quality/workbench/problem`)
        .then(res => {
          this.qualityData = res.data
        })
    },
    preMessage() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    nextMessage() {
      // TODO 需要根据结构做调整
      let length = this.messageList.length
      if (this.currentIndex < length - 1) {
        this.currentIndex++
      } else {
        this.currentIndex = 0
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.overview-bar {
  overflow-x: auto;
  overflow-y: hidden;
  .disabled {
    color: gray;
    pointer-events: none;
    cursor: default;
    opacity: 0.6;
  }
  .canClick {
    color: #409eff;
  }
  display: flex;
  background: #fff;
  .box-left {
    padding: 16px 20px;
    box-sizing: border-box;
    height: 119px;
    width: 128px;
    .avatar {
      width: 88px;
      height: 88px;
      line-height: 88px;
      text-align: center;
      font-size: 16px;
      background: rgba(64, 158, 255, 0.1);
      border-radius: 50%;
    }
  }
  .box-middle {
    width: 334px;
    height: 119px;
    padding-right: 20px;

    .greetings {
      width: 100%;
      margin-top: 25px;
      height: 25px;
      font-size: 18px;
      // font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #555555;
      line-height: 25px;
      overflow: hidden;
    }
    .iconLeft {
      padding: 0 6px 0 8px;
      display: inline-block;
      height: 24px;
      line-height: 24px;
      background: rgba(140, 93, 255, 0.15);
      border-radius: 2px 0 0 2px;
      font-size: 10px;
    }
    .tip1 {
      max-width: 300px;
      display: inline-block;
      height: 24px;
      line-height: 24px;
      background: rgba(140, 93, 255, 0.15);
      border-radius: 0 2px 2px 0;
      margin-right: 10px;
      .tip1_info {
        padding: 0 8px 0 0;
        vertical-align: bottom;
        height: 24px;
        max-width: 300px;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .tip2 {
      position: relative;
      padding-left: 8px;
      min-width: 200px;
      max-width: 360px;
      flex: 1;
      display: inline-block;
      height: 24px;
      line-height: 24px;
      background: rgba(64, 158, 255, 0.1);
      border-radius: 2px;
      i {
        font-size: 10px;
      }
    }
  }
  .box-right {
    // width: 840px;
    padding: 31px 0;
    .icon-bg {
      width: 56px;
      height: 56px;
      line-height: 56px;
      text-align: center;
      position: relative;
      display: inline-block;
    }
    .overview-icon-style {
      color: red;
      font-size: 30px;
      left: 12px;
      top: 13px;
      position: absolute;
    }
    .num {
      width: 90px;
      height: 39px;
      font-size: 30px;
      // font-family: Avenir-Heavy, Avenir;
      font-weight: 800;
      color: #444444;
      line-height: 39px;
    }
    .sub-title {
      width: 132px;
      height: 17px;
      font-size: 12px;
      // font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #999999;
      line-height: 17px;
    }
    .separator-line {
      width: 2px;
      height: 40px;
      background: #eeeeee;
      border-radius: 10px;
      align-self: center;
      margin-right: 20px;
    }
  }

  .inline-block {
    display: inline-block;
  }
}
</style>
