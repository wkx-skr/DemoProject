<template>
  <div class="desensitize-page">
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
        <div
          class="steps"
          :class="{
            'second-steps': strategyType !== 'ACCESS_DATAMASK_TABLE',
            'steps-shadow': stepsShadow,
          }"
        >
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
        <First
          v-loading="loading"
          :catalogInfo="catalogInfo"
          v-show="activeStep === 1"
          ref="first"
          :initData="strategyData.first"
          :clickChild="clickChild"
        ></First>
        <Second
          v-if="strategyType === 'ACCESS_DATAMASK_TABLE'"
          v-show="activeStep === 2"
          :assetInfo="assetInfo"
          ref="second"
          :isEdit="isEdit"
          :clickChild="clickChild"
        ></Second>
        <Third
          :assetInfo="assetInfo"
          :isEdit="isEdit"
          v-show="activeStep === 3"
          ref="third"
          :clickChild="clickChild"
        ></Third>
      </div>
    </div>
  </div>
</template>

<script>
import First from './stepOne.vue'
import Second from './stepTwo.vue'
import Third from './stepThree.vue'
import API from '@/view/dataSecurity/util/api'
import { stepCanSave, getStepName } from '@/view/dataSecurity/util/util.js'
export default {
  components: { First, Second, Third },
  props: {
    strategyType: {
      type: String,
      default: 'ACCESS_DATAMASK_TABLE',
    },
    initData: {
      type: Object,
      default() {
        return {}
      },
    },
    catalogInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      stepsShadow: false,
      observe: null,
      loading: false,
      strategyData: {
        first: {},
        second: {},
        third: {},
      },
      isEdit: false,
      activeStep: 1,
      nodeDatas: ['脱敏策略管理', '新建脱敏策略'],
      stepsData: [],
      assetInfo: {
        assetId: '', // 资产id，表、视图、字段
      },
      ruleList: [],
      completeStep2: false,
      completeStep3: false,
      curInfo: {},
    }
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
    if (this.strategyType === 'ACCESS_DATAMASK_TABLE') {
      this.stepsData = [
        {
          label: '基本信息',
          done: false,
          canNext: false,
          step: 1,
        },
        {
          label: '脱敏规则配置',
          done: false,
          canNext: false,
          step: 2,
        },
        {
          label: '访问者配置',
          done: false,
          canNext: false,
          step: 3,
        },
      ]
    } else {
      this.stepsData = [
        {
          label: '基本信息',
          done: false,
          canNext: false,
          step: 1,
        },
        {
          label: '脱敏规则配置',
          done: false,
          canNext: false,
          step: 3,
        },
      ]
    }
    if (this.initData.accessControlId) {
      this.loading = true
      this.isEdit = true
      this.getDetail()
    } else {
      this.isEdit = false
    }
    this.getNodeDatas()
  },
  methods: {
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
    getNodeDatas() {
      const name = this.strategyType === 'ACCESS_DATAMASK_TABLE' ? '表' : '字段'
      this.nodeDatas = [
        '脱敏策略管理',
        this.isEdit ? `编辑${name}脱敏策略` : `新建${name}脱敏策略`,
      ]
    },
    getAssetInfo(e) {
      this.curInfo = e
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
    cancel() {
      this.$emit('cancel', true)
    },
    getDetail() {
      // 编辑时，都可点
      this.stepsData.map(item => {
        item.done = true
        item.canNext = true
      })
      // 第一步数据详情
      API.accessStrategyBaseInfo(this.initData.accessControlId)
        .then(res => {
          this.loading = false
          this.strategyData.first = res.data.data.dto
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
      const scopedList = [
        {
          name: 'user',
          type: 'PERSON',
        },
        {
          name: 'group',
          type: 'GROUP',
        },
        {
          name: 'org',
          type: 'ORGANIZATION',
        },
      ]
      scopedList.map(item => {
        this.getScoped(item)
      })
    },
    getScoped(row) {
      let isFirst = true
      const params = {
        accessId: this.initData.accessControlId,
        scopeType: row.type,
      }
      if (this.strategyType === 'ACCESS_DATAMASK_TABLE') {
        API.getTableScopedMaskDetail(params)
          .then(res => {
            const data = res.data.data
            if (isFirst) {
              isFirst = false
              this.assetInfo.assetId = data.tableId
            }
            data.scopeDetailDtoList.length > 0 &&
              data.scopeDetailDtoList.map(item => {
                switch (row.name) {
                  case 'user':
                    item.username = item.loginName
                    item.fullUserName = item.name
                    item.orgFullName = item.orgName
                    item.title = item.position
                    break
                  case 'group':
                    item.id = item.groupId
                    item.name = item.groupName
                    break
                  case 'org':
                    item.bm = item.orgCode
                    item.fullName = item.orgName
                    item.name = item.orgName
                    break
                  default:
                    break
                }
              })
            this.$refs.third.thirdData[row.name] = data.scopeDetailDtoList
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        API.getColumnMaskDetail(params)
          .then(res => {
            const data = res.data.data
            if (isFirst) {
              isFirst = false
              this.assetInfo.assetId = data.objectId
            }
            data.detailDtoList.length > 0 &&
              data.detailDtoList.map(item => {
                let ruleMap = {}
                switch (row.name) {
                  case 'user':
                    ruleMap.name = item.maskRule
                    ruleMap.id = item.ruleId
                    item.ruleMap = ruleMap
                    item.username = item.loginName
                    item.fullUserName = item.name
                    item.orgFullName = item.orgName
                    item.title = item.position
                    break
                  case 'group':
                    ruleMap.name = item.maskRule
                    ruleMap.id = item.ruleId
                    item.ruleMap = ruleMap
                    item.id = item.groupId
                    item.name = item.groupName
                    break
                  case 'org':
                    ruleMap.name = item.maskRule
                    ruleMap.id = item.ruleId
                    item.ruleMap = ruleMap
                    item.bm = item.orgCode
                    item.fullName = item.orgName
                    item.name = item.orgName
                    break
                  default:
                    break
                }
              })
            this.$refs.third.thirdData[row.name] = data.detailDtoList
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getRefName(step) {
      let name = ''
      switch (step) {
        case 1:
          name = 'first'
          break
        case 2:
          name = 'second'
          break
        case 3:
          name = 'third'
          break
        default:
          break
      }
      return name
    },
    async nextSkip() {
      let result = false
      switch (this.activeStep) {
        case 1:
          result = this.$refs.first.nextJudge()
          break
        case 2:
          const secondData1 = this.$refs.second.secondData
          result =
            secondData1.maskRuleMap &&
            Object.keys(secondData1.maskRuleMap).length > 0
          break
        case 3:
          const options = await stepCanSave(
            this.strategyType,
            this.$refs.third.thirdData
          )
          result = options.flag
          break
        default:
          break
      }
      return result
    },
    async changeStep(row) {
      const step = row.step
      let canNext = false
      if (this.activeStep === step) return
      if (step < this.activeStep) {
        this.activeStep = step
      } else {
        if (!row.done) return
        canNext = await this.nextSkip()
        if (canNext) {
          this.activeStep = step
        } else {
          this.setTip()
        }
      }
    },
    async setTip() {
      switch (this.activeStep) {
        case 1:
          this.activeStep = 1
          break
        case 2:
          this.$datablauMessage.warning('请添加字段所应用的脱敏规则')
          // this.activeStep = 2
          break
        case 3:
          const options = await stepCanSave(
            this.strategyType,
            this.$refs.third.thirdData
          )
          this.$datablauMessage.warning(options.tip)
          // this.activeStep = 3
          break
        default:
          break
      }
    },
    async clickChild(name, option) {
      const flag = this.strategyType === 'ACCESS_DATAMASK_TABLE'
      switch (name) {
        case 'cancel':
          this.cancel()
          break
        case 'asset':
          this.assetInfo = {
            assetId: option.data.assetId,
          }
          if (flag) {
            this.$refs.second.clearRule()
          }
          break
        case 'step':
          if (option.step > option.prevStep) {
            const canSkip = await this.nextSkip()
            if (canSkip) {
              switch (option.prevStep) {
                case 1:
                  this.stepsData[0].done = true
                  break
                case 2:
                  this.stepsData[1].done = true
                  break
                case 3:
                  if (flag) {
                    this.stepsData[2].done = true
                  } else {
                    this.stepsData[1].done = true
                  }
                  break
                default:
                  break
              }
              this.activeStep = option.step
            } else {
              this.setTip()
            }
          } else {
            this.activeStep = option.step
          }
          break
        case 'save':
          const canNext = this.$refs.first.nextJudge()
          if (!canNext) {
            this.$datablauMessage.warning('请完善基本信息')
            this.activeStep = 1
            return
          }
          if (flag) {
            const secondData1 = this.$refs.second.secondData
            const nowResult =
              secondData1.maskRuleMap &&
              Object.keys(secondData1.maskRuleMap).length > 0
            if (!nowResult) {
              this.$datablauMessage.warning('请添加字段所应用的脱敏规则')
              this.activeStep = 2
              return
            }
          }
          const options = await stepCanSave(
            this.strategyType,
            this.$refs.third.thirdData
          )
          if (!options.flag) {
            this.$datablauMessage.warning(options.tip)
            this.activeStep = 3
            return
          }
          const firstData = this.$refs.first.firstData
          this.strategyData.first = firstData
          let secondData
          if (flag) {
            secondData = this.$refs.second.secondData
            this.strategyData.second = secondData
          }
          const thirdData = this.$refs.third.thirdData
          this.strategyData.third = thirdData
          let scopeList = []
          Object.keys(thirdData).map(key => {
            thirdData[key].length > 0 &&
              thirdData[key].map(item => {
                let tableMap = {}
                switch (key) {
                  case 'user':
                    tableMap.scopeType = 'PERSON'
                    tableMap.scopeInfo = item.username
                    break
                  case 'group':
                    tableMap.scopeType = 'GROUP'
                    tableMap.scopeInfo = item.id.toString()
                    break
                  case 'org':
                    tableMap.scopeType = 'ORGANIZATION'
                    tableMap.scopeInfo = item.bm
                    break
                  default:
                    break
                }
                if (this.strategyType !== 'ACCESS_DATAMASK_TABLE') {
                  if (item.ruleMap) {
                    tableMap.datamaskId = item.ruleMap.id
                  }
                }
                scopeList.push(tableMap)
              })
          })
          const dataMap = {
            accessStrategyName: firstData.accessStrategyName, // 脱敏策略名字
            catalogId: firstData.catalogId, // 防控策略目录id
            catalogName: firstData.catalogName, // 防控策略目录名字
            // securityStrategyId: firstData.securityStrategyId, // 安全策略id
            // securityStrategyName: firstData.securityStrategyName, // 安全策略名字
            strategyDescribe: firstData.strategyDescribe, // 脱敏策略描述
            creator: this.$user.username, // 创建人
            maskType:
              this.strategyType === 'ACCESS_DATAMASK_TABLE'
                ? 'TABLE'
                : 'COLUMN', // 脱敏类型
            // allow: '', //
            // enable: '', //
          }
          if (flag) {
            let columnMaskList = []
            Object.keys(secondData.maskRuleMap).map(key => {
              let columnMap = {}
              columnMap.objectId = key // 脱敏对象id(objectId)
              columnMap.maskId = secondData.maskRuleMap[key].id // 脱敏规则id
              columnMaskList.push(columnMap)
            })
            const params = {
              ...dataMap,
              type: 'ACCESS_DATAMASK_TABLE', // 访控策略类型
              tableId: this.assetInfo.assetId, // 表id
              objectId: this.assetInfo.assetId, // 表id
              modelId: this.curInfo.modelId,
              columnMaskList, // 表字段脱敏策略
              scopeList, // 表级脱敏策略配置
            }
            if (this.isEdit) {
              const idMap = {
                accessId: this.initData.accessControlId,
              }
              API.modifyTableMask({ ...params, ...idMap })
                .then(res => {
                  this.$datablauMessage.success('修改成功')
                  this.$emit('cancel', true)
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            } else {
              API.newTableMask({ ...params })
                .then(res => {
                  this.$datablauMessage.success('新建成功')
                  this.$emit('cancel', true)
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            }
          } else {
            const params = {
              ...dataMap,
              type: 'ACCESS_DATAMASK_COLUMN', // 访控策略类型
              objectId: this.assetInfo.assetId, // 字段id
              modelId: this.curInfo.modelId,
              maskDtoList: scopeList, // 针对该字段各自的脱敏规则
            }
            if (this.isEdit) {
              const idMap = {
                accessId: this.initData.accessControlId,
              }
              API.modifyColumnMask({ ...params, ...idMap })
                .then(res => {
                  this.$datablauMessage.success('修改成功')
                  this.$emit('cancel', true)
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            } else {
              API.newColumnMask(params)
                .then(res => {
                  this.$datablauMessage.success('新建成功')
                  this.$emit('cancel', true)
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            }
          }
          break
        default:
          break
      }
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
.desensitize-page {
  .datablau-breadcrumb-header {
    padding-right: 20px;
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
      &.second-steps {
        .step {
          width: calc(50% - 20px);
          &:last-child {
            width: calc(50% + 8px);
          }
        }
      }
      &.steps-shadow {
        box-shadow: 0px 5px 14px -8px rgba(0, 0, 0, 0.2);
      }
      .step {
        position: relative;
        float: left;
        width: calc(33.3% - 20px);
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
          z-index: 3;
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
          width: 33.33%;
          &:after {
            border: none;
            top: 0;
            right: 0;
          }
        }
        &:nth-of-type(2) {
          width: calc(33.33% + 4px);
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
  }
}
</style>
