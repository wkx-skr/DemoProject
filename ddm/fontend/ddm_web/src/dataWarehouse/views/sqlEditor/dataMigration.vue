<template>
    <div style="position: absolute;
    top: 32px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background: #222222;">
    <div class="setp-cont">
      <div class="setp-cont-div">
        <div class="setp-ul">
          <div
              v-for="item in stepData"
              :key="item.label"
              :class="[
                'step',
                {
                  active: currentStep === item.step,
                  done: item.done,
                  current: item.current,
                  disabled: noClick(item) || currentStep === 3,
                },
              ]"
              @click="changeStepTop(item)"
            >
              <div class="step-line"></div>
              <div class="step-label">
                <span style="margin-right:4px">
                  <span class="defult" v-if="item.disabled">
                    <i ></i>
                  </span>
                  <span class="success" v-if="item.done">
                    <i class=" el-icon-success"    style="color:#187FFF;font-size:22px"></i>
                  </span>
                  <span class="current"  v-if="item.current">
                    <i></i>
                  </span>
                </span>
                {{ item.label }}
              </div>
            </div>

        </div>
      </div>
    </div>
        <dataTransform @showLog="showLog" v-show="!show"
         :migrationObj="migrationObj"
         :codeTree="codeTree"
         :flagType="flagType"
         :authPro="authPro"
         :gitPath="gitPath"
         @changeSetp="changeSetp"
         @backStep="backStep"
         @getThirdButton="getThirdButton"
         @getSecondButton="getSecondButton"
         @getFirstButton="getFirstButton"
         @getFifthButton="getFifthButton"
         ref="dataTransform"
        ></dataTransform>
        <dataMigrationLog
          v-show="show"
          :params="params"
          @prevBtn="prevBtn"
          :codeTree="codeTree"
          :migrationObj="migrationObj"
          :migrationId="migrationId"
          :gitPath="gitPath"
          @backStep="backStep"
        ></dataMigrationLog>
    </div>
</template>

<script>
import dataTransform from './dataTransform.vue'
import dataMigrationLog from '@/dataWarehouse/views/sqlEditor/dataMigrationLog'
export default {
  components: {
    dataTransform,
    dataMigrationLog
  },
  props: {
    codeTree: {
      type: Object,
      default: () => {}
    },
    migrationObj: {
      type: [Array, Object],
      default: () => {}
    },
    migrationId: {
      type: Number
    },
    flagType: {
      type: Boolean
    },
    authPro: {
      type: Object
    },
    gitPath: {
      type: [Array]
    }
  },
  data () {
    return {
      show: false,
      params: {},
      active: 0,
      done: false,
      // done: 完成,
      // disabled: 禁止选择,
      // current: 正在点击
      stepData: [
        {
          label: '基本信息',
          current: true,
          step: 1
        },
        {
          label: '源定义',
          done: false,
          step: 2,
          disabled: true
        },
        {
          label: '目标定义',
          done: false,
          step: 3,
          disabled: true
        },
        {
          label: '过滤条件',
          done: false,
          step: 4,
          disabled: true
        },
        {
          label: '任务创建',
          done: false,
          step: 5,
          disabled: true
        }
      ],
      currentStep: 1
    }
  },
  computed: {
  },
  beforeMount () {
  },
  mounted () {
    if (JSON.stringify(this.migrationObj) !== '{}') {
      this.stepData = [
        {
          label: '基本信息',
          done: true,
          step: 1
        },
        {
          label: '源定义',
          done: true,
          step: 2,
          disabled: false
        },
        {
          label: '目标定义',
          done: true,
          step: 3,
          disabled: false
        },
        {
          label: '过滤条件',
          done: true,
          step: 4,
          disabled: false
        },
        {
          label: '任务创建',
          done: true,
          step: 5,
          disabled: false
        }
      ]
    }
  },
  destroyed () {
  },
  methods: {
    getThirdButton (val) {
      this.stepData[2].done = false
      this.stepData[2].current = true
      this.stepData[3].disabled = val
      this.stepData[3].done = false
      this.stepData[4].disabled = val
      this.stepData[4].done = false
      this.stepData[4].current = false
    },
    getSecondButton (val) {
      this.stepData[1].done = false
      this.stepData[1].current = true
      this.stepData[2].disabled = val
      this.stepData[2].done = false
      this.stepData[2].current = false
      this.stepData[3].disabled = val
      this.stepData[3].done = false
      this.stepData[3].current = false
      this.stepData[4].disabled = val
      this.stepData[4].done = false
      this.stepData[4].current = false
    },
    getFirstButton (val) {
      this.stepData[0].done = false
      this.stepData[0].current = true
      this.stepData[1].disabled = val
      this.stepData[1].done = false
      this.stepData[1].current = false
      this.stepData[2].disabled = val
      this.stepData[2].done = false
      this.stepData[2].current = false
      this.stepData[3].disabled = val
      this.stepData[3].done = false
      this.stepData[3].current = false
      this.stepData[4].disabled = val
      this.stepData[4].done = false
      this.stepData[4].current = false
    },
    getFifthButton (val) {
      this.stepData[3].done = false
      this.stepData[3].current = true
      this.stepData[4].disabled = val
      this.stepData[4].done = false
      this.stepData[4].current = false
    },
    backStep (type, disabled) {
      this.currentStep = Number(type)
      if (type === '1') {
        this.stepData[0].done = true
        this.stepData[1].disabled = this.stepData[1].done !== true
        this.stepData[1].current = false
        // this.stepData[3].current = this.stepData[3].done !== true
      } else if (type === '2') {
        this.stepData[2].disabled = this.stepData[2].done !== true
        this.stepData[2].current = false
        this.stepData[3].current = false
        this.stepData[3].disabled = this.stepData[3].done !== true
      } else if (type === '3') {
        this.stepData[3].disabled = this.stepData[3].done !== true
        this.stepData[3].current = false
        this.stepData[4].disabled = this.stepData[4].done !== true
        this.stepData[4].current = false
      } else if (type === '4') {
        this.stepData[4].disabled = this.stepData[4].done !== true
        this.stepData[4].current = false
      }
    },
    changeSetp (type) {
      this.currentStep = Number(type)
      if (type === '2') {
        this.stepData[0].done = true
        this.stepData[0].current = false
        this.stepData[1].current = this.stepData[1].done !== true
        this.stepData[1].disabled = false
      } else if (type === '3') {
        this.stepData[1].done = true
        this.stepData[1].current = false
        this.stepData[2].current = this.stepData[2].done !== true
        this.stepData[2].disabled = false
      } else if (type === '4') {
        this.stepData[2].done = true
        this.stepData[2].current = false
        this.stepData[3].current = this.stepData[3].done !== true
        this.stepData[3].disabled = false
      } else if (type === '5') {
        this.stepData[3].done = true
        this.stepData[3].current = false
        this.stepData[4].current = this.stepData[4].done !== true
        this.stepData[4].disabled = false
      }
    },
    showLog (params) {
      this.show = true
      this.params = params
    },
    prevBtn () {
      this.show = false
    },
    changeStepTop (row) {
      if (this.currentStep === 5) {
        this.show = false
      }
      if (this.currentStep === row.step) return
      if (row.step < this.currentStep) {
        this.currentStep = row.step
        this.$refs.dataTransform.backStep(row.step.toString())
      } else {
        if (!row.done) return
        this.currentStep = row.step
        this.$refs.dataTransform.nextStep(row.step.toString())
      }
      if (this.currentStep === 4) {
        this.stepData[4].disabled = this.stepData[4].done !== true
        this.stepData[4].current = false
      }
    },
    noClick () {

    }
  }
}
</script>
<style scoped lang='scss'>
.setp-cont{
  height: 56px;
  background: #333333;
  border-radius: 4px;
  margin: 16px;
  display: flex;
  align-items: center;
  .setp-cont-div{
    width: 100%;
    min-width: 1000px;
    .setp-ul{
      padding: 0 10%;
      display: flex;
      justify-content: center;
      .step{
        width: 25%;
        color: #888888;
        position: relative;
        height: 56px;
        display: flex;
        align-items: center;
        &:last-child{
          width: 15%;
          .step-line{
            display: none;
          }
        }
        &:first-child{
          .step-line{
            padding-left: 0;
          }
        }
        &.active{
          color: #187FFF;
          .step-label{
            .success{
              border: 6px solid rgba(24,127,255,0.2);
              border-radius: 22px;
              // background: rgba(24,127,255,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .current{
              border-radius:  19px;
              border: 6px solid rgba(24,127,255,0.2);
            }
          }
        }
        &.done{
          color: #187FFF;
          .step-line{
            background: #187FFF;
          }
          .step-label{
            cursor: pointer;
          }
        }
        .step-line{
          width: 100%;
          height: 2px;
          background: #666666;
          border-radius: 1px;
          position: absolute;
          // top: 10px;
        }
        .step-label{
          background: #333333;
          position: absolute;
          z-index: 1;
          padding-left: 4px;
          padding-right: 8px;
          display: flex;
          align-items: center;
          // min-width: 100px;
          .success{
            border: 6px solid transparent;
          }
          .defult{
            border: 6px solid transparent;
            i{
              width: 21px;
              height: 21px;
              border: 3px solid #4D4D4D;
              border-radius:  21px;
              display: inline-block;
              vertical-align: middle;
            }
          }
          .current{
            display: flex;
            align-items: center;
            justify-content: center;
            border: 6px solid transparent;
            i{
              width: 16px;
              height: 16px;
              background: #FFFFFF;
              display: inline-block;
              border-radius:  19px;
              vertical-align: middle;
              border: 5px solid #187FFF;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang='scss'>
</style>
