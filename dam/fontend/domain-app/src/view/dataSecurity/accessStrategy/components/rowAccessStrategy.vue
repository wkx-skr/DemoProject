<template>
  <div class="edit" v-loading="loading">
    <div class="datablau-breadcrumb-header">
      <div>
        <datablau-breadcrumb
          :node-data="nodeDatas"
          @back="cancel"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
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
      </div>
      <div class="step-content">
        <First
          :catalogInfo="catalogInfo"
          :clickChild="clickChild"
          v-show="activeStep === 1"
          ref="first"
          :initData="strategyData.first"
        ></First>
        <Second
          :assetInfo="tableData"
          :isEdit="isEdit"
          v-show="activeStep === 2"
          :activeStep="activeStep"
          ref="second"
          :clickChild="clickChild"
        ></Second>
      </div>
    </div>
  </div>
</template>

<script>
import First from './baseInfo.vue'
import Second from './rowConfig'
import HTTP from '../../util/api'
import { getStepName, getTypeName } from '@/view/dataSecurity/util/util.js'
export default {
  components: { First, Second },
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
      tableInfo: this.tableData,
    }
  },
  data() {
    return {
      stepsShadow: false,
      observe: null,
      isEdit: false,
      nodeDatas: ['访问策略管理', '新建行级访问策略'],
      activeStep: 1,
      strategyData: {
        first: {},
        second: {},
      },
      stepsData: [
        {
          label: '基本信息',
          done: false,
          step: 1,
        },
        {
          label: '行级访问规则配置',
          done: false,
          step: 2,
        },
      ],
      loading: false,
      tableData: {
        assetId: '', // 行级访问的表/视图id
      },
      accessControlId: '',
      curInfo: {},
    }
  },
  watch: {
    initData: {
      handler(data) {
        if (data.accessControlId) {
          this.accessControlId = data.accessControlId
          this.isEdit = true
          this.stepsData.map(item => (item.done = true))
          this.getFirstData()
        } else {
          this.isEdit = false
        }
        this.nodeDatas[1] = data.accessControlId
          ? '编辑行级访问策略'
          : '新建行级访问策略'
        this.strategyData.second.accessControlId = data.accessControlId
        this.strategyData.first.id = data.accessControlId
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy() {
    this.destoryScroll()
    this.$bus.$off('assetInfo')
  },
  mounted() {
    this.$nextTick(() => {
      this.scrollChange()
    })
    this.$bus.$on('assetInfo', this.getAssetInfo)
  },
  methods: {
    getAssetInfo(e) {
      this.curInfo = e
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
    noClick(row) {
      let result = false
      if (row.done || this.activeStep === row.step) {
        result = false
      } else {
        result = true
      }
      return result
    },
    getFirstData() {
      this.loading = true
      HTTP.accessStrategyBaseInfo(this.accessControlId)
        .then(res => {
          this.loading = false
          this.strategyData.first = res.data.data.dto
          this.tableData = {
            assetId: this.strategyData.first.objectId,
          }
          this.tableInfo = this.tableData
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    async nextSkip() {
      let result = false
      switch (this.activeStep) {
        case 1:
          result = await this.$refs.first.canNext()
          break
        case 2:
          const secondData = this.$refs.second.secondData
          this.strategyData.second = {
            ...secondData,
            accessControlId: this.accessControlId,
          }
          result =
            secondData.user.length ||
            secondData.group.length ||
            secondData.org.length
          break
        default:
          break
      }
      return result
    },
    async clickChild(name, options) {
      switch (name) {
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
          const canSkip = await this.$refs.first.canNext()
          if (canSkip) {
          } else {
            this.$datablauMessage.warning('请完善基本信息')
            return
          }
          let { obj, result } = this.dataCombination(options.data)
          const flag = result.some(item => !item.bool)
          if (flag) {
            // 行级数据没有配置
            const newMap = result.find(item => !item.bool)
            this.$refs.second.handleTabClick(newMap)
            const name = result.find(item => !item.bool).name
            this.$datablauMessage.warning(
              `请添加${getTypeName(name)}所应用的行级数据`
            )
          } else {
            this.saveStrategy(obj)
          }
          break
        case 'table':
          // 编辑的时候，获取表/视图的id和name
          this.tableData = {
            assetId: options.data.assetId,
          }
          this.tableInfo = this.tableData
          break
        default:
          break
      }
    },
    dataCombination(objAry) {
      let contrast = {
        group: { type: 'groupStrategy', scopeType: 'GROUP', visitorId: 'id' },
        user: {
          type: 'userStrategy',
          scopeType: 'PERSON',
          visitorId: 'username',
        },
        org: {
          type: 'orgStrategy',
          scopeType: 'ORGANIZATION',
          visitorId: 'bm',
        },
      }
      let obj = {}
      let result = []
      let newMap = {}
      Object.keys(objAry).forEach(item => {
        let ary = []
        objAry[item].forEach(v => {
          let conditionsDto
          if (v.delete) {
            newMap = {
              bool: true,
              name: item,
            }
            result.push(newMap)
          } else {
            if (v.groupsList) {
              conditionsDto = {
                connector: v.groupsList.connector,
                dtos: v.groupsList.dtos,
                rowLimit: v.groupsList.rowLimit,
              }
              // 判断是否有行级数据
              const canNext =
                v.groupsList.dtos && v.groupsList.dtos[0].conditionDtos[0].name
              if (
                canNext ||
                v.groupsList.rowLimit ||
                v.groupsList.rowLimit === 0
              ) {
                newMap = {
                  bool: true,
                  name: item,
                }
                result.push(newMap)
              } else {
                newMap = {
                  bool: false,
                  name: item,
                }
                result.push(newMap)
              }
            } else {
              newMap = {
                bool: false,
                name: item,
              }
              result.push(newMap)
            }
          }

          let aryO = {
            target: v[contrast[item].visitorId],
            scopeType: contrast[item].scopeType,
            dto: conditionsDto || v.dto,
          }
          v.realId && (aryO.id = v.realId)
          aryO.delete = v.delete
          ary.push(aryO)
        })
        obj[contrast[item].type] = ary
      })
      return { obj, result }
    },
    saveStrategy(obj) {
      const firstData = this.$refs.first.firstData
      HTTP.rowlevelPolicy({
        ...firstData,
        ...obj,
        type: 'ACCESS_ROW_STRATEGY',
        tableId: this.tableData.assetId,
        objectId: this.tableData.assetId,
        tableName: this.curInfo.physicalName,
        modelId: this.curInfo.modelId,
        // modelName: obj.modelName,
      })
        .then(res => {
          let text = '行级访问策略新建成功'
          this.accessControlId && (text = '行级访问策略修改成功')
          this.$blauShowSuccess(text)
          this.$emit('cancel', true)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    async setTip() {
      switch (this.activeStep) {
        case 1:
          // this.activeStep = 1
          break
        case 2:
          this.$datablauMessage.warning('请添加用户所应用的行级数据')
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
        canNext = await this.nextSkip()
        if (canNext) {
          this.activeStep = step
        } else {
          this.setTip()
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
    cancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<style scoped lang="scss">
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
        width: calc(50% - 20px);
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
        &:last-child {
          width: calc(50% + 8px);
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
