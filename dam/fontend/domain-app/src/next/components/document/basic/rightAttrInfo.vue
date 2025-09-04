// 资产属性
<template>
  <div v-loading="loading" style="width: 100%; height: 100%">
    <datablau-meta-data-attr
      :operation-open="operationOpen"
      style="height: 100%; z-index: 999"
    >
      <p class="group-key">{{ $t('assets.summaryInfo.organInfoTitle') }}</p>
      <attr-item
        v-bind="$attrs"
        :editable="
          editable &&
          currentNode.status !== 'PUBLISHED' &&
          currentNode.status !== 'UNDER_REVIEW'
        "
        :isOwnship="true"
        :attrKey="$t('assets.summaryInfo.ownershipText')"
        :imgSrc="'/static/images/metadataIcon/dataOwnership.svg'"
        :attrValue="attrInfo.ownship"
        @saveOwnship="saveOwnship"
        :isOpen="isOpen"
      ></attr-item>
      <attr-item
        v-bind="$attrs"
        :editable="
          editable &&
          currentNode.status !== 'PUBLISHED' &&
          currentNode.status !== 'UNDER_REVIEW'
        "
        :isSteward="true"
        :attrKey="$t('assets.summaryInfo.stewardText')"
        :imgSrc="'/static/images/metadataIcon/dataStewardship.svg'"
        :attrValue="attrInfo.steward"
        @saveSteward="saveSteward"
        :isOpen="isOpen"
      ></attr-item>
      <div class="attr-item">
        <span class="item-key">
          <img src="/static/images/metadataIcon/topUser.svg" alt="" />
          <span v-if="isOpen">
            {{ $t('assets.summaryInfo.topUserText') }}
          </span>
        </span>
        <div class="item-value top-user" v-if="isOpen">
          <el-tooltip
            placement="bottom"
            effect="light"
            v-for="(user, index) in attrInfo.topUsers"
            :key="index"
          >
            <template v-if="user">
              <div slot="content">
                <p style="color: #20293b; padding-bottom: 10px">
                  <span
                    style="
                      color: #7d8493;
                      font-size: 12px;
                      width: 50px;
                      display: inline-block;
                    "
                  >
                    {{ $t('assets.summaryInfo.usernameText') }}：
                  </span>
                  {{ user.username }}
                </p>
                <p style="color: #20293b; padding-bottom: 10px">
                  <span
                    style="
                      color: #7d8493;
                      font-size: 12px;
                      width: 50px;
                      display: inline-block;
                    "
                  >
                    {{ $t('assets.summaryInfo.fullnameText') }}：
                  </span>
                  {{ user.username }}
                </p>
                <p style="color: #20293b">
                  <span
                    style="
                      color: #7d8493;
                      font-size: 12px;
                      width: 50px;
                      display: inline-block;
                    "
                  >
                    {{ $t('assets.summaryInfo.visitCountText') }}：
                  </span>
                  {{ user.visitCount || 0 }}
                </p>
              </div>
              <div class="head-portrait">
                {{ user.username.slice(0, 1) }}
              </div>
            </template>
          </el-tooltip>
        </div>
      </div>
      <extend-props
        :isOpen="isOpen"
        :extendProps="attrInfo.extendProps"
        :editingKey="editingKey"
        v-bind="$attrs"
        :editable="
          editable &&
          currentNode.status !== 'PUBLISHED' &&
          currentNode.status !== 'UNDER_REVIEW'
        "
        @saveExtendValue="saveExtendValue"
        @edit="edit"
      ></extend-props>
      <template v-if="attrInfo.generalSetting">
        <p class="group-key">
          {{ $t('assets.summaryInfo.generalPropTitle') }}
        </p>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.statusText')"
          :imgSrc="'/static/images/metadataIcon/assetstatus.svg'"
          :attrValue="formatStatus(attrInfo.generalSetting.publishStatus)"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.dirTypeText')"
          :imgSrc="'/static/images/metadataIcon/assetType.svg'"
          :attrValue="attrInfo.generalSetting.catalogTypeName"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.approverText')"
          :imgSrc="'/static/images/metadataIcon/dataApprover.svg'"
          :attrValue="attrInfo.generalSetting.approver"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.authorityText')"
          :imgSrc="'/static/images/metadataIcon/directoryRight.svg'"
          :attrValue="formatAuthority(attrInfo.generalSetting.authType)"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="'关键词'"
          :imgSrc="'/static/images/metadataIcon/keyword.svg'"
          :attrValue="attrInfo.generalSetting.keyword"
        ></attr-item>
      </template>
      <template v-if="attrInfo.systemSetting">
        <p class="group-key">
          {{ $t('assets.summaryInfo.systemPropTitle') }}
        </p>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.creatorText')"
          :imgSrc="'/static/images/metadataIcon/creator.svg'"
          :attrValue="attrInfo.systemSetting.creator"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.createTimeText')"
          :imgSrc="'/static/images/metadataIcon/creationTime.svg'"
          :attrValue="attrInfo.systemSetting.createTime"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.lastTimeText')"
          :imgSrc="'/static/images/metadataIcon/modifyTime.svg'"
          :attrValue="formatTime(attrInfo.systemSetting.modifyTime)"
        ></attr-item>
        <attr-item
          v-if="attrInfo.systemSetting.publishTime"
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.publishTimeText')"
          :imgSrc="'/static/images/dataAssets/publishTime.svg'"
          :attrValue="formatTime(attrInfo.systemSetting.publishTime)"
        ></attr-item>
      </template>
      <div class="assets-code">
        <p class="group-key">数据资产编号</p>
        <div class="attr-item">
          <span class="item-key">
            <img
              src="/static/images/dataAssets/autoGenerate.svg"
              style="width: 24px"
              alt=""
            />
            <span style="display: inline-block; width: 90px" v-if="isOpen">
              自动生成
            </span>
          </span>
          <span
            style="
              display: inline-block;
              width: calc(100% - 140px);
              line-height: 34px;
            "
            v-if="isOpen"
          >
            <datablau-switch
              :disabled="
                !editable ||
                currentNode.status === 'PUBLISHED' ||
                currentNode.status === 'UNDER_REVIEW'
              "
              v-model="configData.autoIncState"
              @change="handleAssetsCodeAutoChange"
              style="display: inline-block"
            ></datablau-switch>
            <span
              v-if="!configData.autoIncState"
              style="margin-left: 8px; color: #999; line-height: 34px"
            >
              前往资产清单设置
            </span>
          </span>
        </div>
        <div class="attr-item">
          <span class="item-key">
            <img
              src="/static/images/dataAssets/code.svg"
              style="width: 24px"
              alt=""
            />
            <span style="display: inline-block; width: 90px" v-if="isOpen">
              编号样例
            </span>
          </span>
          <span
            style="
              display: inline-block;
              width: calc(100% - 140px);
              line-height: 34px;
            "
            v-if="isOpen"
          >
            <is-show-tooltip
              :content="getNextCodeExample()"
              style="max-width: calc(100% - 32px); float: left"
            >
              <span>{{ getNextCodeExample() }}</span>
            </is-show-tooltip>

            <i
              v-if="editable && configData.autoIncState && !openAssetsConfig"
              class="iconfont icon-bianji edit-example"
              @click="toEditAssetsCodeConfig"
              style="float: left; line-height: 32px; margin-left: 8px"
            ></i>
            <datablau-tooltip
              v-else-if="
                currentNode.status === 'PUBLISHED' ||
                currentNode.status === 'UNDER_REVIEW'
              "
              content="目录已发布，请下线目录后编辑资产编号"
              style="float: left; line-height: 32px; margin-left: 8px"
            >
              <i class="iconfont icon-tips edit-example"></i>
            </datablau-tooltip>
          </span>
          <div
            v-if="openAssetsConfig && isOpen"
            style="position: absolute; top: 34px; bottom: 16px"
            class="code-config-content"
          >
            <datablau-form
              :model="configData"
              ref="configForm"
              :label-width="'100px'"
              :rules="rules"
            >
              <el-form-item label="固定前缀">
                <datablau-input
                  v-model="configData.prefix"
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 120px; margin-left: 8px"
                  maxlength="30"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="数据部分位数" prop="digitPart">
                <datablau-input
                  v-model.number="configData.digitPart"
                  @input="
                    val => {
                      handleEdit(val, 'digitPart')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 120px; margin-left: 8px"
                ></datablau-input>
              </el-form-item>
              <el-form-item label-width="100px" label="起始值" prop="startVal">
                <datablau-input
                  v-model.number="configData.startVal"
                  @input="
                    val => {
                      handleEdit(val, 'startVal')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  :maxlength="configData.digitPart"
                  style="width: 120px; margin-left: 8px"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                label-width="100px"
                label="自增量"
                prop="incStepSize"
              >
                <datablau-input
                  v-model.number="configData.incStepSize"
                  @input="
                    val => {
                      handleEdit(val, 'incStepSize')
                    }
                  "
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 120px; margin-left: 8px"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="固定后缀" style="margin-bottom: 0">
                <datablau-input
                  v-model="configData.suffix"
                  :placeholder="$t('common.placeholder.prefix')"
                  clearable
                  style="width: 120px; margin-left: 8px"
                  maxlength="30"
                ></datablau-input>
              </el-form-item>
              <div
                style="
                  text-align: center;
                  padding-top: 8px;
                  padding-bottom: 16px;
                "
              >
                <datablau-button
                  type="text"
                  @click="toSaveCodeConfig"
                  style="padding-left: 4px; padding-right: 4px"
                >
                  保存
                </datablau-button>
                <datablau-button
                  type="text"
                  @click="cancelCodeConfig"
                  style="color: #999; padding-left: 4px; padding-right: 4px"
                >
                  取消
                </datablau-button>
              </div>
            </datablau-form>
          </div>
        </div>
      </div>
    </datablau-meta-data-attr>
  </div>
</template>

<script>
import ExtendProps from './extendProps.vue'
import AttrItem from './attrItem.vue'
import api from '../utils/api'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'rightAttrInfo',
  components: { ExtendProps, AttrItem, isShowTooltip },
  props: {
    attrs: {
      type: Object,
      default() {
        return {}
      },
    },
    currentNode: {
      type: Object,
      default() {
        return {}
      },
    },
    editable: {
      type: Boolean,
      default: false,
    },
    exampleData: {
      // 组件例子
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      editing: false,
      editingKey: '',
      attrInfo: {
        ownship: '',
        steward: '',
        topUsers: [],
        extendProps: {},
        generalSetting: {},
        systemSetting: {},
      },
      loading: false,
      isOpen: true,
      openAssetsConfig: false,
      configData: {},
      originConfigData: {},
      rules: {
        digitPart: [
          {
            required: true,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        startVal: [
          {
            required: true,
            message: '请输入起始值',
            trigger: 'blur',
          },
        ],
        incStepSize: [
          {
            required: true,
            message: '请输入子增量',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    operationOpen(params) {
      this.isOpen = params.isOpen
    },
    formatTime(timeStr) {
      const hasT = timeStr && timeStr.indexOf('T') !== -1
      if (hasT) {
        const timeArr = timeStr.split('T')
        return `${timeArr[0]} ${timeArr[1].split('.')[0]}`
      } else {
        return timeStr
      }
    },
    formatStatus(status) {
      let statusText = ''
      switch (status) {
        case 0:
          statusText = this.$t('assets.common.unpublishText')
          break
        case 1:
          statusText = this.$t('assets.common.reviewText')
          break
        case 2:
          statusText = this.$t('assets.common.publishedText')
          break
        case 3:
          statusText = this.$t('assets.common.offlineText')
          break
      }
      return statusText
    },
    formatAuthority(auth) {
      let authText = ''
      switch (auth) {
        case 'MANAGER':
          authText = this.$t('assets.common.managePermissions')
          break
        case 'EDIT':
          authText = this.$t('assets.common.editPermissions')
          break
        case 'READ':
          authText = this.$t('assets.common.visitPermissions')
          break
        default:
          authText = ''
      }
      return authText
    },
    edit(key) {
      // console.log(key)
      this.editingKey = key
    },
    // 保存 数据权属
    saveOwnship(data) {
      // console.log(data)
      api
        .updateDepartment({
          catalogId: this.currentNode.id,
          bm: data.bm,
        })
        .then(res => {
          if (res.status === 200) {
            this.$parent.$parent.updateDirAttr()
            // this.attrInfo.ownship = data.fullName
            this.editingKey = ''
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg,
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 保存 数据管家
    saveSteward(data) {
      // console.log(data)
      api
        .updateSteward({
          catalogId: this.currentNode.id,
          butler: data.username || '',
        })
        .then(res => {
          if (res.status === 200) {
            this.$parent.$parent.updateDirAttr()
            // this.attrInfo.steward = data.fullUserName
            this.editingKey = ''
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg,
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 保存 扩展属性
    saveExtendValue({ p, idx, v, target }) {
      // console.log(p, idx, v, target)
      // console.log(this.attrInfo.extendProps[p][idx])
      if (this.attrInfo.extendProps[p][idx].value.type === 'ENUM' && v) {
        v = v.value
      }
      if (this.attrInfo.extendProps[p][idx].value.required && !(v === 0 || v)) {
        this.$showFailure(this.$t('assets.udp.isRequired'))
        return
      }
      this.loading = true
      api
        .editUDPValue([
          {
            catalogId: this.currentNode.id,
            catalogName: this.currentNode.name,
            valId: Number(target.value.valId),
            udpId: target.value.id,
            udpName: target.value.name,
            value: v,
          },
        ])
        .then(res => {
          this.loading = false
          if (res.status === 200) {
            this.attrInfo.extendProps[p][idx].value.value = v
            this.$parent.$parent.updateDirAttr()
            this.editingKey = ''
            return true
          } else {
            this.$showFailure(res.errorMessage)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // console.log(this.extendProps[p])
    },
    // 当前资产目录下，数据资产编号自动生成的配置
    handleAssetsCodeAutoChange() {
      if (!this.configData.autoIncState) {
        this.cancelCodeConfig()
      }
      this.saveCodeConfig()
    },
    // 打开资产编号配置面板
    toEditAssetsCodeConfig() {
      this.openAssetsConfig = true
    },
    // 编辑 数据部分位数、起始值、自增量时的方法
    handleEdit(e, type) {
      if (type === 'digitPart') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        if (parseInt(value) > 9) value = 9
        this.configData.digitPart = value
        this.configData.startVal = 0
        this.configData.nextVal = 0
      } else if (type === 'startVal') {
        let value = e.replace(/[^\d]/g, '')
        value = value.replace(/^0+(\d)/, '$1')
        this.configData.startVal = value
        this.configData.nextVal = value
      } else if (type === 'incStepSize') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        if (parseInt(value) > 9) value = 9
        this.configData.incStepSize = value
      }
    },
    saveCodeConfig() {
      api
        .updateAssetsCodeConfig({
          ...this.configData,
          sourceId: this.currentNode.id,
        })
        .then(res => {
          if (res.status === 200) {
            this.getAssetsCodeConfig()
          } else {
            this.configData.autoIncState = this.originConfigData.autoIncState
            this.$showFailure('保存失败')
          }
        })
        .catch(error => {
          this.configData.autoIncState = this.originConfigData.autoIncState
          this.$showFailure(error)
        })
    },
    toSaveCodeConfig() {
      this.$refs.configForm.validate(valid => {
        if (valid) {
          this.saveCodeConfig()
        }
      })
    },
    cancelCodeConfig() {
      this.openAssetsConfig = false
      this.configData = _.cloneDeep(this.originConfigData)
    },
    // 获取数据资产编号配置
    getAssetsCodeConfig() {
      api.getAssetsCodeConfig(this.currentNode.id).then(res => {
        const configData = res.data || {
          prefix: 'DA-',
          suffix: null,
          digitPart: 8,
          startVal: 0,
          nextVal: 0,
          incStepSize: 1,
          autoIncState: false,
          codeType: 'DATA_ASSETS',
        }
        this.configData = configData
        this.originConfigData = configData
        this.openAssetsConfig = false
      })
    },
    // 计算数据资产编号样例
    getNextCodeExample() {
      if (
        this.configData.prefix ||
        this.configData.digitPart ||
        this.configData.suffix
      ) {
        return (
          (this.configData.prefix ? this.configData.prefix : '') +
          this.fillZero(this.configData.startVal, this.configData.digitPart) +
          (this.configData.suffix ? this.configData.suffix : '')
        )
      } else {
        return ''
      }
    },
    fillZero(number, digits) {
      // console.log(number, digits)
      number = String(number)
      let length = number.length
      if (number.length < digits) {
        for (let i = 0; i < digits - length; i++) {
          number = '0' + number
        }
      }
      return number
    },
  },
  mounted() {
    this.attrInfo = this.attrs
  },
  watch: {
    attrs: {
      handler(value) {
        if (value) {
          this.attrInfo = value
          this.editingKey = ''
        }
      },
    },
    currentNode: {
      handler() {
        this.getAssetsCodeConfig()
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.group-key {
  height: 24px;
  line-height: 24px;
  font-weight: 600;
  color: #444;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.attr-item {
  width: 100%;
  height: 34px;
  position: relative;

  .item-key {
    width: 140px;
    line-height: 34px;
    float: left;
    padding-right: 20px;
    img {
      margin-right: 6px;
    }
  }

  .top-user {
    float: left;
    margin-top: 5px;
    .head-portrait {
      width: 24px;
      height: 24px;
      border-radius: 100%;
      text-align: center;
      line-height: 22px;
      float: left;

      &:nth-of-type(1) {
        background: #e0d5da;
      }

      &:nth-of-type(2) {
        background: #fff0f7;
        margin: 0 10px;
      }

      &:nth-of-type(3) {
        background: #d0e4ef;
      }
    }
  }
  .edit-example {
    color: #409eff;
    cursor: pointer;
  }

  .code-config-content {
    transition: all ease 0.3s;
    left: 32px;
    /deep/.el-form-item__error {
      top: 88%;
      transform: scale(0.9);
      left: 4%;
    }
    /deep/.el-form.db-form .el-form-item {
      margin-bottom: 8px;
    }
    /deep/.el-form-item__label {
      text-align: left;
    }
  }
}
</style>
