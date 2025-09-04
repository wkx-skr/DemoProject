<template>
  <datablau-dialog
    :title="$t('processDetail.dialogTitle')"
    :visible.sync="showDialog"
    width="960px"
    append-to-body
    :close-on-click-modal="false"
    style="position: relative; overflow: hidden"
  >
    <!-- <span>任务名称：{{ taskName }}</span> -->
    <div v-if="statusDetailList.length > 1">
      <div class="step-line-wrap">
        <div class="step-line">
          <div
            class="step-line-blue"
            :class="[
              processResult !== $t('processDetail.reviewing')
                ? 'pass'
                : 'progress',
            ]"
          ></div>
          <div class="step-button-wrapper">
            <div class="step-button"></div>
          </div>
          <div class="step-button-wrapper" style="left: 50%">
            <div class="step-button"></div>
          </div>
          <div class="step-button-wrapper" style="left: 100%">
            <div
              class="step-button"
              v-if="processResult === $t('processDetail.reviewing')"
              style="border: 4px solid #ddd"
            ></div>
            <div v-else>
              <i
                class="el-icon-success"
                style="font-size: 21px; color: #409eff"
              ></i>
            </div>
          </div>
        </div>
      </div>

      <div
        style="position: relative; width: 600px; height: 120px; margin: 0 auto"
      >
        <div
          style="
            position: absolute;
            left: 0;
            transform: translateX(-50%);
            text-align: center;
          "
        >
          <div
            style="
              font-size: 16px;
              font-weight: 600;
              color: #555;
              margin-bottom: 10px;
            "
          >
            {{ $t('processDetail.initiate') }}
          </div>
          <div style="margin-bottom: 5px">
            {{ $t('processDetail.applicant') }}：{{
              statusDetailList[0].startUserId
            }}
          </div>
          <span>{{ $timeFormatter(statusDetailList[0].startTime) }}</span>
          <div></div>
        </div>

        <div
          style="
            transform: translateX(-50%);
            position: absolute;
            left: 50%;
            text-align: center;
          "
        >
          <div
            style="
              font-size: 16px;
              font-weight: 600;
              color: #555;
              margin-bottom: 10px;
            "
          >
            {{ $t('processDetail.handle') }}
          </div>
          <div style="margin-bottom: 5px">
            {{ $t('processDetail.applicant') }}：{{
              statusDetailList[statusDetailList.length - 1].tasks[0].assignee
            }}
          </div>
          <div style="margin-bottom: 5px">
            {{ $t('processDetail.stayTime') }}：
            {{ getStayTime(statusDetailList[0].startTime) }}
          </div>
          <div>
            {{ $t('processDetail.urgingStatus') }}：{{
              statusDetailList[statusDetailList.length - 1].tasks[0].urge
                ? $t('processDetail.urged')
                : $t('processDetail.notUrged')
            }}
          </div>
        </div>
        <div
          style="
            position: absolute;
            right: 0;
            text-align: center;
            transform: translateX(50%);
          "
        >
          <div
            style="
              font-size: 16px;
              font-weight: 600;
              color: #555;
              margin-bottom: 10px;
            "
          >
            {{ $t('processDetail.reviewResult') }}
          </div>
          <div v-if="processResult !== $t('processDetail.reviewing')">
            <div
              :style="{ color: getColor(processResult) }"
              style="margin-bottom: 5px"
            >
              {{ processResult }}
            </div>
            <div>
              {{
                $timeFormatter(
                  statusDetailList[statusDetailList.length - 1].endTime
                )
              }}
            </div>
          </div>
          <div v-else>{{ $t('processDetail.noResult') }}</div>
        </div>
      </div>

      <div
        id="taskDetail"
        :style="
          'position: absolute; top:' +
          top +
          ';left:' +
          left +
          ';background-color: #fff;z-index: 999;width: 170px'
        "
        v-if="detailVisible && false"
      >
        <div
          v-for="item in msgList"
          :key="item.taskId"
          style="margin-bottom: 20px; font-size: 12px"
        >
          <div>{{ $t('processDetail.approver') }}：{{ item.assignee }}</div>
          <div>
            {{ $t('processDetail.approveStatus') }}：{{
              item.endTime
                ? $t('processDetail.approved')
                : $t('processDetail.approving')
            }}
          </div>
          <div v-if="item.param.result">
            {{ $t('processDetail.reviewResult') }}: {{ item.param.result }}
          </div>
          <div v-if="!item.endTime">
            {{ $t('processDetail.stayTime') }}：{{
              getStayTime(item.startTime)
            }}
          </div>
          <div v-if="!item.endTime">
            {{ $t('processDetail.urgingStatus') }}：{{
              item.urge
                ? $t('processDetail.urgedBySystem')
                : $t('processDetail.notUrgedBySystem')
            }}
          </div>
        </div>
      </div>
      <div
        v-if="false"
        class="mySteps"
        style="overflow-x: auto; overflow-y: hidden; padding-bottom: 40px"
      >
        <div :style="'width:' + statusDetailList.length * 200 + 'px'">
          <div v-if="statusDetailList[0]" style="position: relative">
            <img
              src="../../../src/assets/images/icon/Walking.png"
              class="myImg"
              style="margin-top: 150px"
            />
            <div class="firstNode">
              <span>{{ $t('processDetail.initiateTime') }}</span>
              <br />
              <span>{{ $timeFormatter(statusDetailList[0].startTime) }}</span>
            </div>
          </div>
          <div
            v-if="statusDetailList[1]"
            :class="statusDetailList[1].endTime ? 'green' : 'green colorRed'"
            style="display: inline-block"
            @mouseenter="openTaskDetail(statusDetailList[1].tasks)"
            @mousemove="handleMouseMove($event)"
            @mouseleave="detailVisible = false"
          >
            <span class="myLine"></span>
            <span
              class="myLine"
              style="transform: rotateZ(-90deg) translate(40px, -42px)"
            ></span>
            <span
              class="myLine"
              style="transform: translate(-85px, -80px)"
            ></span>
            <i
              class="el-icon-arrow-right"
              style="width: 20px; transform: translate(-96px, -75px)"
            ></i>
            <span class="myCircle" style="transform: translate(-108px, -70px)">
              <div v-if="statusDetailList[1].endTime">
                <span>
                  {{ $t('processDetail.nodeName') }}:
                  {{ statusDetailList[1].nodeName }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.nodeStatus') }}:
                  {{ $t('processDetail.approved') }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.finishTime') }}}:
                  {{ $timeFormatter(statusDetailList[1].endTime) }}
                </span>
                <br />
              </div>
              <div v-if="!statusDetailList[1].endTime">
                <span>
                  {{ $t('processDetail.nodeName') }}:
                  {{ statusDetailList[statusDetailList.length - 1].nodeName }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.approveStatus') }}:
                  {{ $t('processDetail.approving') }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.initiateTime') }}:
                  {{
                    getStayTime(
                      statusDetailList[statusDetailList.length - 1].startTime
                    )
                  }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.urgingStatus') }}:
                  {{
                    statusDetailList[statusDetailList.length - 1].urge
                      ? $t('processDetail.urgedBySystem')
                      : $t('processDetail.notUrgedBySystem')
                  }}
                </span>
                <br />
              </div>
            </span>
          </div>
          <div
            v-if="i > 1 && item.endTime"
            v-for="(item, i) in statusDetailList"
            :key="item.id"
            class="green"
            style="display: inline-block"
            @mouseenter="openTaskDetail(item.tasks)"
            @mousemove="handleMouseMove($event)"
            @mouseleave="detailVisible = false"
          >
            <span
              class="myLine"
              style="transform: translate(-82px, -80px)"
            ></span>
            <span
              class="myLine"
              style="transform: translate(-85px, -80px)"
            ></span>
            <i
              class="el-icon-arrow-right"
              style="width: 20px; transform: translate(-96px, -75px)"
            ></i>
            <span class="myCircle" style="transform: translate(-108px, -70px)">
              <div>
                <span>
                  {{ $t('processDetail.nodeName') }}:
                  {{ statusDetailList[i].nodeName }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.nodeStatus') }}:
                  {{ $t('processDetail.approved') }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.finishedTime') }}:
                  {{ $timeFormatter(statusDetailList[i].endTime) }}
                </span>
                <br />
              </div>
            </span>
          </div>
          <div
            v-if="
              statusDetailList.length > 2 &&
              statusDetailList[statusDetailList.length - 1] &&
              !statusDetailList[statusDetailList.length - 1].endTime
            "
            class="red"
            style="display: inline-block"
            @mouseenter="
              openTaskDetail(
                statusDetailList[statusDetailList.length - 1].tasks
              )
            "
            @mousemove="handleMouseMove($event)"
            @mouseleave="detailVisible = false"
          >
            <span class="myLine"></span>
            <span
              class="myLine"
              style="transform: rotateZ(-90deg) translate(40px, -42px)"
            ></span>
            <span
              class="myLine"
              style="transform: translate(-85px, -80px)"
            ></span>
            <i
              class="el-icon-arrow-right"
              style="width: 20px; transform: translate(-96px, -75px)"
            ></i>
            <span class="myCircle" style="transform: translate(-108px, -70px)">
              <div>
                <span>
                  {{ $t('proceeDetail.nodeName') }}:
                  {{ statusDetailList[statusDetailList.length - 1].nodeName }}
                </span>
                <br />
                <span>
                  {{ $t('proceeDetail.nodeStatus') }}:
                  {{ $t('proceeDetail.approving') }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.stayTime') }}:
                  {{
                    getStayTime(
                      statusDetailList[statusDetailList.length - 1].startTime
                    )
                  }}
                </span>
                <br />
                <span>
                  {{ $t('processDetail.urgingStatus') }}:
                  {{
                    statusDetailList[statusDetailList.length - 1].urge
                      ? $t('processDetail.urgedBySystem')
                      : $t('processDetail.notUrgedBySystem')
                  }}
                </span>
                <br />
              </div>
            </span>
          </div>
        </div>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
import moment from 'moment'
import HTTP from '@/http/main'
export default {
  name: 'processDetail',
  data() {
    return {
      showDialog: false,
      taskName: '',
      statusList: [
        { label: this.$t('processDetail.all'), value: '' },
        {
          label: this.$t('processDetail.reviewing'),
          value: this.$t('processDetail.reviewing'),
        },
        {
          label: this.$t('processDetail.pass'),
          value: this.$t('processDetail.pass'),
        },
        {
          label: this.$t('processDetail.reject'),
          value: this.$t('processDetail.reject'),
        },
      ],
      status: '',
      loading: false,
      statusDetailList: [
        { id: '' },
        { endTime: '', tasks: [{ assignee: '' }] },
      ],
      active: 0,
      detailVisible: true,
      msgList: [],
      nameMapping: {},
      pageTurn: false,
      dataRange: null,
      startUserId: '',
      startUser: '',
      top: '0',
      left: '0',
      processResult: '', // 设置流程进度的结构展示
    }
  },
  methods: {
    initData(row) {
      this.taskName = row.processInstanceName || row.taskName
      HTTP.getStatusDetail(row.processInstanceId)
        .then(res => {
          this.statusDetailList = res.data
          const arr2 = []
          this.statusDetailList.forEach(e => {
            e.id = e.tasks[0].taskId
            let startTime = e.tasks[0].startTime
            let endTime = e.tasks[0].endTime
            let urge = e.tasks[0].urge
            let isFinished = true
            let startUserId = e.tasks[0].startUserId
            e.tasks.forEach(e2 => {
              startTime = e2.startTime < startTime ? e2.startTime : startTime
              endTime = e2.endTime > endTime ? e2.endTime : endTime
              urge = !e2.endTime ? e2.urge : urge
              if (!e2.endTime) {
                isFinished = false
              }
              e2.assignee && arr2.push(e2.assignee)
            })
            e.startTime = startTime
            e.endTime = isFinished ? endTime : null
            e.urge = urge
            e.startUserId = startUserId
          })
          this.statusDetailList.unshift({
            id: 0,
            startTime: this.statusDetailList[0].startTime,
            startUserId: this.statusDetailList[0].startUserId,
          })
          let sum = 0
          this.statusDetailList.forEach((e, i) => {
            if (e.endTime) {
              sum = i + 1
            }
          })
          this.active = sum
          // this.showDialog = true
          this.$http
            .post(
              `/workflow/workflow/process/instance/getResult?processInstanceId=${row.processInstanceId}`
            )
            .then(res => {
              this.processResult = !!res && !!res.data ? res.data : ''
              this.showDialog = true
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    openTaskDetail(taskList) {
      console.log(taskList, 'taskList')
      this.msgList = taskList
      this.detailVisible = true
    },
    getStayTime(startTime) {
      let st = ''
      // const nowTime = new Date().getTime()
      // const hours = (nowTime - startTime) / 3600000
      // if (hours >= 24) {
      //   const d = parseInt(hours / 24)
      //   const h = parseInt(hours % 24)
      //   st = d + '天' + h + '小时'
      // } else {
      //   st = '0天' + hours.toFixed(2) + '小时'
      // }
      const nowTime =
        this.processResult === this.$t('processDetail.reviewing')
          ? new Date().getTime()
          : this.statusDetailList[this.statusDetailList.length - 1].endTime
      let value = nowTime - startTime
      let years = moment.duration(value).years()
        ? moment.duration(value).years() + this.$t('processDetail.yearUnit')
        : ''
      let months = moment.duration(value).months()
        ? moment.duration(value).months() + this.$t('processDetail.monthUnit')
        : ''
      let days = moment.duration(value).days()
        ? moment.duration(value).days() + this.$t('processDetail.dayUnit')
        : ''
      let hours = moment.duration(value).hours()
        ? moment.duration(value).hours() + this.$t('processDetail.hourUnit')
        : ''
      let minutes = moment.duration(value).minutes()
        ? moment.duration(value).minutes() + this.$t('processDetail.minuteUnit')
        : ''
      let seconds = moment.duration(value).seconds()
        ? moment.duration(value).seconds() + this.$t('processDetail.secondUnit')
        : ''
      st = years + months + days + hours + minutes + seconds // 拼接时间
      return st
    },
    handleMouseMove(e) {
      this.left = e.clientX - 460 + 'px'
      this.top = e.clientY - 300 + 'px'
    },
    // 设置颜色
    getColor(result) {
      let color = '#ccc'
      switch (result) {
        case this.$t('processDetail.pass'):
          color = '#66BF16'
          break
        case this.$t('processDetail.reject'):
          color = '#FF4B53'
          break
        case this.$t('processDetail.rescinded'):
          color = '#afb4bf '
          break
      }
      return color
    },
  },
}
</script>

<style lang="scss" scoped>
#taskDetail {
  border: 1px solid #dcdfe6;
  padding: 10px 20px;
  background-color: #fff;
}
.step-line-wrap {
  width: 600px;
  margin: 0 auto;
  padding-top: 110px;
  .step-line {
    height: 6px;
    margin: 16px 0;
    background-color: #e4e7ed;
    border-radius: 3px;
    position: relative;
    cursor: pointer;
    vertical-align: middle;
    .step-line-blue {
      height: 6px;
      margin: 16px 0;
      // background-color: #e4e7ed;

      // background-image:linear-gradient(135deg,red 0%,red 25%,white 25%,white 50%,red 50%,red 75%,white 75%,white 100%);
      // background-size:60px 60px;
      border-radius: 3px;
      position: relative;
      cursor: pointer;
      vertical-align: middle;
    }
    .progress {
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        #79ceff 100%
      );
      animation: move 3s linear infinite;
      width: 50%;
    }
    .pass {
      background: #409eff;
      width: calc(100% - 6px);
    }
  }
  @keyframes move {
    0% {
    }
    100% {
      background-position: 600px;
    }
  }
  .step-button-wrapper {
    height: 36px;
    width: 36px;
    position: absolute;
    z-index: 1001;
    top: -8px;
    transform: translateX(-50%);
    background-color: transparent;
    text-align: center;
    user-select: none;
    line-height: normal;
  }
  .step-button {
    width: 20px;
    height: 20px;
    border: 4px solid #409eff;
    background-color: #fff;
    border-radius: 50%;
    transition: 0.2s;
    user-select: none;
  }
}
.myImg {
  width: 40px;
  height: 40px;
  margin-top: 50px;
  display: inline-block;
}
.myLine {
  display: inline-block;
  width: 80px;
  height: 2px;
}
.myCircle {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  div {
    display: inline-block;
    width: 185px;
    height: 100px;
    position: absolute;
    top: 30px;
    left: -40px;
    span {
      display: inline-block;
      width: 170px;
      font-size: 12px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      border: none !important;
    }
  }
}
.firstNode {
  position: absolute;
  bottom: -35px;
  left: 0;
  display: inline-block;
  font-size: 12px;
}
.green {
  transform: translate(40px, -40px);
  margin-right: -28px;
  span {
    border-bottom: 2px solid #7cfc00;
  }
  i {
    color: #7cfc00;
  }
  .myCircle {
    border: 2px solid #7cfc00;
  }
}
.red {
  transform: translate(-42px, -120px);
  span {
    border-bottom: 2px solid red;
  }
  i {
    color: red;
  }
  .myCircle {
    border: 2px solid red;
  }
}
.colorRed {
  span {
    border-bottom: 2px solid red;
  }
  i {
    color: red;
  }
  .myCircle {
    border: 2px solid red;
  }
}
</style>
