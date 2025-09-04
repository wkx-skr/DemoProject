<template>
  <div class="edit" v-loading="loading">
    <div class="breadcrumb-box">
      <datablau-breadcrumb
        :node-data="nodeDatas"
        @back="cancel"
        :couldClick="false"
      ></datablau-breadcrumb>
    </div>
    <div class="edit-content">
      <div style="width: 100%; height: 100%">
        <div class="steps" :class="{ 'steps-shadow': stepsShadow }">
          <div
            v-for="item in stepsData"
            :key="item.label"
            :class="[
              'step',
              {
                active: activeStep === item.step,
                done: item.done,
                disabled: noClick(item),
              },
            ]"
            @click="changeStep(item)"
          >
            <span
              class="iconfont"
              :class="{
                'icon-zhengque': item.done,
                'icon-fillin': activeStep === item.step,
              }"
            ></span>
            {{ item.label }}
          </div>
        </div>
        <div class="step-content">
          <First
            v-show="activeStep === 1"
            :catalogInfo="catalogInfo"
            ref="first"
            :clickChild="clickChild"
            :initData="strategyData.first"
          ></First>
          <Second
            v-show="activeStep === 2"
            :isEdit="isEdit"
            :rangeMap="rangeMap"
            :clickChild="clickChild"
            ref="second"
            :initData="strategyData.second"
          ></Second>
          <Third
            :clickChild="clickChild"
            :activeStep="activeStep"
            v-show="activeStep === 3"
            ref="third"
            :initData="strategyData.third"
          ></Third>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import First from './baseInfo.vue'
import Third from './visitorConfig.vue'
import Second from './ruleConfig.vue'
import HTTP from '../../util/api'
import { getStepName } from '@/view/dataSecurity/util/util.js'
export default {
  name: 'EditStrategy',
  components: { First, Second, Third },
  props: {
    initData: {
      type: Object,
      default() {
        return {}
      },
    },
    strategyType: {
      type: String,
      default: '',
    },
    catalogInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  provide() {
    return {
      accessControlId: this.initData.accessControlId,
    }
  },
  data() {
    return {
      rangeMap: {},
      isEdit: false,
      accessControlId: '',
      stepsShadow: false,
      observe: null,
      stepsData: [
        {
          label: '基本信息',
          done: false,
          step: 1,
        },
        {
          label: '访问数据配置',
          done: false,
          step: 2,
        },
        {
          label: '访问者配置',
          done: false,
          step: 3,
        },
      ],
      activeStep: 1,
      strategyData: {
        first: {},
        second: {},
        third: {},
      },
      nodeDatas: ['访问策略管理', '新建访问策略'],
      loading: false,
    }
  },
  beforeDestroy() {
    this.destoryScroll()
  },
  mounted() {
    if (this.initData.accessControlId) {
      this.isEdit = true
      this.accessControlId = this.initData.accessControlId
      this.stepsData.map(item => (item.done = true))
      this.getFirstData()
    } else {
      this.isEdit = false
    }
    this.$nextTick(() => {
      this.scrollChange()
      this.nodeDatas[1] = this.isEdit ? '编辑访问策略' : '新建访问策略'
      this.nodeDatas = _.cloneDeep(this.nodeDatas)
    })
  },
  methods: {
    noClick(row) {
      let result = false
      if (row.done || this.activeStep === row.step) {
        result = false
      } else {
        result = true
      }
      return result
    },
    async destoryScroll(flag = false) {
      if (this.observe) {
        this.observe.disconnect()
      }
      if (flag) {
        this.stepsShadow = false
        const name = await getStepName(this.activeStep)
        if (this.$refs[name].$refs.formSubmit) {
          const content = this.$refs[name].$refs.formSubmit.$refs.content
          $(content).scrollTop(0)
          $(content).off('scroll')
        }
      }
    },
    async scrollChange() {
      const name = await getStepName(this.activeStep)
      if (!this.$refs[name].$refs.formSubmit) {
        return
      }
      const content = this.$refs[name].$refs.formSubmit.$refs.content
      const targetNode =
        this.$refs[name].$refs.formSubmit.$refs['content-inner']
      const handler = () => {
        const scrollTop = $(content).scrollTop()
        if (scrollTop > 0) {
          this.stepsShadow = true
        } else {
          this.stepsShadow = false
        }
      }
      $(content).scroll(() => {
        handler()
      })
      const config = { attributes: true, childList: true, subtree: true }
      const observe = new MutationObserver(function (mutations, observe) {
        handler()
      })
      this.observe = observe
      observe.observe(targetNode, config)
    },
    async nextSkip() {
      let result = false
      switch (this.activeStep) {
        case 1:
          result = await this.$refs.first.canNext()
          break
        case 2:
          result = await this.$refs.second.canNext()
          break
        case 3:
          result = await this.$refs.third.canNext()
          break
        default:
          break
      }
      return result
    },
    async setTip() {
      switch (this.activeStep) {
        case 1:
          // this.activeStep = 1
          break
        case 2:
          // this.$datablauMessage.warning('请添加用户所应用的行级数据')
          break
        default:
          break
      }
    },
    async clickChild(name, options) {
      switch (name) {
        case 'action':
          this.strategyData.third = {
            actionList: options.data,
          }
          break
        case 'cancel':
          this.cancel()
          break
        case 'step':
          if (options.step > options.prevStep) {
            const canSkip = await this.nextSkip()
            if (canSkip) {
              switch (options.prevStep) {
                case 1:
                  this.stepsData[0].done = true
                  break
                case 2:
                  this.stepsData[1].done = true
                  break
                case 3:
                  this.stepsData[2].done = true
                  break
                default:
                  break
              }
              this.activeStep = options.step
            } else {
              this.setTip()
            }
          } else {
            this.activeStep = options.step
          }
          this.destoryScroll(true)
          this.$nextTick(() => {
            this.scrollChange()
          })
          break
        case 'save':
          this.saveStrategy()
          break
        default:
          break
      }
    },
    async changeStep(row) {
      const step = row.step
      let canNext = false
      if (this.activeStep === step) return
      if (this.isEdit) {
        if (step < this.activeStep) {
          this.activeStep = step
        } else {
          canNext = await this.nextSkip()
          if (canNext) {
            this.activeStep = step
          } else {
            this.setTip()
          }
        }
      } else {
        if (step < this.activeStep) {
          this.activeStep = step
        } else {
          if (!row.done) return
          this.activeStep = step
        }
      }
    },
    async saveStrategy() {
      const flag = this.$refs.first.canNext()
      if (!flag) {
        this.$datablauMessage.warning('请完善基本信息')
        this.activeStep = 1
        return
      }
      const flag1 = this.$refs.second.canNext()
      if (!flag1) {
        this.activeStep = 2
        return
      }
      const firstData = this.$refs.first.firstData
      this.strategyData.first = firstData
      this.strategyData.first.type = this.strategyType
      const secondData = this.$refs.second.formContent
      this.strategyData.second = secondData
      this.strategyData.third = {
        actionList: this.strategyData.second.actionList,
        visitorDtoList: this.$refs.third.visitorDtoList,
      }
      this.loading = true
      if (this.accessControlId) {
        HTTP.modifyingPolicy({
          ...this.strategyData.first,
          ...this.strategyData.second,
          ...this.strategyData.third,
          accessStrategyName: this.strategyData.first.accessStrategyName,
          catalogId: this.strategyData.first.catalogId,
          catalogName: this.strategyData.first.catalogName,
          strategyDescribe: this.strategyData.first.strategyDescribe,
        })
          .then(res => {
            this.$blauShowSuccess('访问策略修改成功')
            this.loading = false
            this.$emit('cancel', true)
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
        return
      } else {
        HTTP.addStrategy({
          ...this.strategyData.first,
          ...this.strategyData.second,
          ...this.strategyData.third,
          strategyDescribe: this.strategyData.first.strategyDescribe,
        })
          .then(res => {
            let text = '访问策略新建成功'
            this.accessControlId && (text = '访问策略修改成功')
            this.$blauShowSuccess(text)
            this.loading = false
            this.$emit('cancel', true)
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    getFirstData() {
      this.loading = true
      let modelId
      HTTP.accessStrategyBaseInfo(this.accessControlId)
        .then(res => {
          this.loading = false
          this.strategyData.first = res.data.data.dto
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
      HTTP.getstrategyDetail(this.accessControlId)
        .then(res => {
          const data = res.data.data
          this.strategyData.second = data
          this.rangeMap = {
            oriSchemaRange: data.schemaRange,
            oriTableRange: data.tableRange,
            oriColumnRange: data.columnRange,
            oriSchemaInfo: data.schemaNameList,
            oriModelId: data.modelId,
            oriTableList: [...new Set(data.tableIdList)],
            oriColumnList: [...new Set(data.columnIdList)],
          }
          modelId = data.modelId
          this.strategyData.third = {
            actionList: data.actionList,
          }
          this.$refs.second.selectSchema(modelId)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/ .cut-apart-btn {
  margin-left: 22px;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    left: -12px;
    top: 9px;
    width: 2px;
    height: 14px;
    background: #ddd;
  }
}
.edit {
  position: relative;
  width: 100%;
  height: 100%;
  .breadcrumb-box {
    height: 40px;
    padding-top: 8px;
    margin: 0 20px;
    border-bottom: 1px solid #ddd;
  }

  .add-asset {
    margin-right: 10px;
    &::after {
      content: '';
      position: absolute;
      right: -12px;
      top: 10px;
      height: 12px;
      width: 2px;
      background: #ddd;
    }
  }

  .edit-title {
    height: 44px;
    vertical-align: middle;
    font-size: 16px;
    font-weight: 600;
    line-height: 44px;
  }
  .edit-content {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    .steps {
      width: 100%;
      height: 72px;
      padding: 16px 20px;
      box-sizing: border-box;
      position: relative;
      z-index: 9;
      &.steps-shadow {
        box-shadow: 0px 5px 14px -8px rgba(0, 0, 0, 0.2);
      }
      .step {
        position: relative;
        float: left;
        width: calc(33.3% - 20px);
        // width: 33.3%;
        margin-left: 8px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background-color: #f5f5f5;
        color: #999;
        font-weight: 600;
        font-size: 14px;
        opacity: 1;
        transition: opacity 1s ease-in-out;
        cursor: pointer;
        &:after {
          content: '';
          width: 0px;
          height: 0px;
          border-top: 20px solid transparent;
          border-bottom: 20px solid transparent;
          border-left: 20px solid #f5f5f5;
          position: absolute;
          top: 0;
          right: -20px;
          z-index: 2;
        }
        &:before {
          content: '';
          width: 0px;
          height: 0px;
          border-top: 20px solid transparent;
          border-bottom: 20px solid transparent;
          border-left: 20px solid #fff;
          position: absolute;
          top: 0;
          left: 0;
        }
        &:nth-of-type(2) {
          width: calc(33.33% + 4px);
        }
        &:last-child {
          width: 33.33%;
          &:after {
            border: none;
            top: 0;
            right: 0;
          }
        }
        &:first-child {
          margin-left: 0;
          &:before {
            border: none;
            top: 0;
            right: 0;
          }
        }
        &.done {
          background: linear-gradient(
            90deg,
            rgba(64, 158, 255, 0.1),
            rgba(64, 158, 255, 0.2)
          );
          color: #409eff;
          &:after {
            border-left: 20px solid rgba(64, 158, 255, 0.2);
            z-index: 5;
          }
        }
        &.active {
          background: linear-gradient(90deg, #74cdff 3%, #409eff);
          color: #fff;
          &:after {
            border-left: 20px solid #409eff;
            z-index: 3;
          }
          &:before {
            z-index: 2;
          }
        }
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
    .step-content {
      position: absolute;
      top: 72px;
      left: 0;
      bottom: 0;
      right: 0;
    }
  }
}
</style>
