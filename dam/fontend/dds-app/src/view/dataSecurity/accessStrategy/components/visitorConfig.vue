<template>
  <div v-loading="loading">
    <datablau-form-submit ref="formSubmit">
      <div class="con">
        <div class="lineBox">
          <datablau-button type="icon" @click="handleClick('showWhite')">
            <i class="el-icon-arrow-down upDow" v-if="showWhite"></i>
            <i class="el-icon-arrow-up" v-else></i>
          </datablau-button>
          <span>{{ $t('accessStrategy.whiteList') }}</span>
        </div>
        <div class="whitelist" v-show="showWhite">
          <userConfig
            :actionList="actionList"
            :isWhite="true"
            :activeStep="activeStep"
            ref="whitelistUser"
            @secondData="ary => secondData(ary, 'white')"
          ></userConfig>
        </div>
        <div class="lineBox">
          <datablau-button type="icon" @click="handleClick('showBlack')">
            <i class="el-icon-arrow-down upDow" v-if="showBlack"></i>
            <i class="el-icon-arrow-up" v-else></i>
          </datablau-button>
          <span>{{ $t('accessStrategy.blackList') }}</span>
        </div>
        <div class="whitelist" v-show="showBlack">
          <userConfig
            :activeStep="activeStep"
            :actionList="actionList"
            :isWhite="false"
            ref="blacklistUser"
            @secondData="ary => secondData(ary, 'black')"
          ></userConfig>
        </div>
      </div>
      <template slot="buttons">
        <div>
          <datablau-button type="normal" @click="prev">
            {{ $t('accessStrategy.back') }}
          </datablau-button>
          <datablau-button class="cut-apart-btn" type="important" @click="save">
            {{ $t('securityModule.sure') }}
          </datablau-button>
          <datablau-button type="secondary" @click="back">
            {{ $t('securityModule.cancel') }}
          </datablau-button>
        </div>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import userConfig from '@/view/dataSecurity/accessStrategy/components/userConfig'
export default {
  components: { userConfig },
  props: {
    initData: {
      type: Object,
      default: () => {},
    },
    clickChild: {
      type: Function,
    },
    activeStep: {
      type: Number,
      default: 1,
    },
  },
  inject: ['accessControlId'],
  watch: {
    initData: {
      handler(val) {
        this.actionList = this.initData.actionList
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      showWhite: true,
      showBlack: true,
      actionList: [],
      visitorDtoList: [],
      loading: false,
      whiteList: [],
      blackList: [],
    }
  },
  methods: {
    back() {
      this.clickChild('cancel')
    },
    secondData(data, name) {
      switch (name) {
        case 'white':
          this.whiteList = data
          break
        case 'black':
          this.blackList = data
          break
        default:
          break
      }
    },
    prev() {
      this.clickChild('step', { step: 2, prevStep: 3 })
    },
    canNext() {
      let whiteList = this.$refs.whitelistUser.secondData
      let blacklist = this.$refs.blacklistUser.secondData
      let white = this.$refs.whitelistUser.secondData
      if (white.user.length || white.org.length || white.group.length) {
      } else {
        this.$datablauMessage({
          message: this.$t('accessStrategy.addWhiteListUserTip'),
          type: 'warning',
        })
        return false
      }
      this.visitorDtoList = []
      let contrast = {
        group: { type: 'GROUP', visitorId: 'id' },
        user: { type: 'USER', visitorId: 'username' },
        org: { type: 'ORGANIZATION', visitorId: 'bm' },
      }
      let flagList = []
      const oriWhiteObj = this.$refs.whitelistUser.oriUserList
      Object.keys(oriWhiteObj).forEach(m => {
        oriWhiteObj[m].map(o => {
          const bool = whiteList[m].some(
            v => v[contrast[m].visitorId] === o[contrast[m].visitorId]
          )
          if (bool) {
            // 说明原有的没有被删除
          } else {
            // 被删除
            let obj = {
              visitorType: contrast[m].type,
              visitorId: o[contrast[m].visitorId].toString(),
              actionList: o.action,
              whiteList: true,
              delete: true,
            }
            if (m === 'group') {
              obj.id = o.ori_id
            } else {
              obj.id = o.id
            }
            this.visitorDtoList.push(obj)
          }
        })
      })
      Object.keys(whiteList).forEach(item => {
        whiteList[item].forEach(v => {
          if (v.action && v.action.length != 0) {
            flagList.push(true)
          } else {
            flagList.push(false)
          }
          let obj = {
            visitorType: contrast[item].type,
            visitorId: v[contrast[item].visitorId].toString(),
            actionList: v.action,
            whiteList: true,
            delete: false,
          }
          const bool1 =
            oriWhiteObj[item] &&
            oriWhiteObj[item].some(
              m => m[contrast[item].visitorId] === v[contrast[item].visitorId]
            )
          if (bool1) {
            if (item === 'group') {
              v.ori_id && (obj.id = v.ori_id)
            } else {
              v.id && (obj.id = v.id)
            }
          }
          v.strategyId && (obj.strategyId = v.strategyId)
          this.visitorDtoList.push(obj)
        })
      })
      let oriBlackObj = this.$refs.blacklistUser.oriUserList
      Object.keys(oriBlackObj).forEach(m => {
        oriBlackObj[m].map(o => {
          const bool = blacklist[m].some(
            v => v[contrast[m].visitorId] === o[contrast[m].visitorId]
          )
          if (bool) {
            // 说明原有的没有被删除
          } else {
            // 被删除
            let obj = {
              visitorType: contrast[m].type,
              visitorId: o[contrast[m].visitorId].toString(),
              actionList: o.action,
              whiteList: false,
              delete: true,
            }
            if (m === 'group') {
              obj.id = o.ori_id
            } else {
              obj.id = o.id
            }
            this.visitorDtoList.push(obj)
          }
        })
      })
      Object.keys(blacklist).forEach(item => {
        blacklist[item].forEach(v => {
          if (v.action && v.action.length != 0) {
            flagList.push(true)
          } else {
            flagList.push(false)
          }
          let obj = {
            visitorType: contrast[item].type,
            visitorId: v[contrast[item].visitorId].toString(),
            actionList: v.action,
            whiteList: false,
            delete: false,
          }
          const bool1 =
            oriBlackObj[item] &&
            oriBlackObj[item].some(
              m => m[contrast[item].visitorId] === v[contrast[item].visitorId]
            )
          if (bool1) {
            if (item === 'group') {
              v.ori_id && (obj.id = v.ori_id)
            } else {
              v.id && (obj.id = v.id)
            }
          }
          v.strategyId && (obj.strategyId = v.strategyId)
          this.visitorDtoList.push(obj)
        })
      })
      const flag = flagList.some(item => !item) // 是否有false的
      if (flag) {
        this.$datablauMessage({
          message: this.$t('accessStrategy.addAccessActionTip'),
          type: 'warning',
        })
        return false
      }
      return true
    },
    async save() {
      const result = await this.canNext()
      if (result) {
        this.clickChild('save')
      }
    },
    handleClick(val) {
      this[val] = !this[val]
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.con {
  padding: 0 20px;
}
.lineBox {
  position: relative;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  &:after {
    content: '';
    height: 1px;
    background: #efefef;
    position: absolute;
    top: 12px;
    left: 75px;
    right: 0px;
  }
  span {
    display: inline-block;
  }
}
.is-block.icon {
  color: #999;
}
.drop {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 15px;
  margin-right: 4px;
  position: relative;
  top: 3px;
}
.whitelist {
  padding-bottom: 32px;
}
</style>
